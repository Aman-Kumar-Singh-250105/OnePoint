import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">
      <div class="nav-container">
        <a routerLink="/dashboard" class="brand">
          <div class="brand-logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span class="brand-title">OnePoint</span>
          <span class="brand-badge">ENTERPRISE</span>
        </a>

        <div class="nav-links" *ngIf="authService.isLoggedIn()">
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">Dashboard</a>
          <a routerLink="/builder" routerLinkActive="active" class="nav-item">Form Builder</a>
          <a routerLink="/templates" routerLinkActive="active" class="nav-item">Templates</a>
        </div>

        <div class="nav-right" *ngIf="authService.currentUser() as user; else loginBtn">
          <div class="user-pill">
            <div class="avatar">{{ user.fullName.charAt(0) }}</div>
            <div class="user-info">
              <span class="user-name">{{ user.fullName }}</span>
              <span class="user-role">{{ user.employeeId }} • {{ user.role.replace('ROLE_', '') }}</span>
            </div>
          </div>
          <button (click)="logout()" class="btn btn-secondary btn-sm">Logout</button>
        </div>

        <ng-template #loginBtn>
          <a routerLink="/login" class="btn btn-primary btn-sm">Sign In</a>
        </ng-template>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      background: #ffffff;
      border-bottom: 1px solid #e2e8f0;
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .nav-container {
      max-width: 1300px;
      margin: 0 auto;
      padding: 0.75rem 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
    }
    .brand-logo {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%);
      color: #ffffff;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .brand-title {
      font-size: 1.25rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.02em;
    }
    .brand-badge {
      font-size: 0.65rem;
      font-weight: 700;
      background: #e0e7ff;
      color: #4338ca;
      padding: 0.15rem 0.4rem;
      border-radius: 4px;
    }
    .nav-links {
      display: flex;
      gap: 0.5rem;
    }
    .nav-item {
      padding: 0.5rem 1rem;
      text-decoration: none;
      color: #64748b;
      font-weight: 600;
      font-size: 0.875rem;
      border-radius: 8px;
      transition: all 0.2s;
    }
    .nav-item:hover, .nav-item.active {
      color: #4f46e5;
      background: #f1f5f9;
    }
    .nav-right {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .user-pill {
      display: flex;
      align-items: center;
      gap: 0.625rem;
    }
    .avatar {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: #4f46e5;
      color: #ffffff;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.875rem;
    }
    .user-info {
      display: flex;
      flex-direction: column;
    }
    .user-name {
      font-size: 0.85rem;
      font-weight: 700;
      color: #0f172a;
    }
    .user-role {
      font-size: 0.7rem;
      color: #64748b;
    }
  `]
})
export class NavbarComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
