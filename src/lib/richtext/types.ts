export type TiptapMark = {
  type: string;
  attrs?: Record<string, unknown>;
};

export type TiptapNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TiptapNode[];
  text?: string;
  marks?: TiptapMark[];
};

export type TiptapDoc = {
  type: "doc";
  content: TiptapNode[];
};

export const EMPTY_DOC: TiptapDoc = { type: "doc", content: [] };
