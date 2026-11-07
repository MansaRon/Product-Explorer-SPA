/**
 * Lookup values seed script
 *
 * Usage:
 *   mongosh <connection-string>/<database-name> scripts/seed-lookup-values.js
 *
 * Example:
 *   mongosh mongodb://localhost:27017/product-explorer-db scripts/seed-lookup-values.js
 *
 * This script is idempotent — it replaces existing lookup values on each run.
 */

db.lookup_values.deleteMany({});

// ─── PROVINCES ────────────────────────────────────────────────────────────────

db.lookup_values.insertMany([
  { type: 'PROVINCE', code: 'Eastern Cape',  label: 'Eastern Cape',  active: true, sortOrder: 1 },
  { type: 'PROVINCE', code: 'Free State',    label: 'Free State',    active: true, sortOrder: 2 },
  { type: 'PROVINCE', code: 'Gauteng',       label: 'Gauteng',       active: true, sortOrder: 3 },
  { type: 'PROVINCE', code: 'KwaZulu-Natal', label: 'KwaZulu-Natal', active: true, sortOrder: 4 },
  { type: 'PROVINCE', code: 'Limpopo',       label: 'Limpopo',       active: true, sortOrder: 5 },
  { type: 'PROVINCE', code: 'Mpumalanga',    label: 'Mpumalanga',    active: true, sortOrder: 6 },
  { type: 'PROVINCE', code: 'Northern Cape', label: 'Northern Cape', active: true, sortOrder: 7 },
  { type: 'PROVINCE', code: 'North West',    label: 'North West',    active: true, sortOrder: 8 },
  { type: 'PROVINCE', code: 'Western Cape',  label: 'Western Cape',  active: true, sortOrder: 9 },
]);

// ─── DELIVERY OPTIONS ─────────────────────────────────────────────────────────
// code matches the backend DeliverMethod enum value exactly

db.lookup_values.insertMany([
  {
    type: 'DELIVERY_OPTION',
    code: 'STANDARD',
    label: 'Standard Delivery',
    metadata: {
      description: 'Delivered within 5-7 business days',
      estimatedDays: '5-7 days',
      price: 0,
    },
    active: true,
    sortOrder: 1,
  },
  {
    type: 'DELIVERY_OPTION',
    code: 'EXPRESS',
    label: 'Express Delivery',
    metadata: {
      description: 'Delivered within 2-3 business days',
      estimatedDays: '2-3 days',
      price: 50,
    },
    active: true,
    sortOrder: 2,
  },
  {
    type: 'DELIVERY_OPTION',
    code: 'OVERNIGHT',
    label: 'Overnight Delivery',
    metadata: {
      description: 'Delivered next business day',
      estimatedDays: 'Next day',
      price: 150,
    },
    active: true,
    sortOrder: 3,
  },
]);

// ─── PAYMENT METHODS ──────────────────────────────────────────────────────────
// code matches the backend PaymentMethod enum value exactly
// iconType is used by the frontend to select the correct icon component

db.lookup_values.insertMany([
  {
    type: 'PAYMENT_METHOD',
    code: 'CREDIT_CARD',
    label: 'Credit/Debit Card',
    metadata: { iconType: 'card' },
    active: true,
    sortOrder: 1,
  },
  {
    type: 'PAYMENT_METHOD',
    code: 'EFT',
    label: 'EFT/Bank Transfer',
    metadata: { iconType: 'eft' },
    active: true,
    sortOrder: 2,
  },
  {
    type: 'PAYMENT_METHOD',
    code: 'CASH_ON_DELIVERY',
    label: 'Cash on Delivery',
    metadata: { iconType: 'cash' },
    active: true,
    sortOrder: 3,
  },
]);

print('\nLookup values seeded successfully.');
print('  Provinces:        ' + db.lookup_values.countDocuments({ type: 'PROVINCE' }));
print('  Delivery options: ' + db.lookup_values.countDocuments({ type: 'DELIVERY_OPTION' }));
print('  Payment methods:  ' + db.lookup_values.countDocuments({ type: 'PAYMENT_METHOD' }));
