import {
  mapToBackendDeliverMethod,
  mapToBackendPaymentMethod,
  DeliveryOption,
  PaymentMethod,
} from './checkout';

describe('mapToBackendPaymentMethod', () => {
  const make = (id: string, type: 'card' | 'eft' | 'cash'): PaymentMethod => ({
    id,
    type,
    label: '',
  });

  it('maps CREDIT_CARD id to CREDIT_CARD', () => {
    expect(mapToBackendPaymentMethod(make('CREDIT_CARD', 'card'))).toBe('CREDIT_CARD');
  });

  it('maps EFT id to EFT', () => {
    expect(mapToBackendPaymentMethod(make('EFT', 'eft'))).toBe('EFT');
  });

  it('maps CASH_ON_DELIVERY id to CASH_ON_DELIVERY', () => {
    expect(mapToBackendPaymentMethod(make('CASH_ON_DELIVERY', 'cash'))).toBe('CASH_ON_DELIVERY');
  });

  it('falls back to type when id is an unrecognised legacy value', () => {
    expect(mapToBackendPaymentMethod(make('card', 'card'))).toBe('CREDIT_CARD');
    expect(mapToBackendPaymentMethod(make('eft', 'eft'))).toBe('EFT');
    expect(mapToBackendPaymentMethod(make('cash', 'cash'))).toBe('CASH_ON_DELIVERY');
  });

  it('is case-insensitive on id', () => {
    expect(mapToBackendPaymentMethod(make('credit_card', 'card'))).toBe('CREDIT_CARD');
    expect(mapToBackendPaymentMethod(make('eft', 'eft'))).toBe('EFT');
  });

  it('falls back to CREDIT_CARD via type when id is unrecognised but type is "card"', () => {
    expect(mapToBackendPaymentMethod({ id: 'unknown', type: 'card', label: '' })).toBe(
      'CREDIT_CARD'
    );
  });
});

describe('mapToBackendDeliverMethod', () => {
  const make = (id: string): DeliveryOption => ({
    id,
    name: '',
    description: '',
    estimatedDays: '',
    price: 0,
  });

  it('maps STANDARD id to STANDARD', () => {
    expect(mapToBackendDeliverMethod(make('STANDARD'))).toBe('STANDARD');
  });

  it('maps EXPRESS id to EXPRESS', () => {
    expect(mapToBackendDeliverMethod(make('EXPRESS'))).toBe('EXPRESS');
  });

  it('maps OVERNIGHT id to OVERNIGHT', () => {
    expect(mapToBackendDeliverMethod(make('OVERNIGHT'))).toBe('OVERNIGHT');
  });

  it('maps FREE id to FREE', () => {
    expect(mapToBackendDeliverMethod(make('FREE'))).toBe('FREE');
  });

  it('defaults unknown ids to STANDARD', () => {
    expect(mapToBackendDeliverMethod(make('something_else'))).toBe('STANDARD');
  });

  it('is case-insensitive on id', () => {
    expect(mapToBackendDeliverMethod(make('express'))).toBe('EXPRESS');
    expect(mapToBackendDeliverMethod(make('overnight'))).toBe('OVERNIGHT');
  });
});
