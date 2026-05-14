import { Component, type OnInit } from '@angular/core';
import { NotificationService } from '../../../services/notification.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-notification',
  imports: [NgIf],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.scss',
})
export class NotificationComponent implements OnInit {
  message = '';
  show = false;
  constructor(private notificationService: NotificationService) {}
  ngOnInit(): void {
    this.notificationService.notification$.subscribe({
      next: (msg) => {
        this.message = msg;
        this.show = true;

        setTimeout(() => {
          this.show = false;
        }, 3000);
      },
    });
  }
}
