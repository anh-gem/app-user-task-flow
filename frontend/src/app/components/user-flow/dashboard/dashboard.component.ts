import { Component, type OnInit } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [NgIf],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  userId: any;
  totalTasks: number = 0;
  completedTasks: number = 0;
  pendingTasks: number = 0;
  pausedTasks: number = 0;
  inProgressTasks: number = 0;
  completedTasksPercentage: number = 0;
  isLoading: boolean = true;
  taskStatus: string = '';

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.userId = this.route.parent?.snapshot.paramMap.get('id');
    this.loadUserStats();
  }

  loadUserStats(): void {
    this.userService.getUser(this.userId).subscribe({
      next: (response) => {
        if (response.tasks && response.tasks.length > 0) {
          this.totalTasks = response.tasks.length;
          this.completedTasks = response.tasks.filter(
            (task) => task.status === 'Done',
          ).length;
          this.pendingTasks = response.tasks.filter(
            (task) => task.status === 'Pending',
          ).length;
          this.inProgressTasks = response.tasks.filter(
            (task) => task.status === 'In Progress',
          ).length;
          this.pausedTasks = response.tasks.filter(
            (task) => task.status === 'Paused',
          ).length;
          this.completedTasksPercentage = Math.round(
            (this.completedTasks / this.totalTasks) * 100,
          );
        }
        this.isLoading = false;
      },
    });
  }

  sendStatusFilter(status: string) {
    this.router.navigate(['/user-flow', this.userId, 'user-tasks'], {
      queryParams: { status: status },
    });
  }
}
