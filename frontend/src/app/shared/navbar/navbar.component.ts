import { Component, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { MatIconModule } from '@angular/material/icon';

// Uses Angular Material's <mat-icon> (Material Symbols/Icons font — the same
// icon family MUI draws its React icons from). Make sure MatIconModule is
// imported and the icon font is linked in index.html, per the earlier setup note.
// Swap for @mui/icons-material equivalents if this is actually a React app.

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatIconModule],
  template: `
    <nav class="op-navbar">
      <div class="op-nav-container">

        <a routerLink="/dashboard" class="op-brand" (click)="closeMobile()">
          <div class="op-brand-logo">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span class="op-brand-title">OnePoint</span>
          <span class="op-brand-badge">Enterprise</span>
        </a>

        <!-- Desktop links -->
        <div class="op-nav-links" *ngIf="authService.isLoggedIn()">
          <a routerLink="/dashboard" routerLinkActive="active" class="op-nav-item">Dashboard</a>
          <a routerLink="/builder" routerLinkActive="active" class="op-nav-item">Form builder</a>
          <a routerLink="/templates" routerLinkActive="active" class="op-nav-item">Templates</a>
        </div>

        <!-- Desktop right side -->
        <div class="op-nav-right" *ngIf="authService.currentUser() as user; else loginBtnDesktop">
          <div class="op-user-pill">
            <div class="op-avatar">{{ user.fullName.charAt(0) }}</div>
            <div class="op-user-info">
              <span class="op-user-name">{{ user.fullName }}</span>
              <span class="op-user-role">{{ user.employeeId }} · {{ user.role.replace('ROLE_', '') }}</span>
            </div>
          </div>
          <button (click)="logout()" class="op-btn op-btn-ghost" title="Log out">
            <mat-icon>logout</mat-icon>
          </button>
        </div>
        <ng-template #loginBtnDesktop>
          <a routerLink="/login" class="op-btn op-btn-primary op-desktop-only">Sign in</a>
        </ng-template>

        <!-- Mobile toggle -->
        <button class="op-menu-btn" (click)="toggleMobile()" [attr.aria-expanded]="mobileOpen" aria-label="Toggle menu">
          <mat-icon>{{ mobileOpen ? 'close' : 'menu' }}</mat-icon>
        </button>
      </div>

      <!-- Mobile panel -->
      <div class="op-mobile-panel" *ngIf="mobileOpen">
        <div class="op-mobile-links" *ngIf="authService.isLoggedIn()">
          <a routerLink="/dashboard" routerLinkActive="active" class="op-nav-item" (click)="closeMobile()">Dashboard</a>
          <a routerLink="/builder" routerLinkActive="active" class="op-nav-item" (click)="closeMobile()">Form builder</a>
          <a routerLink="/templates" routerLinkActive="active" class="op-nav-item" (click)="closeMobile()">Templates</a>
        </div>

        <div class="op-mobile-foot" *ngIf="authService.currentUser() as user; else loginBtnMobile">
          <div class="op-user-pill">
            <div class="op-avatar">{{ user.fullName.charAt(0) }}</div>
            <div class="op-user-info">
              <span class="op-user-name">{{ user.fullName }}</span>
              <span class="op-user-role">{{ user.employeeId }} · {{ user.role.replace('ROLE_', '') }}</span>
            </div>
          </div>
          <button (click)="logout()" class="op-btn op-btn-outline">
            <mat-icon>logout</mat-icon> Log out
          </button>
        </div>
        <ng-template #loginBtnMobile>
          <a routerLink="/login" class="op-btn op-btn-primary" (click)="closeMobile()">Sign in</a>
        </ng-template>
      </div>
    </nav>
  `,
  styles: [`
    :host {
      --navy: #000048;
      --blue: #2F78C4;
      --blue-tint: #eaf3fc;
      --yellow: #FFF691;
      --sub: #6b6f8c;
      --line: #e7e9f2;
      font-family: 'Gellix', 'General Sans', 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif;
    }

    .op-navbar {
      background: #ffffff;
      border-bottom: 1px solid var(--line);
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .op-nav-container {
      max-width: 1300px;
      margin: 0 auto;
      padding: 0.7rem 1.5rem;
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    /* brand */
    .op-brand {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      text-decoration: none;
      flex-shrink: 0;
    }
    .op-brand-logo {
      width: 32px;
      height: 32px;
      background: var(--navy);
      color: #ffff;
      border-radius: 9px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .op-brand-title {
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--navy);
      letter-spacing: -0.01em;
    }
    .op-brand-badge {
      font-size: 0.62rem;
      font-weight: 700;
      background: var(--blue-tint);
      color: var(--blue);
      padding: 0.15rem 0.45rem;
      border-radius: 5px;
      text-transform: uppercase;
      letter-spacing: .3px;
    }

    /* desktop links */
    .op-nav-links {
      display: flex;
      gap: 0.25rem;
      margin-right: auto;
    }
    .op-nav-item {
      padding: 0.5rem 0.9rem;
      text-decoration: none;
      color: var(--sub);
      font-weight: 600;
      font-size: 0.85rem;
      border-radius: 8px;
      transition: background .15s, color .15s;
    }
    .op-nav-item:hover { color: var(--navy); background: #f4f5fa; }
    .op-nav-item.active { color: var(--blue); background: var(--blue-tint); }

    /* desktop right */
    .op-nav-right {
      display: flex;
      align-items: center;
      gap: 0.9rem;
    }
    .op-user-pill {
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }
    .op-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--navy);
      color: var(--yellow);
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      flex-shrink: 0;
    }
    .op-user-info { display: flex; flex-direction: column; line-height: 1.25; }
    .op-user-name { font-size: 0.82rem; font-weight: 700; color: var(--navy); }
    .op-user-role { font-size: 0.68rem; color: var(--sub); }

    /* buttons */
    .op-btn {
      border: none;
      border-radius: 9px;
      padding: 0.5rem 0.9rem;
      font-size: 0.8rem;
      font-weight: 700;
      cursor: pointer;
      font-family: inherit;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      text-decoration: none;
    }
    .op-btn-primary { background: var(--blue); color: #fff; }
    .op-btn-ghost {
      background: none;
      color: var(--sub);
      padding: 0.45rem;
      border-radius: 8px;
    }
    .op-btn-ghost:hover { background: #f4f5fa; color: var(--navy); }
    .op-btn-ghost mat-icon { font-size: 19px !important; width: 19px; height: 19px; }
    .op-btn-outline {
      background: #fff;
      border: 1.5px solid var(--line);
      color: var(--navy);
      width: 100%;
      justify-content: center;
    }
    .op-btn mat-icon { font-size: 17px !important; width: 17px; height: 17px; }

    /* mobile toggle */
    .op-menu-btn {
      display: none;
      background: none;
      border: none;
      color: var(--navy);
      cursor: pointer;
      margin-left: auto;
      padding: 0.35rem;
      border-radius: 8px;
    }
    .op-menu-btn:hover { background: #f4f5fa; }

    /* mobile panel */
    .op-mobile-panel {
      display: none;
      border-top: 1px solid var(--line);
      padding: 0.75rem 1.5rem 1.1rem;
    }
    .op-mobile-links {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
      margin-bottom: 0.75rem;
    }
    .op-mobile-links .op-nav-item { padding: 0.65rem 0.75rem; }
    .op-mobile-foot {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      padding-top: 0.75rem;
      border-top: 1px solid var(--line);
    }
    .op-mobile-foot .op-btn { padding: 0.45rem 0.7rem; }

    /* breakpoint */
    @media (max-width: 860px) {
      .op-nav-links, .op-nav-right, .op-desktop-only { display: none; }
      .op-menu-btn { display: flex; align-items: center; justify-content: center; }
      .op-mobile-panel { display: block; }
    }
    @media (max-width: 460px) {
      .op-nav-container { padding: 0.6rem 1rem; }
      .op-brand-badge { display: none; }
      .op-mobile-panel { padding: 0.75rem 1rem 1rem; }
    }
  `]
})

export class NavbarComponent {
  authService = inject(AuthService);
  private router = inject(Router);
  mobileOpen = false;

  toggleMobile() {
    this.mobileOpen = !this.mobileOpen;
  }

  closeMobile() {
    this.mobileOpen = false;
  }

  // Collapse the mobile panel on resize past the breakpoint so it doesn't
  // stay stuck open if the window is widened.
  @HostListener('window:resize')
  onResize() {
    if (window.innerWidth > 860) {
      this.mobileOpen = false;
    }
  }

  logout() {
    this.authService.logout();
    this.closeMobile();
    this.router.navigate(['/login']);
  }
}
