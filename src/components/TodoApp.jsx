import { useState, useEffect } from "react";
import {
  Check,
  Pencil,
  Plus,
  Trash2,
  X,
  ListTodo,
  Moon,
  Sun,
  Calendar as CalendarIcon,
  Flag,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const cn = (...args) => args.filter(Boolean).join(" ");

const STORAGE_KEY = "todos.v2";
const THEME_KEY = "theme";

const PRIORITY_META = {
  low: { label: "Low", dot: "bg-success", chip: "bg-success/15 text-success border-success/30", ring: "ring-success/40" },
  medium: { label: "Medium", dot: "bg-warning", chip: "bg-warning/15 text-warning border-warning/30", ring: "ring-warning/40" },
  high: { label: "High", dot: "bg-danger", chip: "bg-danger/15 text-danger border-danger/30", ring: "ring-danger/40" },
};

const CATEGORIES = ["Study", "Work", "Personal"];

const CATEGORY_META = {
  Study: "bg-primary/15 text-primary border-primary/30",
  Work: "bg-primary/10 text-primary border-primary/20",
  Personal: "bg-accent text-accent-foreground border-primary/20",
};

export default function TodoApp() {
  const [todos, setTodos] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return [
      {
        id: crypto.randomUUID(),
        text: "Welcome! Try adding a task ✨",
        completed: false,
        priority: "medium",
        category: "Personal",
        createdAt: Date.now(),
      },
    ];
  });

  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem(THEME_KEY);
    return stored === "dark";
  });

  const [input, setInput] = useState("");
  const [priority, setPriority] = useState("medium");
  const [category, setCategory] = useState("Personal");
  const [dueDate, setDueDate] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");

  const [filter, setFilter] = useState("all");

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(todos.map(({ removing, ...t }) => t))
    );
  }, [todos]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
  }, [dark]);

  const addTodo = () => {
    const text = input.trim();
    if (!text) {
      toast.error("Please enter a task");
      return;
    }
    const newTodo = {
      id: crypto.randomUUID(),
      text,
      completed: false,
      priority,
      category,
      dueDate: dueDate || undefined,
      createdAt: Date.now(),
    };
    setTodos((t) => [newTodo, ...t]);
    setInput("");
    setDueDate("");
    toast.success("Task added");
  };

  const toggleTodo = (id) => {
    setTodos((t) =>
      t.map((todo) => {
        if (todo.id === id) {
          const next = { ...todo, completed: !todo.completed };
          if (next.completed) toast.success("Task completed 🎉");
          return next;
        }
        return todo;
      })
    );
  };

  const deleteTodo = (id) => {
    setTodos((t) => t.map((todo) => (todo.id === id ? { ...todo, removing: true } : todo)));
    setTimeout(() => {
      setTodos((t) => t.filter((todo) => todo.id !== id));
      toast.success("Task deleted");
    }, 220);
  };

  const startEdit = (todo) => {
    setEditingId(todo.id);
    setEditValue(todo.text);
  };

  const saveEdit = () => {
    if (!editingId) return;
    const text = editValue.trim();
    if (text) {
      setTodos((t) => t.map((todo) => (todo.id === editingId ? { ...todo, text } : todo)));
    }
    setEditingId(null);
  };

  const handleKey = (e, action) => {
    if (e.key === "Enter") action();
    if (e.key === "Escape") setEditingId(null);
  };

  const filtered = todos.filter((t) => {
    if (filter === "completed") return t.completed;
    if (filter === "pending") return !t.completed;
    return true;
  });

  const completedCount = todos.filter((t) => t.completed).length;
  const total = todos.length;
  const progress = total === 0 ? 0 : Math.round((completedCount / total) * 100);

  return (
    <main className="min-h-screen w-full flex items-start justify-center px-4 py-8 sm:py-12">
      <section className="w-full max-w-2xl">
        <header className="flex items-center justify-between mb-6 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-primary shadow-card">
              <ListTodo className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">My Todo List</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Stay productive, beautifully.</p>
            </div>
          </div>
          <button
            onClick={() => setDark((d) => !d)}
            aria-label="Toggle theme"
            className="glass rounded-xl p-3 hover:scale-110 active:scale-95 transition-all shadow-soft"
          >
            {dark ? <Sun className="w-5 h-5 text-primary" /> : <Moon className="w-5 h-5 text-primary" />}
          </button>
        </header>

        <div className="glass rounded-3xl shadow-card p-5 sm:p-7 animate-slide-in">
          <div className="flex flex-col gap-3 mb-5">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => handleKey(e, addTodo)}
                placeholder="What needs to be done?"
                className="flex-1 px-4 py-3 rounded-xl bg-background/60 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 transition-all"
              />
              <button
                onClick={addTodo}
                className="px-4 sm:px-5 rounded-xl bg-gradient-primary text-primary-foreground font-medium shadow-soft hover:shadow-card hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Add</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 p-1 rounded-xl bg-background/50 border border-border">
                {Object.keys(PRIORITY_META).map((p) => {
                  const meta = PRIORITY_META[p];
                  const active = priority === p;
                  return (
                    <button
                      key={p}
                      onClick={() => setPriority(p)}
                      className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all",
                        active ? `${meta.chip} border ring-2 ${meta.ring}` : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <span className={cn("w-2 h-2 rounded-full", meta.dot)} />
                      {meta.label}
                    </button>
                  );
                })}
              </div>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-3 py-2 rounded-xl bg-background/60 border border-border text-sm text-foreground focus:outline-none focus:border-primary/60"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="px-3 py-2 rounded-xl bg-background/60 border border-border text-sm text-foreground focus:outline-none focus:border-primary/60"
              />
              {dueDate && (
                <button
                  onClick={() => setDueDate("")}
                  className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="mb-5">
            <div className="flex items-center justify-between mb-2 text-sm">
              <span className="text-muted-foreground">
                <span className="font-semibold text-foreground">{completedCount}</span>/{total} tasks completed
              </span>
              <span className="text-xs font-medium text-primary">{progress}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-background/60 overflow-hidden border border-border">
              <div className="h-full bg-gradient-primary transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="flex items-center gap-1 mb-4 p-1 rounded-xl bg-background/50 border border-border w-fit">
            {["all", "pending", "completed"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all",
                  filter === f ? "bg-gradient-primary text-primary-foreground shadow-soft" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {f}
              </button>
            ))}
          </div>

          <ul className="space-y-2">
            {filtered.length === 0 && (
              <li className="text-center py-12 text-muted-foreground animate-fade-in">
                {total === 0 ? "No tasks yet. Add one above to get started!" : "Nothing here in this view."}
              </li>
            )}
            {filtered.map((todo) => {
              const meta = PRIORITY_META[todo.priority];
              const overdue = todo.dueDate && !todo.completed && new Date(todo.dueDate) < new Date(new Date().toDateString());
              return (
                <li
                  key={todo.id}
                  className={cn(
                    "group flex items-start gap-3 p-3 rounded-xl bg-background/50 border border-border hover:border-primary/40 hover:bg-background/80 hover:shadow-soft transition-all",
                    todo.removing ? "animate-slide-out" : "animate-slide-in"
                  )}
                >
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    aria-label="Toggle task"
                    className={cn(
                      "shrink-0 mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                      todo.completed ? "bg-gradient-primary border-transparent" : "border-muted-foreground/40 hover:border-primary hover:scale-110"
                    )}
                  >
                    {todo.completed && <Check className="w-4 h-4 text-primary-foreground" strokeWidth={3} />}
                  </button>

                  <div className="flex-1 min-w-0">
                    {editingId === todo.id ? (
                      <input
                        autoFocus
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => handleKey(e, saveEdit)}
                        onBlur={saveEdit}
                        className="w-full px-2 py-1 rounded-md bg-background border border-primary/40 text-foreground focus:outline-none"
                      />
                    ) : (
                      <p
                        onDoubleClick={() => startEdit(todo)}
                        className={cn(
                          "text-foreground select-none break-words",
                          todo.completed && "line-through text-muted-foreground"
                        )}
                      >
                        {todo.text}
                      </p>
                    )}

                    <div className="flex items-center flex-wrap gap-1.5 mt-1.5">
                      <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border", meta.chip)}>
                        <Flag className="w-2.5 h-2.5" />
                        {meta.label}
                      </span>

                      <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium border", CATEGORY_META[todo.category])}>
                        {todo.category}
                      </span>

                      {todo.dueDate && (
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border",
                            overdue ? "bg-destructive/15 text-destructive border-destructive/30" : "bg-muted text-muted-foreground border-border"
                          )}
                        >
                          <CalendarIcon className="w-2.5 h-2.5" />
                          {format(new Date(todo.dueDate), "MMM d")}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-60 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    {editingId === todo.id ? (
                      <button
                        onClick={() => setEditingId(null)}
                        aria-label="Cancel edit"
                        className="p-2 rounded-lg text-muted-foreground hover:bg-background hover:text-foreground transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => startEdit(todo)}
                        aria-label="Edit task"
                        className="p-2 rounded-lg text-muted-foreground hover:bg-background hover:text-primary transition-all"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      aria-label="Delete task"
                      className="p-2 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Double-click a task to edit • Data saved locally
        </p>
      </section>
    </main>
  );
}
