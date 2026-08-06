import Image from "next/image";
import type { TiptapDoc } from "@/lib/richtext/types";
import { renderTiptapDoc } from "@/lib/richtext/render";

export function ArticleContent({
  headline,
  body,
  paragraphs,
  withVideo,
  imageUrl,
}: {
  headline: string;
  body?: TiptapDoc;
  paragraphs?: string[];
  withVideo?: boolean;
  imageUrl?: string;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="relative h-28 shrink-0 bg-lt-gray sm:h-36">
        {imageUrl && (
          <Image src={imageUrl} alt="" fill className="object-cover" sizes="380px" />
        )}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">
        <h3 className="font-gothic text-xl leading-tight text-black sm:text-2xl">
          {headline}
        </h3>

        {withVideo && (
          <div className="my-3 flex h-24 items-center justify-center rounded-squircle-sm border border-black/10 bg-lt-panel sm:h-28">
            <svg
              viewBox="0 0 24 24"
              className="h-8 w-8 text-black/25"
              fill="currentColor"
            >
              <path d="M6 4l14 8-14 8V4z" />
            </svg>
          </div>
        )}

        {body && body.content.length > 0 ? (
          <div className="mt-3 flex flex-col gap-3 text-xs leading-relaxed text-black/80 [&_h2]:font-gothic [&_h2]:text-base [&_h3]:font-gothic [&_h3]:text-sm [&_a]:text-lt-blue [&_a]:underline [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4">
            {renderTiptapDoc(body)}
          </div>
        ) : (
          (paragraphs ?? []).map((paragraph, i) => (
            <p
              key={i}
              className="mt-3 text-xs leading-relaxed text-black/80 first:mt-2"
            >
              {paragraph}
            </p>
          ))
        )}
      </div>
    </div>
  );
}
