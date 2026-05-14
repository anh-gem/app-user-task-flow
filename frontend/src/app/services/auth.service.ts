import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private httpClient: HttpClient) {}

  checkAuth() {
    return this.httpClient.get(`${environment.apiUrl}/api/auth/check-auth`, {
      withCredentials: true,
    });
  }
  loginUser(data: any) {
    return this.httpClient.post(`${environment.apiUrl}/api/auth/login`, data, {
      withCredentials: true,
    });
  }
  addUser(data: Omit<User, 'id'>): Observable<any> {
    return this.httpClient.post<User>(
      `${environment.apiUrl}/api/auth/register`,
      data,
      {
        withCredentials: true,
      },
    );
  }
  loginOut() {
    return this.httpClient.post(`${environment.apiUrl}/api/auth/logout`, '');
  }
}
