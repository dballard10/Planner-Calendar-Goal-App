import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface WeekHeaderProps {
  weekStart: Date;
}

export default function WeekHeader({ weekStart }: WeekHeaderProps) {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const formatDate = (date: Date): string => {
    const month = date.toLocaleDateString("en-US", { month: "short" });
    const day = date.getDate();
    return `${month} ${day}`;
  };

  const content = `${formatDate(weekStart)} to ${formatDate(weekEnd)}`;

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ node, ...props }) => (
          <div className="text-lg font-medium text-slate-300 mb-2" {...props} />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
