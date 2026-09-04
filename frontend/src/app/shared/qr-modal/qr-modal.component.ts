import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-qr-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-backdrop" (click)="close.emit()">
      <div class="modal-content" (click)="$event.stopPropagation()" style="max-width: 420px;">
        <div class="modal-header">
          <h3>Form Distribution & QR Code</h3>
          <button (click)="close.emit()" class="close-btn">&times;</button>
        </div>
        <div class="modal-body" style="text-align: center;">
          <p class="share-desc">Scan QR code or copy public URL link to collect responses.</p>

          <div class="qr-container" *ngIf="qrCodeBase64">
            <img [src]="qrCodeBase64" alt="Form QR Code" class="qr-img" />
          </div>

          <div class="url-box">
            <input type="text" readonly [value]="publicUrl" class="form-control" #urlInput />
            <button (click)="copyUrl(urlInput)" class="btn btn-primary btn-sm">
              {{ copied ? 'Copied!' : 'Copy' }}
            </button>
          </div>
        </div>
        <div class="modal-footer">
          <button (click)="close.emit()" class="btn btn-secondary">Close</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #64748b; }
    .share-desc { font-size: 0.875rem; color: #64748b; margin-bottom: 1rem; }
    .qr-container { background: #ffffff; padding: 1rem; border-radius: 12px; border: 1px solid #e2e8f0; display: inline-block; margin-bottom: 1.25rem; }
    .qr-img { width: 220px; height: 220px; border-radius: 8px; }
    .url-box { display: flex; gap: 0.5rem; }
  `]
})
export class QrModalComponent {
  @Input() qrCodeBase64: string = '';
  @Input() shareToken: string = '';
  @Output() close = new EventEmitter<void>();

  copied = false;

  get publicUrl(): string {
    return `${window.location.origin}/forms/public/${this.shareToken}`;
  }

  copyUrl(input: HTMLInputElement): void {
    input.select();
    navigator.clipboard.writeText(this.publicUrl);
    this.copied = true;
    setTimeout(() => this.copied = false, 2000);
  }
}
