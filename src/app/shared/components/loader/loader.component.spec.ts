/* tslint:disable:no-unused-variable */
import { createComponentFactory, Spectator } from '@ngneat/spectator/jest';
import { LoaderComponent } from './loader.component';

describe(LoaderComponent.name, () => {
  let spectator: Spectator<LoaderComponent>;

  const createComponent = createComponentFactory({
    component: LoaderComponent,
    shallow: true
  });

  beforeEach(() => {
    spectator = createComponent({
      props: {
        label: 'Loading data'
      }
    });
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });

  describe('Accessibility', () => {
    it('should have role="status"', () => {
      const spinner = spectator.query('.spinner');
      expect(spinner?.getAttribute('role')).toBe('status');
    });

    it('should have aria-label on container', () => {
      const container = spectator.query('.spinner-container');
      expect(container?.getAttribute('aria-label')).toBe('Loading data');
    });

    it('should have visually hidden text for screen readers', () => {
      expect(spectator.query('.visually-hidden')).toHaveText('Loading data');
    });

    it('should use default label when not provided', () => {
      const component = createComponent();
      expect(component.query('.visually-hidden')).toHaveText('Loading');
    });
  });

  describe('Visual Elements', () => {
    it('should display spinner', () => {
      expect(spectator.query('.spinner')).toExist();
    });

    it('should be inside spinner container', () => {
      expect(spectator.query('.spinner-container')).toExist();
      expect(spectator.query('.spinner-container .spinner')).toExist();
    });
  });
});