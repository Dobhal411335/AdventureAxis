const mongoose = require('mongoose');

const DiscountSchema = new mongoose.Schema({
  couponCode: { type: String, required: true, unique: true },
  amount: { type: Number }, // Fixed discount amount
  percent: { type: Number }, // Percentage discount
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  maxUses: { type: Number, required: true, min: 1 },
  usesRemaining: { type: Number, required: true, min: 0 },
  status: {
    type: String,
    enum: ['active', 'paused', 'expired'],
    default: 'active',
  },
}, { timestamps: true });

DiscountSchema.pre('save', function (next) {
  if (this.couponCode) {
    this.couponCode = String(this.couponCode).trim().toUpperCase();
  }
  next();
});

DiscountSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate() || {};
  const set = update.$set || update;
  if (set.couponCode) {
    set.couponCode = String(set.couponCode).trim().toUpperCase();
    if (update.$set) {
      update.$set = set;
    }
  }
  next();
});

module.exports = mongoose.models.Discount || mongoose.model('Discount', DiscountSchema);
