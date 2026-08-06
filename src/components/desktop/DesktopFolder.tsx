"use client";

import Image from "next/image";
import Link from "next/link";

export default function DesktopFolder({
  label,
  href,
  className = "",
}: {
  label: string;
  href: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`group absolute z-0 flex w-20 flex-col items-center gap-1.5 rounded-squircle-sm p-2 text-center transition-colors hover:bg-white/15 ${className}`}
    >
      <Image
        src="/images/icons/folder.svg"
        alt=""
        width={221}
        height={216}
        className="h-10 w-10 drop-shadow-[0_2px_2px_rgba(0,0,0,0.35)]"
      />
      <span className="rounded-squircle-xs bg-black/40 px-1.5 py-0.5 text-xs font-semibold leading-tight text-white">
        {label}
      </span>
    </Link>
  );
}
