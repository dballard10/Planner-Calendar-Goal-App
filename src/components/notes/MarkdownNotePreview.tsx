import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownNotePreviewProps {
  content: string;
  className?: string;
}

export function MarkdownNotePreview({
  content,
  className = "",
}: MarkdownNotePreviewProps) {
  return (
    <div className={`prose prose-invert prose-slate max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Headings
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold text-slate-100 mb-4 mt-6 first:mt-0 pb-2 border-b border-slate-700">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-semibold text-slate-100 mb-3 mt-5">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-semibold text-slate-200 mb-2 mt-4">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-base font-semibold text-slate-200 mb-2 mt-3">
              {children}
            </h4>
          ),
          h5: ({ children }) => (
            <h5 className="text-sm font-semibold text-slate-300 mb-1 mt-2">
              {children}
            </h5>
          ),
          h6: ({ children }) => (
            <h6 className="text-sm font-medium text-slate-400 mb-1 mt-2">
              {children}
            </h6>
          ),

          // Paragraphs and text
          p: ({ children }) => (
            <p className="text-slate-300 leading-relaxed mb-3">{children}</p>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-slate-100">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-slate-300">{children}</em>
          ),

          // Lists
          ul: ({ children }) => (
            <ul className="list-disc list-inside mb-3 space-y-1 text-slate-300">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside mb-3 space-y-1 text-slate-300">
              {children}
            </ol>
          ),
          li: ({ children, className }) => {
            // Handle task list items (GFM)
            const isTaskItem = className?.includes("task-list-item");
            return (
              <li
                className={`text-slate-300 ${
                  isTaskItem ? "list-none flex items-start gap-2" : ""
                }`}
              >
                {children}
              </li>
            );
          },

          // Task checkboxes (GFM)
          input: ({ checked, type }) => {
            if (type === "checkbox") {
              return (
                <input
                  type="checkbox"
                  checked={checked}
                  readOnly
                  className="mt-1 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-0 cursor-default"
                />
              );
            }
            return null;
          },

          // Links
          a: ({ href, children }) => {
            // Handle Obsidian-style wiki links [[Note Name]]
            const isWikiLink = href?.startsWith("[[") || !href;
            return (
              <a
                href={href}
                className={`${
                  isWikiLink
                    ? "text-purple-400 hover:text-purple-300"
                    : "text-cyan-400 hover:text-cyan-300"
                } underline underline-offset-2 transition-colors`}
                target={href?.startsWith("http") ? "_blank" : undefined}
                rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
              >
                {children}
              </a>
            );
          },

          // Code
          code: ({ className, children }) => {
            const isBlock = className?.includes("language-");
            if (isBlock) {
              return (
                <code className="block bg-slate-800 rounded-md p-4 text-sm font-mono text-slate-200 overflow-x-auto">
                  {children}
                </code>
              );
            }
            return (
              <code className="bg-slate-800 px-1.5 py-0.5 rounded text-sm font-mono text-cyan-300">
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="mb-3 overflow-x-auto">{children}</pre>
          ),

          // Blockquotes
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-slate-600 pl-4 py-1 my-3 text-slate-400 italic">
              {children}
            </blockquote>
          ),

          // Horizontal rule
          hr: () => <hr className="border-slate-700 my-6" />,

          // Tables (GFM)
          table: ({ children }) => (
            <div className="overflow-x-auto mb-4">
              <table className="w-full border-collapse text-sm">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-slate-800">{children}</thead>
          ),
          tbody: ({ children }) => <tbody>{children}</tbody>,
          tr: ({ children }) => (
            <tr className="border-b border-slate-700">{children}</tr>
          ),
          th: ({ children }) => (
            <th className="px-3 py-2 text-left font-semibold text-slate-200">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 text-slate-300">{children}</td>
          ),

          // Images
          img: ({ src, alt }) => (
            <img
              src={src}
              alt={alt}
              className="max-w-full h-auto rounded-md my-3"
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
