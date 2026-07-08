import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import CaretakerClient from './CaretakerClient'

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
    status: 'pending_caretaker',
    total_amount: 1000,
    payment_status: 'pending',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    guest: { full_name: 'Dr. Suresh Rawat', phone: '9876543210', department: 'Doordarshan', designation: 'Director' },
    room: { room_number: '101', type: 'suite' }
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
    payment_status: 'pending',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    guest: { full_name: 'Meena Kandwal', phone: '9412345678', department: 'Akashvani', designation: 'Engineer' },
    room: { room_number: '102', type: 'deluxe' }
  },
  {
    id: 'b-mock-3',
    guest_id: 'g-user-3',
    guest_house_id: 'gh-dehradun',
    room_id: 'rm-102',
    check_in: '2026-07-05',
    check_out: '2026-07-07',
    guest_count: 1,
    purpose: 'Official visit',
    status: 'checked_in',
    total_amount: 600,
    payment_status: 'paid',
    created_at: new Date(Date.now() - 172800000).toISOString(),
    guest: { full_name: 'Sanjay Thapa', phone: '9760001234', department: 'Doordarshan', designation: 'Assistant' },
    room: { room_number: '102', type: 'deluxe' }
  }
]

export default async function CaretakerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const role = user.user_metadata?.role || 'guest'
  if (role !== 'caretaker' && role !== 'admin') {
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
      // If caretaker, they only see bookings for their assigned guest house.
      // But since caretaker-to-guesthouse assignment is linked via profiles, let's filter if they are not admin.
      if (role === 'caretaker') {
        const { data: gh } = await supabase
          .from('guest_houses')
          .select('id')
          .eq('caretaker_id', user.id)

        if (gh && gh.length > 0) {
          const ghIds = gh.map((g) => g.id)
          bookings = dbBookings.filter((b) => ghIds.includes(b.guest_house_id))
        } else {
          // If no assigned guest house in DB, show all for demonstration/sandbox
          bookings = dbBookings
        }
      } else {
        bookings = dbBookings
      }
    }
  } catch (err) {
    console.error('Caretaker data error, using mock:', err)
    bookings = MOCK_BOOKINGS
  }

  return (
    <CaretakerClient
      user={user}
      bookings={bookings}
    />
  )
}
