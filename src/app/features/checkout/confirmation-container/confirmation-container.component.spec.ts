/* tslint:disable:no-unused-variable */
import { Router } from '@angular/router';
import { Spectator, createComponentFactory, mockProvider } from '@ngneat/spectator';
import { ConfirmationContainerComponent } from './confirmation-container.component';

describe.skip('OrderConfirmationComponent', () => {
  let spectator: Spectator<ConfirmationContainerComponent>;
  
  const createComponent = createComponentFactory({
    component: ConfirmationContainerComponent,
    shallow: true,
    detectChanges: false,
    providers: [
      mockProvider(Router, {
        navigate: jest.fn().mockResolvedValue(true)
      }),
    ]
  });

  beforeEach(() => {
    spectator = createComponent();
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });
});
