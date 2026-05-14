import { NgIf } from '@angular/common';
import { Component, type OnInit } from '@angular/core';
import { FormsModule, type NgForm } from '@angular/forms';
import { User } from '../../../models/user.model';
import { UserService } from '../../../services/user.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-user-details',
  imports: [FormsModule, NgIf],
  templateUrl: './user-details.component.html',
  styleUrl: './user-details.component.scss',
})
export class UserDetailsComponent implements OnInit {
  userId: any;
  formData: User = {
    name: '',
    city: '',
    qualification: '',
    email: '',
    password: '',
    tasks: [],
  };
  enable: boolean = false;
  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
  ) {}
  ngOnInit(): void {
    this.getUser();
  }
  enableUpdate() {
    this.enable = !this.enable;
  }
  getUser() {
    const id = this.route.parent?.snapshot.paramMap.get('id');
    console.log(id);
    this.userService.getUser(id).subscribe({
      next: (response) => {
        console.log(response);
        this.userId = response._id;
        this.formData.name = response.name;
        this.formData.qualification = response.qualification;
        this.formData.email = response.email;
        this.formData.city = response.city;
        this.formData.tasks = response.tasks;
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  handleOnSubmit(form: NgForm) {
    // if (!this.formData._id) {
    //   console.error('ID missing!');
    //   return;
    // }
    if (this.enable) {
      this.userService.updateUser(this.userId, this.formData).subscribe({
        next: (response) => {
          console.log(response);
          alert('Updated user');
        },
      });
    } else {
      alert('Can not update, enable the form first to update!');
    }
  }
}
