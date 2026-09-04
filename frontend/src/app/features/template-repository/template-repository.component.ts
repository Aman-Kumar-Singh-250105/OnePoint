import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormService } from '../../core/services/form.service';
import { FormTemplate } from '../../core/models/models';

@Component({
  selector: 'app-template-repository',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="templates-container">
      <div class="header flex justify-between items-center">
        <div>
          <h1>Corporate Template Repository</h1>
          <p class="subtitle">Pre-configured, standardized enterprise forms ready for deployment</p>
        </div>
      </div>

      <div class="grid grid-cols-3 templates-grid">
        <div class="template-card card" *ngFor="let t of templates">
          <div class="category-badge">{{ t.category }}</div>
          <h3 class="template-title">{{ t.title }}</h3>
          <p class="template-desc">{{ t.description }}</p>

          <div class="template-footer flex justify-between items-center">
            <span class="schema-info">Standard Schema</span>
            <button (click)="useTemplate(t)" class="btn btn-primary btn-sm">Use Template</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .templates-container { max-width: 1200px; margin: 2rem auto; padding: 0 1.5rem; }
    .templates-grid { margin-top: 1.5rem; }
    .template-card { display: flex; flex-direction: column; justify-content: space-between; min-height: 180px; }
    .category-badge { font-size: 0.7rem; font-weight: 700; background: #e0e7ff; color: #4338ca; padding: 0.2rem 0.5rem; border-radius: 4px; display: inline-block; width: fit-content; margin-bottom: 0.5rem; }
    .template-title { font-size: 1.1rem; color: #0f172a; margin-bottom: 0.5rem; }
    .template-desc { font-size: 0.85rem; color: #64748b; line-height: 1.4; margin-bottom: 1.25rem; }
    .schema-info { font-size: 0.75rem; font-weight: 600; color: #94a3b8; }
  `]
})
export class TemplateRepositoryComponent implements OnInit {
  private formService = inject(FormService);
  private router = inject(Router);

  templates: FormTemplate[] = [];

  ngOnInit(): void {
    this.formService.getTemplates().subscribe(res => {
      this.templates = res;
    });
  }

  useTemplate(t: FormTemplate): void {
    try {
      const formSchema = JSON.parse(t.templateJson);
      this.router.navigate(['/builder'], { state: { generatedForm: formSchema } });
    } catch (e) {
      console.error('Failed to parse template JSON', e);
    }
  }
}
