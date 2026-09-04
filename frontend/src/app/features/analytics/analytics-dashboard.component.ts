import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AnalyticsService } from '../../core/services/analytics.service';
import { SubmissionService } from '../../core/services/submission.service';
import { FormAnalytics, FormSubmission } from '../../core/models/models';

@Component({
  selector: 'app-analytics-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="analytics-container" *ngIf="analytics; else loadingTpl">
      <!-- Header Bar with Export Buttons -->
      <div class="analytics-header flex justify-between items-center glass-panel">
        <div>
          <button (click)="goBack()" class="btn btn-secondary btn-sm" style="margin-bottom: 0.5rem;">← Back to Dashboard</button>
          <h1>Form Analytics: {{ analytics.formTitle }}</h1>
          <p class="subtitle">Real-time metrics, completion rates, and question breakdowns</p>
        </div>

        <div class="export-group flex gap-2">
          <button (click)="exportReport('csv')" class="btn btn-secondary btn-sm" title="Export CSV Report">
            📄 Export CSV
          </button>
          <button (click)="exportReport('excel')" class="btn btn-secondary btn-sm" title="Export Excel Report">
            📊 Export Excel
          </button>
          <button (click)="exportReport('pdf')" class="btn btn-primary btn-sm" title="Export PDF Report">
            📕 Export PDF
          </button>
        </div>
      </div>

      <!-- High Level Metrics Grid -->
      <div class="grid grid-cols-4 metrics-grid">
        <div class="card metric-card">
          <span class="metric-label">Total Submissions</span>
          <span class="metric-value">{{ analytics.totalSubmissions }}</span>
        </div>
        <div class="card metric-card">
          <span class="metric-label">Daily Submissions (24h)</span>
          <span class="metric-value text-success">+{{ analytics.dailySubmissions }}</span>
        </div>
        <div class="card metric-card">
          <span class="metric-label">Weekly Submissions</span>
          <span class="metric-value text-primary">{{ analytics.weeklySubmissions }}</span>
        </div>
        <div class="card metric-card">
          <span class="metric-label">Completion Rate</span>
          <span class="metric-value text-accent">{{ analytics.completionRate }}%</span>
        </div>
      </div>

      <!-- Question Wise Analysis Section -->
      <div class="analytics-section">
        <h2>Question-Wise Analysis</h2>
        <div class="grid grid-cols-2 gap-4" style="margin-top: 1rem;">
          <div class="q-analytics-card card" *ngFor="let qa of analytics.questionAnalyticsList">
            <div class="flex justify-between items-center">
              <h3>{{ qa.questionText }}</h3>
              <span class="q-type-badge">{{ qa.questionType }}</span>
            </div>

            <!-- Average Rating -->
            <div class="rating-display" *ngIf="qa.averageRating && qa.averageRating > 0">
              <span class="stars">★★★★★</span>
              <span class="avg-score">Average Score: <strong>{{ qa.averageRating }} / 5.0</strong></span>
            </div>

            <!-- Option Choice Counts Bar Chart -->
            <div class="options-distribution" *ngIf="qa.optionCounts">
              <div class="dist-row" *ngFor="let opt of getOptionEntries(qa.optionCounts)">
                <div class="dist-label flex justify-between">
                  <span>{{ opt.label }}</span>
                  <strong>{{ opt.count }} responses</strong>
                </div>
                <div class="progress-bar-bg">
                  <div class="progress-bar-fill" [style.width.%]="getPercentage(opt.count, analytics.totalSubmissions)"></div>
                </div>
              </div>
            </div>

            <!-- Sample Text Responses -->
            <div class="text-samples" *ngIf="qa.textAnswers && qa.textAnswers.length > 0">
              <span class="sample-title">Recent Sample Responses:</span>
              <div class="sample-item" *ngFor="let text of qa.textAnswers">
                "{{ text }}"
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Submissions Table -->
      <div class="card submissions-card" style="margin-top: 2rem;">
        <div class="flex justify-between items-center" style="margin-bottom: 1rem;">
          <h2>All Individual Submissions ({{ submissions.length }})</h2>
        </div>

        <div class="table-responsive" *ngIf="submissions.length > 0; else emptySubs">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Submission Token</th>
                <th>Respondent</th>
                <th>Submitted At</th>
                <th style="text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let sub of submissions">
                <td><code>{{ sub.submissionToken }}</code></td>
                <td>
                  <strong>{{ sub.isAnonymous ? 'Anonymous' : sub.respondentName }}</strong>
                  <span style="font-size: 0.75rem; color: #64748b; display: block;" *ngIf="!sub.isAnonymous">{{ sub.respondentEmail }}</span>
                </td>
                <td>{{ sub.submittedAt | date:'medium' }}</td>
                <td style="text-align: right;">
                  <button (click)="viewDetail(sub)" class="btn btn-secondary btn-sm">Inspect Answers</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <ng-template #emptySubs>
          <p style="text-align: center; color: #64748b; padding: 2rem;">No responses submitted yet.</p>
        </ng-template>
      </div>
    </div>

    <!-- Submission Inspect Modal -->
    <div class="modal-backdrop" *ngIf="selectedSubmission">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Submission Detail: {{ selectedSubmission.submissionToken }}</h3>
          <button (click)="selectedSubmission = null" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <p style="font-size: 0.85rem; color: #64748b; margin-bottom: 1rem;">
            Submitted by <strong>{{ selectedSubmission.isAnonymous ? 'Anonymous Respondent' : selectedSubmission.respondentName }}</strong> on {{ selectedSubmission.submittedAt | date:'medium' }}
          </p>

          <div class="ans-item" *ngFor="let ans of selectedSubmission.answers">
            <strong class="ans-q">{{ ans.questionText }}</strong>
            <div class="ans-val">{{ ans.answerValue || '(No answer provided)' }}</div>
          </div>
        </div>
        <div class="modal-footer">
          <button (click)="selectedSubmission = null" class="btn btn-secondary">Close</button>
        </div>
      </div>
    </div>

    <ng-template #loadingTpl>
      <div style="text-align: center; padding: 4rem;">
        <p>Loading analytics data...</p>
      </div>
    </ng-template>
  `,
  styles: [`
    .analytics-container { max-width: 1250px; margin: 2rem auto; padding: 0 1.5rem; }
    .analytics-header { padding: 1.25rem 1.5rem; border-radius: 12px; margin-bottom: 1.5rem; }
    .subtitle { color: #64748b; font-size: 0.85rem; }
    .metrics-grid { margin-bottom: 2rem; }
    .metric-card { text-align: center; padding: 1.25rem; }
    .metric-label { font-size: 0.75rem; font-weight: 700; color: #64748b; text-transform: uppercase; display: block; margin-bottom: 0.25rem; }
    .metric-value { font-size: 1.75rem; font-weight: 800; color: #0f172a; }
    .text-success { color: #166534; }
    .text-primary { color: #4f46e5; }
    .text-accent { color: #0284c7; }

    .q-analytics-card { padding: 1.25rem; }
    .q-analytics-card h3 { font-size: 0.95rem; color: #0f172a; margin: 0; }
    .q-type-badge { font-size: 0.65rem; font-weight: 700; background: #f1f5f9; color: #475569; padding: 0.2rem 0.5rem; border-radius: 4px; }
    .rating-display { margin-top: 0.75rem; background: #fef08a; padding: 0.5rem; border-radius: 8px; font-size: 0.85rem; color: #854d0e; }
    .stars { color: #eab308; font-size: 1.1rem; margin-right: 0.5rem; }
    .options-distribution { margin-top: 0.75rem; display: flex; flex-direction: column; gap: 0.5rem; }
    .dist-label { font-size: 0.8rem; color: #334155; margin-bottom: 0.2rem; }
    .progress-bar-bg { height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden; }
    .progress-bar-fill { height: 100%; background: linear-gradient(90deg, #4f46e5 0%, #06b6d4 100%); border-radius: 4px; }
    .text-samples { margin-top: 0.75rem; }
    .sample-title { font-size: 0.75rem; font-weight: 700; color: #64748b; display: block; margin-bottom: 0.25rem; }
    .sample-item { font-size: 0.8rem; background: #f8fafc; padding: 0.4rem 0.6rem; border-radius: 6px; margin-bottom: 0.25rem; color: #334155; font-style: italic; }

    .custom-table { width: 100%; border-collapse: collapse; text-align: left; }
    .custom-table th { padding: 0.75rem 1rem; font-size: 0.75rem; font-weight: 700; color: #64748b; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; }
    .custom-table td { padding: 0.85rem 1rem; border-bottom: 1px solid #f1f5f9; font-size: 0.85rem; }
    .ans-item { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.75rem; margin-bottom: 0.5rem; }
    .ans-q { font-size: 0.85rem; color: #0f172a; display: block; margin-bottom: 0.2rem; }
    .ans-val { font-size: 0.85rem; color: #4f46e5; font-weight: 600; }
    .close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #64748b; }
  `]
})
export class AnalyticsDashboardComponent implements OnInit {
  private analyticsService = inject(AnalyticsService);
  private submissionService = inject(SubmissionService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  formId: number | null = null;
  analytics: FormAnalytics | null = null;
  submissions: FormSubmission[] = [];
  selectedSubmission: FormSubmission | null = null;

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.formId = +params['id'];
        this.loadAnalytics();
      }
    });
  }

  loadAnalytics(): void {
    if (!this.formId) return;

    this.analyticsService.getFormAnalytics(this.formId).subscribe(res => {
      this.analytics = res;
    });

    this.submissionService.getFormSubmissions(this.formId).subscribe(res => {
      this.submissions = res;
    });
  }

  exportReport(format: 'csv' | 'excel' | 'pdf'): void {
    if (this.formId) {
      this.analyticsService.downloadExport(this.formId, format);
    }
  }

  getOptionEntries(countsObj: { [key: string]: number }): { label: string; count: number }[] {
    return Object.keys(countsObj).map(k => ({ label: k, count: countsObj[k] }));
  }

  getPercentage(count: number, total: number): number {
    return total > 0 ? Math.round((count / total) * 100) : 0;
  }

  viewDetail(sub: FormSubmission): void {
    this.selectedSubmission = sub;
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
