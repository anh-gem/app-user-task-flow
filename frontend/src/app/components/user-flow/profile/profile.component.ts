import { Component } from '@angular/core';
import { UserDetailsComponent } from '../user-details/user-details.component';

@Component({
  selector: 'app-profile',
  imports: [UserDetailsComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent {}
