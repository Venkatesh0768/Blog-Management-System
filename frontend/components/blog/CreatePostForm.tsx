"use client";

import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  KeyboardEvent,
} from "react";
import { useRouter } from "next/navigation";
import { createPost } from "@/lib/api/post.api";
import { uploadImage } from "@/lib/api/image.api";
import {
  Loader2,
  ImagePlus,
  X,
  Bold,
  Italic,
  Quote,
  Code,
  Link2,
  List,
  Heading2,
  Heading3,
  Minus,
  AlignCenter,
  AlertCircle,
} from "lucide-react";
import { PostStatus } from "@/types/blog.types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface ImageEntry {
  id: string;
  file: File | null; // null = pasted/dropped without a File object
  previewUrl: string; // blob URL — always valid
  uploading: boolean;
  error: boolean;
  uploadedUrl?: string; // set after successful upload
}

// ─── Floating Format Toolbar ──────────────────────────────────────────────────

interface ToolbarPos {
  top: number;
  left: number;
}

const TOOLBAR_TOOLS = [
  { icon: <Bold size={14} />, cmd: "bold", title: "Bold (Ctrl+B)" },
  { icon: <Italic size={14} />, cmd: "italic", title: "Italic (Ctrl+I)" },
  { icon: <Heading2 size={14} />, cmd: "h2", title: "Heading 2" },
  { icon: <Heading3 size={14} />, cmd: "h3", title: "Heading 3" },
  { icon: <Quote size={14} />, cmd: "blockquote", title: "Blockquote" },
  { icon: <Code size={14} />, cmd: "code", title: "Inline code" },
  { icon: <Link2 size={14} />, cmd: "createLink", title: "Insert link" },
  { icon: <List size={14} />, cmd: "insertUnorderedList", title: "Bullet list" },
  { icon: <Minus size={14} />, cmd: "hr", title: "Divider" },
  { icon: <AlignCenter size={14} />, cmd: "justifyCenter", title: "Center" },
];

function execFormat(cmd: string) {
  switch (cmd) {
    case "h2":
      document.execCommand("formatBlock", false, "h2");
      break;
    case "h3":
      document.execCommand("formatBlock", false, "h3");
      break;
    case "blockquote":
      document.execCommand("formatBlock", false, "blockquote");
      break;
    case "code": {
      const sel = window.getSelection();
      if (sel && !sel.isCollapsed) {
        document.execCommand(
          "insertHTML",
          false,
          `<code>${sel.toString()}</code>`
        );
      }
      break;
    }
    case "createLink": {
      const url = prompt("Paste or type a link:");
      if (url) document.execCommand("createLink", false, url);
      break;
    }
    case "hr":
      document.execCommand(
        "insertHTML",
        false,
        "<hr/><p><br/></p>"
      );
      break;
    default:
      document.execCommand(cmd, false, undefined);
  }
}

function FormatToolbar({
  position,
}: {
  position: ToolbarPos | null;
}) {
  if (!position) return null;

  return (
    <div
      className="fixed z-[200] flex items-center gap-0.5 rounded-xl px-2 py-1.5 shadow-2xl"
      style={{
        top: position.top,
        left: position.left,
        transform: "translateX(-50%)",
        background: "#111",
        border: "1px solid rgba(255,255,255,0.08)",
        pointerEvents: "auto",
        // Subtle entrance
        animation: "tbFade 0.12s ease",
      }}
    >
      {TOOLBAR_TOOLS.map(({ icon, cmd, title }) => (
        <button
          key={cmd}
          type="button"
          title={title}
          onMouseDown={(e) => {
            e.preventDefault();
            execFormat(cmd);
          }}
          className="p-1.5 rounded-lg text-[#aaa] hover:text-white hover:bg-white/10 transition-colors"
          style={{ lineHeight: 1 }}
        >
          {icon}
        </button>
      ))}
      <style>{`@keyframes tbFade{from{opacity:0;transform:translateX(-50%) translateY(4px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
    </div>
  );
}

// ─── Inline Image Block (inside editor) ──────────────────────────────────────

/**
 * We render images directly inside the contentEditable via insertHTML.
 * Each image gets a wrapper <figure> with a data-img-id attribute so we can
 * swap the blob src for the real CDN URL after upload completes.
 */
function buildFigureHTML(previewUrl: string, id: string) {
  return `<figure contenteditable="false" data-img-id="${id}" style="margin:2em 0;text-align:center;user-select:none;">
    <img src="${previewUrl}" data-img-id="${id}" style="max-width:100%;border-radius:6px;display:inline-block;cursor:default;" alt="" />
    <figcaption contenteditable="true" data-placeholder="Add a caption (optional)" style="margin-top:8px;font-size:13px;color:#888;text-align:center;outline:none;min-height:1em;font-style:italic;"></figcaption>
  </figure><p><br/></p>`;
}

function updateFigureSrc(editorEl: HTMLElement, id: string, newSrc: string) {
  const img = editorEl.querySelector<HTMLImageElement>(
    `img[data-img-id="${id}"]`
  );
  if (img) img.src = newSrc;
}

// ─── Image Button (sidebar, appears on empty line) ────────────────────────────

function ImageSideButton({
  visible,
  top,
  onClick,
}: {
  visible: boolean;
  top: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title="Insert image"
      onClick={onClick}
      aria-label="Insert image"
      style={{
        position: "absolute",
        left: -48,
        top: top - 2,
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        transition: "opacity 0.15s ease",
        zIndex: 10,
      }}
      className="w-8 h-8 rounded-full border border-[#c4c7c7] bg-white hover:border-[#2a676b] hover:text-[#2a676b] flex items-center justify-center text-[#747878] transition-colors shadow-sm"
    >
      <ImagePlus size={15} />
    </button>
  );
}

// ─── Main Editor ──────────────────────────────────────────────────────────────

export default function CreatePostForm() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toolbarPos, setToolbarPos] = useState<ToolbarPos | null>(null);

  // Side image button
  const [imgBtnVisible, setImgBtnVisible] = useState(false);
  const [imgBtnTop, setImgBtnTop] = useState(0);

  const titleRef = useRef<HTMLTextAreaElement>(null);
  const subtitleRef = useRef<HTMLTextAreaElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const imgInputRef = useRef<HTMLInputElement>(null);
  const imagesRef = useRef<ImageEntry[]>([]); // mutable map: id → entry

  // ── Auto-resize textareas ──
  const autoResize = (el: HTMLTextAreaElement) => {
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  // ── Floating format toolbar ──
  const updateToolbar = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.toString().trim()) {
      setToolbarPos(null);
      return;
    }
    // Only show inside editor
    if (!editorRef.current?.contains(sel.anchorNode)) {
      setToolbarPos(null);
      return;
    }
    const rect = sel.getRangeAt(0).getBoundingClientRect();
    setToolbarPos({
      top: rect.top + window.scrollY - 52,
      left: rect.left + rect.width / 2 + window.scrollX,
    });
  }, []);

  useEffect(() => {
    const handler = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed) setToolbarPos(null);
    };
    document.addEventListener("selectionchange", handler);
    return () => document.removeEventListener("selectionchange", handler);
  }, []);

  // ── Side image button: show on empty paragraph ──
  const updateSideButton = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || !editorRef.current) return;

    const node = sel.anchorNode;
    if (!node) { setImgBtnVisible(false); return; }

    // Find the closest block element inside editor
    let block: Node | null = node;
    while (block && block !== editorRef.current) {
      if (block instanceof HTMLElement && /^(P|DIV|H[1-6]|BLOCKQUOTE|LI)$/.test(block.tagName)) break;
      block = block.parentNode;
    }

    if (!block || block === editorRef.current) { setImgBtnVisible(false); return; }

    const blockEl = block as HTMLElement;
    const isEmpty =
      blockEl.innerText.trim() === "" || blockEl.innerHTML === "<br>";

    if (isEmpty) {
      const editorRect = editorRef.current.getBoundingClientRect();
      const blockRect = blockEl.getBoundingClientRect();
      setImgBtnTop(blockRect.top - editorRect.top + editorRef.current.scrollTop);
      setImgBtnVisible(true);
    } else {
      setImgBtnVisible(false);
    }
  }, []);

  // ── Paste handler: intercept pasted images ──
  const handlePaste = useCallback(
    async (e: React.ClipboardEvent<HTMLDivElement>) => {
      const items = Array.from(e.clipboardData.items);
      const imageItems = items.filter((i) => i.type.startsWith("image/"));
      if (imageItems.length === 0) return;

      e.preventDefault();
      for (const item of imageItems) {
        const file = item.getAsFile();
        if (!file) continue;
        await insertImageFile(file);
      }
    },
    []
  );

  // ── Drop handler: intercept dropped images ──
  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      const files = Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith("image/")
      );
      if (files.length === 0) return;
      e.preventDefault();
      for (const file of files) await insertImageFile(file);
    },
    []
  );

  // ── Core: insert image into editor ──
  async function insertImageFile(file: File) {
    const id = uid();
    const previewUrl = URL.createObjectURL(file);

    const entry: ImageEntry = {
      id,
      file,
      previewUrl,
      uploading: true,
      error: false,
    };
    imagesRef.current = [...imagesRef.current, entry];

    // Insert figure HTML at cursor
    editorRef.current?.focus();
    document.execCommand("insertHTML", false, buildFigureHTML(previewUrl, id));

    // Upload in background
    try {
      const uploadedUrl = await uploadImage(file);
      // Swap blob for real URL in DOM
      if (editorRef.current) updateFigureSrc(editorRef.current, id, uploadedUrl);
      imagesRef.current = imagesRef.current.map((e) =>
        e.id === id ? { ...e, uploading: false, uploadedUrl } : e
      );
    } catch {
      // Mark as failed — keep blob so content is still visible
      imagesRef.current = imagesRef.current.map((e) =>
        e.id === id ? { ...e, uploading: false, error: true } : e
      );
    }
  }

  // ── File input → insert ──
  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    for (const file of files) await insertImageFile(file);
    e.target.value = "";
  };

  // ── Keyboard shortcuts inside editor ──
  const handleEditorKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "b") { e.preventDefault(); execFormat("bold"); }
    if ((e.ctrlKey || e.metaKey) && e.key === "i") { e.preventDefault(); execFormat("italic"); }
    // Enter inside figure caption → move out
    if (e.key === "Enter") {
      const sel = window.getSelection();
      if (sel?.anchorNode) {
        const figcap = (sel.anchorNode as Element).closest?.("figcaption");
        if (figcap) {
          e.preventDefault();
          const figure = figcap.closest("figure");
          const next = figure?.nextElementSibling as HTMLElement | null;
          if (next) {
            const r = document.createRange();
            r.setStart(next, 0);
            r.collapse(true);
            sel.removeAllRanges();
            sel.addRange(r);
          } else {
            document.execCommand("insertParagraph");
          }
        }
      }
    }
  };

  // ── Submit ──
  const handleSubmit = async (submitStatus: PostStatus) => {
    const content = editorRef.current?.innerHTML?.trim() ?? "";
    const plainText = editorRef.current?.innerText?.trim() ?? "";

    if (!title.trim()) { setError("Please add a title before publishing."); return; }
    if (!plainText) { setError("Please write some content before publishing."); return; }

    // Check for pending uploads
    const pending = imagesRef.current.filter((i) => i.uploading);
    if (pending.length > 0) {
      setError("Please wait — images are still uploading.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      await createPost({
        title: title.trim(),
        content, // send HTML content
        postStatus: submitStatus,
      });

      // Revoke all blob URLs
      imagesRef.current.forEach((img) => {
        if (img.previewUrl.startsWith("blob:")) URL.revokeObjectURL(img.previewUrl);
      });

      router.push("/dashboard");
    } catch {
      setError("Failed to save post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Ensure editor has initial paragraph ──
  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML.trim()) {
      editorRef.current.innerHTML = "<p><br/></p>";
    }
  }, []);

  return (
    <>
      {/* Global editor styles */}
      <style>{`
        .medium-editor {
          outline: none;
          min-height: 320px;
          font-family: 'Georgia', 'Times New Roman', serif;
          font-size: 20px;
          line-height: 1.8;
          color: #1b1c1c;
          caret-color: #2a676b;
          position: relative;
        }
        .medium-editor > p,
        .medium-editor > div {
          margin: 0 0 0.2em;
          min-height: 1.8em;
        }
        .medium-editor p:only-child br,
        .medium-editor p:first-child:last-child br {
          /* keep */
        }
        .medium-editor h2 {
          font-family: 'Georgia', serif;
          font-size: 28px;
          font-weight: 700;
          line-height: 1.3;
          margin: 1.4em 0 0.4em;
          color: #1b1c1c;
        }
        .medium-editor h3 {
          font-family: 'Georgia', serif;
          font-size: 22px;
          font-weight: 600;
          line-height: 1.35;
          margin: 1.2em 0 0.3em;
          color: #1b1c1c;
        }
        .medium-editor blockquote {
          border-left: 3px solid #1b1c1c;
          margin: 1.5em 0;
          padding: 0 0 0 24px;
          font-style: italic;
          font-size: 22px;
          color: #444;
          line-height: 1.7;
        }
        .medium-editor code {
          background: #f0efed;
          padding: 2px 7px;
          border-radius: 4px;
          font-family: 'Fira Mono', 'Courier New', monospace;
          font-size: 0.85em;
          color: #c7254e;
        }
        .medium-editor a {
          color: #2a676b;
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        .medium-editor ul {
          margin: 0.8em 0;
          padding-left: 28px;
        }
        .medium-editor li {
          margin: 0.25em 0;
        }
        .medium-editor hr {
          border: none;
          border-top: 1px solid #e9e8e7;
          margin: 2.5em auto;
          width: 60px;
        }
        .medium-editor figure {
          margin: 2em -32px;
          text-align: center;
          position: relative;
        }
        .medium-editor figure img {
          max-width: 100%;
          border-radius: 6px;
          display: inline-block;
        }
        .medium-editor figcaption {
          margin-top: 10px;
          font-size: 13px;
          color: #999;
          font-style: italic;
          font-family: sans-serif;
          text-align: center;
          outline: none;
          min-height: 1.2em;
        }
        .medium-editor figcaption:empty:before {
          content: attr(data-placeholder);
          color: #ccc;
          pointer-events: none;
        }
        /* Empty editor placeholder */
        .medium-editor:not(:focus) > p:first-child:last-child > br:only-child::before,
        .medium-editor > p:first-child.is-empty::before {
          content: '';
        }
        .medium-editor-placeholder {
          position: absolute;
          top: 0;
          left: 0;
          pointer-events: none;
          font-family: 'Georgia', 'Times New Roman', serif;
          font-size: 20px;
          line-height: 1.8;
          color: #c4c7c7;
          user-select: none;
        }
        /* Title + subtitle */
        .post-title::placeholder { color: #c4c7c7; }
        .post-subtitle::placeholder { color: #c4c7c7; }
      `}</style>

      <div className="relative w-full">
        {/* ── Error banner ── */}
        {error && (
          <div className="mb-8 flex items-start gap-3 px-4 py-3 rounded-xl text-sm font-sans"
            style={{ background: "#fff1f0", border: "1px solid #ffccc7", color: "#a8071a" }}>
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <span>{error}</span>
            <button type="button" onClick={() => setError(null)} className="ml-auto shrink-0 opacity-60 hover:opacity-100 transition-opacity">
              <X size={13} />
            </button>
          </div>
        )}

        {/* ── Title ── */}
        <textarea
          ref={titleRef}
          value={title}
          onChange={(e) => { setTitle(e.target.value); autoResize(e.target); }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              subtitleRef.current?.focus();
            }
          }}
          placeholder="Title"
          rows={1}
          disabled={isSubmitting}
          className="post-title w-full resize-none overflow-hidden bg-transparent border-none outline-none font-bold leading-tight tracking-tight mb-3"
          style={{
            fontFamily: "'Georgia', 'Times New Roman', serif",
            fontSize: "clamp(30px, 4.5vw, 46px)",
            color: "#1b1c1c",
            lineHeight: 1.15,
            letterSpacing: "-0.01em",
          }}
        />

        {/* ── Subtitle / description ── */}
        <textarea
          ref={subtitleRef}
          value={subtitle}
          onChange={(e) => { setSubtitle(e.target.value); autoResize(e.target); }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              editorRef.current?.focus();
              // Move cursor to end
              const range = document.createRange();
              const sel = window.getSelection();
              if (editorRef.current) {
                range.selectNodeContents(editorRef.current);
                range.collapse(false);
                sel?.removeAllRanges();
                sel?.addRange(range);
              }
            }
          }}
          placeholder="Add a subtitle..."
          rows={1}
          disabled={isSubmitting}
          className="post-subtitle w-full resize-none overflow-hidden bg-transparent border-none outline-none leading-snug mb-8"
          style={{
            fontFamily: "'Georgia', 'Times New Roman', serif",
            fontSize: "clamp(16px, 2vw, 22px)",
            color: "#747878",
            lineHeight: 1.4,
          }}
        />

        {/* ── Divider ── */}
        <div className="border-t border-[#e9e8e7] mb-10" />

        {/* ── Editor area (relative for side button) ── */}
        <div className="relative" style={{ paddingLeft: 0 }}>
          {/* Side image button */}
          <ImageSideButton
            visible={imgBtnVisible}
            top={imgBtnTop}
            onClick={() => imgInputRef.current?.click()}
          />

          {/* Editor placeholder */}
          <EditorPlaceholder editorRef={editorRef} />

          {/* Rich text editor */}
          <div
            ref={editorRef}
            contentEditable={!isSubmitting}
            suppressContentEditableWarning
            className="medium-editor"
            onMouseUp={updateToolbar}
            onKeyUp={() => { updateToolbar(); updateSideButton(); }}
            onKeyDown={handleEditorKeyDown}
            onClick={updateSideButton}
            onFocus={updateSideButton}
            onPaste={handlePaste}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            spellCheck
          />

          {/* Floating toolbar */}
          <FormatToolbar position={toolbarPos} />
        </div>

        {/* ── Divider ── */}
        <div className="border-t border-[#e9e8e7] mt-12 mb-8" />

        {/* ── Action bar ── */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="text-sm text-[#747878] font-sans">Publish as:</span>
            <StatusSelect disabled={isSubmitting} />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleSubmit("DRAFT")}
              disabled={isSubmitting}
              className="px-5 py-2.5 text-sm font-semibold font-sans text-[#444748] border border-[#c4c7c7] rounded-full hover:bg-[#f5f3f3] hover:border-[#999] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Save draft
            </button>
            <button
              type="button"
              onClick={() => handleSubmit("PUBLISHED")}
              disabled={isSubmitting || !title.trim()}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold font-sans text-white rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: "#1b1c1c" }}
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {isSubmitting ? "Publishing..." : "Publish story"}
            </button>
          </div>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={imgInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileInput}
      />
    </>
  );
}

// ─── Editor Placeholder ───────────────────────────────────────────────────────

function EditorPlaceholder({ editorRef }: { editorRef: React.RefObject<HTMLDivElement> }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    const update = () => {
      const text = el.innerText?.trim();
      setShow(!text || text === "");
    };
    el.addEventListener("input", update);
    el.addEventListener("focus", update);
    el.addEventListener("blur", update);
    return () => {
      el.removeEventListener("input", update);
      el.removeEventListener("focus", update);
      el.removeEventListener("blur", update);
    };
  }, [editorRef]);

  if (!show) return null;

  return (
    <span className="medium-editor-placeholder select-none pointer-events-none">
      Tell your story…
    </span>
  );
}

// ─── Status Select ────────────────────────────────────────────────────────────

function StatusSelect({ disabled }: { disabled: boolean }) {
  return (
    <select
      disabled={disabled}
      defaultValue="PUBLISHED"
      className="text-sm font-sans text-[#1b1c1c] bg-white border border-[#c4c7c7] rounded-full px-4 py-2 focus:outline-none focus:border-[#2a676b] transition-colors cursor-pointer"
    >
      <option value="DRAFT">Draft — only me</option>
      <option value="PUBLISHED">Published — everyone</option>
    </select>
  );
}