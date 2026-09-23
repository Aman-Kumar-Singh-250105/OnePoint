import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AnalyticsService } from '../../core/services/analytics.service';
import { FormService } from '../../core/services/form.service';
import { DashboardMetrics, Form, FormStatus } from '../../core/models/models';
import { QrModalComponent } from '../../shared/qr-modal/qr-modal.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, QrModalComponent],
  template: `
    <div class="dashboard-container">
      <!-- Header Banner -->
      <div class="dashboard-header flex justify-between items-center">
        <div>
          <h1>Form Management Dashboard</h1>
          <p class="subtitle">Monitor active surveys, response metrics, and form lifecycles</p>
        </div>
        <div class="header-actions">
          <button (click)="openRuleModal = true" class="btn btn-accent">
            <span>AI Rule Engine Generator</span>
          </button>
          <a routerLink="/builder" class="btn btn-primary">
            <span>+ Create Blank Form</span>
          </a>
        </div>
      </div>

      <!-- Metric Cards Grid -->
      <div class="grid grid-cols-4 metrics-grid" *ngIf="metrics">
        <div class="metric-card">
          <div class="metric-icon primary">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
          </div>
          <div class="metric-info">
            <span class="metric-value">{{ metrics.totalForms }}</span>
            <span class="metric-label">Total Forms Created</span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon success">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <div class="metric-info">
            <span class="metric-value">{{ metrics.activeForms }}</span>
            <span class="metric-label">Active / Live Forms</span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon warning">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 8v13H3V8M1 3h22v5H1z"/>
            </svg>
          </div>
          <div class="metric-info">
            <span class="metric-value">{{ metrics.archivedForms }}</span>
            <span class="metric-label">Archived Forms</span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon accent">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div class="metric-info">
            <span class="metric-value">{{ metrics.totalResponses }}</span>
            <span class="metric-label">Total Responses</span>
          </div>
        </div>
      </div>



      <!-- Forms Table Section -->
      <div class="card forms-card">
        <div class="forms-header flex justify-between items-center">
          <div class="tabs">
            <button (click)="filterStatus = 'ALL'" [class.active]="filterStatus === 'ALL'" class="tab-btn">All Forms</button>
            <button (click)="filterStatus = 'PUBLISHED'" [class.active]="filterStatus === 'PUBLISHED'" class="tab-btn">Active</button>
            <button (click)="filterStatus = 'DRAFT'" [class.active]="filterStatus === 'DRAFT'" class="tab-btn">Drafts</button>
            <button (click)="filterStatus = 'ARCHIVED'" [class.active]="filterStatus === 'ARCHIVED'" class="tab-btn">Archived</button>
          </div>

          <div class="search-box">
            <input type="text" [(ngModel)]="searchQuery" placeholder="Search forms..." class="form-control form-control-sm" />
          </div>
        </div>

        <div class="table-responsive" *ngIf="filteredForms.length > 0; else emptyState">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Form Title</th>
                <th>Status</th>
                <th>Distribution</th>
                <th>Responses</th>
                <th>Created</th>
                <th style="text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let form of filteredForms">
                <td>
                  <div class="form-title-cell">
                    <strong class="title-text">{{ form.title }}</strong>
                    <span class="desc-text">{{ form.description || 'No description provided' }}</span>
                  </div>
                </td>
                <td>
                  <span [class]="getStatusBadgeClass(form.status)" class="badge">
                    {{ form.status }}
                  </span>
                </td>
                <td>
                  <span class="dist-type">{{ form.distributionType.replace('_', ' ') }}</span>
                </td>
                <td>
                  <div class="response-count">
                    <strong>{{ form.currentResponseCount || 0 }}</strong>
                    <span *ngIf="form.responseLimit">/ {{ form.responseLimit }} max</span>
                  </div>
                </td>
                <td>
                  <span class="date-text">{{ form.createdAt | date:'mediumDate' }}</span>
                </td>
                <td style="text-align: right;">
                  <div class="action-buttons">
                    <button (click)="openQrModal(form)" class="btn btn-secondary btn-sm" title="Share QR Code & Link">🔗</button>
                    <button (click)="editForm(form.id!)" class="btn btn-secondary btn-sm" title="Edit Form Schema">✏️</button>
                    <button (click)="viewResponses(form.id!)" class="btn btn-secondary btn-sm" title="View Responses">📥</button>
                    <button (click)="viewAnalytics(form.id!)" class="btn btn-secondary btn-sm" title="Analytics">📊</button>
                    <button (click)="cloneForm(form.id!)" class="btn btn-secondary btn-sm" title="Clone Form">📋</button>
                    <button (click)="deleteForm(form.id!)" class="btn btn-danger btn-sm" title="Delete Form">🗑️</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <ng-template #emptyState>
          <div class="empty-box">
            <p>No forms found matching your criteria.</p>
            <a routerLink="/builder" class="btn btn-primary btn-sm" style="margin-top: 0.5rem;">Create First Form</a>
          </div>
        </ng-template>
      </div>
    </div>

    <!-- Rule Generator Modal -->
    <div class="modal-backdrop" *ngIf="openRuleModal">
      <div class="modal-content" style="max-width: 550px;">
        <div class="modal-header">
          <h3>✨ Rule-Based AI Form Generator</h3>
          <button (click)="openRuleModal = false" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <p style="font-size: 0.85rem; color: #64748b; margin-bottom: 1rem;">
            Type a prompt in natural language. Our Spring Boot internal rule engine will parse keywords and construct full sections, question types, and validation rules automatically.
          </p>

          <div class="form-group">
            <label>Form Generation Prompt</label>
            <textarea [(ngModel)]="rulePrompt" class="form-control" placeholder="e.g. Create an onboarding feedback form for new engineers with date, IT setup rating, and comments" rows="4"></textarea>
          </div>

          <div class="prompt-suggestions">
            <span class="sug-title">Try Prompts:</span>
            <button (click)="rulePrompt = 'Create employee feedback pulse survey'" class="sug-btn">Employee Feedback</button>
            <button (click)="rulePrompt = 'Create event registration RSVP form'" class="sug-btn">Event RSVP</button>
            <button (click)="rulePrompt = 'Create IT equipment support request form'" class="sug-btn">IT Support</button>
          </div>
        </div>
        <div class="modal-footer">
          <button (click)="openRuleModal = false" class="btn btn-secondary">Cancel</button>
          <button (click)="generateFromRule()" [disabled]="generating || !rulePrompt.trim()" class="btn btn-accent">
            {{ generating ? 'Analyzing Prompt...' : 'Generate Form Schema' }}
          </button>
        </div>
      </div>
    </div>

    <!-- QR Code Modal -->
    <app-qr-modal *ngIf="selectedQrCode" [qrCodeBase64]="selectedQrCode" [shareToken]="selectedShareToken" (close)="selectedQrCode = ''"></app-qr-modal>
  `,
  styles: [`
    .dashboard-container { max-width: 1300px; margin: 2rem auto; padding: 0 1.5rem; }
    .dashboard-header h1 { font-size: 1.75rem; margin-bottom: 0.25rem; }
    .subtitle { color: #64748b; font-size: 0.9rem; }
    .header-actions { display: flex; gap: 0.75rem; }
    .metrics-grid { margin: 1.75rem 0; }
    .metric-card {
      background: #ffffff; padding: 1.25rem; border-radius: 12px; border: 1px solid #e2e8f0;
      display: flex; align-items: center; gap: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .metric-icon {
      width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center;
    }
    .metric-icon.primary { background: #e0e7ff; color: #4338ca; }
    .metric-icon.success { background: #dcfce7; color: #166534; }
    .metric-icon.warning { background: #feefc3; color: #854d0e; }
    .metric-icon.accent { background: #e0f2fe; color: #0369a1; }
    .metric-value { font-size: 1.5rem; font-weight: 800; color: #0f172a; display: block; }
    .metric-label { font-size: 0.75rem; color: #64748b; font-weight: 600; }

    .quick-actions-bar { margin-bottom: 1.75rem; }
    .action-tile {
      background: #ffffff; padding: 1rem; border-radius: 12px; border: 1px solid #e2e8f0;
      display: flex; align-items: center; gap: 0.85rem; text-decoration: none; color: inherit;
      transition: all 0.2s;
    }
    .action-tile:hover { transform: translateY(-2px); border-color: #cbd5e1; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.08); }
    .action-tile.clickable { cursor: pointer; }
    .tile-icon {
      width: 38px; height: 38px; background: #f1f5f9; border-radius: 10px;
      display: flex; align-items: center; justify-content: center; font-size: 1.1rem; font-weight: 700; color: #4f46e5;
    }
    .tile-icon.spark { background: #f0fdf4; color: #166534; }
    .tile-text strong { display: block; font-size: 0.85rem; color: #0f172a; }
    .tile-text span { font-size: 0.75rem; color: #64748b; }

    .forms-card { padding: 1.5rem; }
    .forms-header { margin-bottom: 1.25rem; }
    .tabs { display: flex; gap: 0.25rem; background: #f1f5f9; padding: 0.25rem; border-radius: 8px; }
    .tab-btn { padding: 0.35rem 0.75rem; font-size: 0.8rem; font-weight: 600; border: none; background: none; border-radius: 6px; cursor: pointer; color: #64748b; }
    .tab-btn.active { background: #ffffff; color: #0f172a; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }

    .custom-table { width: 100%; border-collapse: collapse; text-align: left; }
    .custom-table th { padding: 0.75rem 1rem; font-size: 0.75rem; font-weight: 700; color: #64748b; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; }
    .custom-table td { padding: 1rem; border-bottom: 1px solid #f1f5f9; font-size: 0.875rem; }
    .form-title-cell { display: flex; flex-direction: column; }
    .title-text { font-size: 0.9rem; color: #0f172a; }
    .desc-text { font-size: 0.75rem; color: #64748b; max-width: 320px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .dist-type { font-size: 0.75rem; font-weight: 600; color: #475569; }
    .response-count strong { color: #4f46e5; }
    .response-count span { font-size: 0.75rem; color: #64748b; }
    .action-buttons { display: flex; gap: 0.35rem; justify-content: flex-end; }
    .empty-box { text-align: center; padding: 3rem 1rem; color: #64748b; }

    .close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #64748b; }
    .prompt-suggestions { margin-top: 0.75rem; display: flex; gap: 0.4rem; align-items: center; flex-wrap: wrap; }
    .sug-title { font-size: 0.75rem; font-weight: 600; color: #64748b; }
    .sug-btn { font-size: 0.7rem; background: #e0e7ff; color: #4338ca; border: none; padding: 0.2rem 0.5rem; border-radius: 4px; cursor: pointer; }
  `]
})
export class DashboardComponent implements OnInit {
  private analyticsService = inject(AnalyticsService);
  private formService = inject(FormService);
  private router = inject(Router);

  metrics: DashboardMetrics | null = null;
  forms: Form[] = [];
  filterStatus = 'ALL';
  searchQuery = '';

  openRuleModal = false;
  rulePrompt = '';
  generating = false;

  selectedQrCode = '';
  selectedShareToken = '';

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.analyticsService.getDashboardMetrics().subscribe(res => {
      this.metrics = res;
    });

    this.formService.getUserForms().subscribe(res => {
      this.forms = res;
    });
  }

  get filteredForms(): Form[] {
    return this.forms.filter(f => {
      const matchesStatus = this.filterStatus === 'ALL' || f.status === this.filterStatus;
      const matchesSearch = !this.searchQuery || f.title.toLowerCase().includes(this.searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }

  getStatusBadgeClass(status: FormStatus): string {
    switch (status) {
      case 'PUBLISHED': return 'badge-published';
      case 'DRAFT': return 'badge-draft';
      case 'ARCHIVED': return 'badge-archived';
      case 'EXPIRED': return 'badge-expired';
      default: return 'badge-draft';
    }
  }

  generateFromRule(): void {
    if (!this.rulePrompt.trim()) return;
    this.generating = true;
    this.formService.generateRuleForm(this.rulePrompt).subscribe({
      next: (res) => {
        this.generating = false;
        this.openRuleModal = false;
        // Navigate to form builder with generated schema state
        this.router.navigate(['/builder'], { state: { generatedForm: res.generatedForm } });
      },
      error: () => {
        this.generating = false;
      }
    });
  }

  openQrModal(form: Form): void {
    this.selectedShareToken = form.shareToken || '';
    this.formService.getQrCode(form.id!).subscribe(qr => {
      this.selectedQrCode = qr;
    });
  }

  editForm(id: number): void {
    this.router.navigate(['/builder', id]);
  }

  viewResponses(id: number): void {
    this.router.navigate(['/analytics', id]);
  }

  viewAnalytics(id: number): void {
    this.router.navigate(['/analytics', id]);
  }

  cloneForm(id: number): void {
    this.formService.cloneForm(id).subscribe(() => {
      this.loadDashboardData();
    });
  }

  deleteForm(id: number): void {
    if (confirm('Are you sure you want to delete this form?')) {
      this.formService.deleteForm(id).subscribe(() => {
        this.loadDashboardData();
      });
    }
  }
}
