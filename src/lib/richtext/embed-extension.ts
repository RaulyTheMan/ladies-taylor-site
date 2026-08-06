import { Node, mergeAttributes, nodePasteRule } from "@tiptap/core";

export type EmbedProvider = "youtube" | "vimeo";

export function parseEmbedUrl(
  url: string
): { provider: EmbedProvider; videoId: string } | null {
  const youtubeMatch = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{6,})/
  );
  if (youtubeMatch) return { provider: "youtube", videoId: youtubeMatch[1] };

  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return { provider: "vimeo", videoId: vimeoMatch[1] };

  return null;
}

export function embedSrc(provider: string, videoId: string) {
  return provider === "vimeo"
    ? `https://player.vimeo.com/video/${videoId}`
    : `https://www.youtube.com/embed/${videoId}`;
}

const EMBED_URL_REGEX =
  /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=[a-zA-Z0-9_-]{6,}|youtu\.be\/[a-zA-Z0-9_-]{6,}|vimeo\.com\/\d+)/g;

export const Embed = Node.create({
  name: "embed",
  group: "block",
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      provider: { default: "youtube" },
      videoId: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-embed]" }];
  },

  renderHTML({ node, HTMLAttributes }) {
    const provider = String(node.attrs.provider ?? "youtube");
    const videoId = String(node.attrs.videoId ?? "");
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-embed": "",
        class: "aspect-video w-full overflow-hidden rounded-squircle-sm",
      }),
      [
        "iframe",
        {
          src: embedSrc(provider, videoId),
          class: "h-full w-full border-0",
          allowfullscreen: "true",
        },
      ],
    ];
  },

  addPasteRules() {
    return [
      nodePasteRule({
        find: EMBED_URL_REGEX,
        type: this.type,
        getAttributes: (match) => {
          const parsed = parseEmbedUrl(match[0]);
          return parsed
            ? { provider: parsed.provider, videoId: parsed.videoId }
            : {};
        },
      }),
    ];
  },
});
