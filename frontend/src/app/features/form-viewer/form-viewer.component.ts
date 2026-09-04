import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormService } from '../../core/services/form.service';
import { SubmissionService } from '../../core/services/submission.service';
import { AuthService } from '../../core/services/auth.service';
import { Form, FormSubmission, Question } from '../../core/models/models';

@Component({
  selector: 'app-form-viewer',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="viewer-container" *ngIf="form; else loadingTpl">
      <!-- Submitted Confirmation View -->
      <div class="card success-card" *ngIf="submitted">
        <div class="success-icon">✓</div>
        <h2>Submission Received!</h2>
        <p class="success-desc">Thank you for completing <strong>{{ form.title }}</strong>.</p>

        <div class="ref-box" *ngIf="submissionToken">
          <span>Submission Reference Token:</span>
          <code>{{ submissionToken }}</code>
        </div>

        <div class="actions">
          <button (click)="resetForm()" class="btn btn-secondary btn-sm">Submit Another Response</button>
          <a routerLink="/dashboard" class="btn btn-primary btn-sm" *ngIf="authService.isLoggedIn()">Return to Dashboard</a>
        </div>
      </div>

      <!-- Active Form Viewer -->
      <div class="form-paper card" *ngIf="!submitted">
        <div class="form-header">
          <h1>{{ form.title }}</h1>
          <p class="form-desc">{{ form.description }}</p>
          <div class="form-meta flex gap-4" style="margin-top: 0.75rem;">
            <span class="meta-item" *ngIf="form.allowAnonymous">🔒 Anonymous Survey</span>
            <span class="meta-item" *ngIf="!form.allowAnonymous">👤 Authorized Employee Form</span>
            <span class="meta-item status-badge" *ngIf="form.status !== 'PUBLISHED'" style="background: #fef2f2; color: #991b1b;">
              ⚠️ {{ form.status }}
            </span>
          </div>
        </div>

        <!-- Validation & Error Banner -->
        <div class="error-banner" *ngIf="validationError" style="margin-top: 1rem; padding: 0.875rem 1.25rem; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; color: #991b1b; font-size: 0.9rem;">
          <strong>Validation Error:</strong> {{ validationError }}
        </div>

        <!-- Inactive Form Banner -->
        <div *ngIf="form.status !== 'PUBLISHED'" style="margin-top: 1rem; padding: 1rem; background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; color: #92400e;">
          This form is currently not accepting new submissions (Status: {{ form.status }}).
        </div>

        <!-- Respondent Details (If Authorized & Not Logged In) -->
        <div class="respondent-box" *ngIf="!form.allowAnonymous && !authService.isLoggedIn()">
          <h3>Respondent Information</h3>
          <div class="grid grid-cols-3 gap-4" style="margin-top: 0.75rem;">
            <div class="form-group" style="margin:0;">
              <label>Employee ID *</label>
              <input type="text" [(ngModel)]="employeeId" class="form-control" placeholder="EMP003" />
            </div>
            <div class="form-group" style="margin:0;">
              <label>Full Name *</label>
              <input type="text" [(ngModel)]="respondentName" class="form-control" placeholder="David Chen" />
            </div>
            <div class="form-group" style="margin:0;">
              <label>Corporate Email *</label>
              <input type="email" [(ngModel)]="respondentEmail" class="form-control" placeholder="employee@onepoint.com" />
            </div>
          </div>
        </div>

        <!-- Form Sections & Questions -->
        <form (ngSubmit)="submitForm(false)">
          <div class="section-block" *ngFor="let sec of form.sections">
            <h2 class="sec-title">{{ sec.sectionTitle }}</h2>
            <p class="sec-desc" *ngIf="sec.sectionDescription">{{ sec.sectionDescription }}</p>

            <div class="q-card" *ngFor="let q of sec.questions">
              <label class="q-label">
                {{ q.questionText }}
                <span class="required-star" *ngIf="q.required">*</span>
              </label>
              <p class="help-text" *ngIf="q.helpText">{{ q.helpText }}</p>

              <!-- Field Types Renderer -->
              <!-- TEXT -->
              <input type="text" *ngIf="q.questionType === 'TEXT'" [(ngModel)]="answersMap[q.id!]" [name]="'q_' + q.id" class="form-control" />

              <!-- MULTILINE TEXT -->
              <textarea *ngIf="q.questionType === 'MULTILINE_TEXT'" [(ngModel)]="answersMap[q.id!]" [name]="'q_' + q.id" class="form-control" rows="3"></textarea>

              <!-- EMAIL -->
              <input type="email" *ngIf="q.questionType === 'EMAIL'" [(ngModel)]="answersMap[q.id!]" [name]="'q_' + q.id" class="form-control" placeholder="name@domain.com" />

              <!-- NUMBER -->
              <input type="number" *ngIf="q.questionType === 'NUMBER'" [(ngModel)]="answersMap[q.id!]" [name]="'q_' + q.id" class="form-control" />

              <!-- DATE -->
              <input type="date" *ngIf="q.questionType === 'DATE'" [(ngModel)]="answersMap[q.id!]" [name]="'q_' + q.id" class="form-control" />

              <!-- TIME -->
              <input type="time" *ngIf="q.questionType === 'TIME'" [(ngModel)]="answersMap[q.id!]" [name]="'q_' + q.id" class="form-control" />

              <!-- DROPDOWN -->
              <select *ngIf="q.questionType === 'DROPDOWN'" [(ngModel)]="answersMap[q.id!]" [name]="'q_' + q.id" class="form-control">
                <option value="">-- Select Choice --</option>
                <option *ngFor="let opt of q.options" [value]="opt.optionValue">{{ opt.optionLabel }}</option>
              </select>

              <!-- RADIO -->
              <div *ngIf="q.questionType === 'RADIO'" class="radio-group">
                <label *ngFor="let opt of q.options" class="radio-label">
                  <input type="radio" [name]="'q_' + q.id" [(ngModel)]="answersMap[q.id!]" [value]="opt.optionValue" />
                  {{ opt.optionLabel }}
                </label>
              </div>

              <!-- CHECKBOX -->
              <div *ngIf="q.questionType === 'CHECKBOX'" class="checkbox-group">
                <label *ngFor="let opt of q.options" class="checkbox-label">
                  <input type="checkbox" [checked]="isCheckboxChecked(q.id!, opt.optionValue)" (change)="toggleCheckbox(q.id!, opt.optionValue)" />
                  {{ opt.optionLabel }}
                </label>
              </div>

              <!-- RATING -->
              <div *ngIf="q.questionType === 'RATING'" class="rating-stars">
                <button type="button" *ngFor="let star of [1,2,3,4,5]" (click)="answersMap[q.id!] = star.toString()" [class.active]="answersMap[q.id!] === star.toString()" class="star-btn">
                  ★ {{ star }}
                </button>
              </div>

              <!-- FILE UPLOAD -->
              <div *ngIf="q.questionType === 'FILE_UPLOAD'">
                <input type="file" (change)="onFileSelect($event, q.id!)" class="form-control" />
                <small *ngIf="answersMap[q.id!]" style="color: #4f46e5; display: block; margin-top: 0.25rem;">
                  Selected: {{ answersMap[q.id!] }}
                </small>
              </div>
            </div>
          </div>

          <div class="footer-actions flex justify-between items-center">
            <div class="flex items-center gap-2">
              <input type="checkbox" [(ngModel)]="sendResponseCopy" name="sendCopy" id="sendCopy" />
              <label for="sendCopy" style="font-size: 0.85rem; cursor: pointer;">Email me a copy of my responses</label>
            </div>

            <div class="flex gap-2">
              <button type="button" (click)="submitForm(true)" [disabled]="submitting" class="btn btn-secondary">
                💾 Save Progress / Draft
              </button>
              <button type="submit" [disabled]="submitting || form.status !== 'PUBLISHED'" class="btn btn-primary">
                Submit Response
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- Resume Draft Token Dialog Modal -->
    <div class="modal-backdrop" *ngIf="savedDraftToken">
      <div class="modal-content" style="max-width: 440px; text-align: center;">
        <div class="modal-header">
          <h3>Progress Saved!</h3>
          <button (click)="savedDraftToken = ''" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <p style="font-size: 0.875rem; color: #64748b;">
            Your responses have been saved as a draft. Use this token or URL to resume anytime:
          </p>
          <div style="background: #f1f5f9; padding: 1rem; border-radius: 8px; margin: 1rem 0;">
            <code style="font-size: 1.1rem; font-weight: 700; color: #4f46e5;">{{ savedDraftToken }}</code>
          </div>
        </div>
        <div class="modal-footer" style="justify-content: center;">
          <button (click)="savedDraftToken = ''" class="btn btn-primary">Got it</button>
        </div>
      </div>
    </div>

    <ng-template #loadingTpl>
      <div style="text-align: center; padding: 4rem;">
        <p>Loading form...</p>
      </div>
    </ng-template>
  `,
  styles: [`
    .viewer-container { max-width: 800px; margin: 2rem auto; padding: 0 1rem; }
    .form-paper { padding: 2.5rem; background: #ffffff; border-radius: 16px; }
    .form-header h1 { font-size: 1.75rem; margin-bottom: 0.5rem; color: #0f172a; }
    .form-desc { color: #64748b; font-size: 0.95rem; line-height: 1.5; }
    .meta-item { font-size: 0.75rem; font-weight: 700; background: #f1f5f9; color: #475569; padding: 0.25rem 0.6rem; border-radius: 6px; }
    .respondent-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.25rem; margin: 1.5rem 0; }
    .respondent-box h3 { font-size: 0.95rem; color: #0f172a; }
    .section-block { margin-top: 2rem; border-top: 1px solid #e2e8f0; padding-top: 1.5rem; }
    .sec-title { font-size: 1.25rem; color: #0f172a; margin-bottom: 0.25rem; }
    .sec-desc { font-size: 0.85rem; color: #64748b; margin-bottom: 1.25rem; }
    .q-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 1.25rem; margin-bottom: 1rem; }
    .q-label { font-size: 0.95rem; font-weight: 700; color: #1e293b; display: block; margin-bottom: 0.35rem; }
    .required-star { color: #ef4444; margin-left: 0.25rem; }
    .help-text { font-size: 0.75rem; color: #64748b; margin-bottom: 0.5rem; }
    .radio-group, .checkbox-group { display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.5rem; }
    .radio-label, .checkbox-label { font-size: 0.875rem; color: #334155; display: flex; align-items: center; gap: 0.5rem; cursor: pointer; }
    .rating-stars { display: flex; gap: 0.5rem; margin-top: 0.5rem; }
    .star-btn { padding: 0.5rem 0.875rem; border: 1px solid #cbd5e1; background: #ffffff; border-radius: 8px; cursor: pointer; font-weight: 700; }
    .star-btn.active { background: #fef08a; border-color: #eab308; color: #854d0e; }
    .footer-actions { margin-top: 2.5rem; padding-top: 1.5rem; border-top: 1px solid #e2e8f0; }

    .success-card { text-align: center; padding: 3.5rem 2rem; }
    .success-icon { width: 64px; height: 64px; background: #dcfce7; color: #166534; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: 800; margin: 0 auto 1.5rem; }
    .success-desc { color: #64748b; margin-bottom: 1.5rem; }
    .ref-box { background: #f8fafc; padding: 1rem; border-radius: 8px; border: 1px solid #e2e8f0; display: inline-block; margin-bottom: 1.5rem; }
    .ref-box code { font-size: 1.1rem; font-weight: 700; color: #4f46e5; margin-left: 0.5rem; }
    .close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #64748b; }
  `]
})
export class FormViewerComponent implements OnInit {
  private formService = inject(FormService);
  private submissionService = inject(SubmissionService);
  authService = inject(AuthService);
  private route = inject(ActivatedRoute);

  form: Form | null = null;
  answersMap: { [questionId: number]: string } = {};
  checkboxMap: { [questionId: number]: Set<string> } = {};

  employeeId = '';
  respondentName = '';
  respondentEmail = '';
  sendResponseCopy = false;

  submitting = false;
  submitted = false;
  submissionToken = '';
  savedDraftToken = '';
  validationError = '';

  ngOnInit(): void {
    const shareToken = this.route.snapshot.params['token'];
    const draftToken = this.route.snapshot.queryParams['draftToken'] || this.route.snapshot.queryParams['draft'];

    if (shareToken) {
      this.formService.getFormByShareToken(shareToken).subscribe({
        next: (res) => {
          this.form = res;
          if (draftToken) {
            this.loadDraft(draftToken);
          }
        },
        error: (err) => {
          this.validationError = 'Failed to load form definition.';
        }
      });
    } else if (draftToken) {
      this.loadDraft(draftToken);
    }

    // Auto-fill logged in user info if authorized
    const user = this.authService.currentUser();
    if (user) {
      this.employeeId = user.employeeId;
      this.respondentName = user.fullName;
      this.respondentEmail = user.email;
    }
  }

  loadDraft(token: string): void {
    this.submissionService.getDraftByToken(token).subscribe({
      next: (sub) => {
        this.submissionToken = sub.submissionToken || token;
        if (sub.employeeId && sub.employeeId !== 'ANONYMOUS') this.employeeId = sub.employeeId;
        if (sub.respondentName && sub.respondentName !== 'Anonymous Respondent') this.respondentName = sub.respondentName;
        if (sub.respondentEmail && sub.respondentEmail !== 'ANONYMOUS') this.respondentEmail = sub.respondentEmail;

        if (sub.answers) {
          sub.answers.forEach(a => {
            if (a.questionId && a.answerValue !== undefined) {
              this.answersMap[a.questionId] = a.answerValue;
            }
          });
        }
      },
      error: () => {
        this.validationError = 'Invalid or expired draft token.';
      }
    });
  }

  isCheckboxChecked(qId: number, val: string): boolean {
    if (this.answersMap[qId]) {
      const selected = this.answersMap[qId].split(',');
      return selected.includes(val);
    }
    return false;
  }

  toggleCheckbox(qId: number, val: string): void {
    if (!this.checkboxMap[qId]) {
      this.checkboxMap[qId] = new Set<string>();
      if (this.answersMap[qId]) {
        this.answersMap[qId].split(',').forEach(item => this.checkboxMap[qId].add(item.trim()));
      }
    }
    const set = this.checkboxMap[qId];
    if (set.has(val)) {
      set.delete(val);
    } else {
      set.add(val);
    }
    this.answersMap[qId] = Array.from(set).join(',');
  }

  onFileSelect(event: any, qId: number): void {
    const file = event.target.files[0];
    if (file) {
      this.answersMap[qId] = `Attachment: ${file.name} (${Math.round(file.size / 1024)} KB)`;
    }
  }

  submitForm(isDraft: boolean): void {
    this.validationError = '';
    if (!this.form) return;

    // Validate Respondent Details if not anonymous and not logged in
    if (!isDraft && !this.form.allowAnonymous && !this.authService.isLoggedIn()) {
      if (!this.employeeId.trim() || !this.respondentName.trim() || !this.respondentEmail.trim()) {
        this.validationError = 'Please fill out all required respondent information (Employee ID, Full Name, Corporate Email).';
        return;
      }
    }

    // Validate Required Questions if not a draft
    if (!isDraft) {
      const missingQuestions: string[] = [];
      for (const sec of this.form.sections || []) {
        for (const q of sec.questions || []) {
          if (q.required) {
            const ans = this.answersMap[q.id!];
            if (!ans || ans.trim() === '') {
              missingQuestions.push(q.questionText);
            }
          }
        }
      }

      if (missingQuestions.length > 0) {
        this.validationError = `Please answer all mandatory questions: ${missingQuestions.slice(0, 3).join(', ')}${missingQuestions.length > 3 ? '...' : ''}`;
        return;
      }
    }

    this.submitting = true;

    // Build questionText lookup map to populate questionText in answer payload
    const questionTextMap = new Map<number, string>();
    this.form.sections?.forEach(sec => {
      sec.questions?.forEach(q => {
        if (q.id) questionTextMap.set(q.id, q.questionText);
      });
    });

    const answers = Object.keys(this.answersMap)
      .filter(qIdStr => this.answersMap[+qIdStr] !== undefined && this.answersMap[+qIdStr] !== null)
      .map(qIdStr => {
        const qId = +qIdStr;
        return {
          questionId: qId,
          questionText: questionTextMap.get(qId) || '',
          answerValue: this.answersMap[qId]
        };
      });

    const payload: FormSubmission = {
      formId: this.form.id!,
      submissionToken: this.submissionToken || undefined,
      isDraft: isDraft,
      sendResponseCopy: this.sendResponseCopy,
      employeeId: this.employeeId,
      respondentName: this.respondentName,
      respondentEmail: this.respondentEmail,
      answers: answers
    };

    this.submissionService.submitPublicForm(payload).subscribe({
      next: (res) => {
        this.submitting = false;
        if (res.submissionToken) {
          this.submissionToken = res.submissionToken;
        }
        if (isDraft) {
          this.savedDraftToken = res.submissionToken || '';
        } else {
          this.submitted = true;
        }
      },
      error: (err) => {
        this.submitting = false;
        this.validationError = err.error?.message || err.error || 'Submission failed. Please check your inputs.';
      }
    });
  }

  resetForm(): void {
    this.submitted = false;
    this.answersMap = {};
    this.checkboxMap = {};
    this.submissionToken = '';
    this.validationError = '';
  }
}
