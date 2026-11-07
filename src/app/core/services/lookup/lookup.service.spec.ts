import { createServiceFactory, SpectatorService } from '@ngneat/spectator/jest';
import { HttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { LookupService } from './lookup.service';
import { LookupApiResponse, LookupValue } from '../../models/lookup';

const makeValue = (overrides: Partial<LookupValue>): LookupValue => ({
  id: 'id-1',
  type: 'PROVINCE',
  code: 'Gauteng',
  label: 'Gauteng',
  sortOrder: 1,
  active: true,
  ...overrides,
});

const provincesResponse: LookupApiResponse = {
  data: [
    makeValue({ id: 'id-1', code: 'Gauteng', label: 'Gauteng', sortOrder: 1 }),
    makeValue({ id: 'id-2', code: 'Western Cape', label: 'Western Cape', sortOrder: 2 }),
  ],
  message: 'OK',
  status: 'OK',
  statusCode: 200,
};

const deliveryResponse: LookupApiResponse = {
  data: [
    makeValue({
      id: 'id-3',
      type: 'DELIVERY_OPTION',
      code: 'STANDARD',
      label: 'Standard Delivery',
      metadata: { description: '5-7 business days', estimatedDays: '5-7 days', price: 0 },
    }),
    makeValue({
      id: 'id-4',
      type: 'DELIVERY_OPTION',
      code: 'EXPRESS',
      label: 'Express Delivery',
      metadata: { description: '2-3 business days', estimatedDays: '2-3 days', price: 50 },
    }),
  ],
  message: 'OK',
  status: 'OK',
  statusCode: 200,
};

const paymentResponse: LookupApiResponse = {
  data: [
    makeValue({
      id: 'id-5',
      type: 'PAYMENT_METHOD',
      code: 'CREDIT_CARD',
      label: 'Credit/Debit Card',
      metadata: { iconType: 'card' },
    }),
    makeValue({
      id: 'id-6',
      type: 'PAYMENT_METHOD',
      code: 'EFT',
      label: 'EFT/Bank Transfer',
      metadata: { iconType: 'eft' },
    }),
  ],
  message: 'OK',
  status: 'OK',
  statusCode: 200,
};

// Shared mock fn — configured in beforeEach BEFORE createService() so the constructor sees the right data
const mockGet = jest.fn();

const createService = createServiceFactory({
  service: LookupService,
  providers: [{ provide: HttpClient, useValue: { get: mockGet } }],
});

describe(LookupService.name, () => {
  let spectator: SpectatorService<LookupService>;
  let service: LookupService;

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  describe('fallback defaults (API unavailable)', () => {
    beforeEach(() => {
      mockGet.mockReturnValue(throwError(() => ({ status: 404 })));
      spectator = createService();
      service = spectator.service;
    });

    it('should pre-populate provinces with SA fallback data', () => {
      expect(service.provinces().length).toBe(9);
      expect(service.provinces()).toContain('Gauteng');
    });

    it('should pre-populate delivery options with fallback data', () => {
      expect(service.deliveryOptions().length).toBe(3);
      expect(service.deliveryOptions()[0].id).toBe('STANDARD');
    });

    it('should pre-populate payment methods with fallback data', () => {
      expect(service.paymentMethods().length).toBe(3);
      expect(service.paymentMethods()[0].id).toBe('CREDIT_CARD');
    });
  });

  describe('live API responses', () => {
    beforeEach(() => {
      mockGet.mockImplementation((url: string) => {
        if (url.includes('PROVINCE')) return of(provincesResponse);
        if (url.includes('DELIVERY_OPTION')) return of(deliveryResponse);
        if (url.includes('PAYMENT_METHOD')) return of(paymentResponse);
        return throwError(() => ({ status: 404 }));
      });
      spectator = createService();
      service = spectator.service;
    });

    it('should call GET /lookup/PROVINCE, DELIVERY_OPTION, and PAYMENT_METHOD', () => {
      expect(mockGet).toHaveBeenCalledWith(
        expect.stringContaining('/lookup/PROVINCE'),
        expect.any(Object)
      );
      expect(mockGet).toHaveBeenCalledWith(
        expect.stringContaining('/lookup/DELIVERY_OPTION'),
        expect.any(Object)
      );
      expect(mockGet).toHaveBeenCalledWith(
        expect.stringContaining('/lookup/PAYMENT_METHOD'),
        expect.any(Object)
      );
    });

    it('should map PROVINCE responses to plain string labels', () => {
      expect(service.provinces()).toContain('Gauteng');
      expect(service.provinces()).toContain('Western Cape');
    });

    it('should map DELIVERY_OPTION response to DeliveryOption shape', () => {
      const standard = service.deliveryOptions().find((o) => o.id === 'STANDARD');

      expect(standard).toBeDefined();
      expect(standard?.name).toBe('Standard Delivery');
      expect(standard?.price).toBe(0);
      expect(standard?.estimatedDays).toBe('5-7 days');
    });

    it('should use metadata.price for delivery option pricing', () => {
      const express = service.deliveryOptions().find((o) => o.id === 'EXPRESS');

      expect(express?.price).toBe(50);
    });

    it('should map PAYMENT_METHOD response to PaymentMethod shape', () => {
      const eft = service.paymentMethods().find((m) => m.id === 'EFT');

      expect(eft).toBeDefined();
      expect(eft?.type).toBe('eft');
      expect(eft?.label).toBe('EFT/Bank Transfer');
    });

    it('should not overwrite the signal when the API returns an empty list', () => {
      mockGet.mockReturnValue(of({ data: [], message: 'OK', status: 'OK', statusCode: 200 }));

      spectator = createService();
      service = spectator.service;

      expect(service.provinces().length).toBeGreaterThan(0);
    });

    it('should default delivery price to 0 when metadata is absent', () => {
      mockGet.mockImplementation((url: string) => {
        if (url.includes('DELIVERY_OPTION')) {
          return of({
            data: [
              makeValue({
                id: 'x',
                type: 'DELIVERY_OPTION',
                code: 'FREE',
                label: 'Free',
                metadata: undefined,
              }),
            ],
            message: 'OK',
            status: 'OK',
            statusCode: 200,
          });
        }
        return throwError(() => ({ status: 404 }));
      });

      spectator = createService();
      service = spectator.service;

      expect(service.deliveryOptions()[0].price).toBe(0);
    });
  });
});
