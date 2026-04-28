/* tslint:disable:no-unused-variable */
import { FooterComponent } from './footer.component';
import { createComponentFactory, Spectator } from '@ngneat/spectator/jest';

describe.skip('FooterComponent', () => {
  let spectator: Spectator<FooterComponent>;
  
  const createComponent = createComponentFactory({
    component: FooterComponent,
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
