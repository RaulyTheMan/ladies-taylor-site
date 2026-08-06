import Image from "next/image";

export type NewsfeedItem = {
  handle: string;
  headline: string;
  stat: string;
  avatarUrl?: string;
};

export function NewsfeedContent({ items }: { items: NewsfeedItem[] }) {
  return (
    <div className="h-full divide-y divide-black/10 overflow-y-auto overscroll-contain">
      {items.map((item, i) => (
        <div key={i} className="flex gap-3 p-3">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-squircle-sm bg-lt-gray">
            {item.avatarUrl && (
              <Image
                src={item.avatarUrl}
                alt=""
                fill
                className="object-cover"
                sizes="48px"
              />
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-black">
              {item.handle}
            </p>
            <p className="mt-0.5 text-xs leading-snug text-black/80">
              {item.headline}
            </p>
            <p className="mt-1 text-micro text-black/50">{item.stat}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
