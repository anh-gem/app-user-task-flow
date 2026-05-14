import { NgFor } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../../services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../../../../src/environments/environment';
import { MatIconModule } from '@angular/material/icon';
import { NotificationService } from '../../../../services/notification.service';

@Component({
  selector: 'app-edit-task-popup',
  imports: [FormsModule, NgFor, MatIconModule],
  templateUrl: './edit-task-popup.component.html',
  styleUrl: './edit-task-popup.component.scss',
})
export class EditTaskPopupComponent implements OnInit {
  @Input() task: any;
  @Input() userId!: any;
  @Output() close = new EventEmitter<void>();
  @Output() taskSaved = new EventEmitter<void>();

  // Create a LOCAL copy to work with
  localTask: any;
  apiUrl = `${environment.apiUrl}/users`;

  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.userId = this.route.parent?.snapshot.paramMap.get('id');
    this.localTask = structuredClone(this.task);
  }

  addSubTasks() {
    this.router.navigate(['/user-flow', this.userId, 'user-tasks'], {
      queryParams: { taskId: this.localTask._id },
    });
    this.onClose();
  }

  onSave() {
    this.localTask.updatedAt = new Date();

    // Update status based on subtasks
    if (this.localTask.subtasks && this.localTask.subtasks.length > 0) {
      if (
        this.localTask.subtasks.some(
          (data: any) => data.status === 'In Progress',
        )
      ) {
        this.localTask.status = 'In Progress';
      } else if (
        this.localTask.subtasks.every((data: any) => data.status === 'Pending')
      ) {
        this.localTask.status = 'Pending';
      } else if (
        this.localTask.subtasks.every((data: any) => data.status === 'Done')
      ) {
        this.localTask.status = 'Done';
      } else if (
        this.localTask.subtasks.some((data: any) => data.status === 'Done') &&
        this.localTask.subtasks.some(
          (data: any) => data.status === 'Pending',
        ) &&
        !this.localTask.subtasks.some(
          (data: any) => data.status === 'In Progress',
        )
      ) {
        this.localTask.status = 'Paused';
      }
    }

    // Update task with local copy
    this.userService.updateTask(this.userId, this.localTask).subscribe({
      next: (res) => {
        console.log('Updated task:', res);

        // Handle notification if task completed today
        if (
          this.localTask.status === 'Done' &&
          this.isToday(this.localTask.updatedAt)
        ) {
          this.notificationService.addNotification(
            `✓ Task completed: "${this.localTask.title}"`,
          );

          const notifications =
            this.notificationService.getNotificationsValue();
          // console.log('Notifications to save:', notifications);

          this.userService
            .addUserNotification(this.userId, notifications)
            .subscribe({
              next: (response) => {
                // console.log('Updated Data', response);
                this.taskSaved.emit();
                this.onClose();
              },
              error: (err) => {
                console.error('Error saving notification:', err);
                this.taskSaved.emit();
                this.onClose();
              },
            });
          this.notificationService.clearNotifications();
        } else {
          this.taskSaved.emit();
          this.onClose();
        }
      },
      error: (err) => {
        console.error('Error updating task:', err);
      },
    });
  }

  isToday(date: Date): boolean {
    const today = new Date();
    const checkDate = new Date(date);
    return (
      checkDate.getDate() === today.getDate() &&
      checkDate.getMonth() === today.getMonth() &&
      checkDate.getFullYear() === today.getFullYear()
    );
  }

  deleteSubtask(index: any) {
    this.localTask.subtasks.splice(index, 1);
  }

  onClose() {
    this.close.emit();
  }
}
