import { createComponentFactory, Spectator } from '@ngneat/spectator/jest';
import { AuthFormComponent } from './auth-form.component';

describe(AuthFormComponent.name, () => {
  let spectator: Spectator<AuthFormComponent>;

  const createComponent = createComponentFactory({
    component: AuthFormComponent,
    shallow: true,
    detectChanges: false,
  });

  describe('login mode', () => {
    beforeEach(() => {
      spectator = createComponent({ props: { mode: 'login' } });
      spectator.detectChanges();
    });

    it('should create', () => {
      expect(spectator.component).toBeTruthy();
    });

    it('should have email and password controls enabled', () => {
      const form = spectator.component['form'];
      expect(form.get('email')?.enabled).toBe(true);
      expect(form.get('password')?.enabled).toBe(true);
    });

    it('should disable register-only controls', () => {
      const form = spectator.component['form'];
      expect(form.get('name')?.disabled).toBe(true);
      expect(form.get('phone')?.disabled).toBe(true);
      expect(form.get('confirmPassword')?.disabled).toBe(true);
    });

    it('should be invalid when empty', () => {
      expect(spectator.component['form'].invalid).toBe(true);
    });

    it('should emit login data on valid submit', () => {
      const emitSpy = jest.spyOn(spectator.component.formSubmit, 'emit');
      const form = spectator.component['form'];
      form.patchValue({ email: 'test@test.com', password: 'password123' });
      spectator.component['onSubmit']();
      expect(emitSpy).toHaveBeenCalledWith({
        mode: 'login',
        email: 'test@test.com',
        password: 'password123',
      });
    });

    it('should not emit when form is invalid', () => {
      const emitSpy = jest.spyOn(spectator.component.formSubmit, 'emit');
      spectator.component['onSubmit']();
      expect(emitSpy).not.toHaveBeenCalled();
    });
  });

  describe('register mode', () => {
    beforeEach(() => {
      spectator = createComponent({ props: { mode: 'register' } });
      spectator.detectChanges();
    });

    it('should enable all controls', () => {
      const form = spectator.component['form'];
      expect(form.get('name')?.enabled).toBe(true);
      expect(form.get('email')?.enabled).toBe(true);
      expect(form.get('phone')?.enabled).toBe(true);
      expect(form.get('password')?.enabled).toBe(true);
      expect(form.get('confirmPassword')?.enabled).toBe(true);
    });

    it('should detect password mismatch', () => {
      const form = spectator.component['form'];
      form.patchValue({ password: 'password123', confirmPassword: 'different' });
      form.get('confirmPassword')?.markAsTouched();
      expect(spectator.component['hasPasswordMismatch']).toBe(true);
    });
  });

  describe('forgot-password mode', () => {
    beforeEach(() => {
      spectator = createComponent({ props: { mode: 'forgot-password' } });
      spectator.detectChanges();
    });

    it('should only enable email', () => {
      const form = spectator.component['form'];
      expect(form.get('email')?.enabled).toBe(true);
      expect(form.get('password')?.disabled).toBe(true);
    });

    it('should emit forgot-password data on valid submit', () => {
      const emitSpy = jest.spyOn(spectator.component.formSubmit, 'emit');
      spectator.component['form'].patchValue({ email: 'test@test.com' });
      spectator.component['onSubmit']();
      expect(emitSpy).toHaveBeenCalledWith({ mode: 'forgot-password', email: 'test@test.com' });
    });
  });
});
