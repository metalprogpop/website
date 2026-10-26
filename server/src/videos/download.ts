// The Content-Disposition of a part's download link, so the browser saves it
// with a readable name ("MetalProgPop - Programa 97 - Parte 1 - Album.mp4")
// instead of the bucket's key.

export type DownloadNameInput = {
  program: number;
  part: number;
  lastPart: number;
  albums: string[];
};

export const downloadFileName = ({
  program,
  part,
  lastPart,
  albums,
}: DownloadNameInput): string => {
  const parts =
    lastPart > part
      ? `Partes ${String(part)} a ${String(lastPart)}`
      : `Parte ${String(part)}`;
  const name = [`MetalProgPop`, `Programa ${String(program)}`, parts, ...albums]
    .join(" - ")
    // Characters that file systems reject.
    .replace(/[\\/:*?"<>|]/g, "")
    .replace(/[\p{Cc}]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
  return `${name}.mp4`;
};

// RFC 6266: an ASCII fallback for old clients, plus the UTF-8 name.
export const attachmentDisposition = (fileName: string): string => {
  const ascii = fileName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7e]/g, "_")
    .replace(/["\\]/g, "");
  const encoded = encodeURIComponent(fileName).replace(
    /['()*]/g,
    (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`,
  );
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encoded}`;
};
