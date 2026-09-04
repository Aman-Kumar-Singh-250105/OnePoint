import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FormService } from '../../core/services/form.service';
import { DistributionType, Form, FormSection, FormStatus, Question, QuestionType } from '../../core/models/models';

@Component({
  selector: 'app-form-builder',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="builder-container">
      <!-- Top Action Bar -->
      <div class="builder-header flex justify-between items-center glass-panel">
        <div class="flex items-center gap-4">
          <button (click)="goBack()" class="btn btn-secondary btn-sm">← Back</button>
          <div>
            <h2>{{ formId ? 'Edit Form Schema' : 'Create New Form' }}</h2>
            <span class="status-indicator">Current Status: <strong>{{ form.status }}</strong></span>
          </div>
        </div>

        <div class="flex gap-2">
          <button (click)="saveForm('DRAFT')" [disabled]="saving" class="btn btn-secondary">
            Save as Draft
          </button>
          <button (click)="saveForm('PUBLISHED')" [disabled]="saving" class="btn btn-primary">
            🚀 Publish Live
          </button>
        </div>
      </div>

      <div class="builder-content grid grid-cols-3">
        <!-- Main Form Editor Canvas (2 Cols) -->
        <div class="canvas-col" style="grid-column: span 2;">
          <!-- Form Header Config Card -->
          <div class="card header-card">
            <div class="form-group">
              <label>Form Title *</label>
              <input type="text" [(ngModel)]="form.title" class="form-control form-control-lg" placeholder="Enter Form Title..." />
            </div>
            <div class="form-group">
              <label>Form Description</label>
              <textarea [(ngModel)]="form.description" class="form-control" placeholder="Add detailed instructions for respondents..." rows="2"></textarea>
            </div>
          </div>

          <!-- Sections List -->
          <div class="sections-list">
            <div class="section-card card" *ngFor="let section of form.sections; let sIdx = index">
              <div class="section-header flex justify-between items-center">
                <div class="flex items-center gap-2" style="flex: 1;">
                  <span class="sec-num">Section {{ sIdx + 1 }}</span>
                  <input type="text" [(ngModel)]="section.sectionTitle" class="form-control sec-title-input" placeholder="Section Title..." />
                </div>
                <button (click)="removeSection(sIdx)" *ngIf="form.sections.length > 1" class="btn btn-danger btn-sm" title="Remove Section">🗑️</button>
              </div>

              <div class="form-group" style="margin-top: 0.5rem;">
                <input type="text" [(ngModel)]="section.sectionDescription" class="form-control form-control-sm" placeholder="Section Description / Subtitle..." />
              </div>

              <!-- Questions List within Section -->
              <div class="questions-list">
                <div class="question-item" *ngFor="let q of section.questions; let qIdx = index">
                  <div class="q-header flex justify-between items-center">
                    <span class="q-num">Q{{ qIdx + 1 }}</span>
                    <div class="flex items-center gap-2">
                      <label class="required-toggle">
                        <input type="checkbox" [(ngModel)]="q.required" /> Required
                      </label>
                      <button (click)="removeQuestion(section, qIdx)" class="btn btn-secondary btn-sm" style="color: #ef4444;">&times;</button>
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-4" style="margin-top: 0.5rem;">
                    <div class="form-group" style="margin:0;">
                      <label>Question Label</label>
                      <input type="text" [(ngModel)]="q.questionText" class="form-control" placeholder="Ask a question..." />
                    </div>

                    <div class="form-group" style="margin:0;">
                      <label>Field Type</label>
                      <select [(ngModel)]="q.questionType" class="form-control">
                        <option value="TEXT">Short Text</option>
                        <option value="MULTILINE_TEXT">Multi-Line Textarea</option>
                        <option value="EMAIL">Email Address</option>
                        <option value="NUMBER">Number Input</option>
                        <option value="DATE">Date Picker</option>
                        <option value="TIME">Time Picker</option>
                        <option value="DROPDOWN">Dropdown Menu</option>
                        <option value="RADIO">Radio Single Choice</option>
                        <option value="CHECKBOX">Checkbox Multi Choice</option>
                        <option value="RATING">Star / NPS Rating</option>
                        <option value="FILE_UPLOAD">File Upload Attachment</option>
                      </select>
                    </div>
                  </div>

                  <!-- Options Builder for Choice Field Types -->
                  <div class="options-builder" *ngIf="q.questionType === 'DROPDOWN' || q.questionType === 'RADIO' || q.questionType === 'CHECKBOX'">
                    <label style="font-size: 0.75rem; font-weight: 700; color: #475569; display: block; margin: 0.75rem 0 0.25rem;">Choice Options:</label>
                    <div class="option-row flex items-center gap-2" *ngFor="let opt of q.options; let optIdx = index">
                      <input type="text" [(ngModel)]="opt.optionLabel" (ngModelChange)="opt.optionValue = opt.optionLabel" class="form-control form-control-sm" placeholder="Option label..." />
                      <button (click)="q.options.splice(optIdx, 1)" class="btn btn-secondary btn-sm" style="padding: 0.2rem 0.5rem;">&times;</button>
                    </div>
                    <button (click)="addOption(q)" class="btn btn-secondary btn-sm" style="margin-top: 0.5rem;">+ Add Option</button>
                  </div>
                </div>

                <button (click)="addQuestion(section)" class="btn btn-secondary btn-sm btn-block" style="margin-top: 0.75rem;">
                  + Add Question to Section {{ sIdx + 1 }}
                </button>
              </div>
            </div>

            <button (click)="addSection()" class="btn btn-secondary btn-block" style="padding: 0.875rem;">
              + Add New Section
            </button>
          </div>
        </div>

        <!-- Form Distribution & Settings Sidebar (1 Col) -->
        <div class="sidebar-col">
          <div class="card settings-card">
            <h3>Publishing & Access Controls</h3>

            <div class="form-group" style="margin-top: 1rem;">
              <label>Distribution Type</label>
              <select [(ngModel)]="form.distributionType" class="form-control">
                <option value="PUBLIC_LINK">Public Link & QR Code</option>
                <option value="INTERNAL_EMPLOYEE">Internal Employees Only</option>
                <option value="QR_CODE">QR Code Only</option>
              </select>
            </div>

            <div class="form-group flex items-center gap-2">
              <input type="checkbox" [(ngModel)]="form.allowAnonymous" id="anonCheck" />
              <label for="anonCheck" style="margin: 0; cursor: pointer;">Allow Anonymous Submissions</label>
            </div>

            <div class="form-group">
              <label>Response Limit Cap</label>
              <input type="number" [(ngModel)]="form.responseLimit" class="form-control" placeholder="Leave empty for unlimited" />
            </div>

            <div class="form-group">
              <label>Start Date</label>
              <input type="datetime-local" [(ngModel)]="form.startDate" class="form-control" />
            </div>

            <div class="form-group">
              <label>Expiry Date</label>
              <input type="datetime-local" [(ngModel)]="form.expiryDate" class="form-control" />
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .builder-container { max-width: 1300px; margin: 1.5rem auto; padding: 0 1.5rem; }
    .builder-header { padding: 1rem 1.5rem; border-radius: 12px; margin-bottom: 1.5rem; }
    .status-indicator { font-size: 0.8rem; color: #64748b; }
    .builder-content { gap: 1.5rem; }
    .header-card { margin-bottom: 1.25rem; }
    .form-control-lg { font-size: 1.25rem; font-weight: 700; padding: 0.75rem; }
    .sections-list { display: flex; flex-direction: column; gap: 1.25rem; }
    .sec-num { font-size: 0.75rem; font-weight: 700; background: #e0e7ff; color: #4338ca; padding: 0.2rem 0.5rem; border-radius: 4px; }
    .sec-title-input { font-size: 1rem; font-weight: 700; border: none; background: #f8fafc; border-bottom: 2px solid #e2e8f0; border-radius: 0; }
    .questions-list { margin-top: 1rem; display: flex; flex-direction: column; gap: 1rem; }
    .question-item { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 1rem; }
    .q-num { font-weight: 700; color: #4f46e5; font-size: 0.85rem; }
    .required-toggle { font-size: 0.75rem; font-weight: 600; color: #64748b; cursor: pointer; display: flex; align-items: center; gap: 0.25rem; }
    .btn-block { width: 100%; }
    .options-builder { background: #ffffff; padding: 0.75rem; border-radius: 8px; border: 1px solid #cbd5e1; margin-top: 0.75rem; }
    .option-row { margin-bottom: 0.35rem; }
  `]
})
export class FormBuilderComponent implements OnInit {
  private formService = inject(FormService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  formId: number | null = null;
  saving = false;

  form: Form = {
    title: 'Untitled Enterprise Form',
    description: '',
    status: 'DRAFT',
    distributionType: 'PUBLIC_LINK',
    allowAnonymous: false,
    sections: [
      {
        sectionTitle: 'Main Section',
        sectionDescription: '',
        orderIndex: 1,
        questions: [
          {
            questionText: 'Full Name',
            questionType: 'TEXT',
            required: true,
            orderIndex: 1,
            options: []
          }
        ]
      }
    ]
  };

  ngOnInit(): void {
    // Check state passed from rule engine or templates
    const navigationState = history.state;
    if (navigationState && navigationState.generatedForm) {
      this.form = navigationState.generatedForm;
    }

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.formId = +params['id'];
        this.formService.getFormById(this.formId).subscribe(res => {
          this.form = res;
        });
      }
    });
  }

  addSection(): void {
    this.form.sections.push({
      sectionTitle: `Section ${this.form.sections.length + 1}`,
      sectionDescription: '',
      orderIndex: this.form.sections.length + 1,
      questions: []
    });
  }

  removeSection(index: number): void {
    this.form.sections.splice(index, 1);
  }

  addQuestion(section: FormSection): void {
    section.questions.push({
      questionText: 'New Question',
      questionType: 'TEXT',
      required: false,
      orderIndex: section.questions.length + 1,
      options: []
    });
  }

  removeQuestion(section: FormSection, qIdx: number): void {
    section.questions.splice(qIdx, 1);
  }

  addOption(question: Question): void {
    if (!question.options) question.options = [];
    const count = question.options.length + 1;
    question.options.push({
      optionLabel: `Option ${count}`,
      optionValue: `OPTION_${count}`,
      orderIndex: count
    });
  }

  saveForm(status: FormStatus): void {
    if (!this.form.title.trim()) {
      alert('Please enter a Form Title');
      return;
    }

    this.saving = true;
    this.form.status = status;

    if (this.formId) {
      this.formService.updateForm(this.formId, this.form).subscribe({
        next: () => {
          this.saving = false;
          this.router.navigate(['/dashboard']);
        },
        error: () => this.saving = false
      });
    } else {
      this.formService.createForm(this.form).subscribe({
        next: () => {
          this.saving = false;
          this.router.navigate(['/dashboard']);
        },
        error: () => this.saving = false
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
