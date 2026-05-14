import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { UserDetailsComponent } from './components/user-flow/user-details/user-details.component';
import { TasksComponent } from './components/user-flow/user-tasks/tasks/tasks.component';
import { UserTasksComponent } from './components/user-flow/user-tasks/user-tasks.component';
import { HomeComponent } from './components/user-flow/home/home.component';
import { ProfileComponent } from './components/user-flow/profile/profile.component';
import { NotificationComponent } from './components/user-flow/notification/notification.component';
import { NotificationPanelComponent } from './components/user-flow/notification-panel/notification-panel.component';
import { UserFlowComponent } from './components/user-flow/user-flow.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'register',
    component: RegisterComponent,
  },
  {
    path: 'user-flow/:id',
    component: UserFlowComponent,
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      {
        path: 'home',
        component: HomeComponent,
      },
      {
        path: 'user-tasks',
        component: UserTasksComponent,
      },

      {
        path: 'profile',
        component: ProfileComponent,
      },
      {
        path: 'notifications',
        component: NotificationPanelComponent,
      },
    ],
  },
];
