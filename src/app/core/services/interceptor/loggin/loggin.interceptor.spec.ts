import { TestBed } from '@angular/core/testing';

import { loggingInterceptor } from './loggin.interceptor';

describe.skip('LogginInterceptorService', () => {
  let service: typeof loggingInterceptor;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(loggingInterceptor);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
