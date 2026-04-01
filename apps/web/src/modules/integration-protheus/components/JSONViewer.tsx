/**
 * @contract UX-008-M01 §6
 *
 * Styled JSON viewer with monospace font and scroll.
 */

export interface JSONViewerProps {
  data: unknown;
  maxHeight?: number;
}

export function JSONViewer({ data, maxHeight = 200 }: JSONViewerProps) {
  return (
    <pre
      className="overflow-y-auto whitespace-pre rounded-md border border-[#E8E8E6] bg-[#F8F8F6] p-3 font-mono text-xs leading-relaxed text-[#333]"
      style={{ maxHeight }}
    >
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}
