import Image from "next/image";

export function PhotoContent({
  caption,
  imageUrl,
}: {
  caption?: string;
  imageUrl?: string;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="relative min-h-0 flex-1 bg-lt-gray">
        {imageUrl && (
          <Image src={imageUrl} alt="" fill className="object-cover" sizes="300px" />
        )}
      </div>
      {caption && (
        <p className="shrink-0 border-t border-black/10 bg-lt-panel px-3 py-2 text-center text-micro text-black/60">
          {caption}
        </p>
      )}
    </div>
  );
}
