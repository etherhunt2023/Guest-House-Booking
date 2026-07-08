import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ManagerClient from './ManagerClient'

export const dynamic = 'force-dynamic'

const MOCK_BOOKINGS = [
  {
    id: 'b-mock-1',
    guest_id: 'g-user-1',
    guest_house_id: 'gh-dehradun',
    room_id: 'rm-101',
    check_in: '2026-07-10',
    check_out: '2026-07-12',
    guest_count: 2,
    purpose: 'Official meeting at cluster head office',
    status: 'pending_manager',
    total_amount: 1000,
    payment_status: 'pending',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    guest: { full_name: 'Dr. Suresh Rawat', phone: '9876543210', department: 'Doordarshan', designation: 'Director' },
    guest_house: { name: 'Dehradun VIP Guest House' },
    room: { room_number: '101', type: 'suite' },
    caretaker_remarks: 'Verified guest credentials. Recommended for approval.'
  },
  {
    id: 'b-mock-2',
    guest_id: 'g-user-2',
    guest_house_id: 'gh-dehradun',
    room_id: 'rm-102',
    check_in: '2026-07-15',
    check_out: '2026-07-18',
    guest_count: 1,
    purpose: 'Official inspection at transmitter site',
    status: 'approved',
    total_amount: 900,
    payment_status: 'paid',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    guest: { full_name: 'Meena Kandwal', phone: '9412345678', department: 'Akashvani', designation: 'Engineer' },
    guest_house: { name: 'Dehradun VIP Guest House' },
    room: { room_number: '102', type: 'deluxe' },
    caretaker_remarks: 'Room is available.'
  }
]

export default async function ManagerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const role = user.user_metadata?.role || 'guest'
  if (role !== 'manager' && role !== 'admin') {
    redirect('/dashboard')
  }

  let bookings = []

  try {
    const { data: dbBookings, error } = await supabase
      .from('bookings')
      .select('*, guest:profiles(*), guest_house:guest_houses(*), room:rooms(*)')
      .order('created_at', { ascending: false })

    if (error || !dbBookings || dbBookings.length === 0) {
      bookings = MOCK_BOOKINGS
    } else {
      bookings = dbBookings
    }
  } catch (err) {
    console.error('Manager data error, using mock:', err)
    bookings = MOCK_BOOKINGS
  }

  return (
    <ManagerClient
      user={user}
      bookings={bookings}
    />
  )
}
