import { useState, useMemo, useEffect } from "react";
import {
  IconFolder,
  IconChevronDown,
  IconChevronRight,
  IconFileText,
} from "@tabler/icons-react";
import type { Note } from "./mockNotes";

interface NotesDrawerProps {
  notes: Note[];
  selectedNoteId: string | null;
  onSelectNote: (noteId: string) => void;
  autoExpandAll?: boolean;
}

interface TreeFolder {
  type: "folder";
  name: string;
  path: string;
  children: (TreeFolder | TreeNote)[];
}

interface TreeNote {
  type: "note";
  id: string;
  name: string;
  path: string;
  note: Note;
}

type TreeNode = TreeFolder | TreeNote;

function buildTree(notes: Note[]): TreeNode[] {
  const root: TreeNode[] = [];

  notes.forEach((note) => {
    const parts = note.path.split("/");
    let currentLevel = root;
    let currentPath = "";

    parts.forEach((part, index) => {
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      const isLast = index === parts.length - 1;

      if (isLast) {
        currentLevel.push({
          type: "note",
          id: note.id,
          name: note.title,
          path: currentPath,
          note,
        });
      } else {
        let folder = currentLevel.find(
          (node): node is TreeFolder =>
            node.type === "folder" && node.name === part
        );

        if (!folder) {
          folder = {
            type: "folder",
            name: part,
            path: currentPath,
            children: [],
          };
          currentLevel.push(folder);
        }
        currentLevel = folder.children;
      }
    });
  });

  const sortNodes = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === "folder" ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
    nodes.forEach((node) => {
      if (node.type === "folder") {
        sortNodes(node.children);
      }
    });
  };

  sortNodes(root);
  return root;
}

export function NotesDrawer({
  notes,
  selectedNoteId,
  onSelectNote,
  autoExpandAll = false,
}: NotesDrawerProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set()
  );

  const tree = useMemo(() => buildTree(notes), [notes]);

  // Auto-expand folders on search or initial select
  useEffect(() => {
    if (autoExpandAll) {
      const foldersToExpand = new Set<string>();
      const addFolders = (nodes: TreeNode[]) => {
        nodes.forEach((node) => {
          if (node.type === "folder") {
            foldersToExpand.add(node.path);
            addFolders(node.children);
          }
        });
      };
      addFolders(tree);
      setExpandedFolders((prev) => {
        const next = new Set(prev);
        foldersToExpand.forEach((f) => next.add(f));
        return next;
      });
    }
  }, [autoExpandAll, tree]);

  useEffect(() => {
    if (selectedNoteId) {
      const selectedNote = notes.find((n) => n.id === selectedNoteId);
      if (selectedNote) {
        const parts = selectedNote.path.split("/");
        if (parts.length > 1) {
          const foldersToExpand = new Set<string>();
          let currentPath = "";
          for (let i = 0; i < parts.length - 1; i++) {
            currentPath = currentPath ? `${currentPath}/${parts[i]}` : parts[i];
            foldersToExpand.add(currentPath);
          }
          setExpandedFolders((prev) => {
            const next = new Set(prev);
            foldersToExpand.forEach((f) => next.add(f));
            return next;
          });
        }
      }
    }
  }, [selectedNoteId, notes]);

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const renderTree = (nodes: TreeNode[], level = 0) => {
    return (
      <ul className="space-y-0.5">
        {nodes.map((node) => {
          if (node.type === "folder") {
            const isExpanded = expandedFolders.has(node.path);
            return (
              <li key={node.path}>
                <button
                  onClick={() => toggleFolder(node.path)}
                  className="w-full flex items-center gap-1.5 px-2 py-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors group"
                  style={{ paddingLeft: `${level * 12 + 8}px` }}
                >
                  <span className="shrink-0">
                    {isExpanded ? (
                      <IconChevronDown className="w-3.5 h-3.5" />
                    ) : (
                      <IconChevronRight className="w-3.5 h-3.5" />
                    )}
                  </span>
                  <IconFolder className="w-4 h-4 text-slate-500 group-hover:text-slate-400 shrink-0" />
                  <span className="text-sm font-medium truncate">
                    {node.name}
                  </span>
                </button>
                {isExpanded && renderTree(node.children, level + 1)}
              </li>
            );
          } else {
            const isSelected = selectedNoteId === node.id;
            return (
              <li key={node.id}>
                <button
                  onClick={() => onSelectNote(node.id)}
                  className={`w-full flex items-center gap-2 px-2 py-1 rounded transition-colors ${
                    isSelected
                      ? "bg-slate-700 text-slate-100"
                      : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                  style={{ paddingLeft: `${level * 12 + 28}px` }}
                >
                  <IconFileText className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="text-sm truncate">{node.name}</span>
                </button>
              </li>
            );
          }
        })}
      </ul>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Tree list */}
      <div className="flex-1 overflow-y-auto -mx-2 px-2">
        {tree.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            No notes found
          </div>
        ) : (
          renderTree(tree)
        )}
      </div>
    </div>
  );
}
