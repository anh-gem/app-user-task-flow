import { Component, type OnInit } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Task } from '../../../models/task.model';
import { FormsModule } from '@angular/forms';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { EditTaskPopupComponent } from './edit-task-popup/edit-task-popup.component';
import { TasksComponent } from './tasks/tasks.component';
import { MatIconModule } from '@angular/material/icon';
import { NotificationService } from '../../../services/notification.service';
import type { User } from '../../../models/user.model';
import { ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-user-tasks',
  imports: [
    FormsModule,
    NgFor,
    NgIf,
    EditTaskPopupComponent,
    TasksComponent,
    DatePipe,
    MatIconModule,
  ],
  templateUrl: './user-tasks.component.html',
  styleUrl: './user-tasks.component.scss',
})
export class UserTasksComponent implements OnInit {
  @ViewChild('taskFormSection')
  taskFormSection!: ElementRef;
  taskFormShow: boolean = false;
  isPopupOpen = false;
  selectedTask: any = null;
  userId: any = null;
  taskData: Task[] = [];
  responseData: Task[] = [];
  taskId: any = null;
  status: string = '';
  filteredTaskData: Task[] = [];
  userData: User = {
    tasks: this.taskData,
  };

  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalPages: number = 0;
  paginatedTasks: Task[] = [];

  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef,
  ) {}
  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      console.log('QUERY PARAMS CHANGED', params);
    });
    this.route.queryParams.subscribe((params) => {
      this.taskId = params['taskId'];
      this.status = params['status'];

      if (this.taskId && !this.status) {
        this.taskFormShow = true;
        this.cdr.detectChanges();
        setTimeout(() => {
          console.log(this.taskFormSection);

          this.taskFormSection?.nativeElement?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }, 300);
      } else {
        this.taskFormShow = false;
      }
    });

    this.userId = this.route.parent?.snapshot.paramMap.get('id');
    this.userService.getUser(this.userId).subscribe({
      next: (response) => {
        this.responseData = response.tasks;
        if (this.status) {
          this.taskData = response.tasks.filter(
            (task) => task.status === this.status,
          );
        } else {
          this.taskData = response.tasks;
          if (this.taskData?.length) {
            this.taskData.sort((a, b) => {
              const dateA = new Date(b.createdAt || 0).getTime();
              const dateB = new Date(a.createdAt || 0).getTime();
              return dateA - dateB;
            });
          }
        }
        this.updatePagination();
      },
    });
  }
  onSearch() {
    if (this.status.trim() === '') {
      // If empty, show all tasks
      this.router.navigate(['user-flow', this.userId, 'user-tasks']);
      this.taskData = this.responseData;
      this.currentPage = 1;
    } else {
      this.router.navigate(['user-flow', this.userId, 'user-tasks'], {
        queryParams: { status: this.status },
      });
      // Filter tasks by status
      this.taskData = this.responseData.filter((task) =>
        task.status.toLowerCase().includes(this.status.toLowerCase()),
      );
      this.currentPage = 1;
    }
    this.updatePagination();
  }
  deleteTask(taskId: any) {
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskData = this.taskData.filter((task) => task._id !== taskId);
      this.userData.tasks = this.userData.tasks.filter(
        (task) => task._id !== taskId,
      );
      this.updatePagination();
      this.userData.tasks = this.taskData;
      this.userService.updateUser(this.userId, this.userData).subscribe({
        next: (response) => {
          this.notificationService.show('Task deleted');
        },
        error: (err) => {
          console.error('Error deleting task', err);
          this.notificationService.show('Error deleting task');
        },
      });
    }
  }
  updatePagination() {
    this.totalPages = Math.ceil(this.taskData.length / this.itemsPerPage);
    this.paginatedTasks = this.getPaginatedTasks();
  }

  getPaginatedTasks(): Task[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.taskData.slice(startIndex, endIndex);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.paginatedTasks = this.getPaginatedTasks();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }
  openEditPopup(task: any) {
    this.selectedTask = task;
    this.isPopupOpen = true;
  }

  closePopup() {
    this.isPopupOpen = false;
  }

  closeTaskForm() {
    this.taskFormShow = false;
  }

  addTaskForm() {
    this.taskFormShow = !this.taskFormShow;
  }

  loadUserTasks() {
    this.userService.getUser(this.userId).subscribe({
      next: (user) => {
        this.userData = user;
        this.responseData = user.tasks || [];

        // Apply filters if any
        if (this.status) {
          this.taskData = this.responseData.filter(
            (task) => task.status === this.status,
          );
        } else {
          this.taskData = this.responseData;
          // Sort newest first
          if (this.taskData?.length) {
            this.taskData.sort((a, b) => {
              const dateA = new Date(b.createdAt || 0).getTime();
              const dateB = new Date(a.createdAt || 0).getTime();
              return dateA - dateB;
            });
          }
        }

        // Reset to page 1 and update pagination
        this.currentPage = 1;
        this.updatePagination();

        // console.log('Tasks loaded:', this.taskData);
      },
      error: (err) => {
        console.error('Error loading tasks:', err);
      },
    });
  }

  onTaskSaved() {
    console.log('Task saved, reloading tasks...');
    this.loadUserTasks();
  }
}
