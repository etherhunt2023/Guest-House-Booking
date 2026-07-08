import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'

export const dynamic = 'force-dynamic'

// Mock Fallback Data (renders if database tables do not exist yet)
const MOCK_GUEST_HOUSES = [
  {
    id: 'gh-dehradun',
    name: 'Dehradun VIP Guest House',
    location: 'Dehradun',
    description: 'Centrally located guest house near Haridwar bypass. Features VIP suites, green lawns, and full catering service.',
    facilities: ['WiFi', 'AC', 'Catering', 'Parking', 'TV Lounge'],
    rooms: [
      { id: 'rm-101', guest_house_id: 'gh-dehradun', room_number: '101', type: 'suite', capacity: 2, tariff_internal: 500, tariff_external: 1500, status: 'available' },
      { id: 'rm-102', guest_house_id: 'gh-dehradun', room_number: '102', type: 'deluxe', capacity: 2, tariff_internal: 300, tariff_external: 1000, status: 'available' },
      { id: 'rm-103', guest_house_id: 'gh-dehradun', room_number: '103', type: 'standard', capacity: 3, tariff_internal: 150, tariff_external: 600, status: 'maintenance' }
    ]
  },
  {
    id: 'gh-mussoorie',
    name: 'Mussoorie Transit House',
    location: 'Mussoorie',
    description: 'Scenic transit house located at the hills of Mussoorie, adjacent to the Doordarshan Transmitter compound. Stunning Himalayan views.',
    facilities: ['WiFi', 'Heater', 'Catering', 'Balcony View'],
    rooms: [
      { id: 'rm-201', guest_house_id: 'gh-mussoorie', room_number: '201', type: 'suite', capacity: 2, tariff_internal: 600, tariff_external: 2000, status: 'available' },
      { id: 'rm-202', guest_house_id: 'gh-mussoorie', room_number: '202', type: 'deluxe', capacity: 2, tariff_internal: 400, tariff_external: 1200, status: 'available' }
    ]
  },
  {
    id: 'gh-haridwar',
    name: 'Haridwar Transit House',
    location: 'Haridwar',
    description: 'Transit guest house near the holy Ganges. Clean, peaceful environment suitable for touring staff and officers.',
    facilities: ['WiFi', 'AC', 'Parking', 'Catering'],
    rooms: [
      { id: 'rm-301', guest_house_id: 'gh-haridwar', room_number: '301', type: 'standard', capacity: 2, tariff_internal: 200, tariff_external: 700, status: 'available' },
      { id: 'rm-302', guest_house_id: 'gh-haridwar', room_number: '302', type: 'standard', capacity: 2, tariff_internal: 200, tariff_external: 700, status: 'available' }
    ]
  }
]

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  let guestHouses = []
  let bookings = []

  try {
    // 1. Fetch guest houses and rooms
    const { data: dbGuestHouses, error: ghError } = await supabase
      .from('guest_houses')
      .select('*, rooms(*)')
      .order('name')

    if (ghError || !dbGuestHouses || dbGuestHouses.length === 0) {
      console.warn('Using mock guest houses (tables not created or empty)')
      guestHouses = MOCK_GUEST_HOUSES
    } else {
      guestHouses = dbGuestHouses
    }

    // 2. Fetch user bookings
    const { data: dbBookings, error: bError } = await supabase
      .from('bookings')
      .select('*, guest_house:guest_houses(*), room:rooms(*)')
      .eq('guest_id', user.id)
      .order('created_at', { ascending: false })

    if (bError || !dbBookings) {
      console.warn('No active DB bookings found or table missing')
      bookings = []
    } else {
      bookings = dbBookings
    }
  } catch (err) {
    console.error('Error fetching data from Supabase, falling back to mock data:', err)
    guestHouses = MOCK_GUEST_HOUSES
    bookings = []
  }

  return (
    <DashboardClient
      user={user}
      guestHouses={guestHouses}
      bookings={bookings}
    />
  )
}
