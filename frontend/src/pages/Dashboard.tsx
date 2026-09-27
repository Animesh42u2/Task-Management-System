import React, { useState, useEffect, useCallback } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Task, TaskStatus } from "../types";
import TaskForm from "../components/TaskForm";
import TaskList from "../components/TaskList";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [filter, setFilter] = useState<TaskStatus | "all">("all");

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = filter !== "all" ? { status: filter } : {};
      const { data } = await api.get("/tasks", { params });
      setTasks(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  async function handleCreateOrUpdate(formData: {
    title: string;
    description: string;
    status: TaskStatus;
    dueDate: string;
  }) {
    if (editingTask) {
      await api.put(`/tasks/${editingTask.id}`, formData);
    } else {
      await api.post("/tasks", formData);
    }
    setShowForm(false);
    setEditingTask(undefined);
    loadTasks();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this task?")) return;
    await api.delete(`/tasks/${id}`);
    loadTasks();
  }

  async function handleComplete(id: string) {
    await api.patch(`/tasks/${id}/complete`);
    loadTasks();
  }

  function handleEdit(task: Task) {
    setEditingTask(task);
    setShowForm(true);
  }

  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "completed").length;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>My Tasks</h1>
          <p className="subtitle">
            {user?.name ? `Welcome, ${user.name}` : user?.email} — {completed}/{total} completed
          </p>
        </div>
        <button className="secondary" onClick={logout}>
          Log out
        </button>
      </header>

      <div className="toolbar">
        <div className="filters">
          {(["all", "pending", "in_progress", "completed"] as const).map((f) => (
            <button
              key={f}
              className={filter === f ? "filter-btn active" : "filter-btn"}
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "All" : f.replace("_", " ")}
            </button>
          ))}
        </div>
        <button
          onClick={() => {
            setEditingTask(undefined);
            setShowForm((s) => !s);
          }}
        >
          {showForm ? "Close" : "+ New Task"}
        </button>
      </div>

      {showForm && (
        <div className="form-panel">
          <TaskForm
            initial={editingTask}
            onSubmit={handleCreateOrUpdate}
            onCancel={() => {
              setShowForm(false);
              setEditingTask(undefined);
            }}
          />
        </div>
      )}

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <p className="center-message">Loading tasks...</p>
      ) : (
        <TaskList tasks={tasks} onEdit={handleEdit} onDelete={handleDelete} onComplete={handleComplete} />
      )}
    </div>
  );
}
