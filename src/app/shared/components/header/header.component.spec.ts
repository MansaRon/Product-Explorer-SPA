/* tslint:disable:no-unused-variable */
import { createComponentFactory, Spectator } from '@ngneat/spectator/jest';
import { HeaderComponent } from './header.component';

describe.skip('HeaderComponent', () => {
  let spectator: Spectator<HeaderComponent>;
  
  const createComponent = createComponentFactory({
    component: HeaderComponent,
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
