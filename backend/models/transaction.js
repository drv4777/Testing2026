const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
			index: true,
		},
		merchantId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Merchant',
			required: true,
			index: true,
		},
		amount: {
			type: Number,
			required: true,
			min: 0,
		},
		currency: {
			type: String,
			required: true,
			default: 'USD',
			uppercase: true,
			trim: true,
		},
		paymentMethod: {
			type: String,
			required: true,
			trim: true,
		},
		status: {
			type: String,
			enum: ['pending', 'completed', 'failed', 'refunded'],
			default: 'pending',
			index: true,
		},
		gatewayReference: {
			type: String,
			trim: true,
			sparse: true,
		},
		failureReason: {
			type: String,
			trim: true,
		},
		refundReason: {
			type: String,
			trim: true,
		},
		processedAt: {
			type: Date,
		},
	},
	{
		timestamps: true,
	}
);

transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ merchantId: 1, createdAt: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
