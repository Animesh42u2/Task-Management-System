import { Response } from "express";
import { AppDataSource } from "../config/database";
import { Task, TaskStatus } from "../entities/Task";
import { AuthRequest } from "../middleware/auth";

const taskRepo = () => AppDataSource.getRepository(Task);

export async function getTasks(req: AuthRequest, res: Response) {
  const { status } = req.query;

  const where: any = { userId: req.userId };
  if (status && Object.values(TaskStatus).includes(status as TaskStatus)) {
    where.status = status;
  }

  const tasks = await taskRepo().find({
    where,
    order: { createdAt: "DESC" },
  });

  return res.json(tasks);
}

export async function getTask(req: AuthRequest, res: Response) {
  const task = await taskRepo().findOne({
    where: { id: req.params.id, userId: req.userId },
  });
  if (!task) return res.status(404).json({ message: "Task not found" });
  return res.json(task);
}

export async function createTask(req: AuthRequest, res: Response) {
  const { title, description, status, dueDate } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ message: "Title is required" });
  }
  if (status && !Object.values(TaskStatus).includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const task = taskRepo().create({
    title,
    description,
    status: status || TaskStatus.PENDING,
    dueDate,
    userId: req.userId!,
  });
  await taskRepo().save(task);

  return res.status(201).json(task);
}

export async function updateTask(req: AuthRequest, res: Response) {
  const task = await taskRepo().findOne({
    where: { id: req.params.id, userId: req.userId },
  });
  if (!task) return res.status(404).json({ message: "Task not found" });

  const { title, description, status, dueDate } = req.body;
  if (status && !Object.values(TaskStatus).includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (status !== undefined) task.status = status;
  if (dueDate !== undefined) task.dueDate = dueDate;

  await taskRepo().save(task);
  return res.json(task);
}

export async function deleteTask(req: AuthRequest, res: Response) {
  const task = await taskRepo().findOne({
    where: { id: req.params.id, userId: req.userId },
  });
  if (!task) return res.status(404).json({ message: "Task not found" });

  await taskRepo().remove(task);
  return res.json({ message: "Task deleted" });
}

export async function completeTask(req: AuthRequest, res: Response) {
  const task = await taskRepo().findOne({
    where: { id: req.params.id, userId: req.userId },
  });
  if (!task) return res.status(404).json({ message: "Task not found" });

  task.status = TaskStatus.COMPLETED;
  await taskRepo().save(task);
  return res.json(task);
}
