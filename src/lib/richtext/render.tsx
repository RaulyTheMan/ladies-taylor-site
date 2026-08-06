import type { ReactNode } from "react";
import Image from "next/image";
import type { TiptapDoc, TiptapNode, TiptapMark } from "./types";
import { embedSrc } from "./embed-extension";

export type HeadingEntry = { id: string; text: string; level: number };

function slugify(text: string) {
  const slug = text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return slug || "section";
}

function headingText(node: TiptapNode) {
  return (node.content ?? []).map((n) => n.text ?? "").join("");
}

export function extractHeadings(doc: TiptapDoc): HeadingEntry[] {
  const seen = new Map<string, number>();
  const headings: HeadingEntry[] = [];

  for (const node of doc.content ?? []) {
    if (node.type !== "heading") continue;
    const text = headingText(node);
    const base = slugify(text);
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    headings.push({
      id: count === 0 ? base : `${base}-${count}`,
      text,
      level: Number(node.attrs?.level ?? 2),
    });
  }

  return headings;
}

function renderMarks(text: string, marks: TiptapMark[] = []): ReactNode {
  return marks.reduce<ReactNode>((acc, mark) => {
    switch (mark.type) {
      case "bold":
        return <strong key="b">{acc}</strong>;
      case "italic":
        return <em key="i">{acc}</em>;
      case "code":
        return (
          <code key="c" className="rounded bg-lt-panel px-1 text-[0.9em]">
            {acc}
          </code>
        );
      case "link":
        return (
          <a
            key="a"
            href={String(mark.attrs?.href ?? "#")}
            target="_blank"
            rel="noreferrer noopener"
            className="underline"
          >
            {acc}
          </a>
        );
      default:
        return acc;
    }
  }, text as ReactNode);
}

function renderInline(nodes: TiptapNode[] = []): ReactNode {
  return nodes.map((node, i) => {
    if (node.type === "text") {
      return (
        <span key={i}>{renderMarks(node.text ?? "", node.marks)}</span>
      );
    }
    if (node.type === "hardBreak") {
      return <br key={i} />;
    }
    return null;
  });
}

/** Renders a stored Tiptap JSON document to JSX — never dangerouslySetInnerHTML. */
export function renderTiptapDoc(doc: TiptapDoc): ReactNode {
  let headingIndex = 0;
  const headings = extractHeadings(doc);

  return (doc.content ?? []).map((node, i) =>
    renderNode(node, i, () => headings[headingIndex++]?.id)
  );
}

function renderNode(
  node: TiptapNode,
  key: number,
  nextHeadingId: () => string | undefined
): ReactNode {
  switch (node.type) {
    case "paragraph":
      return (
        <p key={key} className="text-sm leading-relaxed text-black/80">
          {renderInline(node.content)}
        </p>
      );
    case "heading": {
      const level = Number(node.attrs?.level ?? 2);
      const id = nextHeadingId();
      const className = "scroll-mt-24 font-gothic text-black";
      const sizeClass = level <= 2 ? "text-2xl" : "text-xl";
      switch (level) {
        case 1:
          return (
            <h1 key={key} id={id} className={`${className} ${sizeClass}`}>
              {renderInline(node.content)}
            </h1>
          );
        default:
          return (
            <h2 key={key} id={id} className={`${className} ${sizeClass}`}>
              {renderInline(node.content)}
            </h2>
          );
      }
    }
    case "bulletList":
      return (
        <ul
          key={key}
          className="list-disc space-y-1 pl-5 text-sm text-black/80"
        >
          {(node.content ?? []).map((item, i) => (
            <li key={i}>{renderInline(item.content?.[0]?.content)}</li>
          ))}
        </ul>
      );
    case "orderedList":
      return (
        <ol
          key={key}
          className="list-decimal space-y-1 pl-5 text-sm text-black/80"
        >
          {(node.content ?? []).map((item, i) => (
            <li key={i}>{renderInline(item.content?.[0]?.content)}</li>
          ))}
        </ol>
      );
    case "blockquote":
      return (
        <blockquote
          key={key}
          className="border-l-2 border-black/20 pl-4 text-sm italic text-black/70"
        >
          {(node.content ?? []).map((child, i) => renderNode(child, i, nextHeadingId))}
        </blockquote>
      );
    case "image":
      return (
        <span
          key={key}
          className="relative block aspect-video w-full overflow-hidden rounded-squircle-sm bg-lt-gray"
        >
          <Image
            src={String(node.attrs?.src ?? "")}
            alt={String(node.attrs?.alt ?? "")}
            fill
            className="object-cover"
            sizes="(min-width: 768px) 50vw, 100vw"
          />
        </span>
      );
    case "embed": {
      const provider = String(node.attrs?.provider ?? "youtube");
      const videoId = String(node.attrs?.videoId ?? "");
      return (
        <span
          key={key}
          className="block aspect-video w-full overflow-hidden rounded-squircle-sm"
        >
          <iframe
            src={embedSrc(provider, videoId)}
            className="h-full w-full border-0"
            allowFullScreen
          />
        </span>
      );
    }
    case "horizontalRule":
      return <hr key={key} className="border-black/10" />;
    default:
      return null;
  }
}
