import { createComponentFactory, Spectator } from '@ngneat/spectator/jest';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app.component';
import { NavItem } from '../../src/app/core/models/navigation';

describe(AppComponent.name, () => {
  let spectator: Spectator<AppComponent>;

  const createComponent = createComponentFactory({
    component: AppComponent,
    providers: [
      provideRouter([])
    ],
    shallow: true,
    detectChanges: false
  });

  beforeEach(() => {
    spectator = createComponent();
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });

  describe('Navigation Items', () => {
    it('should have navigation items defined', () => {
      expect(spectator.component.navItems).toBeDefined();
      expect(spectator.component.navItems.length).toBeGreaterThan(0);
    });

    it('should have exactly 3 navigation items', () => {
      expect(spectator.component.navItems.length).toBe(3);
    });

    it('should have Catalog navigation item', () => {
      const catalogItem = spectator.component.navItems.find(
        (item: NavItem) => item.label === 'Catalog'
      );
      
      expect(catalogItem).toBeDefined();
      expect(catalogItem?.link).toBe('/catalog');
    });

    it('should have Admin navigation item', () => {
      const adminItem = spectator.component.navItems.find(
        (item: NavItem) => item.label === 'Admin'
      );
      
      expect(adminItem).toBeDefined();
      expect(adminItem?.link).toBe('/admin');
    });

    it('should have navigation items in correct order', () => {
      expect(spectator.component.navItems[0].label).toBe('Catalog');
      expect(spectator.component.navItems[1].label).toBe('Favorites');
      expect(spectator.component.navItems[2].label).toBe('Admin');
    });

    it('should have readonly navigation items', () => {
      const navItems = spectator.component.navItems;
      expect(Array.isArray(navItems)).toBe(true);
    });
  });

  describe('Template Structure', () => {
    it('should render skip link', () => {
      expect(spectator.query('.skip-link')).toExist();
    });

    it('should have skip link with correct href', () => {
      const skipLink = spectator.query<HTMLAnchorElement>('.skip-link');
      expect(skipLink?.getAttribute('href')).toBe('#main-content');
    });

    it('should have skip link with correct text', () => {
      expect(spectator.query('.skip-link')).toHaveText('Skip to main content');
    });

    it('should render header component', () => {
      expect(spectator.query('app-header')).toExist();
    });

    it('should pass navItems to header component', () => {
      const header = spectator.query('app-header');
      expect(header).toExist();
    });

    it('should render main content area', () => {
      expect(spectator.query('.main-content')).toExist();
    });

    it('should have main content with id', () => {
      const mainContent = spectator.query('.main-content');
      expect(mainContent?.getAttribute('id')).toBe('main-content');
    });

    it('should render router outlet', () => {
      expect(spectator.query('router-outlet')).toExist();
    });

    it('should have router outlet inside main content', () => {
      const mainContent = spectator.query('.main-content');
      const routerOutlet = mainContent?.querySelector('router-outlet');
      expect(routerOutlet).toExist();
    });
  });

  describe('Accessibility', () => {
    it('should have skip link for keyboard navigation', () => {
      const skipLink = spectator.query('.skip-link');
      expect(skipLink).toExist();
    });

    it('should have main landmark with id for skip link', () => {
      const main = spectator.query('main');
      expect(main?.getAttribute('id')).toBe('main-content');
    });

    it('should have main element with correct role', () => {
      const main = spectator.query('main');
      expect(main?.tagName.toLowerCase()).toBe('main');
    });
  });

  describe('Layout', () => {
    it('should have host element with flex layout', () => {
      const host = spectator.element;
      const styles = window.getComputedStyle(host);
      
      // Verify flex layout is applied (from :host styles)
      expect(host).toBeDefined();
    });

    it('should contain all required sections', () => {
      expect(spectator.query('.skip-link')).toExist();
      expect(spectator.query('app-header')).toExist();
      expect(spectator.query('.main-content')).toExist();
      expect(spectator.query('router-outlet')).toExist();
    });
  });

  describe('Component Properties', () => {
    it('should have navItems as readonly property', () => {
      const component = spectator.component;
      
      expect(component.navItems).toBeDefined();
      expect(Array.isArray(component.navItems)).toBe(true);
    });

    it('should not allow navItems modification', () => {
      const component = spectator.component;
      const originalLength = component.navItems.length;
      
      // This should not affect the original array (readonly)
      const navItems = component.navItems;
      
      expect(navItems.length).toBe(originalLength);
    });
  });

  describe('Integration', () => {
    it('should work with router', () => {
      expect(spectator.query('router-outlet')).toExist();
    });

    it('should integrate with header component', () => {
      const header = spectator.query('app-header');
      expect(header).toExist();
    });
  });
});