export const environment = {
  production: false,
  /**
   * Base URL prepended to all relative HTTP requests by the baseUrlInterceptor.
   * Point this at your local or staging backend.
   */
  apiBaseUrl: 'http://localhost:8080/api/v1',
 
  /**
   * When true, the mockBackendInterceptor intercepts requests and returns
   * fake data instead of hitting the real backend.
   * Set to false when you want to test against a live API locally.
   */
  useMockBackend: true,
 
  /**
   * Application name — useful for logging and display.
   */
  appName: 'MyApp (Dev)',
};