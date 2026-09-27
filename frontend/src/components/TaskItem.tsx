import React from "react";
import { Task } from "../types";

interface Props {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onComplete: (id: string) => void;
}

const statusLabels: Record<string, string> = {
  pending: "Pending",
  in_progress: "In progress",
  completed: "Completed",
};

export default function TaskItem({ task, onEdit, onDelete, onComplete }: Props) {
  return (
    <div className={`task-item status-${task.status}`}>
      <div className="task-item-main">
        <h3>{task.title}</h3>
        {task.description && <p>{task.description}</p>}
        <div className="task-meta">
          <span className={`badge badge-${task.status}`}>{statusLabels[task.status]}</span>
          {task.dueDate && <span className="due-date">Due {task.dueDate.slice(0, 10)}</span>}
        </div>
      </div>
      <div className="task-item-actions">
        {task.status !== "completed" && (
          <button className="secondary" onClick={() => onComplete(task.id)}>
            Complete
          </button>
        )}
        <button className="secondary" onClick={() => onEdit(task)}>
          Edit
        </button>
        <button className="danger" onClick={() => onDelete(task.id)}>
          Delete
        </button>
      </div>
    </div>
  );
}
