/* tslint:disable:no-unused-variable */
import { Router } from '@angular/router';
import { PageNotFoundComponent } from './page-not-found.component';
import { createComponentFactory, mockProvider, Spectator } from '@ngneat/spectator/jest';

describe.skip('PageNotFoundComponent', () => {
  let spectator: Spectator<PageNotFoundComponent>;
  
  const createComponent = createComponentFactory({
    component: PageNotFoundComponent,
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
