import connectDB from '@/lib/connectDB';
import Discount from '@/models/Discount';

export async function GET(req) {
  await connectDB();
  try {
    const discounts = await Discount.find();
    const normalized = discounts.map(coupon => ({
      ...coupon.toObject(),
      startDate: coupon.startDate || null,
      endDate: coupon.endDate || null,
      maxUses: coupon.maxUses ?? null,
      usesRemaining: coupon.usesRemaining ?? null,
    }));
    return Response.json(normalized);
  } catch (err) {
    return Response.json({ error: 'Failed to fetch discounts' }, { status: 500 });
  }
}

export async function POST(req) {
  await connectDB();
  try {
    const body = await req.json();
    const maxUses = Number(body.maxUses);
    if (!Number.isFinite(maxUses) || maxUses < 1) {
      return Response.json({ error: 'maxUses must be at least 1' }, { status: 400 });
    }
    if (!body.couponCode) {
      return Response.json({ error: 'couponCode is required' }, { status: 400 });
    }

    const discount = await Discount.create({
      couponCode: String(body.couponCode).trim().toUpperCase(),
      amount: body.amount !== undefined && body.amount !== '' ? Number(body.amount) : undefined,
      percent: body.percent !== undefined && body.percent !== '' ? Number(body.percent) : undefined,
      startDate: body.startDate,
      endDate: body.endDate,
      maxUses,
      usesRemaining: maxUses,
      status: body.status || 'active',
    });
    return Response.json(discount, { status: 201 });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 400 });
  }
}

export async function PATCH(req) {
  await connectDB();
  try {
    const body = await req.json();
    const { id, status, edit } = body;
    if (!id) {
      return Response.json({ error: 'Discount id is required' }, { status: 404 });
    }

    // Full edit from admin form
    if (edit) {
      const maxUses = Number(body.maxUses);
      if (!Number.isFinite(maxUses) || maxUses < 1) {
        return Response.json({ error: 'maxUses must be at least 1' }, { status: 400 });
      }

      const update = {
        couponCode: String(body.couponCode || '').trim().toUpperCase(),
        amount: body.amount !== undefined && body.amount !== '' ? Number(body.amount) : undefined,
        percent: body.percent !== undefined && body.percent !== '' ? Number(body.percent) : undefined,
        startDate: body.startDate,
        endDate: body.endDate,
        maxUses,
        usesRemaining: maxUses, // reset remaining to new maxUses on edit
      };

      const discount = await Discount.findByIdAndUpdate(id, update, { new: true, runValidators: true });
      if (!discount) return Response.json({ error: 'Discount not found' }, { status: 404 });
      return Response.json(discount);
    }

    // Status-only toggle
    if (!status) {
      return Response.json({ error: 'status is required' }, { status: 400 });
    }
    const discount = await Discount.findByIdAndUpdate(id, { status }, { new: true });
    if (!discount) return Response.json({ error: 'Discount not found' }, { status: 404 });
    return Response.json(discount);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(req) {
  await connectDB();
  try {
    const { id } = await req.json();
    await Discount.findByIdAndDelete(id);
    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 400 });
  }
}
