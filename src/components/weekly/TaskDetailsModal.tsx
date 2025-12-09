import { createPortal } from "react-dom";
import { useEffect } from "react";
import type { Task, TaskStatus } from "../../types/weekly";
import TaskDetailsContent from "./TaskDetailsContent";
import { IconX } from "@tabler/icons-react";

interface TaskDetailsModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (status: TaskStatus) => void;
  onTitleChange?: (title: string) => void;
}

export default function TaskDetailsModal({
  task,
  isOpen,
  onClose,
  onStatusChange,
  onTitleChange,
}: TaskDetailsModalProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 border border-slate-700 w-full max-w-2xl max-h-[85vh] rounded-lg shadow-2xl flex flex-col relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-100 rounded hover:bg-slate-800 transition-colors z-10"
        >
          <IconX className="w-5 h-5" />
        </button>
        <div className="flex-1 overflow-hidden p-2">
           <TaskDetailsContent 
             task={task} 
             onStatusChange={onStatusChange}
             onTitleChange={onTitleChange}
           />
        </div>
      </div>
      <div className="absolute inset-0 -z-10" onClick={onClose} />
    </div>,
    document.body
  );
}

