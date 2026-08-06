"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TiptapImage from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { useRef, useState } from "react";
import {
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Strikethrough,
  Code as CodeIcon,
  Link2,
  Image as ImageIcon,
  Video,
  Quote,
  List,
  ListOrdered,
} from "lucide-react";
import { Embed, parseEmbedUrl } from "@/lib/richtext/embed-extension";
import type { TiptapDoc } from "@/lib/richtext/types";
import { EMPTY_DOC } from "@/lib/richtext/types";
import {
  ADMIN_BUTTON_CLASS,
  ADMIN_BUTTON_SECONDARY_CLASS,
  ADMIN_FOCUS_RING_CLASS,
  ADMIN_INPUT_CLASS,
  ADMIN_LABEL_CLASS,
} from "@/lib/admin/ui";

function ToolbarButton({
  onClick,
  active,
  children,
  label,
}: {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${ADMIN_FOCUS_RING_CLASS} ${
        active ? "bg-black text-white" : "text-black/60 hover:bg-black/[0.06] hover:text-black"
      }`}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div aria-hidden className="mx-1 h-5 w-px shrink-0 bg-black/10" />;
}

type PromptMode = "link" | "embed" | null;

export default function RichTextEditor({
  name,
  slug,
  defaultValue,
  uploadImageAction,
  ariaLabelledBy,
}: {
  name: string;
  slug: string;
  defaultValue?: TiptapDoc;
  uploadImageAction: (slug: string, formData: FormData) => Promise<string>;
  ariaLabelledBy?: string;
}) {
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const promptDialogRef = useRef<HTMLDialogElement>(null);
  const [promptMode, setPromptMode] = useState<PromptMode>(null);
  const [promptValue, setPromptValue] = useState("");
  const [promptError, setPromptError] = useState<string | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      // StarterKit v3 already bundles Link — configuring it separately
      // registered two extensions named "link" and silently broke typing.
      StarterKit.configure({
        link: { openOnClick: false },
      }),
      TiptapImage,
      Placeholder.configure({ placeholder: "Start writing..." }),
      Embed,
    ],
    content: defaultValue ?? EMPTY_DOC,
    onUpdate: ({ editor }) => {
      if (hiddenInputRef.current) {
        hiddenInputRef.current.value = JSON.stringify(editor.getJSON());
      }
    },
    editorProps: {
      attributes: {
        class:
          "prose-none min-h-[400px] text-lg leading-relaxed text-black focus:outline-none [&_h2]:font-gothic [&_h2]:text-2xl [&_h2]:mt-8 [&_h3]:font-gothic [&_h3]:text-xl [&_h3]:mt-6 [&_p]:my-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_blockquote]:border-l-2 [&_blockquote]:border-black/20 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-black/70 [&_code]:rounded [&_code]:bg-black/5 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-base [&_a]:text-lt-blue [&_a]:underline [&_a]:decoration-lt-blue/40 [&_a]:underline-offset-2",
        ...(ariaLabelledBy ? { "aria-labelledby": ariaLabelledBy } : {}),
      },
    },
  });

  function currentStyle() {
    if (editor?.isActive("heading", { level: 2 })) return "h2";
    if (editor?.isActive("heading", { level: 3 })) return "h3";
    return "p";
  }

  function applyStyle(value: string) {
    if (!editor) return;
    if (value === "h2") editor.chain().focus().setHeading({ level: 2 }).run();
    else if (value === "h3") editor.chain().focus().setHeading({ level: 3 }).run();
    else editor.chain().focus().setParagraph().run();
  }

  async function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !editor) return;

    const formData = new FormData();
    formData.append("file", file);
    const url = await uploadImageAction(slug, formData);
    editor.chain().focus().setImage({ src: url }).run();
  }

  function openPrompt(mode: PromptMode) {
    setPromptMode(mode);
    setPromptValue("");
    setPromptError(null);
    promptDialogRef.current?.showModal();
  }

  function closePrompt() {
    promptDialogRef.current?.close();
    setPromptMode(null);
  }

  function handlePromptSubmit(e: { preventDefault: () => void }) {
    e.preventDefault();
    if (!editor) return;
    const url = promptValue.trim();
    if (!url) return;

    if (promptMode === "link") {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
      closePrompt();
      return;
    }

    if (promptMode === "embed") {
      const parsed = parseEmbedUrl(url);
      if (!parsed) {
        setPromptError("That doesn't look like a YouTube or Vimeo link.");
        return;
      }
      editor.chain().focus().insertContent({ type: "embed", attrs: parsed }).run();
      closePrompt();
    }
  }

  if (!editor) {
    return <div className="min-h-[400px] text-lg text-black/40">Loading editor...</div>;
  }

  return (
    <div>
      <input
        ref={hiddenInputRef}
        type="hidden"
        name={name}
        defaultValue={JSON.stringify(defaultValue ?? EMPTY_DOC)}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        className="hidden"
      />

      <EditorContent editor={editor} />

      <div className="sticky bottom-0 z-10 -mx-8 mt-6 flex flex-wrap items-center gap-0.5 border-t border-black/10 bg-white/95 px-8 py-2 backdrop-blur">
        <label htmlFor="richtext-style" className="sr-only">
          Text style
        </label>
        <select
          id="richtext-style"
          value={currentStyle()}
          onChange={(e) => applyStyle(e.target.value)}
          className={`h-8 rounded-md border-none bg-transparent px-2 text-xs font-medium text-black/70 hover:bg-black/[0.06] focus:outline-none ${ADMIN_FOCUS_RING_CLASS}`}
        >
          <option value="p">Paragraph</option>
          <option value="h2">Heading</option>
          <option value="h3">Subheading</option>
        </select>

        <ToolbarDivider />

        <ToolbarButton
          label="Bold"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <BoldIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Italic"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <ItalicIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Strikethrough"
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Code"
          active={editor.isActive("code")}
          onClick={() => editor.chain().focus().toggleCode().run()}
        >
          <CodeIcon className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton label="Link" onClick={() => openPrompt("link")}>
          <Link2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Insert image"
          onClick={() => fileInputRef.current?.click()}
        >
          <ImageIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Embed video" onClick={() => openPrompt("embed")}>
          <Video className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          label="Quote"
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Bullet list"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Numbered list"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {/*
        Native <dialog> replaces the old window.prompt()/window.alert() pair —
        those block the whole page, can't be styled, and aren't part of the
        app's normal focus/tab order for assistive tech.
      */}
      <dialog
        ref={promptDialogRef}
        aria-labelledby="richtext-prompt-title"
        className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-lg border border-black/10 bg-white p-6 shadow-xl backdrop:bg-black/50"
        onClick={(e) => {
          if (e.target === promptDialogRef.current) closePrompt();
        }}
        onCancel={(e) => {
          e.preventDefault();
          closePrompt();
        }}
      >
        {/*
          A plain div, not a <form> — this dialog is rendered inside the
          post form (Save Post's <form>), and HTML doesn't allow nested
          forms. Enter-to-submit is preserved via onKeyDown below.
        */}
        <div>
          <h2
            id="richtext-prompt-title"
            className="text-base font-semibold text-black"
          >
            {promptMode === "embed" ? "Embed video" : "Insert link"}
          </h2>

          <label htmlFor="richtext-prompt-input" className={`mt-4 block ${ADMIN_LABEL_CLASS}`}>
            {promptMode === "embed" ? "YouTube or Vimeo URL" : "Link URL"}
          </label>
          <input
            id="richtext-prompt-input"
            type="url"
            autoFocus
            value={promptValue}
            onChange={(e) => {
              setPromptValue(e.target.value);
              setPromptError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handlePromptSubmit(e);
            }}
            placeholder="https://..."
            className={ADMIN_INPUT_CLASS}
          />
          {promptError && (
            <p role="alert" className="mt-1 text-xs font-medium text-red-600">
              {promptError}
            </p>
          )}

          <div className="mt-5 flex justify-end gap-3">
            <button
              type="button"
              onClick={closePrompt}
              className={ADMIN_BUTTON_SECONDARY_CLASS}
            >
              Cancel
            </button>
            <button type="button" onClick={handlePromptSubmit} className={ADMIN_BUTTON_CLASS}>
              {promptMode === "embed" ? "Embed" : "Insert"}
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
