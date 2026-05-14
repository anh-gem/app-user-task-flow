import { Component, OnInit } from '@angular/core';
import {
  RouterLink,
  ActivatedRoute,
  RouterOutlet,
  Router,
} from '@angular/router';
import { UserService } from '../../services/user.service';
import { NgIf } from '@angular/common';
import type { UserNotification } from '../../models/notification.model';
import { NotificationService } from '../../services/notification.service';
import { skip } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-user-flow',
  imports: [RouterLink, RouterOutlet],
  templateUrl: './user-flow.component.html',
  styleUrl: './/user-flow.component.scss',
})
export class UserFlowComponent implements OnInit {
  id?: string | null;
  notifications: UserNotification[] = [];
  show = false;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private authService: AuthService,
    private notificationService: NotificationService,
  ) {}
  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');

    this.userService.getUser(this.id).subscribe({
      next: (response) => {
        if (response.notifications) {
          this.notifications = response.notifications;
        }
      },
      error: (err) => {
        console.log('error', err);
      },
    });

    this.notificationService.notificationBhv$.pipe(skip(1)).subscribe({
      next: (notifications) => {
        if (notifications && notifications.length > 0) {
          console.log('New persistent notification:', notifications);
          this.show = true;

          // Glow for 3 seconds then turn off
          setTimeout(() => {
            this.show = false;
          }, 3000);
        }
      },
    });
  }

  notificationClicked() {
    this.show = false;
  }
  onLogout() {
    if (confirm('Are you sure you want to log out?')) {
      this.authService.loginOut().subscribe({
        next: (response) => {
          console.log(response);
          this.router.navigate(['/']);
        },
      });
    }
  }
}
