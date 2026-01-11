/* tslint:disable:no-unused-variable */
import { createComponentFactory, Spectator } from '@ngneat/spectator/jest';
import { EmptyStateComponent } from './empty-state.component';

describe(EmptyStateComponent.name, () => {
  let spectator: Spectator<EmptyStateComponent>;

  const createComponent = createComponentFactory({
    component: EmptyStateComponent,
    shallow: true
  });

  beforeEach(() => {
    spectator = createComponent({
      props: {
        title: 'No items found',
        description: 'Try adjusting your filters',
        icon: 'search'
      }
    });
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });

  describe('Content Display', () => {
    it('should display title', () => {
      expect(spectator.query('.empty-title')).toHaveText('No items found');
    });

    it('should display description when provided', () => {
      expect(spectator.query('.empty-description')).toHaveText('Try adjusting your filters');
    });

    it('should not display description when empty', () => {
      spectator.setInput('description', '');
      expect(spectator.query('.empty-description')).not.toExist();
    });
  });

  describe('Icon Display', () => {
    it('should display search icon', () => {
      spectator.setInput('icon', 'search');
      const svg = spectator.query('.empty-icon');
      expect(svg).toExist();
    });

    it('should display heart icon', () => {
      spectator.setInput('icon', 'heart');
      const svg = spectator.query('.empty-icon');
      expect(svg).toExist();
    });

    it('should display box icon', () => {
      spectator.setInput('icon', 'box');
      const svg = spectator.query('.empty-icon');
      expect(svg).toExist();
    });

    it('should display info icon by default', () => {
      spectator.setInput('icon', 'info');
      const svg = spectator.query('.empty-icon');
      expect(svg).toExist();
    });
  });
});