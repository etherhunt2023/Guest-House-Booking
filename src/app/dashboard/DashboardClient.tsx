'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Script from 'next/script'
import { Button } from '@/components/ui/button'
import { createBooking, cancelBooking } from '@/app/actions/bookings'
import { createRazorpayOrder, verifyPayment } from '@/app/actions/payments'
import { logout } from '@/app/auth/actions'
import {
  Building2,
  Calendar,
  LogOut,
  MapPin,
  Info,
  X,
  CreditCard,
  Printer,
  CheckCircle,
  Clock,
  XCircle,
  DoorOpen,
  AlertCircle
} from 'lucide-react'
import { User } from '@supabase/supabase-js'
import { GuestHouse, Room, Booking } from '@/types/database'

interface DashboardClientProps {
  user: User
  guestHouses: GuestHouse[]
  bookings: Booking[]
}

export default function DashboardClient({ user, guestHouses, bookings }: DashboardClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Tabs
  const [activeTab, setActiveTab] = useState<'book' | 'reservations'>('book')

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('')
  const filteredGuestHouses = guestHouses.filter((gh) =>
    gh.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    gh.location.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Booking Modal State
  const [selectedGuestHouse, setSelectedGuestHouse] = useState<GuestHouse | null>(null)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guestCount, setGuestCount] = useState(1)
  const [purpose, setPurpose] = useState('')
  const [bookingError, setBookingError] = useState('')
  const [bookingSuccess, setBookingSuccess] = useState(false)

  // Razorpay payment state
  const [payingBookingId, setPayingBookingId] = useState<string | null>(null)

  const handleOpenBookingModal = (gh: GuestHouse, room: Room) => {
    setSelectedGuestHouse(gh)
    setSelectedRoom(room)
    setCheckIn('')
    setCheckOut('')
    setGuestCount(1)
    setPurpose('')
    setBookingError('')
    setBookingSuccess(false)
  }

  const handleCloseBookingModal = () => {
    setSelectedGuestHouse(null)
    setSelectedRoom(null)
  }

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    setBookingError('')

    if (!selectedGuestHouse || !selectedRoom) {
      setBookingError('Please select a valid room and guest house.')
      return
    }

    const formData = new FormData()
    formData.append('guest_house_id', selectedGuestHouse.id)
    formData.append('room_id', selectedRoom.id)
    formData.append('check_in', checkIn)
    formData.append('check_out', checkOut)
    formData.append('guest_count', guestCount.toString())
    formData.append('purpose', purpose)

    startTransition(async () => {
      const res = await createBooking(null, formData)
      if (res?.error) {
        setBookingError(res.error)
      } else {
        setBookingSuccess(true)
        setTimeout(() => {
          handleCloseBookingModal()
          setActiveTab('reservations')
          router.refresh()
        }, 2000)
      }
    })
  }

  const handleCancelBooking = (bookingId: string) => {
    if (confirm('Are you sure you want to cancel this booking request?')) {
      startTransition(async () => {
        await cancelBooking(bookingId)
        router.refresh()
      })
    }
  }

  const handlePayment = async (bookingId: string) => {
    setPayingBookingId(bookingId)
    const res = await createRazorpayOrder(bookingId)

    if (res.error) {
      alert(`Payment initialization failed: ${res.error}`)
      setPayingBookingId(null)
      return
    }

    if (res.isMock) {
      // Complete mock payment process
      alert('Demo Mode: Simulating Razorpay gateway. Clicking OK will process payment verification.')
      const verifyRes = await verifyPayment(
        res.bookingId!,
        res.orderId!,
        'pay_mock_12345',
        'sig_mock_12345',
        true
      )
      if (verifyRes.error) {
        alert(`Payment verification failed: ${verifyRes.error}`)
      } else {
        alert('Payment completed successfully in Demo Mode!')
        router.refresh()
      }
      setPayingBookingId(null)
    } else {
      // Load and trigger Razorpay SDK
      const options = {
        key: res.keyId,
        amount: res.amount,
        currency: res.currency,
        name: 'Prasar Bharati Guest House',
        description: 'Accommodation Charges',
        order_id: res.orderId,
        handler: async function (response: { razorpay_payment_id: string; razorpay_signature: string }) {
          const verifyRes = await verifyPayment(
            res.bookingId!,
            res.orderId!,
            response.razorpay_payment_id,
            response.razorpay_signature,
            false
          )
          if (verifyRes.error) {
            alert(`Payment verification failed: ${verifyRes.error}`)
          } else {
            alert('Payment completed successfully!')
            router.refresh()
          }
          setPayingBookingId(null)
        },
        prefill: {
          name: user.user_metadata?.full_name || '',
          email: user.email || '',
          contact: user.user_metadata?.phone || '',
        },
        theme: {
          color: '#4f46e5',
        },
      }

      const rzpay = new (window as unknown as { Razorpay: new (o: unknown) => { open: () => void } }).Razorpay(options)
      rzpay.open()
    }
  }

  // Get status badge formatting
  const getStatusBadge = (status: string, paymentStatus: string) => {
    if (status === 'cancelled') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
          <XCircle className="h-3 w-3" /> Cancelled
        </span>
      )
    }
    if (status === 'rejected') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
          <XCircle className="h-3 w-3" /> Rejected
        </span>
      )
    }
    if (status === 'checked_out') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20">
          <DoorOpen className="h-3 w-3" /> Checked Out
        </span>
      )
    }
    if (status === 'checked_in') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <DoorOpen className="h-3 w-3" /> Checked In
        </span>
      )
    }
    if (status === 'approved') {
      if (paymentStatus === 'paid') {
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle className="h-3 w-3" /> Approved & Paid
          </span>
        )
      }
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <CreditCard className="h-3 w-3" /> Approved - Pay Pending
        </span>
      )
    }
    if (status === 'pending_manager') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          <Clock className="h-3 w-3" /> Pending Cluster Approval
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
        <Clock className="h-3 w-3" /> Pending Caretaker Approval
      </span>
    )
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
        {/* Top Navbar */}
        <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                <Building2 className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <span className="font-bold text-white text-base">Prasar Bharati</span>
                <span className="text-slate-500 text-xs block -mt-1">Dehradun Cluster</span>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-sm font-semibold text-white">{user.user_metadata?.full_name || 'Guest User'}</span>
                <span className="text-xs text-slate-500 capitalize">{user.user_metadata?.role || 'Guest'} Account</span>
              </div>
              <form action={logout}>
                <Button type="submit" variant="ghost" size="sm" className="text-slate-400 hover:text-white gap-2 cursor-pointer">
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </form>
            </div>
          </div>
        </header>

        {/* Dashboard Frame */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white">Guest House Dashboard</h1>
              <p className="text-slate-400 text-sm">Request and monitor guest house accommodations in the Dehradun Cluster.</p>
            </div>

            {/* Tab Toggles */}
            <div className="flex p-1 bg-slate-900 border border-slate-800 rounded-xl w-fit">
              <button
                onClick={() => setActiveTab('book')}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-300 ${
                  activeTab === 'book'
                    ? 'bg-slate-800 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Building2 className="h-3.5 w-3.5" />
                Book Accommodations
              </button>
              <button
                onClick={() => setActiveTab('reservations')}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-300 relative ${
                  activeTab === 'reservations'
                    ? 'bg-slate-800 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Calendar className="h-3.5 w-3.5" />
                My Reservations
                {bookings.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold">
                    {bookings.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {activeTab === 'book' ? (
            <div className="space-y-6">
              {/* Search Bar */}
              <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-center">
                <div className="relative w-full">
                  <input
                    type="text"
                    placeholder="Search guest houses by name or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full px-4 py-2.5 bg-slate-950/60 border border-slate-850 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20"
                  />
                </div>
                <div className="hidden sm:flex text-slate-500 text-xs gap-1.5 items-center shrink-0">
                  <Info className="h-4 w-4" />
                  Prices differ for internal Prasar Bharati employees.
                </div>
              </div>

              {/* Guest Houses and Rooms */}
              {filteredGuestHouses.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-slate-900 rounded-2xl text-slate-500">
                  <Building2 className="h-10 w-10 mx-auto text-slate-700 mb-3" />
                  <p>No guest houses found matching your criteria.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-8">
                  {filteredGuestHouses.map((gh) => (
                    <div
                      key={gh.id}
                      className="bg-slate-900/20 border border-slate-900 rounded-3xl p-6 hover:border-slate-800 transition-all duration-300"
                    >
                      {/* Guest house header */}
                      <div className="flex flex-col md:flex-row justify-between gap-4 border-b border-slate-900 pb-6 mb-6">
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <h2 className="text-xl font-bold text-white">{gh.name}</h2>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                              <MapPin className="h-3 w-3" />
                              {gh.location}
                            </span>
                          </div>
                          <p className="text-slate-400 text-sm max-w-3xl leading-relaxed">{gh.description || 'No description available.'}</p>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs text-slate-500 h-fit md:justify-end">
                          {gh.facilities && gh.facilities.map((fac: string, idx: number) => (
                            <span key={idx} className="bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-lg">
                              {fac}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Rooms list */}
                      <div>
                        <h3 className="text-sm font-semibold text-slate-400 mb-4">Available Rooms</h3>
                        {gh.rooms && gh.rooms.length === 0 ? (
                          <p className="text-slate-500 text-xs italic">No rooms registered under this guest house.</p>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {gh.rooms && gh.rooms.map((room: Room) => {
                              const isInternal = user.user_metadata?.department && user.user_metadata.department.trim() !== ''
                              const tariff = isInternal ? room.tariff_internal : room.tariff_external

                              return (
                                <div
                                  key={room.id}
                                  className="bg-slate-950/40 border border-slate-900 rounded-2xl p-5 flex flex-col justify-between"
                                >
                                  <div>
                                    <div className="flex justify-between items-center mb-3">
                                      <span className="text-base font-bold text-white">Room {room.room_number}</span>
                                      <span className="text-[10px] uppercase font-bold tracking-wide px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-md">
                                        {room.type}
                                      </span>
                                    </div>
                                    <div className="space-y-1.5 mb-6 text-xs text-slate-400">
                                      <p>Capacity: {room.capacity} Persons</p>
                                      <p>Status:{' '}
                                        <span className={`capitalize ${room.status === 'available' ? 'text-emerald-400' : room.status === 'maintenance' ? 'text-rose-400' : 'text-slate-500'}`}>
                                          {room.status}
                                        </span>
                                      </p>
                                      <p className="text-lg font-bold text-white mt-3">
                                        ₹{tariff} <span className="text-xs text-slate-500 font-normal">/ Night</span>
                                      </p>
                                    </div>
                                  </div>

                                  <Button
                                    onClick={() => handleOpenBookingModal(gh, room)}
                                    disabled={room.status !== 'available' || isPending}
                                    className="w-full justify-center bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs py-2 cursor-pointer"
                                  >
                                    {room.status === 'available' ? 'Book Room' : 'Unavailable'}
                                  </Button>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Reservations Tab */
            <div className="space-y-6">
              {bookings.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-slate-900 rounded-2xl text-slate-500">
                  <Calendar className="h-10 w-10 mx-auto text-slate-700 mb-3" />
                  <p>You have no guest house reservations yet.</p>
                  <p className="text-xs text-slate-650 mt-1">Book room tabs to create new booking requests.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {bookings.map((booking) => {
                    const isPendingApproval = booking.status === 'pending_caretaker' || booking.status === 'pending_manager'
                    const isApprovedUnpaid = booking.status === 'approved' && booking.payment_status === 'pending'
                    const isPaid = booking.payment_status === 'paid'

                    return (
                      <div
                        key={booking.id}
                        className="bg-slate-900/20 border border-slate-900 rounded-2xl p-6 flex flex-col md:flex-row justify-between gap-6"
                      >
                        <div className="space-y-4">
                          {/* Booking header */}
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="text-sm font-bold text-white">Booking Ref: #{booking.id.substring(0, 8).toUpperCase()}</span>
                            {getStatusBadge(booking.status, booking.payment_status)}
                          </div>

                          {/* Booking details */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-slate-400">
                            <div>
                              <span className="text-slate-500 block">Location</span>
                              <span className="text-white font-semibold text-sm block mt-0.5">{booking.guest_house?.name}</span>
                              <span className="text-slate-500">Room {booking.room?.room_number} ({booking.room?.type})</span>
                            </div>
                            <div>
                              <span className="text-slate-500 block">Dates</span>
                              <span className="text-white font-semibold block mt-0.5">
                                {new Date(booking.check_in).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}{' '}
                                to{' '}
                                {new Date(booking.check_out).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                              <span className="text-slate-500">
                                Total: {Math.ceil(Math.abs(new Date(booking.check_out).getTime() - new Date(booking.check_in).getTime()) / (1000 * 60 * 60 * 24))} Nights
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-500 block">Amount</span>
                              <span className="text-white text-lg font-bold block mt-0.5">₹{booking.total_amount}</span>
                              <span className="text-slate-500 capitalize">{booking.payment_status} payment</span>
                            </div>
                          </div>

                          {/* Remarks */}
                          {(booking.caretaker_remarks || booking.manager_remarks) && (
                            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-900 text-xs text-slate-400 max-w-2xl space-y-1">
                              {booking.caretaker_remarks && (
                                <p><span className="text-indigo-400 font-semibold">Caretaker Remarks:</span> {booking.caretaker_remarks}</p>
                              )}
                              {booking.manager_remarks && (
                                <p><span className="text-indigo-400 font-semibold">Manager Remarks:</span> {booking.manager_remarks}</p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-row md:flex-col justify-end items-end gap-3 h-full self-center shrink-0">
                          {isPendingApproval && (
                            <Button
                              onClick={() => handleCancelBooking(booking.id)}
                              variant="destructive"
                              size="sm"
                              className="w-full md:w-32 justify-center rounded-xl py-2 cursor-pointer"
                            >
                              Cancel Request
                            </Button>
                          )}
                          {isApprovedUnpaid && (
                            <Button
                              onClick={() => handlePayment(booking.id)}
                              disabled={payingBookingId === booking.id}
                              size="sm"
                              className="w-full md:w-32 justify-center bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl py-2 cursor-pointer shadow-lg shadow-emerald-600/10"
                            >
                              {payingBookingId === booking.id ? 'Processing...' : 'Pay Now'}
                            </Button>
                          )}
                          {isPaid && (
                            <Link href={`/bookings/${booking.id}/receipt`} target="_blank" className="w-full md:w-fit">
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full md:w-32 justify-center border-slate-800 text-slate-300 hover:bg-slate-900 rounded-xl py-2 cursor-pointer"
                              >
                                <Printer className="h-3.5 w-3.5" />
                                Receipt
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </main>

        {/* Booking Form Modal */}
        {selectedGuestHouse && selectedRoom && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-full max-w-md bg-slate-900 border border-slate-850 rounded-3xl p-6 shadow-2xl relative">
              <button
                onClick={handleCloseBookingModal}
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              <h2 className="text-lg font-bold text-white mb-1">Confirm Booking Request</h2>
              <p className="text-xs text-slate-400 mb-6">
                Requesting Room {selectedRoom.room_number} at {selectedGuestHouse.name}.
              </p>

              {bookingSuccess ? (
                <div className="text-center py-6 animate-in fade-in zoom-in duration-300">
                  <div className="inline-flex items-center justify-center p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 mb-4">
                    <CheckCircle className="h-8 w-8" />
                  </div>
                  <h3 className="font-bold text-white text-base">Request Submitted!</h3>
                  <p className="text-xs text-slate-400 mt-1">Redirecting to reservations history...</p>
                </div>
              ) : (
                <form onSubmit={handleConfirmBooking} className="space-y-4">
                  {bookingError && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs flex items-start gap-2">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      <span>{bookingError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="check_in" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Check In Date
                      </label>
                      <input
                        id="check_in"
                        type="date"
                        required
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        className="block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="check_out" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Check Out Date
                      </label>
                      <input
                        id="check_out"
                        type="date"
                        required
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        className="block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="guest_count" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Number of Guests
                    </label>
                    <input
                      id="guest_count"
                      type="number"
                      min="1"
                      max={selectedRoom.capacity}
                      required
                      value={guestCount}
                      onChange={(e) => setGuestCount(parseInt(e.target.value) || 1)}
                      className="block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">Maximum capacity of this room: {selectedRoom.capacity}</span>
                  </div>

                  <div>
                    <label htmlFor="purpose" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Purpose of Visit
                    </label>
                    <textarea
                      id="purpose"
                      required
                      rows={3}
                      placeholder="e.g. Official Tour, personal visit..."
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      className="block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-650 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      disabled={isPending}
                      className="w-full justify-center bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-2.5 font-semibold text-xs cursor-pointer shadow-lg"
                    >
                      {isPending ? 'Submitting request...' : 'Confirm Request'}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
