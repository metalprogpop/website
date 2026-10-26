import {
  GetObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { VideoObject } from "./keys.js";

// Presigned URLs last a day, so a paused video still plays after lunch. The
// signature can't outlive the credentials that made it: with a runtime role
// (temporary credentials) it lasts less, which is why the player asks for a
// new URL whenever one fails.
export const SIGNED_URL_SECONDS = 24 * 60 * 60;

const VIDEOS_PREFIX = "videos/";

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

export const listVideoObjects = async (): Promise<VideoObject[]> => {
  const objects: VideoObject[] = [];
  let token: string | undefined;
  do {
    const page = await s3().send(
      new ListObjectsV2Command({
        Bucket: getBucket(),
        Prefix: VIDEOS_PREFIX,
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

// A URL to read a video, optionally as a download with this disposition.
export const signVideoUrl = (
  key: string,
  contentDisposition?: string,
): Promise<string> =>
  getSignedUrl(
    s3(),
    new GetObjectCommand({
      Bucket: getBucket(),
      Key: key,
      ResponseContentDisposition: contentDisposition,
      // Some uploads may carry a generic type, which Safari won't play.
      ResponseContentType: "video/mp4",
    }),
    { expiresIn: SIGNED_URL_SECONDS },
  );
