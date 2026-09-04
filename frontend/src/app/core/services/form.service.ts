import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Form, FormStatus, FormTemplate, RuleGenerationResponse } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class FormService {
  private apiUrl = 'http://localhost:8081/api/forms';
  private templateUrl = 'http://localhost:8081/api/templates';
  private ruleEngineUrl = 'http://localhost:8081/api/rule-engine';

  constructor(private http: HttpClient) {}

  getUserForms(): Observable<Form[]> {
    return this.http.get<Form[]>(this.apiUrl);
  }

  getFormById(id: number): Observable<Form> {
    return this.http.get<Form>(`${this.apiUrl}/${id}`);
  }

  getFormByShareToken(token: string): Observable<Form> {
    return this.http.get<Form>(`${this.apiUrl}/share/${token}`);
  }

  createForm(form: Form): Observable<Form> {
    return this.http.post<Form>(this.apiUrl, form);
  }

  updateForm(id: number, form: Form): Observable<Form> {
    return this.http.put<Form>(`${this.apiUrl}/${id}`, form);
  }

  updateStatus(id: number, status: FormStatus): Observable<Form> {
    return this.http.patch<Form>(`${this.apiUrl}/${id}/status?status=${status}`, {});
  }

  cloneForm(id: number): Observable<Form> {
    return this.http.post<Form>(`${this.apiUrl}/${id}/clone`, {});
  }

  deleteForm(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getQrCode(id: number): Observable<string> {
    return this.http.get(`${this.apiUrl}/${id}/qr-code`, { responseType: 'text' });
  }

  generateRuleForm(prompt: string): Observable<RuleGenerationResponse> {
    return this.http.post<RuleGenerationResponse>(`${this.ruleEngineUrl}/generate`, { prompt });
  }

  getTemplates(): Observable<FormTemplate[]> {
    return this.http.get<FormTemplate[]>(this.templateUrl);
  }
}
