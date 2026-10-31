import {
  GetObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// The Fan Club's media bucket (program videos and Poné Rec™). Members get
// presigned URLs or bytes through the server, never the keys.

// Presigned URLs last a day, so something paused still plays after lunch.
// The signature can't outlive the credentials that made it: with a runtime
// role (temporary credentials) it lasts less, which is why the players ask
// for a new URL whenever one fails.
export const SIGNED_URL_SECONDS = 24 * 60 * 60;

export type MediaObject = { key: string; size: number };

// Credentials and region come from the environment (AWS_ACCESS_KEY_ID,
// AWS_SECRET_ACCESS_KEY, AWS_REGION) or the runtime's role.
let client: S3Client | null = null;
const s3 = () => (client ??= new S3Client({}));

const getBucket = (): string => {
  const bucket = process.env.MEDIA_BUCKET;
  if (!bucket) {
    throw new Error("MEDIA_BUCKET environment variable is required");
  }
  return bucket;
};

export const listMediaObjects = async (
  prefix: string,
): Promise<MediaObject[]> => {
  const objects: MediaObject[] = [];
  let token: string | undefined;
  do {
    const page = await s3().send(
      new ListObjectsV2Command({
        Bucket: getBucket(),
        Prefix: prefix,
        ContinuationToken: token,
      }),
    );
    for (const object of page.Contents ?? []) {
      if (object.Key) {
        objects.push({ key: object.Key, size: object.Size ?? 0 });
      }
    }
    token = page.IsTruncated ? page.NextContinuationToken : undefined;
  } while (token);
  return objects;
};

// A URL to read an object. The content type is forced, since some uploads
// carry a generic one that Safari won't play; a disposition makes it a
// download.
export const signMediaUrl = (
  key: string,
  contentType: string,
  contentDisposition?: string,
): Promise<string> =>
  getSignedUrl(
    s3(),
    new GetObjectCommand({
      Bucket: getBucket(),
      Key: key,
      ResponseContentType: contentType,
      ResponseContentDisposition: contentDisposition,
    }),
    { expiresIn: SIGNED_URL_SECONDS },
  );

// The object's bytes, for small files the server relays itself.
export const readMediaObject = async (
  key: string,
): Promise<{ bytes: Uint8Array; contentType: string | undefined }> => {
  const object = await s3().send(
    new GetObjectCommand({ Bucket: getBucket(), Key: key }),
  );
  if (!object.Body) {
    throw new Error(`Empty object: ${key}`);
  }
  return {
    bytes: await object.Body.transformToByteArray(),
    contentType: object.ContentType,
  };
};
