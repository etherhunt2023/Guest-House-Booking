'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getGuestBookings() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('bookings')
    .select('*, guest_house:guest_houses(*), room:rooms(*)')
    .eq('guest_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching guest bookings:', error)
    return []
  }
  return data || []
}

export async function createBooking(prevState: unknown, formData: FormData) {
  const guest_house_id = formData.get('guest_house_id') as string
  const room_id = formData.get('room_id') as string
  const check_in_str = formData.get('check_in') as string
  const check_out_str = formData.get('check_out') as string
  const guest_count = parseInt(formData.get('guest_count') as string) || 1
  const purpose = formData.get('purpose') as string

  if (!guest_house_id || !room_id || !check_in_str || !check_out_str || !purpose) {
    return { error: 'Please fill in all required fields' }
  }

  const check_in = new Date(check_in_str)
  const check_out = new Date(check_out_str)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (check_in < today) {
    return { error: 'Check-in date cannot be in the past' }
  }

  if (check_out <= check_in) {
    return { error: 'Check-out date must be after check-in date' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'You must be logged in to make a booking' }
  }

  // Calculate nights
  const diffTime = Math.abs(check_out.getTime() - check_in.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  const nights = diffDays === 0 ? 1 : diffDays

  // Get Room details for pricing & availability checks
  const { data: room, error: roomError } = await supabase
    .from('rooms')
    .select('*')
    .eq('id', room_id)
    .single()

  if (roomError || !room) {
    return { error: 'Room details not found' }
  }

  if (room.status === 'maintenance') {
    return { error: 'This room is currently under maintenance' }
  }

  // Overlap verification to prevent double bookings
  // Overlap condition: check_in < b.check_out AND check_out > b.check_in
  const { data: overlaps, error: overlapError } = await supabase
    .from('bookings')
    .select('id')
    .eq('room_id', room_id)
    .not('status', 'in', '("cancelled","rejected")')
    .lt('check_in', check_out_str)
    .gt('check_out', check_in_str)

  if (overlapError) {
    return { error: 'Failed to verify availability. Please try again.' }
  }

  if (overlaps && overlaps.length > 0) {
    return { error: 'This room is already booked for the selected dates. Please choose a different room or dates.' }
  }

  // Calculate tariff
  const isInternal = user.user_metadata?.department && user.user_metadata.department.trim() !== ''
  const rate = isInternal ? room.tariff_internal : room.tariff_external
  const total_amount = rate * nights

  // Insert booking
  const { data: newBooking, error: bookingInsertError } = await supabase
    .from('bookings')
    .insert({
      guest_id: user.id,
      guest_house_id,
      room_id,
      check_in: check_in_str,
      check_out: check_out_str,
      guest_count,
      purpose,
      total_amount,
      status: 'pending_caretaker',
      payment_status: 'pending',
    })
    .select()
    .single()

  if (bookingInsertError || !newBooking) {
    return { error: bookingInsertError?.message || 'Failed to create booking request' }
  }

  // Log action
  try {
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'create_booking',
      details: { booking_id: newBooking.id, total_amount },
    })
  } catch (e) {
    console.error('Audit log insert failed', e)
  }

  revalidatePath('/dashboard')
  revalidatePath('/admin')
  return { success: true, booking_id: newBooking.id }
}

export async function cancelBooking(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthenticated' }

  const { error } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', id)
    .eq('guest_id', user.id) // Ensure users can only cancel their own bookings

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  revalidatePath('/admin')
  return { success: true }
}
