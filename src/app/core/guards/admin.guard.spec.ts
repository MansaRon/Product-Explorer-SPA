import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { adminGuard } from './admin.guard';
import { AuthService } from '../services/auth/auth.service';

describe('adminGuard', () => {
  let mockRouter: jest.Mocked<Router>;
  let mockAuthService: jest.Mocked<AuthService>;

  beforeEach(() => {
    mockRouter = {
      createUrlTree: jest.fn()
    } as any;

    mockAuthService = {
      isAdmin: jest.fn()
    } as any;

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: AuthService, useValue: mockAuthService }
      ]
    });

    sessionStorage.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('should redirect to catalog when user is not admin', () => {
    sessionStorage.setItem('isAdmin', 'false');
    const mockUrlTree = { toString: () => '/catalog' } as any;
    mockRouter.createUrlTree.mockReturnValue(mockUrlTree);
    
    const result = TestBed.runInInjectionContext(() => 
      adminGuard({} as any, {} as any)
    );

    expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/catalog']);
    expect(result).toBe(mockUrlTree);
  });

  it('should redirect to catalog when isAdmin is not set', () => {
    sessionStorage.removeItem('isAdmin');
    const mockUrlTree = { toString: () => '/catalog' } as any;
    mockRouter.createUrlTree.mockReturnValue(mockUrlTree);
    
    const result = TestBed.runInInjectionContext(() => 
      adminGuard({} as any, {} as any)
    );

    expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/catalog']);
    expect(result).toBe(mockUrlTree);
  });
});