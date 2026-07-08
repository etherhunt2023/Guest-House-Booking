import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import AdminClient from './AdminClient'

export const dynamic = 'force-dynamic'

const MOCK_GUEST_HOUSES = [
  {
    id: 'gh-dehradun',
    name: 'Dehradun VIP Guest House',
    location: 'Dehradun',
    description: 'Centrally located guest house near Haridwar bypass. Features VIP suites, green lawns, and full catering service.',
    facilities: ['WiFi', 'AC', 'Catering', 'Parking', 'TV Lounge'],
    caretaker_id: 'p-caretaker-1',
    caretaker: { id: 'p-caretaker-1', full_name: 'Amit Negi', role: 'caretaker' }
  },
  {
    id: 'gh-mussoorie',
    name: 'Mussoorie Transit House',
    location: 'Mussoorie',
    description: 'Scenic transit house located at the hills of Mussoorie, adjacent to the Doordarshan Transmitter compound. Stunning Himalayan views.',
    facilities: ['WiFi', 'Heater', 'Catering', 'Balcony View'],
    caretaker_id: 'p-caretaker-2',
    caretaker: { id: 'p-caretaker-2', full_name: 'Rajesh Sharma', role: 'caretaker' }
  }
]

const MOCK_ROOMS = [
  { id: 'rm-101', guest_house_id: 'gh-dehradun', room_number: '101', type: 'suite', capacity: 2, tariff_internal: 500, tariff_external: 1500, status: 'available' },
  { id: 'rm-102', guest_house_id: 'gh-dehradun', room_number: '102', type: 'deluxe', capacity: 2, tariff_internal: 300, tariff_external: 1000, status: 'available' },
  { id: 'rm-201', guest_house_id: 'gh-mussoorie', room_number: '201', type: 'suite', capacity: 2, tariff_internal: 600, tariff_external: 2000, status: 'available' },
  { id: 'rm-202', guest_house_id: 'gh-mussoorie', room_number: '202', type: 'deluxe', capacity: 2, tariff_internal: 400, tariff_external: 1200, status: 'maintenance' }
]

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
    guest: { full_name: 'Dr. Suresh Rawat', phone: '9876543210' },
    guest_house: { name: 'Dehradun VIP Guest House' },
    room: { room_number: '101', type: 'suite' }
  },
  {
    id: 'b-mock-2',
    guest_id: 'g-user-2',
    guest_house_id: 'gh-mussoorie',
    room_id: 'rm-201',
    check_in: '2026-07-15',
    check_out: '2026-07-18',
    guest_count: 1,
    purpose: 'Official inspection at Mussoorie Transmitter',
    status: 'approved',
    total_amount: 1800,
    payment_status: 'paid',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    guest: { full_name: 'Meena Kandwal', phone: '9412345678' },
    guest_house: { name: 'Mussoorie Transit House' },
    room: { room_number: '201', type: 'suite' }
  }
]

const MOCK_AUDIT_LOGS = [
  { id: 'l-1', action: 'create_guest_house', details: { name: 'Dehradun VIP Guest House' }, created_at: new Date(Date.now() - 172800000).toISOString(), user: { full_name: 'System Admin' } },
  { id: 'l-2', action: 'create_room', details: { room_number: '101', type: 'suite' }, created_at: new Date(Date.now() - 172700000).toISOString(), user: { full_name: 'System Admin' } }
]

const MOCK_STAFF = [
  { id: 'p-caretaker-1', full_name: 'Amit Negi', role: 'caretaker' },
  { id: 'p-caretaker-2', full_name: 'Rajesh Sharma', role: 'caretaker' },
  { id: 'p-manager-1', full_name: 'Karan Negi', role: 'manager' }
]

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const role = user.user_metadata?.role || 'guest'
  if (role !== 'admin') {
    redirect('/dashboard')
  }

  let guestHouses = []
  let rooms = []
  let bookings = []
  let auditLogs = []
  let staffProfiles = []

  try {
    // 1. Fetch guest houses
    const { data: dbGuestHouses, error: ghError } = await supabase
      .from('guest_houses')
      .select('*, caretaker:profiles(*)')
      .order('name')

    if (ghError || !dbGuestHouses || dbGuestHouses.length === 0) {
      guestHouses = MOCK_GUEST_HOUSES
    } else {
      guestHouses = dbGuestHouses
    }

    // 2. Fetch rooms
    const { data: dbRooms, error: rError } = await supabase
      .from('rooms')
      .select('*, guest_house:guest_houses(*)')
      .order('room_number')

    if (rError || !dbRooms || dbRooms.length === 0) {
      rooms = MOCK_ROOMS
    } else {
      rooms = dbRooms
    }

    // 3. Fetch bookings
    const { data: dbBookings, error: bError } = await supabase
      .from('bookings')
      .select('*, guest:profiles(*), guest_house:guest_houses(*), room:rooms(*)')
      .order('created_at', { ascending: false })

    if (bError || !dbBookings || dbBookings.length === 0) {
      bookings = MOCK_BOOKINGS
    } else {
      bookings = dbBookings
    }

    // 4. Fetch audit logs
    const { data: dbLogs, error: logError } = await supabase
      .from('audit_logs')
      .select('*, user:profiles(*)')
      .order('created_at', { ascending: false })

    if (logError || !dbLogs || dbLogs.length === 0) {
      auditLogs = MOCK_AUDIT_LOGS
    } else {
      auditLogs = dbLogs
    }

    // 5. Fetch staff profiles
    const { data: dbStaff, error: sError } = await supabase
      .from('profiles')
      .select('*')
      .in('role', ['admin', 'manager', 'caretaker'])
      .order('full_name')

    if (sError || !dbStaff || dbStaff.length === 0) {
      staffProfiles = MOCK_STAFF
    } else {
      staffProfiles = dbStaff
    }
  } catch (err) {
    console.error('Database connection failed, running on mock admin data:', err)
    guestHouses = MOCK_GUEST_HOUSES
    rooms = MOCK_ROOMS
    bookings = MOCK_BOOKINGS
    auditLogs = MOCK_AUDIT_LOGS
    staffProfiles = MOCK_STAFF
  }

  return (
    <AdminClient
      user={user}
      guestHouses={guestHouses}
      rooms={rooms}
      bookings={bookings}
      auditLogs={auditLogs}
      staffProfiles={staffProfiles}
    />
  )
}
