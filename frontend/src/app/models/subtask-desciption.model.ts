export interface SubTaskDescription {
  id?: any;
  subtask: string;
  status: 'Pending' | 'In Progress' | 'Done';
}
