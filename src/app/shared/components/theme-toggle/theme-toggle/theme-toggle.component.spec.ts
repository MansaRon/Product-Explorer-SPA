/* tslint:disable:no-unused-variable */
import { ThemeToggleComponent } from './theme-toggle.component';
import { createComponentFactory, Spectator } from '@ngneat/spectator/jest';

describe('ThemeToggleComponent', () => {
  let spectator: Spectator<ThemeToggleComponent>;
  
  const createComponent = createComponentFactory({
    component: ThemeToggleComponent,
    shallow: true,
    detectChanges: false
  });

  beforeEach(() => {
    spectator = createComponent();
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });
});
