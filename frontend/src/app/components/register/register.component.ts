import { Component } from '@angular/core';
import { FormsModule, type NgForm } from '@angular/forms';
import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service';
import { NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-register',
  imports: [FormsModule, NgIf],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  formData: User = {
    name: '',
    city: '',
    qualification: '',
    email: '',
    password: '',
    tasks: [],
  };
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private notificationService: NotificationService,
    private router: Router,
  ) {}
  handleOnSubmit(form: NgForm) {
    if (form.invalid) {
      console.log('Form is invalid');
      return;
    }
    this.authService.addUser(this.formData).subscribe({
      next: (response) => {
        console.log(response);
        this.router.navigate(['/user-flow', response.data.id, 'home']);
        this.notificationService.addNotification(
          `Welcome ${response.data.name}`,
        );
        const notifications = this.notificationService.getNotificationsValue();

        console.log('Notifications to save:', notifications);
        this.userService
          .addUserNotification(response.data.id, notifications)
          .subscribe({
            next: (response) => {
              console.log('Updated Data', response);
            },
            error: (err) => {
              console.error('Error saving notification:', err);
            },
          });
      },
      error: (err) => {
        console.log(err);
      },
    });
    form.resetForm();
  }
}
