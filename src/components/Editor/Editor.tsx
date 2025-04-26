import React, { useState, useRef, useEffect } from "react";
import EditorToolbar from "./EditorToolbar";
import FormatMenu from "./FormatMenu";
import MentionMenu from "./MentionMenu";
import { toast } from "sonner";

interface Person {
  id: number;
  name: string;
  role: string;
}

interface EditorProps {
  initialContent?: string;
}

const Editor: React.FC<EditorProps> = ({ initialContent = "" }) => {
  const [content, setContent] = useState(initialContent);
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());
  const [formatMenuPosition, setFormatMenuPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [mentionMenuPosition, setMentionMenuPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [selection, setSelection] = useState<{
    start: number;
    end: number;
  } | null>(null);
  const [undoStack, setUndoStack] = useState<string[]>([initialContent]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const [fontSize, setFontSize] = useState("11");
  const [fontFamily, setFontFamily] = useState("Arial");
  const [currentTextColor, setCurrentTextColor] = useState<string | null>(null);
  const [currentHighlightColor, setCurrentHighlightColor] = useState<
    string | null
  >(null);

  const editorRef = useRef<HTMLDivElement>(null);
  const lastEditTimeRef = useRef<number>(Date.now());
  const undoTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (undoTimeoutRef.current) {
      clearTimeout(undoTimeoutRef.current);
    }

    undoTimeoutRef.current = setTimeout(() => {
      const currentTime = Date.now();
      if (
        currentTime - lastEditTimeRef.current > 500 &&
        content !== undoStack[undoStack.length - 1]
      ) {
        setUndoStack((prev) => [...prev, content]);
        setRedoStack([]);
      }
      lastEditTimeRef.current = currentTime;
    }, 500);

    return () => {
      if (undoTimeoutRef.current) {
        clearTimeout(undoTimeoutRef.current);
      }
    };
  }, [content, undoStack]);

  useEffect(() => {
    if (initialContent === "" && editorRef.current) {
      const sampleContent = `
        <h1>Sample Document</h1>
        <hr>
        <h2>Heading</h2>
        <p><strong>Bold</strong> text</p>
        <p><em>Italic</em> text</p>
        <p><u>Underlined</u> text</p>
        <p><strike>Strikethrough</strike> text</p>
        <p>X<sub>2</sub> and X<sup>2</sup></p>
        <ul>
          <li>Blockqude</li>
          <li>Numberedirem</li>
        </ul>
        <p>Text in red <span style="color: #ea384c;">red</span> <span style="background-color: #ff9800;">highligteted</span> text</p>
      `;

      editorRef.current.innerHTML = sampleContent;
      setContent(sampleContent);
    }
  }, [initialContent]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "/" && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
      if (editorRef.current) {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();

          setFormatMenuPosition({
            top: rect.bottom + window.scrollY,
            left: rect.left + window.scrollX,
          });
        }
      }
    }

    if ((e.ctrlKey || e.metaKey) && e.key === "z") {
      e.preventDefault();
      if (e.shiftKey) {
        handleRedo();
      } else {
        handleUndo();
      }
    }

    if ((e.ctrlKey || e.metaKey) && e.key === "b") {
      e.preventDefault();
      formatText("bold");
    }

    if ((e.ctrlKey || e.metaKey) && e.key === "i") {
      e.preventDefault();
      formatText("italic");
    }

    if ((e.ctrlKey || e.metaKey) && e.key === "u") {
      e.preventDefault();
      formatText("underline");
    }

    if ((e.ctrlKey || e.metaKey) && e.key === "d") {
      e.preventDefault();
      formatText("strikethrough");
    }
  };

  const handleUndo = () => {
    if (undoStack.length > 1) {
      const currentIndex = undoStack.length - 1;
      const prevContent = undoStack[currentIndex - 1];
      const currentContent = undoStack[currentIndex];

      setRedoStack((prev) => [...prev, currentContent]);
      setContent(prevContent);
      setUndoStack((prev) => prev.slice(0, prev.length - 1));

      if (editorRef.current) {
        editorRef.current.innerHTML = prevContent;
      }

      toast("Undo action");
    }
  };

  const handleRedo = () => {
    if (redoStack.length > 0) {
      const lastIndex = redoStack.length - 1;
      const nextContent = redoStack[lastIndex];

      setUndoStack((prev) => [...prev, nextContent]);
      setContent(nextContent);
      setRedoStack((prev) => prev.slice(0, prev.length - 1));

      if (editorRef.current) {
        editorRef.current.innerHTML = nextContent;
      }

      toast("Redo action");
    }
  };

  const handleSelectionChange = () => {
    const selection = window.getSelection();
    let currentElement: Node | null = null;
    let activeTextColor: string | null = null;
    let activeHighlightColor: string | null = null;
    const formats = new Set<string>();

    if (document.queryCommandState("bold")) formats.add("bold");
    if (document.queryCommandState("italic")) formats.add("italic");
    if (document.queryCommandState("underline")) formats.add("underline");
    if (document.queryCommandState("strikethrough"))
      formats.add("strikethrough");

    if (
      selection &&
      selection.rangeCount > 0 &&
      editorRef.current &&
      editorRef.current.contains(selection.anchorNode)
    ) {
      const range = selection.getRangeAt(0);

      if (range.collapsed) {
        currentElement = range.startContainer;
      } else {
        currentElement = range.commonAncestorContainer;
      }
      while (currentElement && currentElement !== editorRef.current) {
        if (currentElement.nodeType === Node.ELEMENT_NODE) {
          const element = currentElement as HTMLElement;
          const computedStyle = window.getComputedStyle(element);

          if (!activeTextColor) {
            const color = computedStyle.color;
            if (color && color !== "inherit" && color !== "rgb(0, 0, 0)") {
              activeTextColor = color;
            }
          }
          if (!activeHighlightColor) {
            const bgColor = computedStyle.backgroundColor || "#000000";
            if (
              bgColor &&
              bgColor !== "transparent" &&
              bgColor !== "rgba(0, 0, 0, 0)"
            ) {
              activeHighlightColor = bgColor;
            }
          }
          if (["H1", "H2", "H3", "H4", "H5", "H6"].includes(element.tagName)) {
            formats.add("heading");
          }
          const textAlign = computedStyle.textAlign;
          if (
            textAlign &&
            ["left", "center", "right", "justify"].includes(textAlign)
          ) {
            formats.add(`align-${textAlign}`);
          }

          const computedFontSize = computedStyle.fontSize;
          if (computedFontSize) {
            const sizeInPx = parseInt(computedFontSize);
            if (sizeInPx) setFontSize(sizeInPx.toString());
          }

          const computedFontFamily = computedStyle.fontFamily;
          if (computedFontFamily && computedFontFamily !== "inherit") {
            const fontName = computedFontFamily
              .split(",")[0]
              .replace(/['"]/g, "")
              .trim();
            if (
              fontName &&
              !["sans-serif", "serif", "monospace"].includes(
                fontName.toLowerCase()
              )
            ) {
              setFontFamily(fontName);
            }
          }
        }
        currentElement = currentElement.parentNode;
      }
    } else {
      activeTextColor = null;
      activeHighlightColor = null;
      setFontSize("11");
      setFontFamily("Arial");
      formats.clear();
    }

    setActiveFormats(formats);
    setCurrentTextColor(activeTextColor);
    setCurrentHighlightColor(activeHighlightColor);
  };
  useEffect(() => {
    const handler = () => {
      requestAnimationFrame(handleSelectionChange);
    };
    document.addEventListener("selectionchange", handler);
    handler();
    return () => {
      document.removeEventListener("selectionchange", handler);
    };
  }, []);

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      const preSelectionRange = range.cloneRange();
      if (editorRef.current) {
        preSelectionRange.selectNodeContents(editorRef.current);
        preSelectionRange.setEnd(range.startContainer, range.startOffset);
        const start = preSelectionRange.toString().length;

        return {
          start,
          end: start + range.toString().length,
        };
      }
    }
    return null;
  };

  const restoreSelection = (savedSelection: { start: number; end: number }) => {
    if (editorRef.current) {
      const sel = window.getSelection();
      if (sel) {
        let charIndex = 0;
        const range = document.createRange();
        range.setStart(editorRef.current, 0);
        range.collapse(true);

        const nodeStack = [editorRef.current];
        let node: Node | null;
        let foundStart = false;
        let stop = false;

        while (!stop && (node = nodeStack.pop())) {
          if (node.nodeType === Node.TEXT_NODE) {
            const nextCharIndex = charIndex + (node.textContent?.length || 0);
            if (
              !foundStart &&
              savedSelection.start >= charIndex &&
              savedSelection.start <= nextCharIndex
            ) {
              range.setStart(node, savedSelection.start - charIndex);
              foundStart = true;
            }
            if (
              foundStart &&
              savedSelection.end >= charIndex &&
              savedSelection.end <= nextCharIndex
            ) {
              range.setEnd(node, savedSelection.end - charIndex);
              stop = true;
            }
            charIndex = nextCharIndex;
          } else {
            const children = Array.from(node.childNodes);
            for (let i = children.length - 1; i >= 0; i--) {
              nodeStack.push(children[i] as Node as HTMLDivElement);
            }
          }
        }

        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
  };

  const formatText = (format: string, value?: string) => {
    if (!editorRef.current) return;

    const savedSelection = saveSelection();

    switch (format) {
      case "bold":
        document.execCommand("bold", false);
        break;
      case "italic":
        document.execCommand("italic", false);
        break;
      case "underline":
        document.execCommand("underline", false);
        break;
      case "strikethrough":
        document.execCommand("strikethrough", false);
        break;
      case "color":
        if (value) {
          document.execCommand("foreColor", false, value || "inherit");
        }
        break;
      case "highlight":
        if (value) {
          document.execCommand("backColor", false, value || "transparent");
        }
        break;
    }

    if (editorRef.current) {
      setTimeout(() => {
        if (editorRef.current) {
          const newContent = editorRef.current.innerHTML;
          setContent(newContent);
          if (savedSelection) {
            restoreSelection(savedSelection);
          }
          handleSelectionChange();
        }
      }, 0);
    }

    setFormatMenuPosition(null);

    handleSelectionChange();
  };

  const alignText = (alignment: string) => {
    document.execCommand(
      "justify" + alignment.charAt(0).toUpperCase() + alignment.slice(1),
      false
    );
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
    handleSelectionChange();
  };

  const formatList = (listType: string) => {
    if (listType === "ordered") {
      document.execCommand("insertOrderedList", false);
    } else if (listType === "unordered") {
      document.execCommand("insertUnorderedList", false);
    }

    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
    handleSelectionChange();
  };

  const handleIndent = (direction: "increase" | "decrease") => {
    if (direction === "increase") {
      document.execCommand("indent", false);
    } else {
      document.execCommand("outdent", false);
    }

    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  };

  const handleHeadingChange = () => {
    const selection = window.getSelection();

    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const parentNode = range.commonAncestorContainer;
      const parentElement =
        parentNode.nodeType === Node.TEXT_NODE && parentNode.parentElement
          ? parentNode.parentElement
          : (parentNode as HTMLElement);

      if (parentElement) {
        if (
          parentElement.tagName === "H1" ||
          parentElement.tagName === "H2" ||
          parentElement.tagName === "H3"
        ) {
          document.execCommand("formatBlock", false, "p");
        } else {
          document.execCommand("formatBlock", false, "h2");
        }

        if (editorRef.current) {
          setContent(editorRef.current.innerHTML);
        }
        handleSelectionChange();
      }
    }
  };

  const handleFontSizeChange = (size: string) => {
    setFontSize(size);
    document.execCommand("fontSize", false, "7");

    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      if (range.collapsed) {
        return;
      }

      const span = document.createElement("span");
      span.style.fontSize = `${size}px`;

      const contents = range.extractContents();
      span.appendChild(contents);
      range.insertNode(span);

      selection.removeAllRanges();
      selection.addRange(range);

      if (editorRef.current) {
        setContent(editorRef.current.innerHTML);
      }
    }
  };

  const handleFontFamilyChange = (font: string) => {
    setFontFamily(font);

    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      if (range.collapsed) {
        return;
      }

      const span = document.createElement("span");
      span.style.fontFamily = font;

      const contents = range.extractContents();
      span.appendChild(contents);
      range.insertNode(span);

      selection.removeAllRanges();
      selection.addRange(range);

      if (editorRef.current) {
        setContent(editorRef.current.innerHTML);
      }
    }
  };

  const handleSelectionClick = () => {
    const selection = window.getSelection();

    if (selection && !selection.isCollapsed && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      setFormatMenuPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
      });

      setSelection(saveSelection());
    } else {
      setFormatMenuPosition(null);
    }
  };

  const handleOpenMentionMenu = () => {
    const selection = window.getSelection();

    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      setMentionMenuPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
      });

      setFormatMenuPosition(null);
    }
  };

  const handleMentionSelect = (person: Person) => {
    const mention = `<span class="mention" contenteditable="false" data-person-id="${person.id}">@${person.name}</span>&nbsp;`;

    document.execCommand("insertHTML", false, mention);

    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }

    setMentionMenuPosition(null);
    toast(`Mentioned ${person.name}`);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);

    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  };

  return (
    <div className="border border-gray-300 rounded-lg shadow-sm bg-white max-w-4xl mx-auto">
      <div className="border-b border-gray-300 px-4 py-2 bg-gray-50 flex items-center">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-gray-400"></div>
          <div className="w-3 h-3 rounded-full bg-gray-400"></div>
          <div className="w-3 h-3 rounded-full bg-gray-400"></div>
        </div>
        <div className="mx-auto flex space-x-6 text-sm">
          <button className="hover:bg-gray-100 px-3 py-1 rounded">File</button>
          <button className="hover:bg-gray-100 px-3 py-1 rounded">Edit</button>
          <button className="hover:bg-gray-100 px-3 py-1 rounded">View</button>
          <button className="hover:bg-gray-100 px-3 py-1 rounded">
            Insert
          </button>
          <button className="hover:bg-gray-100 px-3 py-1 rounded">
            Format
          </button>
          <button className="hover:bg-gray-100 px-3 py-1 rounded">Tools</button>
          <button className="hover:bg-gray-100 px-3 py-1 rounded">Table</button>
        </div>
      </div>

      <EditorToolbar
        onFormatText={formatText}
        onAlignText={alignText}
        onListFormat={formatList}
        onIndent={handleIndent}
        onHeadingChange={handleHeadingChange}
        onFontSizeChange={handleFontSizeChange}
        onFontFamilyChange={handleFontFamilyChange}
        activeFormats={activeFormats}
        fontSize={fontSize}
        fontFamily={fontFamily}
        currentTextColor={currentTextColor}
        currentHighlightColor={currentHighlightColor}
      />

      <div
        ref={editorRef}
        className="editor-content"
        contentEditable
        dangerouslySetInnerHTML={{ __html: content }}
        onKeyDown={handleKeyDown}
        onMouseUp={handleSelectionClick}
        onPaste={handlePaste}
        onClick={() => setFormatMenuPosition(null)}
        aria-label="Rich text editor"
        role="textbox"
        aria-multiline="true"
      ></div>

      <FormatMenu
        position={formatMenuPosition}
        onClose={() => setFormatMenuPosition(null)}
        onFormat={formatText}
        onMention={handleOpenMentionMenu}
      />

      <MentionMenu
        position={mentionMenuPosition}
        onClose={() => setMentionMenuPosition(null)}
        onSelect={handleMentionSelect}
      />

      <div className="border-t border-gray-300 px-4 py-2 bg-gray-50 flex justify-between items-center text-xs text-gray-500">
        <div>
          Tip: Select text for formatting options or type / for commands
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleUndo}
            className="p-1 hover:bg-gray-200 rounded"
            title="Undo (Ctrl/⌘+Z)"
          >
            Undo
          </button>
          <button
            onClick={handleRedo}
            className="p-1 hover:bg-gray-200 rounded"
            title="Redo (Ctrl/⌘+Shift+Z)"
          >
            Redo
          </button>
        </div>
      </div>
    </div>
  );
};

export default Editor;
