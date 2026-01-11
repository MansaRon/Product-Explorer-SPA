/* tslint:disable:no-unused-variable */
import { createComponentFactory, Spectator } from '@ngneat/spectator/jest';
import { ErrorMessageComponent } from './error-message.component';

describe(ErrorMessageComponent.name, () => {
  let spectator: Spectator<ErrorMessageComponent>;

  const createComponent = createComponentFactory({
    component: ErrorMessageComponent,
    shallow: true
  });

  beforeEach(() => {
    spectator = createComponent({
      props: {
        message: 'An error occurred',
        showRetry: true
      }
    });
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });

  describe('Error Display', () => {
    it('should display error message', () => {
      expect(spectator.query('.error-message')).toHaveText('An error occurred');
    });

    it('should have role="alert"', () => {
      const container = spectator.query('.error-container');
      expect(container?.getAttribute('role')).toBe('alert');
    });

    it('should have aria-live="assertive"', () => {
      const container = spectator.query('.error-container');
      expect(container?.getAttribute('aria-live')).toBe('assertive');
    });

    it('should display error icon', () => {
      expect(spectator.query('.error-icon')).toExist();
    });
  });

  describe('Retry Button', () => {
    it('should display retry button when showRetry is true', () => {
      spectator.setInput('showRetry', true);
      expect(spectator.query('.retry-button')).toExist();
    });

    it('should not display retry button when showRetry is false', () => {
      spectator.setInput('showRetry', false);
      expect(spectator.query('.retry-button')).not.toExist();
    });

    it('should emit retry event when clicked', () => {
      let retryEmitted = false;
      spectator.output('retry').subscribe(() => retryEmitted = true);
      
      spectator.click('.retry-button');
      
      expect(retryEmitted).toBe(true);
    });

    it('should have correct button text', () => {
      expect(spectator.query('.retry-button')).toHaveText('Try Again');
    });
  });
});