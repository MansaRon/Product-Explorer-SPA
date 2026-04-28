import { TestBed } from '@angular/core/testing';

import { HeadersInterceptor } from './headers.interceptor';

describe.skip('HeadersInterceptorService', () => {
  let service: HeadersInterceptor;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HeadersInterceptor);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
