import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-wrapper">
      <div class="login-card glass-panel">
        <div class="login-header">
          <div class="logo-circle">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h2>Sign In to OnePoint</h2>
          <p class="subtitle">Enterprise Internal Form Management Platform</p>
        </div>

        <div class="demo-box">
          <div class="demo-title">⚡ Demo Credentials Quick Select:</div>
          <div class="demo-pills">
            <button type="button" (click)="fillDemo('EMP001', 'Password@123')" class="pill-btn">Admin (EMP001)</button>
            <button type="button" (click)="fillDemo('EMP002', 'Password@123')" class="pill-btn">HR Lead (EMP002)</button>
            <button type="button" (click)="fillDemo('EMP003', 'Password@123')" class="pill-btn">Employee (EMP003)</button>
          </div>
        </div>

        <form (ngSubmit)="onLogin()" #loginForm="ngForm">
          <div class="form-group">
            <label>Employee ID or Corporate Email</label>
            <input type="text" [(ngModel)]="usernameOrEmail" name="usernameOrEmail" required class="form-control" placeholder="e.g. EMP001 or admin@onepoint.com" />
          </div>

          <div class="form-group">
            <div class="flex justify-between items-center">
              <label>Password</label>
              <a href="javascript:void(0)" (click)="showForgotModal = true" class="forgot-link">Forgot Password?</a>
            </div>
            <input type="password" [(ngModel)]="password" name="password" required class="form-control" placeholder="••••••••" />
          </div>

          <div *ngIf="errorMessage" class="error-banner">
            {{ errorMessage }}
          </div>

          <button type="submit" [disabled]="loading || !loginForm.form.valid" class="btn btn-primary btn-block">
            {{ loading ? 'Signing In...' : 'Sign In to Dashboard' }}
          </button>
        </form>
      </div>

      <!-- Forgot Password Modal -->
      <div class="modal-backdrop" *ngIf="showForgotModal">
        <div class="modal-content" style="max-width: 440px;">
          <div class="modal-header">
            <h3>Reset Password</h3>
            <button (click)="showForgotModal = false" class="close-btn">&times;</button>
          </div>
          <div class="modal-body">
            <p style="font-size: 0.875rem; color: #64748b; margin-bottom: 1rem;">
              Enter your Employee ID or Corporate Email to receive password reset instructions.
            </p>
            <div class="form-group">
              <label>Employee ID or Corporate Email</label>
              <input type="text" [(ngModel)]="forgotInput" class="form-control" placeholder="EMP001" />
            </div>
            <div *ngIf="forgotMessage" class="info-banner">
              {{ forgotMessage }}
            </div>
          </div>
          <div class="modal-footer">
            <button (click)="showForgotModal = false" class="btn btn-secondary">Cancel</button>
            <button (click)="onForgotPassword()" [disabled]="!forgotInput" class="btn btn-primary">Send Reset Link</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-wrapper {
      min-height: calc(100vh - 65px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem 1rem;
    }
    .login-card {
      width: 100%;
      max-width: 440px;
      padding: 2.5rem 2rem;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }
    .login-header {
      text-align: center;
      margin-bottom: 1.5rem;
    }
    .logo-circle {
      width: 52px;
      height: 52px;
      background: linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%);
      color: #ffffff;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1rem;
      box-shadow: 0 8px 16px rgba(79, 70, 229, 0.25);
    }
    .login-header h2 { font-size: 1.5rem; margin-bottom: 0.25rem; }
    .subtitle { font-size: 0.85rem; color: #64748b; }
    .demo-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 0.75rem;
      margin-bottom: 1.5rem;
    }
    .demo-title { font-size: 0.75rem; font-weight: 700; color: #475569; margin-bottom: 0.5rem; }
    .demo-pills { display: flex; gap: 0.4rem; flex-wrap: wrap; }
    .pill-btn {
      font-size: 0.7rem; font-weight: 600; padding: 0.25rem 0.5rem; border-radius: 6px;
      border: 1px solid #cbd5e1; background: #ffffff; cursor: pointer; color: #334155;
    }
    .pill-btn:hover { background: #e0e7ff; color: #4338ca; border-color: #a5b4fc; }
    .forgot-link { font-size: 0.75rem; color: #4f46e5; text-decoration: none; font-weight: 600; }
    .btn-block { width: 100%; margin-top: 0.5rem; }
    .error-banner { background: #fee2e2; color: #991b1b; padding: 0.625rem; border-radius: 8px; font-size: 0.85rem; margin-bottom: 1rem; }
    .info-banner { background: #dcfce7; color: #166534; padding: 0.625rem; border-radius: 8px; font-size: 0.85rem; margin-top: 0.5rem; }
    .close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #64748b; }
  `]
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  usernameOrEmail = 'EMP001';
  password = 'Password@123';
  loading = false;
  errorMessage = '';

  showForgotModal = false;
  forgotInput = '';
  forgotMessage = '';

  fillDemo(user: string, pass: string): void {
    this.usernameOrEmail = user;
    this.password = pass;
  }

  onLogin(): void {
    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.usernameOrEmail, this.password).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || err.error || 'Authentication failed. Check credentials.';
      }
    });
  }

  onForgotPassword(): void {
    if (!this.forgotInput) return;
    this.authService.forgotPassword(this.forgotInput).subscribe({
      next: (res) => {
        this.forgotMessage = res;
      },
      error: () => {
        this.forgotMessage = 'Password reset instructions sent.';
      }
    });
  }
}
