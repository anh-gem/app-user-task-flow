import { DatePipe, NgFor } from '@angular/common';
import { Component, type OnInit } from '@angular/core';
import { NotificationService } from '../../../services/notification.service';
import { UserService } from '../../../services/user.service';
import { ActivatedRoute } from '@angular/router';
import { User } from '../../../models/user.model';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-notification-panel',
  imports: [NgFor, DatePipe, MatIconModule],
  templateUrl: './notification-panel.component.html',
  styleUrl: './notification-panel.component.scss',
})
export class NotificationPanelComponent implements OnInit {
  id: any;
  userData: User = {
    notifications: [],
    tasks: [],
  };

  constructor(
    private notificationService: NotificationService,
    private userService: UserService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.id = this.route.parent?.snapshot.paramMap.get('id');
    this.loadNotifications();

    // Listen to BehaviorSubject (in-memory notifications)
    this.notificationService.notificationBhv$.subscribe((notifications) => {
      console.log('Notifications from service:', notifications);

      if (notifications && notifications.length > 0) {
        this.userData.notifications = notifications;
        this.sortNotifications();
      }
    });
  }

  loadNotifications() {
    this.userService.getUser(this.id).subscribe({
      next: (response) => {
        console.log('User data loaded:', response);
        this.userData = response;

        if (
          this.userData.notifications &&
          this.userData.notifications.length > 0
        ) {
          this.sortNotifications();
        } else {
          this.userData.notifications = [];
        }
      },
    });
  }

  sortNotifications() {
    this.userData.notifications?.sort(
      (a, b) =>
        new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime(),
    );
  }

  deleteNotification(index: number) {
    // Remove notification from local array
    if (this.userData.notifications) {
      this.userData.notifications.splice(index, 1);

      // Save to backend
      this.userService
        .updateUser(this.id, {
          notifications: this.userData.notifications,
        })
        .subscribe({
          next: (response) => {
            console.log('Notification deleted:', response);
          },
          error: (err) => {
            console.error('Error deleting notification:', err);
            // Reload if delete fails
            this.loadNotifications();
          },
        });
    }
  }
}
