import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthResponse, User } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8081/api/auth';
  currentUser = signal<User | null>(this.getUserFromStorage());

  constructor(private http: HttpClient) {}

  login(usernameOrEmail: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { usernameOrEmail, password }).pipe(
      tap(res => this.handleAuthSuccess(res))
    );
  }

  register(userData: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData).pipe(
      tap(res => this.handleAuthSuccess(res))
    );
  }

  forgotPassword(usernameOrEmail: string): Observable<string> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { usernameOrEmail }, { responseType: 'text' });
  }

  logout(): void {
    localStorage.removeItem('onepoint_token');
    localStorage.removeItem('onepoint_user');
    this.currentUser.set(null);
  }

  getToken(): string | null {
    return localStorage.getItem('onepoint_token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  private handleAuthSuccess(res: AuthResponse): void {
    localStorage.setItem('onepoint_token', res.token);
    const user: User = {
      employeeId: res.employeeId,
      email: res.email,
      fullName: res.fullName,
      department: res.department,
      role: res.role
    };
    localStorage.setItem('onepoint_user', JSON.stringify(user));
    this.currentUser.set(user);
  }

  private getUserFromStorage(): User | null {
    const data = localStorage.getItem('onepoint_user');
    return data ? JSON.parse(data) : null;
  }
}
