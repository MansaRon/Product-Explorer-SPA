/* tslint:disable:no-unused-variable */
import { createComponentFactory, mockProvider, Spectator } from '@ngneat/spectator/jest';
import { ReviewComponent } from './review.component';
import { Router } from '@angular/router';

describe.skip('ReviewComponent', () => {
  let spectator: Spectator<ReviewComponent>;
  
  const createComponent = createComponentFactory({
    component: ReviewComponent,
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
