import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  type OnInit,
} from '@angular/core';
import { FormsModule, type NgForm } from '@angular/forms';
import { Task } from '../../../../models/task.model';
import { SubTaskDescription } from '../../../../models/subtask-desciption.model';
import { NgIf, NgFor } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../../services/user.service';
import { User } from '../../../../models/user.model';
import { NotificationService } from '../../../../services/notification.service';

@Component({
  selector: 'app-tasks',
  imports: [FormsModule, NgIf, NgFor],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.scss',
})
export class TasksComponent implements OnInit {
  @Input() taskId: any;
  @Output() taskSaved = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();
  @ViewChild('taskForm') form!: NgForm;
  subTaskFormShow: boolean = false;
  taskFormShow: boolean = false;
  userData: User = {
    tasks: [],
  };
  taskData: Task = {
    title: '',
    status: 'Pending',
    subtasks: [],
  };
  subTaskData: SubTaskDescription = {
    subtask: '',
    status: 'Pending',
  };
  userId: any;
  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private notificationService: NotificationService,
    private router: Router,
  ) {}
  ngOnInit(): void {
    this.userId = this.route.parent?.snapshot.paramMap.get('id');
    console.log(this.userId);
    console.log('taskid', this.taskId);
    if (this.taskId) {
      this.userService.getUser(this.userId).subscribe({
        next: (user) => {
          if (user) {
            this.userData = user;
            console.log('This is user data', this.userData);
          }
          const task = user.tasks.find((task) => task._id === this.taskId);
          if (task) {
            this.taskData = task;
            console.log('This is task data', this.taskData);
          }
        },
      });
    }
    this.getUserById();
  }
  onFormSubmit(form: NgForm) {
    console.log('Form Submit User Data', this.userData);
    if (!this.userData._id) {
      console.error('ID missing!');
      return;
    }

    if (!this.taskData.title || !this.taskData.title.trim()) {
      this.notificationService.show('Please enter a task title');
      return;
    }

    if (this.subTaskData.subtask && this.subTaskData.subtask.trim()) {
      this.taskData.subtasks.push({
        subtask: this.subTaskData.subtask.trim(),
        status: this.subTaskData.status,
      });
    }

    if (this.taskId) {
      this.taskData.updatedAt = new Date();
      if (this.taskData.subtasks.length > 0) {
        this.updateStatus();
      }

      console.log('FOR TASK UPDATE', this.userId, this.taskData);
      this.userService.updateTask(this.userId, this.taskData).subscribe({
        next: (res) => {
          this.notificationService.show('Task updated successfully!');
          this.taskSaved.emit();
          this.resetTaskForm(form);
        },
      });
    } else {
      if (this.taskData.subtasks.length > 0) {
        this.updateStatus();
      }

      const newTask: Task = {
        title: this.taskData.title,
        status: this.taskData.status,
        subtasks: structuredClone(this.taskData.subtasks),
        createdAt: new Date(),
      };
      this.taskData.subtasks.push({
        subtask: this.subTaskData.subtask,
        status: this.subTaskData.status,
      });
      console.log('New task', newTask);

      this.userData.tasks.push(newTask);
      console.log(this.userData);
      this.userService.addTask(this.userId, newTask).subscribe({
        next: (response) => {
          console.log('RESPONSE', response);
        },
      });
      this.resetTaskForm(form);
      if (this.userData.tasks.length % 5 === 0) {
        this.notificationService.show(
          `${this.userData.tasks?.length} tasks added`,
        );
        const notifications = this.notificationService.getNotificationsValue();

        this.userService
          .addUserNotification(this.userId, notifications)
          .subscribe({
            next: () => {
              console.log('Milestone notification saved');
              this.notificationService.show('Task added');
              this.taskSaved.emit();
              this.resetTaskForm(form);
              this.close.emit();
            },
          });
      } else {
        this.notificationService.show('Task added successfully!');
        this.taskSaved.emit();
        this.resetTaskForm(form);
        this.close.emit();
      }
    }
  }

  resetTaskForm(form: NgForm) {
    this.taskData = {
      title: '',
      status: 'Pending',
      subtasks: [],
    };

    this.subTaskData = {
      subtask: '',
      status: 'Pending',
    };

    this.subTaskFormShow = false;
    form.resetForm();
    this.router.navigate(['/user-flow', this.userId, 'user-tasks']);
  }
  getUserById() {
    this.userService.getUser(this.userId).subscribe({
      next: (response) => {
        this.userData._id = response._id;
        this.userData.name = response.name;
        this.userData.city = response.city;
        this.userData.qualification = response.qualification;
        this.userData.email = response.email;
      },
    });
  }
  addSubTaskForm() {
    this.subTaskFormShow = !this.subTaskFormShow;
    this.subTaskData.subtask = '';
  }
  addSubTask() {
    if (!this.subTaskData.subtask || !this.subTaskData.subtask.trim()) {
      console.log('Subtask cannot be empty');
      return;
    }
    this.taskData.subtasks.push({
      id: crypto.randomUUID(),
      subtask: this.subTaskData.subtask,
      status: this.subTaskData.status,
    });

    // reset properly
    this.subTaskData = {
      subtask: '',
      status: 'Pending',
    };

    this.subTaskFormShow = false;
  }

  updateStatus() {
    // if (this.taskData.subtasks) {
    if (this.taskData.subtasks.some((data) => data.status === 'In Progress')) {
      this.taskData.status = 'In Progress';
    } else if (
      this.taskData.subtasks.every((data) => data.status === 'Pending')
    ) {
      this.taskData.status = 'Pending';
    } else if (this.taskData.subtasks.every((data) => data.status === 'Done')) {
      this.taskData.status = 'Done';
    } else if (
      this.taskData.subtasks.some((data) => data.status === 'Done') &&
      this.taskData.subtasks.some((data) => data.status === 'Pending') &&
      !this.taskData.subtasks.some((data) => data.status === 'In Progress')
    ) {
      this.taskData.status = 'Paused';
    }
  }
}
