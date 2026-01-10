import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-error-message',
  template: `
    <div class="error-container" role="alert" tabindex="-1" aria-labelledby="error-title">
      <div class="error-content">
        <svg 
          class="error-icon" 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor"
          aria-hidden="true"
          focusable="false">
          <circle cx="12" cy="12" r="10" stroke-width="2"/>
          <path d="M12 8v4" stroke-width="2" stroke-linecap="round"/>
          <circle cx="12" cy="16" r="1" fill="currentColor"/>
        </svg>
        
        <div class="error-text">
          <p id="error-title" class="error-message">
            {{ message() }}
          </p>
        </div>
      </div>
      
      @if (showRetry()) {
        <button 
          type="button"
          class="retry-button"
          (click)="retry.emit()">
          Try Again
        </button>
      }
    </div>
  `,
  styles: [`
    .error-container {
      background-color: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: var(--radius-md);
      padding: var(--spacing-md);
      margin: var(--spacing-md) 0;
    }

    .error-content {
      display: flex;
      gap: var(--spacing-md);
      align-items: flex-start;
    }

    .error-icon {
      flex-shrink: 0;
      color: var(--color-danger);
    }

    .error-text {
      flex: 1;
    }

    .error-message {
      color: #991b1b;
      font-weight: 500;
      margin: 0;
    }

    .retry-button {
      margin-top: var(--spacing-md);
      padding: var(--spacing-sm) var(--spacing-md);
      background-color: var(--color-danger);
      color: white;
      border-radius: var(--radius-md);
      font-weight: 500;
      transition: background-color var(--transition-fast);

      &:hover {
        background-color: #dc2626;
      }

      &:focus-visible {
        outline: 2px solid var(--color-danger);
        outline-offset: 2px;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErrorMessageComponent {
  readonly message = input.required<string>();
  readonly showRetry = input(false);
  readonly retry = output<void>();
}
