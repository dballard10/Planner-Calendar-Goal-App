import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { IconCalendar, IconClock } from "@tabler/icons-react";
import type { Task, TaskStatus } from "../../types/weekly";
import StatusSelector from "./StatusSelector";

interface TaskDetailsContentProps {
  task: Task;
  onStatusChange?: (status: TaskStatus) => void;
  onTitleChange?: (title: string) => void;
}

export default function TaskDetailsContent({
  task,
  onStatusChange,
  onTitleChange,
}: TaskDetailsContentProps) {
  // Placeholder markdown content
  const markdownContent = `
### Notes
- Add more details here...
- [ ] Subtask 1
- [ ] Subtask 2

### Description
This is a placeholder for the task description. In the future, this will be editable.
`;

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Header Section */}
      <div className="flex flex-col gap-4 border-b border-slate-700 pb-4">
        <div className="flex items-start gap-3">
          {/* Status Selector reused here */}
          <div className="mt-1">
            <StatusSelector
              status={task.status}
              onChange={(newStatus) => onStatusChange?.(newStatus)}
            />
          </div>

          {/* Title - we can make this editable later, for now just display */}
          <h2 className="text-xl font-bold text-slate-100 flex-1 leading-tight break-words">
            {task.title}
          </h2>
        </div>

        {/* Metadata */}
        {task.groupId && (
          <div className="bg-slate-800 px-2 py-0.5 rounded text-slate-300">
            Group ID: {task.groupId.slice(0, 8)}...
          </div>
        )}
      </div>

      {/* Markdown Content */}
      <div className="prose prose-invert prose-sm max-w-none flex-1 overflow-y-auto">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {markdownContent}
        </ReactMarkdown>
      </div>
    </div>
  );
}
