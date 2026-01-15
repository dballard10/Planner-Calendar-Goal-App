import { useCallback, useRef } from "react";
import { DarkCodeMirror, type ReactCodeMirrorRef } from "../ui/DarkCodeMirror";
import { markdown } from "@codemirror/lang-markdown";
import { EditorView, Decoration, ViewPlugin, ViewUpdate, WidgetType } from "@codemirror/view";
import type { Extension } from "@codemirror/state";
import { RangeSet } from "@codemirror/state";
import { syntaxTree } from "@codemirror/language";

// ----------------------------------------------------------------------------
// Theme matching app's slate dark design with prose-like typography
// ----------------------------------------------------------------------------
const livePreviewTheme = EditorView.theme({
  "&": {
    backgroundColor: "transparent",
    color: "#cbd5e1",
    fontSize: "15px",
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  "&.cm-focused": {
    outline: "none",
  },
  ".cm-content": {
    padding: "24px",
    caretColor: "#38bdf8",
    lineHeight: "1.75",
  },
  ".cm-line": {
    padding: "2px 0",
  },
  ".cm-gutters": {
    display: "none",
  },
  ".cm-cursor": {
    borderLeftColor: "#38bdf8",
  },
  ".cm-selectionBackground": {
    backgroundColor: "#334155 !important",
  },
  "&.cm-focused .cm-selectionBackground": {
    backgroundColor: "#334155 !important",
  },
  ".cm-activeLine": {
    backgroundColor: "transparent",
  },
  // Live preview styles for non-active lines
  ".lp-heading-1": {
    fontSize: "1.5em",
    fontWeight: "700",
    color: "#f1f5f9",
    borderBottom: "1px solid #334155",
    paddingBottom: "4px",
    marginBottom: "4px",
  },
  ".lp-heading-2": {
    fontSize: "1.25em",
    fontWeight: "600",
    color: "#f1f5f9",
  },
  ".lp-heading-3": {
    fontSize: "1.125em",
    fontWeight: "600",
    color: "#e2e8f0",
  },
  ".lp-heading-4, .lp-heading-5, .lp-heading-6": {
    fontSize: "1em",
    fontWeight: "600",
    color: "#cbd5e1",
  },
  ".lp-blockquote": {
    borderLeft: "3px solid #475569",
    paddingLeft: "12px",
    color: "#94a3b8",
    fontStyle: "italic",
  },
  ".lp-list-item": {
    paddingLeft: "8px",
  },
  ".lp-code-inline": {
    backgroundColor: "#1e293b",
    padding: "2px 6px",
    borderRadius: "4px",
    color: "#22d3ee",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    fontSize: "0.9em",
  },
  ".lp-code-fence": {
    backgroundColor: "#1e293b",
    borderRadius: "6px",
    padding: "4px 8px",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    fontSize: "0.9em",
  },
  ".lp-bold": {
    fontWeight: "700",
    color: "#f1f5f9",
  },
  ".lp-italic": {
    fontStyle: "italic",
    color: "#cbd5e1",
  },
  ".lp-link": {
    color: "#22d3ee",
    textDecoration: "underline",
    textUnderlineOffset: "2px",
  },
  ".lp-hidden": {
    fontSize: "0",
    width: "0",
    display: "inline-block",
    overflow: "hidden",
  },
  ".lp-checkbox": {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "16px",
    height: "16px",
    border: "1px solid #475569",
    borderRadius: "3px",
    marginRight: "8px",
    backgroundColor: "#1e293b",
    verticalAlign: "middle",
    cursor: "default",
  },
  ".lp-checkbox-checked": {
    backgroundColor: "#0891b2",
    borderColor: "#0891b2",
  },
  ".lp-bullet": {
    display: "inline-block",
    width: "6px",
    height: "6px",
    backgroundColor: "#64748b",
    borderRadius: "50%",
    marginRight: "10px",
    verticalAlign: "middle",
  },
  ".lp-number": {
    display: "inline-block",
    color: "#64748b",
    marginRight: "8px",
    minWidth: "20px",
    textAlign: "right",
  },
}, { dark: true });

// ----------------------------------------------------------------------------
// Checkbox widget for task items
// ----------------------------------------------------------------------------
class CheckboxWidget extends WidgetType {
  constructor(readonly checked: boolean) {
    super();
  }

  toDOM() {
    const span = document.createElement("span");
    span.className = `lp-checkbox${this.checked ? " lp-checkbox-checked" : ""}`;
    if (this.checked) {
      span.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    }
    return span;
  }

  ignoreEvent() {
    return true;
  }
}

// ----------------------------------------------------------------------------
// Bullet widget for unordered list items
// ----------------------------------------------------------------------------
class BulletWidget extends WidgetType {
  toDOM() {
    const span = document.createElement("span");
    span.className = "lp-bullet";
    return span;
  }

  ignoreEvent() {
    return true;
  }
}

// ----------------------------------------------------------------------------
// Number widget for ordered list items
// ----------------------------------------------------------------------------
class NumberWidget extends WidgetType {
  constructor(readonly num: string) {
    super();
  }

  toDOM() {
    const span = document.createElement("span");
    span.className = "lp-number";
    span.textContent = `${this.num}.`;
    return span;
  }

  ignoreEvent() {
    return true;
  }
}

// ----------------------------------------------------------------------------
// Live preview decorations plugin
// ----------------------------------------------------------------------------
const hiddenMark = Decoration.mark({ class: "lp-hidden" });
const boldMark = Decoration.mark({ class: "lp-bold" });
const italicMark = Decoration.mark({ class: "lp-italic" });
const linkMark = Decoration.mark({ class: "lp-link" });
const inlineCodeMark = Decoration.mark({ class: "lp-code-inline" });
const codeFenceMark = Decoration.mark({ class: "lp-code-fence" });
const blockquoteMark = Decoration.line({ class: "lp-blockquote" });
const listItemMark = Decoration.line({ class: "lp-list-item" });

function headingLineMark(level: number) {
  return Decoration.line({ class: `lp-heading-${level}` });
}

function getActiveLineNumbers(view: EditorView): Set<number> {
  const activeLines = new Set<number>();
  for (const range of view.state.selection.ranges) {
    const startLine = view.state.doc.lineAt(range.from).number;
    const endLine = view.state.doc.lineAt(range.to).number;
    for (let i = startLine; i <= endLine; i++) {
      activeLines.add(i);
    }
  }
  return activeLines;
}

function buildDecorations(view: EditorView): RangeSet<Decoration> {
  const activeLines = getActiveLineNumbers(view);
  const doc = view.state.doc;
  const tree = syntaxTree(view.state);

  // Track fenced code block ranges
  const fencedRanges: Array<{ from: number; to: number }> = [];
  tree.iterate({
    enter(node) {
      if (node.name === "FencedCode") {
        fencedRanges.push({ from: node.from, to: node.to });
      }
    },
  });

  const isInFencedBlock = (pos: number) =>
    fencedRanges.some((r) => pos >= r.from && pos <= r.to);

  // Collect all decorations - will use Decoration.set() with sorting
  const ranges: Array<{ from: number; to: number; value: Decoration }> = [];
  
  // Helper to add a decoration
  const addRange = (from: number, to: number, value: Decoration) => {
    ranges.push({ from, to, value });
  };

  // Process each line
  for (let i = 1; i <= doc.lines; i++) {
    const line = doc.line(i);
    const lineText = line.text;
    const isActive = activeLines.has(i);

    // Skip decoration hiding for active lines
    if (isActive) continue;

    // Skip if line is inside a fenced code block (except for the fence markers themselves)
    if (isInFencedBlock(line.from) && !lineText.startsWith("```")) {
      continue;
    }

    // Heading detection
    const headingMatch = lineText.match(/^(#{1,6})\s/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      // Line decoration for heading style
      addRange(line.from, line.from, headingLineMark(level));
      // Hide the # markers and space
      addRange(line.from, line.from + headingMatch[0].length, hiddenMark);
      continue;
    }

    // Blockquote detection
    const blockquoteMatch = lineText.match(/^>\s?/);
    if (blockquoteMatch) {
      addRange(line.from, line.from, blockquoteMark);
      addRange(line.from, line.from + blockquoteMatch[0].length, hiddenMark);
      continue;
    }

    // Task list detection - [ ] or - [x]
    const taskMatch = lineText.match(/^(\s*)- \[([ x])\]\s/);
    if (taskMatch) {
      const indent = taskMatch[1].length;
      const checked = taskMatch[2] === "x";
      const markerEnd = line.from + taskMatch[0].length;
      
      // Line decoration
      addRange(line.from, line.from, listItemMark);
      // Hide the marker
      addRange(line.from + indent, markerEnd, hiddenMark);
      // Add checkbox widget
      addRange(line.from + indent, line.from + indent, Decoration.widget({
        widget: new CheckboxWidget(checked),
        side: 1,
      }));
      continue;
    }

    // Unordered list detection (- or *)
    const ulMatch = lineText.match(/^(\s*)[-*]\s/);
    if (ulMatch) {
      const indent = ulMatch[1].length;
      const markerEnd = line.from + ulMatch[0].length;
      
      addRange(line.from, line.from, listItemMark);
      addRange(line.from + indent, markerEnd, hiddenMark);
      addRange(line.from + indent, line.from + indent, Decoration.widget({
        widget: new BulletWidget(),
        side: 1,
      }));
      continue;
    }

    // Ordered list detection
    const olMatch = lineText.match(/^(\s*)(\d+)\.\s/);
    if (olMatch) {
      const indent = olMatch[1].length;
      const num = olMatch[2];
      const markerEnd = line.from + olMatch[0].length;
      
      addRange(line.from, line.from, listItemMark);
      addRange(line.from + indent, markerEnd, hiddenMark);
      addRange(line.from + indent, line.from + indent, Decoration.widget({
        widget: new NumberWidget(num),
        side: 1,
      }));
      continue;
    }

    // Fenced code block markers
    if (lineText.startsWith("```")) {
      addRange(line.from, line.to, codeFenceMark);
      continue;
    }

    // Inline formatting within the line (bold, italic, inline code, links)
    // Bold **text** or __text__
    let match;
    const boldRegex = /(\*\*|__)(.+?)\1/g;
    while ((match = boldRegex.exec(lineText)) !== null) {
      const start = line.from + match.index;
      const markerLen = match[1].length;
      const end = start + match[0].length;
      
      addRange(start, start + markerLen, hiddenMark);
      addRange(start + markerLen, end - markerLen, boldMark);
      addRange(end - markerLen, end, hiddenMark);
    }

    // Italic *text* or _text_ (but not inside bold)
    const italicRegex = /(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)|(?<!_)_(?!_)(.+?)(?<!_)_(?!_)/g;
    while ((match = italicRegex.exec(lineText)) !== null) {
      const start = line.from + match.index;
      const end = start + match[0].length;
      
      addRange(start, start + 1, hiddenMark);
      addRange(start + 1, end - 1, italicMark);
      addRange(end - 1, end, hiddenMark);
    }

    // Inline code `code`
    const codeRegex = /`([^`]+)`/g;
    while ((match = codeRegex.exec(lineText)) !== null) {
      const start = line.from + match.index;
      const end = start + match[0].length;
      
      addRange(start, start + 1, hiddenMark);
      addRange(start + 1, end - 1, inlineCodeMark);
      addRange(end - 1, end, hiddenMark);
    }

    // Links [text](url)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    while ((match = linkRegex.exec(lineText)) !== null) {
      const start = line.from + match.index;
      const textStart = start + 1;
      const textEnd = textStart + match[1].length;
      const end = start + match[0].length;
      
      addRange(start, start + 1, hiddenMark);
      addRange(textStart, textEnd, linkMark);
      addRange(textEnd, end, hiddenMark);
    }
  }

  // Use Decoration.set with sort=true to handle sorting automatically
  return Decoration.set(
    ranges.map(r => r.value.range(r.from, r.to)),
    true
  );
}

const livePreviewPlugin = ViewPlugin.fromClass(
  class {
    decorations: RangeSet<Decoration>;

    constructor(view: EditorView) {
      this.decorations = buildDecorations(view);
    }

    update(update: ViewUpdate) {
      if (update.docChanged || update.selectionSet || update.viewportChanged) {
        this.decorations = buildDecorations(update.view);
      }
    }
  },
  {
    decorations: (v) => v.decorations,
  }
);

// ----------------------------------------------------------------------------
// LiveMarkdownEditor component
// ----------------------------------------------------------------------------
interface LiveMarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function LiveMarkdownEditor({
  value,
  onChange,
  placeholder = "Start writing...",
}: LiveMarkdownEditorProps) {
  const editorRef = useRef<ReactCodeMirrorRef>(null);

  const handleChange = useCallback(
    (val: string) => {
      onChange(val);
    },
    [onChange]
  );

  const extensions: Extension[] = [
    markdown(),
    livePreviewTheme,
    livePreviewPlugin,
    EditorView.lineWrapping,
  ];

  // Add placeholder extension
  if (placeholder) {
    extensions.push(
      EditorView.theme({
        ".cm-content[data-placeholder]::before": {
          content: `"${placeholder}"`,
          color: "#64748b",
          position: "absolute",
          pointerEvents: "none",
        },
      })
    );
  }

  return (
    <div className="h-full w-full overflow-auto">
      <DarkCodeMirror
        ref={editorRef}
        value={value}
        onChange={handleChange}
        extensions={extensions}
        basicSetup={{
          lineNumbers: false,
          foldGutter: false,
          highlightActiveLine: false,
          highlightSelectionMatches: false,
          drawSelection: true,
          dropCursor: true,
          allowMultipleSelections: false,
          indentOnInput: true,
          bracketMatching: false,
          closeBrackets: false,
          autocompletion: false,
          rectangularSelection: false,
          crosshairCursor: false,
          highlightActiveLineGutter: false,
          searchKeymap: false,
        }}
        placeholder={placeholder}
        autoFocus
        className="h-full"
      />
    </div>
  );
}
