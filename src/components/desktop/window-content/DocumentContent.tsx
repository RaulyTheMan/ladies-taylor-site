import type { TiptapDoc } from "@/lib/richtext/types";
import { renderTiptapDoc } from "@/lib/richtext/render";

export function DocumentContent({
  headline,
  body,
  paragraphs,
}: {
  headline: string;
  body?: TiptapDoc;
  paragraphs?: string[];
}) {
  return (
    <div className="flex h-full flex-col p-3">
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain rounded-squircle-sm bg-white p-4">
        <h3 className="font-gothic text-xl leading-tight text-black sm:text-2xl">
          {headline}
        </h3>
        {body && body.content.length > 0 ? (
          <div className="mt-3 flex flex-col gap-3 text-xs leading-relaxed text-black/80">
            {renderTiptapDoc(body)}
          </div>
        ) : (
          (paragraphs ?? []).map((paragraph, i) => (
            <p key={i} className="mt-3 text-xs leading-relaxed text-black/80">
              {paragraph}
            </p>
          ))
        )}
      </div>
      <p className="shrink-0 pt-2 text-right text-micro text-black/60">
        Page 1 of 1
      </p>
    </div>
  );
}
