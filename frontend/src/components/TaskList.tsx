import React from "react";
import { Task } from "../types";
import TaskItem from "./TaskItem";

interface Props {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onComplete: (id: string) => void;
}

export default function TaskList({ tasks, onEdit, onDelete, onComplete }: Props) {
  if (tasks.length === 0) {
    return <p className="empty-state">No tasks yet. Add your first task above.</p>;
  }

  return (
    <div className="task-list">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} onComplete={onComplete} />
      ))}
    </div>
  );
}
