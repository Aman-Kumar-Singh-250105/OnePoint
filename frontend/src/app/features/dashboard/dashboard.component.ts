import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AnalyticsService } from '../../core/services/analytics.service';
import { FormService } from '../../core/services/form.service';
import { DashboardMetrics, Form, FormStatus } from '../../core/models/models';
import { QrModalComponent } from '../../shared/qr-modal/qr-modal.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    QrModalComponent,
    MatIconModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
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

  openMenuFormId: number | null = null;
  toggleMenu(id: number) {
    this.openMenuFormId = this.openMenuFormId === id ? null : id;
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.analyticsService.getDashboardMetrics().subscribe((res) => {
      this.metrics = res;
    });

    this.formService.getUserForms().subscribe((res) => {
      this.forms = res;
    });
  }

  get filteredForms(): Form[] {
    return this.forms.filter((f) => {
      const matchesStatus =
        this.filterStatus === 'ALL' || f.status === this.filterStatus;
      const matchesSearch =
        !this.searchQuery ||
        f.title.toLowerCase().includes(this.searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }

  getStatusBadgeClass(status: FormStatus): string {
    switch (status) {
      case 'PUBLISHED':
        return 'badge-published';
      case 'DRAFT':
        return 'badge-draft';
      case 'ARCHIVED':
        return 'badge-archived';
      case 'EXPIRED':
        return 'badge-expired';
      default:
        return 'badge-draft';
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
        this.router.navigate(['/builder'], {
          state: { generatedForm: res.generatedForm },
        });
      },
      error: () => {
        this.generating = false;
      },
    });
  }

  openQrModal(form: Form): void {
    this.selectedShareToken = form.shareToken || '';
    this.formService.getQrCode(form.id!).subscribe((qr) => {
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
