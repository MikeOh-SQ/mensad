type DownloadButtonProps = {
  isExporting: boolean;
  onDownload: () => void;
};

export function DownloadButton({ isExporting, onDownload }: DownloadButtonProps) {
  return (
    <button className="downloadButton" type="button" onClick={onDownload} disabled={isExporting}>
      {isExporting ? "Rendering PNG..." : "Download PNG"}
    </button>
  );
}
