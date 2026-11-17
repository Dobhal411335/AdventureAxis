import Discount from '@/models/Discount';

/**
 * Atomically decrement a cart-level promo's remaining uses after a successful order/payment.
 * Safe for concurrent checkouts: only matches when usesRemaining > 0.
 * Never throws — paid orders should not fail if the counter cannot update.
 */
export async function decrementPromoUse(promoCode, promoDiscount) {
  const code = promoCode ? String(promoCode).trim().toUpperCase() : '';
  const discount = Number(promoDiscount) || 0;

  if (!code || discount <= 0) {
    return null;
  }

  try {
    const updatedCoupon = await Discount.findOneAndUpdate(
      {
        couponCode: code,
        usesRemaining: { $gt: 0 },
      },
      { $inc: { usesRemaining: -1 } },
      { new: true }
    );

    if (!updatedCoupon) {
      console.warn('Promo usesRemaining already 0 or coupon not found:', code);
    }

    return updatedCoupon;
  } catch (promoDecError) {
    console.error('Failed to decrement promo usesRemaining:', promoDecError);
    return null;
  }
}
