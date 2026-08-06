import type { TiptapDoc } from "./types";

// Desktop Article/Document windows used to store plain paragraph strings
// before they got a real rich-text body. Converts old rows into an
// equivalent Tiptap doc so editing one loads its content into the new
// editor instead of silently starting blank.
export function paragraphsToTiptapDoc(paragraphs: string[]): TiptapDoc {
  return {
    type: "doc",
    content: paragraphs
      .filter(Boolean)
      .map((text) => ({
        type: "paragraph",
        content: [{ type: "text", text }],
      })),
  };
}
