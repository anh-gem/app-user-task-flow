import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { UserNotification } from '../models/notification.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(private httpClient: HttpClient) {}
  private notificationSubject = new Subject<string>();
  notification$ = this.notificationSubject.asObservable();
  show(message: string) {
    this.notificationSubject.next(message);
  }

  private notificationBehaviorSubject = new BehaviorSubject<UserNotification[]>(
    [],
  );

  notificationBhv$ = this.notificationBehaviorSubject.asObservable();
  addNotification(message: string) {
    const current = this.notificationBehaviorSubject.value;
    const newNotification: UserNotification = {
      message: message,
      createdAt: new Date(),
    };
    console.log(newNotification);
    this.notificationBehaviorSubject.next([...current, newNotification]);
  }

  getNotificationsValue() {
    return this.notificationBehaviorSubject.value;
  }
  clearNotifications() {
    this.notificationBehaviorSubject.next([]);
  }
}
