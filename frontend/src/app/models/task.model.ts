import type { SubTaskDescription } from './subtask-desciption.model';

export interface Task {
  _id?: any;
  title: string;
  status: 'Pending' | 'In Progress' | 'Done' | 'Paused'; // task-level
  subtasks: SubTaskDescription[];
  createdAt?: Date;
  updatedAt?: Date;
}
