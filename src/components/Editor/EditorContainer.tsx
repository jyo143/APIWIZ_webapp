import React from "react";
import Editor from "./Editor";

const EditorContainer: React.FC = () => {
  const initialContent = `
    <h1>Sample Document</h1>
    <p>Here's a demonstration of the rich text editor capabilities.</p>
    <h2>Heading</h2>
    <p><strong>Bold</strong> text</p>
    <p><em>Italic</em> text</p>
    <p><u>Underlined</u> text</p>
    <p><strike>Strikethrough</strike> text</p>
    <p>X<sub>2</sub> and X<sup>2</sup></p>
    <ul>
      <li>Blockqude</li>
      <li>Numbereditem</li>
    </ul>
    <p>Text in red <span style="color: #ff0000;">red</span> <span style="background-color: #ff9800;">highlighed</span> text</p>
  `;

  return (
    <div className="container mx-auto py-8 px-4">
      <Editor initialContent={initialContent} />

      <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-4 max-w-4xl mx-auto">
        <h2 className="text-lg font-semibold mb-2">Keyboard Shortcuts</h2>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            Ctrl/⌘ + B: <span className="font-medium">Bold</span>
          </div>
          <div>
            Ctrl/⌘ + I: <span className="font-medium">Italic</span>
          </div>
          <div>
            Ctrl/⌘ + U: <span className="font-medium">Underline</span>
          </div>
          <div>
            Ctrl/⌘ + Z: <span className="font-medium">Undo</span>
          </div>
          <div>
            Ctrl/⌘ + Shift + Z: <span className="font-medium">Redo</span>
          </div>
          <div>
            Type / for <span className="font-medium">Commands</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorContainer;
