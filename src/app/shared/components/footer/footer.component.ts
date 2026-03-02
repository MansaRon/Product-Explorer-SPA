import { ChangeDetectionStrategy, Component, input, OnInit, output } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FooterComponent {
  backLabel = input<string>('Back');
  showBackButton = input<boolean>(true);
  backDisabled = input<boolean>(false);

  forwardLabel = input<string>('Continue');
  forwardDisabled = input<boolean>(false);
  isSubmitting = input<boolean>(false);

  backClick = output<void>();
  forwardClick = output<void>();

  protected handleBackClick(): void {
    if (!this.backDisabled()) {
      this.backClick.emit();
    }
  }

  protected handleForwardClick(): void {
    if (!this.forwardDisabled() && !this.isSubmitting()) {
      this.forwardClick.emit();
    }
  }
}
