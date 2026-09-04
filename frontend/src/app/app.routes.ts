import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { FormBuilderComponent } from './features/form-builder/form-builder.component';
import { TemplateRepositoryComponent } from './features/template-repository/template-repository.component';
import { AnalyticsDashboardComponent } from './features/analytics/analytics-dashboard.component';
import { FormViewerComponent } from './features/form-viewer/form-viewer.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'builder', component: FormBuilderComponent, canActivate: [authGuard] },
  { path: 'builder/:id', component: FormBuilderComponent, canActivate: [authGuard] },
  { path: 'templates', component: TemplateRepositoryComponent, canActivate: [authGuard] },
  { path: 'analytics/:id', component: AnalyticsDashboardComponent, canActivate: [authGuard] },
  { path: 'forms/public/:token', component: FormViewerComponent },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'dashboard' }
];
