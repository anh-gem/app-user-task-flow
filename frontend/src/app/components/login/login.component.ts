import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, type NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LoginData } from '../../models/logindata.model';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, NgIf, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  formData: LoginData = {
    email: '',
    password: '',
    rememberMe: false,
  };
  isLoading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private notificationService: NotificationService,
    private router: Router,
  ) {}

  handleOnSubmit(form: NgForm) {
    if (form.invalid) {
      this.errorMessage = 'Please fill all fields correctly';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.loginUser(this.formData).subscribe({
      next: (response: any) => {
        console.log('Login success:', response);

        // Store token and user data
        localStorage.setItem('token', response.token);
        localStorage.setItem('userId', response.user.id);
        localStorage.setItem('userName', response.user.name);

        // Navigate to dashboard
        this.router.navigate(['/user-flow', response.user.id, 'home']);
        this.notificationService.show(`Welcome Back ${response.user.name}`);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Login error:', error);
        this.isLoading = false;
        this.errorMessage =
          error.error?.message || 'Login failed. Please try again.';
      },
    });
  }
}
