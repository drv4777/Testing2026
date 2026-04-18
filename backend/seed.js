require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dbConfig = require('./config/db');

const User = require('./models/user');
const Merchant = require('./models/merchant');
const Transaction = require('./models/transaction');
const FraudAlert = require('./models/fraudAlert');
const AuditLog = require('./models/auditLog');
const TestCard = require('./models/testCard');

async function seed() {
  if (!dbConfig.mongoURI) {
    throw new Error('MONGO_URI is not set');
  }

  await mongoose.connect(dbConfig.mongoURI);

  await Promise.all([
    AuditLog.deleteMany({}),
    FraudAlert.deleteMany({}),
    Transaction.deleteMany({}),
    Merchant.deleteMany({}),
    TestCard.deleteMany({}),
    User.deleteMany({}),
  ]);

  const passwordHash = await bcrypt.hash('Password123!', 10);

  const [adminUser, merchantUser, customerUser] = await User.create([
    {
      username: 'admin',
      password: passwordHash,
      email: 'admin@example.com',
      role: 'admin',
      status: 'active',
      twoFactorEnabled: true,
    },
    {
      username: 'merchant_owner',
      password: passwordHash,
      email: 'merchant@example.com',
      role: 'merchant',
      status: 'active',
    },
    {
      username: 'customer1',
      password: passwordHash,
      email: 'customer@example.com',
      role: 'customer',
      status: 'active',
    },
  ]);

  const [merchantOne, merchantTwo] = await Merchant.create([
    {
      name: 'Northwind Books',
      apiKey: 'northwind-books-api-key',
      ownerUserId: merchantUser._id,
      status: 'active',
      webhookUrl: 'https://example.com/webhooks/northwind',
      settings: {
        currency: 'USD',
        captureMode: 'automatic',
      },
    },
    {
      name: 'Apex Supplies',
      apiKey: 'apex-supplies-api-key',
      ownerUserId: merchantUser._id,
      status: 'active',
      webhookUrl: 'https://example.com/webhooks/apex',
      settings: {
        currency: 'USD',
        captureMode: 'manual',
      },
    },
  ]);

  const [transactionOne, transactionTwo, transactionThree] = await Transaction.create([
    {
      userId: customerUser._id,
      merchantId: merchantOne._id,
      amount: 49.99,
      currency: 'USD',
      paymentMethod: 'card',
      status: 'completed',
      gatewayReference: 'gw-ref-1001',
      processedAt: new Date(),
    },
    {
      userId: customerUser._id,
      merchantId: merchantTwo._id,
      amount: 129.5,
      currency: 'USD',
      paymentMethod: 'card',
      status: 'pending',
      gatewayReference: 'gw-ref-1002',
    },
    {
      userId: customerUser._id,
      merchantId: merchantOne._id,
      amount: 240,
      currency: 'USD',
      paymentMethod: 'bank_transfer',
      status: 'failed',
      gatewayReference: 'gw-ref-1003',
      failureReason: 'Insufficient funds',
    },
  ]);

  await FraudAlert.create({
    transactionId: transactionThree._id,
    userId: customerUser._id,
    merchantId: merchantOne._id,
    reason: 'High-value transfer with failed authorization',
    severity: 'high',
    status: 'open',
  });

  await TestCard.create([
    {
      token: 'card_tok_success_001',
      label: 'Customer Visa Success',
      brand: 'visa',
      cardNumber: '4242424242424242',
      last4: '4242',
      expMonth: 12,
      expYear: 2030,
      cvv: '123',
      balance: 1000,
      currency: 'USD',
      status: 'active',
      holderName: 'Test Customer',
    },
    {
      token: 'card_tok_low_balance_002',
      label: 'Customer Mastercard Low Balance',
      brand: 'mastercard',
      cardNumber: '5555555555554444',
      last4: '4444',
      expMonth: 11,
      expYear: 2030,
      cvv: '456',
      balance: 15,
      currency: 'USD',
      status: 'active',
      holderName: 'Test Customer',
    },
    {
      token: 'card_tok_blocked_003',
      label: 'Blocked Test Card',
      brand: 'visa',
      cardNumber: '4000000000000002',
      last4: '4000',
      expMonth: 10,
      expYear: 2030,
      cvv: '321',
      balance: 500,
      currency: 'USD',
      status: 'blocked',
      holderName: 'Test Customer',
    },
    {
      token: 'card_tok_expired_004',
      label: 'Expired Test Card',
      brand: 'amex',
      cardNumber: '378282246310005',
      last4: '3782',
      expMonth: 1,
      expYear: 2020,
      cvv: '1234',
      balance: 500,
      currency: 'USD',
      status: 'expired',
      holderName: 'Test Customer',
    },
  ]);

  await AuditLog.create([
    {
      actorUserId: adminUser._id,
      action: 'seed.users_created',
      entityType: 'User',
      entityId: adminUser._id.toString(),
      details: { username: adminUser.username },
    },
    {
      actorUserId: adminUser._id,
      action: 'seed.merchants_created',
      entityType: 'Merchant',
      entityId: merchantOne._id.toString(),
      details: { merchantIds: [merchantOne._id.toString(), merchantTwo._id.toString()] },
    },
    {
      actorUserId: adminUser._id,
      action: 'seed.transactions_created',
      entityType: 'Transaction',
      entityId: transactionOne._id.toString(),
      details: { transactionCount: 3 },
    },
    {
      actorUserId: adminUser._id,
      action: 'seed.test_cards_created',
      entityType: 'TestCard',
      entityId: 'seed',
      details: {
        cards: [
          'card_tok_success_001',
          'card_tok_low_balance_002',
          'card_tok_blocked_003',
          'card_tok_expired_004',
        ],
      },
    },
  ]);

  console.log('Database seeded successfully');
}

seed()
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });