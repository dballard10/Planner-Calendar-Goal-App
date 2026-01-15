import { useState, useCallback, useMemo } from "react";
import {
  IconLayoutSidebarRight,
  IconPlus,
  IconSearch,
  IconFolder,
} from "@tabler/icons-react";
import { RightSidePanel } from "../layout/RightSidePanel";
import { NotesDrawer } from "./NotesDrawer";
import { LiveMarkdownEditor } from "./LiveMarkdownEditor";
import { mockNotes, createNewNote, type Note } from "./mockNotes";

export function NotesPage() {
  const [notes, setNotes] = useState<Note[]>(mockNotes);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(
    notes[0]?.id ?? null
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeRightTab, setActiveRightTab] = useState<"explorer" | "search">(
    "explorer"
  );
  const [searchQuery, setSearchQuery] = useState("");

  const selectedNote = notes.find((n) => n.id === selectedNoteId) ?? null;

  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes;
    const query = searchQuery.toLowerCase();
    return notes.filter(
      (note) =>
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query) ||
        note.path.toLowerCase().includes(query)
    );
  }, [notes, searchQuery]);

  const handleSelectNote = useCallback((noteId: string) => {
    setSelectedNoteId(noteId);
    setIsDrawerOpen(false);
  }, []);

  const handleCreateNote = useCallback(() => {
    const newNote = createNewNote();
    setNotes((prev) => [newNote, ...prev]);
    setSelectedNoteId(newNote.id);
    setIsDrawerOpen(false);
  }, []);

  const handleUpdateNoteContent = useCallback(
    (content: string) => {
      if (!selectedNoteId) return;
      setNotes((prev) =>
        prev.map((note) =>
          note.id === selectedNoteId
            ? { ...note, content, updatedAt: new Date().toISOString() }
            : note
        )
      );
    },
    [selectedNoteId]
  );

  const handleUpdateNoteTitle = useCallback(
    (title: string) => {
      if (!selectedNoteId) return;
      setNotes((prev) =>
        prev.map((note) =>
          note.id === selectedNoteId
            ? { ...note, title, updatedAt: new Date().toISOString() }
            : note
        )
      );
    },
    [selectedNoteId]
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-2 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-3 min-w-0">
            <h1 className="text-lg font-semibold text-slate-100 truncate flex-1">
              {selectedNote ? (
                <input
                  type="text"
                  value={selectedNote.title}
                  onChange={(e) => handleUpdateNoteTitle(e.target.value)}
                  className="bg-transparent border-none outline-none text-lg font-semibold text-slate-100 w-full"
                  placeholder="Untitled Note"
                />
              ) : (
                "Notes"
              )}
            </h1>
          </div>
          {selectedNote && (
            <div 
              className="text-[10px] text-slate-500 font-mono truncate -mt-0.5"
              title={selectedNote.path}
            >
              {selectedNote.path}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* New note */}
          <button
            onClick={handleCreateNote}
            className="p-2 rounded-md text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
            title="New note"
            aria-label="Create new note"
          >
            <IconPlus className="w-5 h-5" />
          </button>

          {/* Open drawer */}
          <button
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            className={`p-2 rounded-md transition-colors ${
              isDrawerOpen
                ? "bg-slate-700 text-slate-100"
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            }`}
            title="File Explorer"
            aria-label="Open file explorer"
          >
            <IconLayoutSidebarRight className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-hidden relative">
        {selectedNote ? (
          <LiveMarkdownEditor
            value={selectedNote.content}
            onChange={handleUpdateNoteContent}
            placeholder="Start writing..."
          />
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500">
            <div className="text-center">
              <p className="mb-4">No note selected</p>
              <button
                onClick={handleCreateNote}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-md text-slate-200 transition-colors"
              >
                Create your first note
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Right side drawer */}
      <RightSidePanel
        title={activeRightTab === "explorer" ? "File Explorer" : "File Search"}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        headerActions={
          <button
            onClick={handleCreateNote}
            className="p-1 text-slate-400 hover:text-slate-100 transition-colors rounded hover:bg-slate-800"
            aria-label="New note"
            title="New note"
          >
            <IconPlus className="w-5 h-5" />
          </button>
        }
        subHeader={
          <div className="flex p-1 gap-1">
            <button
              onClick={() => setActiveRightTab("explorer")}
              className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-md text-xs font-medium transition-colors ${
                activeRightTab === "explorer"
                  ? "bg-slate-800 text-slate-100 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <IconFolder className="w-3.5 h-3.5" />
              File Explorer
            </button>
            <button
              onClick={() => setActiveRightTab("search")}
              className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-md text-xs font-medium transition-colors ${
                activeRightTab === "search"
                  ? "bg-slate-800 text-slate-100 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <IconSearch className="w-3.5 h-3.5" />
              File Search
            </button>
          </div>
        }
      >
        {activeRightTab === "explorer" ? (
          <NotesDrawer
            notes={notes}
            selectedNoteId={selectedNoteId}
            onSelectNote={handleSelectNote}
          />
        ) : (
          <div className="flex flex-col h-full">
            <div className="relative mb-4">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes..."
                autoFocus
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-md text-slate-200 text-sm placeholder-slate-500 outline-none focus:border-slate-600 transition-colors"
              />
            </div>
            <NotesDrawer
              notes={filteredNotes}
              selectedNoteId={selectedNoteId}
              onSelectNote={handleSelectNote}
              autoExpandAll={searchQuery.length > 0}
            />
          </div>
        )}
      </RightSidePanel>
    </div>
  );
}
