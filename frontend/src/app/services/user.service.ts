import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, switchMap } from 'rxjs';
import { User } from '../models/user.model';
import { environment } from '../../environments/environment';
import type { Task } from '../models/task.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  apiUrl = `${environment.apiUrl}/api/users`;
  constructor(private http: HttpClient) {}

  getUser(id: any): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }
  updateUser(id: any, data: any): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${id}`, data);
  }
  deleteUser(id: any): Observable<User> {
    return this.http.delete<User>(`${this.apiUrl}/${id}`);
  }
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  updateTask(userId: string, updatedTask: Task) {
    return this.getUser(userId).pipe(
      switchMap((user) => {
        const updatedTasks = user.tasks?.map((task) =>
          task._id === updatedTask._id ? updatedTask : task,
        );
        console.log('Here is task in service', updatedTask);
        return this.http.patch<User>(`${this.apiUrl}/${userId}`, {
          tasks: updatedTasks,
        });
      }),
    );
  }
  addTask(userId: string, newTask: Task) {
    return this.getUser(userId).pipe(
      switchMap((user) => {
        const updatedTasks = [...(user.tasks || []), newTask];

        return this.http.patch<User>(`${this.apiUrl}/${userId}`, {
          tasks: updatedTasks,
        });
      }),
    );
  }

  addUserNotification(userId: string, newNotification: any) {
    console.log('In Service notification check', newNotification);
    return this.getUser(userId).pipe(
      switchMap((user) => {
        const updatedNotifications = [
          ...(user.notifications || []),
          ...newNotification,
        ];
        console.log(
          'In Service updated notification check',
          updatedNotifications,
        );
        return this.http.patch<User>(`${this.apiUrl}/${userId}`, {
          notifications: updatedNotifications,
        });
      }),
    );
  }
}
