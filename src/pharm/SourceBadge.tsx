import type { SourceRef } from "./types";

export function SourceBadge({ source }: { source: SourceRef }) {
  return (
    <span className="inline-flex rounded-full border border-[#d7e7f5] bg-[#f6fbff] px-2 py-1 text-[10px] text-[#47617a]">
      Source: {source.pdf_file} | p.{source.page_number ?? "?"} | {source.table_or_section}
    </span>
  );
}
