'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { BookingStatus, RoomStatus } from '@/types/database'

// --- AUDIT LOG UTILITY ---
async function logAction(action: string, details: Record<string, unknown>) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('audit_logs').insert({
        user_id: user.id,
        action,
        details,
      })
    }
  } catch (err) {
    console.error('Audit log error:', err)
  }
}

// --- GUEST HOUSES SERVER ACTIONS ---
export async function getGuestHouses() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('guest_houses')
    .select('*, caretaker:profiles(*)')
    .order('name')

  if (error) {
    console.error('Error fetching guest houses:', error)
    return []
  }
  return data || []
}

export async function createGuestHouse(formData: FormData) {
  const name = formData.get('name') as string
  const location = formData.get('location') as string
  const description = formData.get('description') as string
  const caretaker_id = (formData.get('caretaker_id') as string) || null
  const latitude = parseFloat(formData.get('latitude') as string) || null
  const longitude = parseFloat(formData.get('longitude') as string) || null
  
  const facilitiesRaw = formData.get('facilities') as string
  const facilities = facilitiesRaw
    ? facilitiesRaw.split(',').map((f) => f.trim()).filter(Boolean)
    : []

  const supabase = await createClient()
  const { error } = await supabase.from('guest_houses').insert({
    name,
    location,
    description,
    caretaker_id,
    latitude,
    longitude,
    facilities,
  })

  if (error) {
    return { error: error.message }
  }

  await logAction('create_guest_house', { name, location })
  revalidatePath('/admin')
  return { success: true }
}

export async function updateGuestHouse(id: string, formData: FormData) {
  const name = formData.get('name') as string
  const location = formData.get('location') as string
  const description = formData.get('description') as string
  const caretaker_id = (formData.get('caretaker_id') as string) || null
  const latitude = parseFloat(formData.get('latitude') as string) || null
  const longitude = parseFloat(formData.get('longitude') as string) || null
  
  const facilitiesRaw = formData.get('facilities') as string
  const facilities = facilitiesRaw
    ? facilitiesRaw.split(',').map((f) => f.trim()).filter(Boolean)
    : []

  const supabase = await createClient()
  const { error } = await supabase
    .from('guest_houses')
    .update({
      name,
      location,
      description,
      caretaker_id,
      latitude,
      longitude,
      facilities,
    })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  await logAction('update_guest_house', { id, name })
  revalidatePath('/admin')
  return { success: true }
}

export async function deleteGuestHouse(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('guest_houses').delete().eq('id', id)

  if (error) {
    return { error: error.message }
  }

  await logAction('delete_guest_house', { id })
  revalidatePath('/admin')
  return { success: true }
}

// --- ROOMS SERVER ACTIONS ---
export async function getRooms(guestHouseId?: string) {
  const supabase = await createClient()
  let query = supabase.from('rooms').select('*, guest_house:guest_houses(*)')
  if (guestHouseId) {
    query = query.eq('guest_house_id', guestHouseId)
  }
  const { data, error } = await query.order('room_number')
  if (error) {
    console.error('Error fetching rooms:', error)
    return []
  }
  return data || []
}

export async function createRoom(formData: FormData) {
  const guest_house_id = formData.get('guest_house_id') as string
  const room_number = formData.get('room_number') as string
  const type = formData.get('type') as string
  const capacity = parseInt(formData.get('capacity') as string) || 2
  const tariff_internal = parseFloat(formData.get('tariff_internal') as string) || 0
  const tariff_external = parseFloat(formData.get('tariff_external') as string) || 0
  const status = (formData.get('status') as RoomStatus) || 'available'

  const supabase = await createClient()
  const { error } = await supabase.from('rooms').insert({
    guest_house_id,
    room_number,
    type,
    capacity,
    tariff_internal,
    tariff_external,
    status,
  })

  if (error) {
    return { error: error.message }
  }

  await logAction('create_room', { guest_house_id, room_number })
  revalidatePath('/admin')
  return { success: true }
}

export async function updateRoom(id: string, formData: FormData) {
  const room_number = formData.get('room_number') as string
  const type = formData.get('type') as string
  const capacity = parseInt(formData.get('capacity') as string) || 2
  const tariff_internal = parseFloat(formData.get('tariff_internal') as string) || 0
  const tariff_external = parseFloat(formData.get('tariff_external') as string) || 0
  const status = (formData.get('status') as RoomStatus) || 'available'

  const supabase = await createClient()
  const { error } = await supabase
    .from('rooms')
    .update({
      room_number,
      type,
      capacity,
      tariff_internal,
      tariff_external,
      status,
    })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  await logAction('update_room', { id, room_number })
  revalidatePath('/admin')
  return { success: true }
}

export async function deleteRoom(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('rooms').delete().eq('id', id)

  if (error) {
    return { error: error.message }
  }

  await logAction('delete_room', { id })
  revalidatePath('/admin')
  return { success: true }
}

// --- BOOKINGS & APPROVALS SERVER ACTIONS ---
export async function getAllBookings() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('bookings')
    .select('*, guest:profiles(*), guest_house:guest_houses(*), room:rooms(*)')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching bookings:', error)
    return []
  }
  return data || []
}

export async function updateBookingStatus(
  id: string,
  status: BookingStatus,
  remarks: string,
  type: 'caretaker' | 'manager'
) {
  const updateData: Record<string, unknown> = { status }
  if (type === 'caretaker') {
    updateData.caretaker_remarks = remarks
  } else {
    updateData.manager_remarks = remarks
  }

  const supabase = await createClient()
  const { error } = await supabase.from('bookings').update(updateData).eq('id', id)

  if (error) {
    return { error: error.message }
  }

  await logAction('update_booking_status', { id, status, type })
  revalidatePath('/admin')
  revalidatePath('/caretaker')
  revalidatePath('/manager')
  return { success: true }
}

// --- AUDIT LOGS FETCHING ---
export async function getAuditLogs() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*, user:profiles(*)')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching audit logs:', error)
    return []
  }
  return data || []
}

// --- STAFF PROFILES FETCHING ---
export async function getStaffProfiles() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .in('role', ['admin', 'manager', 'caretaker'])
    .order('full_name')

  if (error) {
    console.error('Error fetching staff profiles:', error)
    return []
  }
  return data || []
}
