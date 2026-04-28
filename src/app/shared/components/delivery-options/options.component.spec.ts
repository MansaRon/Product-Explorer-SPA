/* tslint:disable:no-unused-variable */
import { OptionsComponent } from './options.component';
import { createComponentFactory, Spectator } from '@ngneat/spectator/jest';

describe.skip('OptionsComponent', () => {
  let spectator: Spectator<OptionsComponent>;
  
  const createComponent = createComponentFactory({
    component: OptionsComponent,
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
