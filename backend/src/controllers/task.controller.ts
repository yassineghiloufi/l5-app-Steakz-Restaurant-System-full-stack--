import { Request, Response } from 'express';
import { assignTaskRecord, fetchTasks, updateTaskRecord } from '../services/task.service';

export const getTasks = async (req: Request, res: Response) => {
  const tasks = await fetchTasks(req.query.assignedTo as string | undefined);
  res.json({ success: true, data: { tasks } });
};

export const assignTask = async (req: Request, res: Response) => {
  const { title, description, assignedTo } = req.body;
  if (!title || !description || !assignedTo) {
    return res.status(400).json({ success: false, message: 'Title, description, and assignedTo are required' });
  }

  const task = await assignTaskRecord({ title, description, assignedTo });
  res.status(201).json({ success: true, data: { task } });
};

export const updateTask = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, description, status, assignedTo } = req.body;
  const task = await updateTaskRecord(id, { title, description, status, assignedTo });
  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }
  res.json({ success: true, data: { task } });
};
