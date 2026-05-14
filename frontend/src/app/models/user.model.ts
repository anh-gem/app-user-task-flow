import { UserNotification } from './notification.model';
import type { Task } from './task.model';

export interface User {
  _id?: any;
  name?: string;
  city?: string;
  qualification?: string;
  email?: string;
  password?: string;
  notifications?: UserNotification[];
  tasks: Task[];
}
