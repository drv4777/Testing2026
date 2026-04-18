require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dbConfig = require('./config/db');

const User = require('./models/user');
const Merchant = require('./models/merchant');
const Transaction = require('./models/transaction');
const FraudAlert = require('./models/fraudAlert');
const AuditLog = require('./models/auditLog');

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