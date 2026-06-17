/**
 * Triggers a browser download of a Blob, robustly.
 *
 * Revoking the object URL (or removing the anchor) synchronously right after
 * click() makes Chrome drop the download filename: the file saves as the blob
 * UUID with no extension, which Excel then refuses to open. The anchor must
 * also be in the DOM for the `download` attribute to be honored. Append it and
 * defer cleanup so the download commits with the intended name.
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  setTimeout(() => {
    anchor.remove();
    URL.revokeObjectURL(url);
  }, 1000);
}
