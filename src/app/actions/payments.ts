'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import Razorpay from 'razorpay'
import crypto from 'crypto'

export async function createRazorpayOrder(bookingId: string) {
  const supabase = await createClient()
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', bookingId)
    .single()

  if (bookingError || !booking) {
    return { error: 'Booking details not found' }
  }

  const keyId = process.env.RAZORPAY_KEY_ID || 'your-razorpay-key-id'
  const keySecret = process.env.RAZORPAY_KEY_SECRET || 'your-razorpay-key-secret'

  // If credentials are placeholder values, run in Mock Mode for testing
  const isMock = keyId === 'your-razorpay-key-id' || keySecret === 'your-razorpay-key-secret'

  if (isMock) {
    console.warn('Razorpay credentials missing. Running payment in Mock Mode.')
    return {
      success: true,
      isMock: true,
      amount: booking.total_amount * 100, // in paisa
      currency: 'INR',
      orderId: `order_mock_${Math.random().toString(36).substring(2, 11)}`,
      bookingId: booking.id,
      keyId,
    }
  }

  try {
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    })

    const order = await razorpay.orders.create({
      amount: Math.round(booking.total_amount * 100), // amount in paise
      currency: 'INR',
      receipt: booking.id,
    })

    return {
      success: true,
      isMock: false,
      amount: order.amount,
      currency: order.currency,
      orderId: order.id,
      bookingId: booking.id,
      keyId,
    }
  } catch (err) {
    console.error('Razorpay order creation failed:', err)
    return { error: err instanceof Error ? err.message : 'Razorpay order creation failed' }
  }
}

export async function verifyPayment(
  bookingId: string,
  orderId: string,
  paymentId: string,
  signature: string,
  isMock: boolean = false
) {
  const supabase = await createClient()
  
  if (!isMock) {
    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'your-razorpay-key-secret'
    const generated_signature = crypto
      .createHmac('sha256', keySecret)
      .update(orderId + '|' + paymentId)
      .digest('hex')

    if (generated_signature !== signature) {
      // Payment verification failed
      await supabase.from('payments').insert({
        booking_id: bookingId,
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: signature,
        amount: 0,
        status: 'failed',
      })
      return { error: 'Payment signature verification failed' }
    }
  }

  // Retrieve booking
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', bookingId)
    .single()

  if (bookingError || !booking) {
    return { error: 'Booking details not found' }
  }

  // Update booking payment status
  const { error: updateError } = await supabase
    .from('bookings')
    .update({ payment_status: 'paid' })
    .eq('id', bookingId)

  if (updateError) {
    return { error: 'Failed to update booking status' }
  }

  // Insert payment transaction
  await supabase.from('payments').insert({
    booking_id: bookingId,
    razorpay_order_id: orderId,
    razorpay_payment_id: paymentId,
    razorpay_signature: signature,
    amount: booking.total_amount,
    status: 'captured',
  })

  // Log action
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'payment_captured',
      details: { booking_id: bookingId, order_id: orderId, payment_id: paymentId },
    })
  }

  revalidatePath('/dashboard')
  revalidatePath('/admin')
  return { success: true }
}

export async function refundPayment(bookingId: string) {
  const supabase = await createClient()

  // Update booking
  const { error: bookingError } = await supabase
    .from('bookings')
    .update({ payment_status: 'refunded' })
    .eq('id', bookingId)

  if (bookingError) {
    return { error: bookingError.message }
  }

  // Update payment status
  const { error: paymentError } = await supabase
    .from('payments')
    .update({ status: 'refunded' })
    .eq('booking_id', bookingId)

  if (paymentError) {
    return { error: paymentError.message }
  }

  // Log action
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'payment_refunded',
      details: { booking_id: bookingId },
    })
  }

  revalidatePath('/dashboard')
  revalidatePath('/admin')
  return { success: true }
}
