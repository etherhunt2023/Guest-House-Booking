'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  createGuestHouse,
  updateGuestHouse,
  deleteGuestHouse,
  createRoom,
  updateRoom,
  deleteRoom,
  updateBookingStatus
} from '@/app/actions/admin'
import { refundPayment } from '@/app/actions/payments'
import { logout } from '@/app/auth/actions'
import {
  Building2,
  Shield,
  LogOut,
  Home,
  Plus,
  Trash2,
  Edit2,
  DollarSign,
  MapPin,
  X,
  Clock
} from 'lucide-react'
import { User } from '@supabase/supabase-js'
import { GuestHouse, Room, Booking, AuditLog, Profile } from '@/types/database'

interface AdminClientProps {
  user: User
  guestHouses: GuestHouse[]
  rooms: Room[]
  bookings: Booking[]
  auditLogs: AuditLog[]
  staffProfiles: Profile[]
}

export default function AdminClient({
  user,
  guestHouses,
  rooms,
  bookings,
  auditLogs,
  staffProfiles
}: AdminClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Tabs
  const [activeTab, setActiveTab] = useState<'overview' | 'guesthouses' | 'rooms' | 'bookings' | 'audit'>('overview')

  // Forms modals visibility
  const [showGhModal, setShowGhModal] = useState(false)
  const [editingGh, setEditingGh] = useState<GuestHouse | null>(null)
  const [ghName, setGhName] = useState('')
  const [ghLocation, setGhLocation] = useState('')
  const [ghDescription, setGhDescription] = useState('')
  const [ghCaretakerId, setGhCaretakerId] = useState('')
  const [ghFacilities, setGhFacilities] = useState('')

  const [showRoomModal, setShowRoomModal] = useState(false)
  const [editingRoom, setEditingRoom] = useState<Room | null>(null)
  const [roomGhId, setRoomGhId] = useState('')
  const [roomNumber, setRoomNumber] = useState('')
  const [roomType, setRoomType] = useState('standard')
  const [roomCapacity, setRoomCapacity] = useState(2)
  const [roomTariffInternal, setRoomTariffInternal] = useState(200)
  const [roomTariffExternal, setRoomTariffExternal] = useState(600)
  const [roomStatus, setRoomStatus] = useState('available')

  // Booking details view
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [adminRemarks, setAdminRemarks] = useState('')

  // Search filter
  const [bookingFilter, setBookingFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')

  // Calculated Stats
  const totalRevenue = bookings
    .filter((b) => b.payment_status === 'paid')
    .reduce((sum, b) => sum + (b.total_amount || 0), 0)

  const pendingApprovalsCount = bookings.filter(
    (b) => b.status === 'pending_caretaker' || b.status === 'pending_manager'
  ).length

  // --- GUEST HOUSE ACTIONS ---
  const handleOpenGhModal = (gh: GuestHouse | null = null) => {
    if (gh) {
      setEditingGh(gh)
      setGhName(gh.name)
      setGhLocation(gh.location)
      setGhDescription(gh.description || '')
      setGhCaretakerId(gh.caretaker_id || '')
      setGhFacilities(gh.facilities?.join(', ') || '')
    } else {
      setEditingGh(null)
      setGhName('')
      setGhLocation('')
      setGhDescription('')
      setGhCaretakerId('')
      setGhFacilities('')
    }
    setShowGhModal(true)
  }

  const handleSaveGh = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append('name', ghName)
    formData.append('location', ghLocation)
    formData.append('description', ghDescription)
    formData.append('caretaker_id', ghCaretakerId)
    formData.append('facilities', ghFacilities)

    startTransition(async () => {
      let res
      if (editingGh) {
        res = await updateGuestHouse(editingGh.id, formData)
      } else {
        res = await createGuestHouse(formData)
      }

      if (res.error) {
        alert(res.error)
      } else {
        setShowGhModal(false)
        router.refresh()
      }
    })
  }

  const handleDeleteGh = async (id: string) => {
    if (confirm('Are you sure you want to delete this guest house? All associated rooms will be deleted.')) {
      startTransition(async () => {
        const res = await deleteGuestHouse(id)
        if (res.error) alert(res.error)
        else router.refresh()
      })
    }
  }

  // --- ROOM ACTIONS ---
  const handleOpenRoomModal = (room: Room | null = null) => {
    if (room) {
      setEditingRoom(room)
      setRoomGhId(room.guest_house_id)
      setRoomNumber(room.room_number)
      setRoomType(room.type)
      setRoomCapacity(room.capacity)
      setRoomTariffInternal(room.tariff_internal)
      setRoomTariffExternal(room.tariff_external)
      setRoomStatus(room.status)
    } else {
      setEditingRoom(null)
      setRoomGhId(guestHouses[0]?.id || '')
      setRoomNumber('')
      setRoomType('standard')
      setRoomCapacity(2)
      setRoomTariffInternal(200)
      setRoomTariffExternal(600)
      setRoomStatus('available')
    }
    setShowRoomModal(true)
  }

  const handleSaveRoom = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append('guest_house_id', roomGhId)
    formData.append('room_number', roomNumber)
    formData.append('type', roomType)
    formData.append('capacity', roomCapacity.toString())
    formData.append('tariff_internal', roomTariffInternal.toString())
    formData.append('tariff_external', roomTariffExternal.toString())
    formData.append('status', roomStatus)

    startTransition(async () => {
      let res
      if (editingRoom) {
        res = await updateRoom(editingRoom.id, formData)
      } else {
        res = await createRoom(formData)
      }

      if (res.error) {
        alert(res.error)
      } else {
        setShowRoomModal(false)
        router.refresh()
      }
    })
  }

  const handleDeleteRoom = async (id: string) => {
    if (confirm('Are you sure you want to delete this room?')) {
      startTransition(async () => {
        const res = await deleteRoom(id)
        if (res.error) alert(res.error)
        else router.refresh()
      })
    }
  }

  // --- BOOKING STATUS OVERRIDES ---
  const handleAdminApproval = async (status: 'approved' | 'rejected') => {
    if (!selectedBooking) return
    startTransition(async () => {
      const res = await updateBookingStatus(
        selectedBooking.id,
        status,
        adminRemarks || 'Processed by Administrator Override',
        'manager' // override acts at coordinator level
      )
      if (res.error) {
        alert(res.error)
      } else {
        setSelectedBooking(null)
        setAdminRemarks('')
        router.refresh()
      }
    })
  }

  const handleAdminRefund = async (bookingId: string) => {
    if (confirm('Are you sure you want to trigger a refund for this booking payment?')) {
      startTransition(async () => {
        const res = await refundPayment(bookingId)
        if (res.error) alert(res.error)
        else router.refresh()
      })
    }
  }

  // Filter Bookings
  const filteredBookings = bookings.filter((b) => {
    if (bookingFilter === 'pending') {
      return b.status === 'pending_caretaker' || b.status === 'pending_manager'
    }
    if (bookingFilter === 'approved') return b.status === 'approved' || b.status === 'checked_in' || b.status === 'checked_out'
    if (bookingFilter === 'rejected') return b.status === 'rejected' || b.status === 'cancelled'
    return true
  })

  return (
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
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-semibold text-white">{user.user_metadata?.full_name || 'Admin User'}</span>
              <span className="text-xs text-rose-500 capitalize font-semibold flex items-center gap-1 justify-end">
                <Shield className="h-3 w-3" />
                System Admin
              </span>
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

      {/* Admin Panel */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Shield className="h-5 w-5 text-indigo-400" />
              Administrative Operations
            </h1>
            <p className="text-slate-400 text-sm">Configure locations, manage rooms, audit activities, and coordinate bookings.</p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap p-1 bg-slate-900 border border-slate-800 rounded-xl w-fit">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-300 ${
                activeTab === 'overview' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('guesthouses')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-300 ${
                activeTab === 'guesthouses' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Guest Houses
            </button>
            <button
              onClick={() => setActiveTab('rooms')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-300 ${
                activeTab === 'rooms' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Rooms
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-300 ${
                activeTab === 'bookings' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Bookings
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-300 ${
                activeTab === 'audit' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Audit Trail
            </button>
          </div>
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5 flex items-center gap-4">
                <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/10">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 block font-medium">Guest Houses</span>
                  <span className="text-2xl font-bold text-white">{guestHouses.length}</span>
                </div>
              </div>

              <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5 flex items-center gap-4">
                <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/10">
                  <Home className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 block font-medium">Registered Rooms</span>
                  <span className="text-2xl font-bold text-white">{rooms.length}</span>
                </div>
              </div>

              <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5 flex items-center gap-4">
                <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/10">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 block font-medium">Pending Approvals</span>
                  <span className="text-2xl font-bold text-white">{pendingApprovalsCount}</span>
                </div>
              </div>

              <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5 flex items-center gap-4">
                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/10">
                  <DollarSign className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 block font-medium">Total Revenue</span>
                  <span className="text-2xl font-bold text-white">₹{totalRevenue}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-slate-900/20 border border-slate-900 rounded-3xl p-6">
              <h2 className="text-lg font-bold text-white mb-4">Quick Panel Actions</h2>
              <div className="flex flex-wrap gap-4">
                <Button onClick={() => handleOpenGhModal()} className="bg-indigo-600 hover:bg-indigo-500 text-white gap-1.5 py-2 px-4 rounded-xl cursor-pointer text-xs font-semibold">
                  <Plus className="h-4 w-4" /> Add Guest House
                </Button>
                <Button onClick={() => handleOpenRoomModal()} className="bg-indigo-600 hover:bg-indigo-500 text-white gap-1.5 py-2 px-4 rounded-xl cursor-pointer text-xs font-semibold">
                  <Plus className="h-4 w-4" /> Add Room
                </Button>
                <Button onClick={() => setActiveTab('bookings')} variant="outline" className="border-slate-800 text-slate-300 hover:bg-slate-900 gap-1.5 py-2 px-4 rounded-xl cursor-pointer text-xs font-semibold">
                  Review Booking Applications
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* GUEST HOUSES TAB */}
        {activeTab === 'guesthouses' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-white">Registered Locations</h2>
              <Button onClick={() => handleOpenGhModal()} className="bg-indigo-600 hover:bg-indigo-500 text-white gap-1 py-1.5 px-3 rounded-lg text-xs font-semibold cursor-pointer">
                <Plus className="h-3.5 w-3.5" /> Add Location
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {guestHouses.map((gh) => (
                <div key={gh.id} className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white mb-1.5">{gh.name}</h3>
                    <p className="text-xs text-indigo-400 font-semibold mb-3 flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {gh.location}
                    </p>
                    <p className="text-xs text-slate-400 line-clamp-3 mb-4 leading-relaxed">{gh.description || 'No description provided.'}</p>
                    <div className="text-xs text-slate-500 space-y-1.5 mb-6">
                      <p><span className="font-semibold text-slate-400">Caretaker:</span> {gh.caretaker?.full_name || 'Unassigned'}</p>
                      <p><span className="font-semibold text-slate-400">Facilities:</span> {gh.facilities?.join(', ') || 'None'}</p>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-slate-950">
                    <Button onClick={() => handleOpenGhModal(gh)} variant="outline" size="sm" className="flex-1 justify-center border-slate-800 text-slate-350 hover:bg-slate-950 rounded-xl cursor-pointer">
                      <Edit2 className="h-3 w-3 mr-1" /> Edit
                    </Button>
                    <Button onClick={() => handleDeleteGh(gh.id)} variant="destructive" size="sm" className="flex-1 justify-center rounded-xl cursor-pointer">
                      <Trash2 className="h-3 w-3 mr-1" /> Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ROOMS TAB */}
        {activeTab === 'rooms' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-white">Guest House Rooms</h2>
              <Button onClick={() => handleOpenRoomModal()} className="bg-indigo-600 hover:bg-indigo-500 text-white gap-1 py-1.5 px-3 rounded-lg text-xs font-semibold cursor-pointer">
                <Plus className="h-3.5 w-3.5" /> Add Room
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.map((room) => {
                const ghName = guestHouses.find((g) => g.id === room.guest_house_id)?.name || 'Guest House'
                return (
                  <div key={room.id} className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <h3 className="text-base font-bold text-white">Room {room.room_number}</h3>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-md">
                          {room.type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mb-3">{ghName}</p>
                      <div className="space-y-1.5 text-xs text-slate-400 mb-6">
                        <p>Capacity: {room.capacity} Persons</p>
                        <p>Internal Tariff: ₹{room.tariff_internal} / Night</p>
                        <p>External Tariff: ₹{room.tariff_external} / Night</p>
                        <p>
                          Status:{' '}
                          <span className={`capitalize font-semibold ${
                            room.status === 'available' ? 'text-emerald-400' : room.status === 'maintenance' ? 'text-rose-400' : 'text-slate-500'
                          }`}>
                            {room.status}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-slate-950">
                      <Button onClick={() => handleOpenRoomModal(room)} variant="outline" size="sm" className="flex-1 justify-center border-slate-800 text-slate-350 hover:bg-slate-950 rounded-xl cursor-pointer">
                        <Edit2 className="h-3 w-3 mr-1" /> Edit
                      </Button>
                      <Button onClick={() => handleDeleteRoom(room.id)} variant="destructive" size="sm" className="flex-1 justify-center rounded-xl cursor-pointer">
                        <Trash2 className="h-3 w-3 mr-1" /> Delete
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* BOOKINGS TAB */}
        {activeTab === 'bookings' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-lg font-bold text-white">Booking Applications</h2>
              {/* Filter */}
              <div className="flex p-1 bg-slate-900 border border-slate-800 rounded-lg w-fit text-xs">
                <button onClick={() => setBookingFilter('all')} className={`px-3 py-1.5 rounded-md ${bookingFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400'}`}>All</button>
                <button onClick={() => setBookingFilter('pending')} className={`px-3 py-1.5 rounded-md ${bookingFilter === 'pending' ? 'bg-slate-800 text-white' : 'text-slate-400'}`}>Pending</button>
                <button onClick={() => setBookingFilter('approved')} className={`px-3 py-1.5 rounded-md ${bookingFilter === 'approved' ? 'bg-slate-800 text-white' : 'text-slate-400'}`}>Active/Paid</button>
                <button onClick={() => setBookingFilter('rejected')} className={`px-3 py-1.5 rounded-md ${bookingFilter === 'rejected' ? 'bg-slate-800 text-white' : 'text-slate-400'}`}>Archived</button>
              </div>
            </div>

            <div className="border border-slate-900 rounded-2xl overflow-hidden bg-slate-900/10">
              {filteredBookings.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">No bookings found matching filter criteria.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-900 bg-slate-900/30 text-slate-400 uppercase tracking-wider font-semibold">
                        <th className="p-4">Reference</th>
                        <th className="p-4">Guest Info</th>
                        <th className="p-4">Accomodation</th>
                        <th className="p-4">Dates</th>
                        <th className="p-4">Amount</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900">
                      {filteredBookings.map((b) => {
                        const isPendingApproval = b.status === 'pending_caretaker' || b.status === 'pending_manager'
                        return (
                          <tr key={b.id} className="hover:bg-slate-900/20 text-slate-350">
                            <td className="p-4 font-bold text-white">#{b.id.substring(0, 8).toUpperCase()}</td>
                            <td className="p-4">
                              <span className="text-white block font-medium">{b.guest?.full_name}</span>
                              <span className="text-[10px] text-slate-500 block">{b.guest?.phone}</span>
                            </td>
                            <td className="p-4">
                              <span className="text-white block">{b.guest_house?.name}</span>
                              <span className="text-slate-500">Room {b.room?.room_number}</span>
                            </td>
                            <td className="p-4">
                              <span>{b.check_in} to {b.check_out}</span>
                            </td>
                            <td className="p-4 font-bold text-white">₹{b.total_amount}</td>
                            <td className="p-4">
                              <span className="capitalize">{b.status.replace('_', ' ')}</span>
                              <span className="block text-[10px] text-slate-500 capitalize">{b.payment_status} payment</span>
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex gap-2 justify-end">
                                {isPendingApproval && (
                                  <Button onClick={() => setSelectedBooking(b)} size="xs" className="bg-indigo-600 hover:bg-indigo-500 text-white rounded px-2.5 py-1 cursor-pointer">
                                    Process
                                  </Button>
                                )}
                                {b.payment_status === 'paid' && (
                                  <Button onClick={() => handleAdminRefund(b.id)} variant="destructive" size="xs" className="rounded px-2.5 py-1 cursor-pointer">
                                    Refund
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* AUDIT TRAIL TAB */}
        {activeTab === 'audit' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h2 className="text-lg font-bold text-white">Database Audit Trail</h2>
            <div className="bg-slate-900/10 border border-slate-900 rounded-2xl p-4 overflow-hidden">
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {auditLogs.length === 0 ? (
                  <p className="text-slate-500 text-center text-sm py-4">Audit log is currently empty.</p>
                ) : (
                  auditLogs.map((log) => (
                    <div key={log.id} className="p-3 bg-slate-950/40 border border-slate-900 rounded-xl text-xs flex justify-between gap-4">
                      <div>
                        <span className="font-semibold text-indigo-400 capitalize block mb-0.5">{log.action.replace('_', ' ')}</span>
                        <span className="text-slate-500">Performed by: {log.user?.full_name || 'System'}</span>
                        <pre className="text-[10px] text-slate-650 mt-1 font-mono">{JSON.stringify(log.details)}</pre>
                      </div>
                      <span className="text-[10px] text-slate-500 self-center shrink-0">
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* GUEST HOUSE EDIT MODAL */}
      {showGhModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-slate-900 border border-slate-850 rounded-3xl p-6 shadow-2xl relative">
            <button onClick={() => setShowGhModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
            <h2 className="text-lg font-bold text-white mb-6">{editingGh ? 'Edit Guest House' : 'Create Guest House'}</h2>
            <form onSubmit={handleSaveGh} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Name</label>
                <input required value={ghName} onChange={(e) => setGhName(e.target.value)} type="text" className="block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Location</label>
                <input required value={ghLocation} onChange={(e) => setGhLocation(e.target.value)} type="text" className="block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Description</label>
                <textarea rows={3} value={ghDescription} onChange={(e) => setGhDescription(e.target.value)} className="block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Caretaker Assignment</label>
                <select value={ghCaretakerId} onChange={(e) => setGhCaretakerId(e.target.value)} className="block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white">
                  <option value="">Unassigned</option>
                  {staffProfiles.map((p) => (
                    <option key={p.id} value={p.id}>{p.full_name} ({p.role})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Facilities (comma separated)</label>
                <input placeholder="WiFi, AC, Catering" value={ghFacilities} onChange={(e) => setGhFacilities(e.target.value)} type="text" className="block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white" />
              </div>
              <Button type="submit" disabled={isPending} className="w-full justify-center bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-2 cursor-pointer">{isPending ? 'Saving...' : 'Save Location'}</Button>
            </form>
          </div>
        </div>
      )}

      {/* ROOM EDIT MODAL */}
      {showRoomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-slate-900 border border-slate-850 rounded-3xl p-6 shadow-2xl relative">
            <button onClick={() => setShowRoomModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
            <h2 className="text-lg font-bold text-white mb-6">{editingRoom ? 'Edit Room' : 'Create Room'}</h2>
            <form onSubmit={handleSaveRoom} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Guest House</label>
                <select value={roomGhId} onChange={(e) => setRoomGhId(e.target.value)} className="block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white">
                  {guestHouses.map((gh) => <option key={gh.id} value={gh.id}>{gh.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Room Number</label>
                <input required value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} type="text" className="block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Type</label>
                  <select value={roomType} onChange={(e) => setRoomType(e.target.value)} className="block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white">
                    <option value="suite">Suite</option>
                    <option value="deluxe">Deluxe</option>
                    <option value="standard">Standard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Capacity</label>
                  <input required type="number" value={roomCapacity} onChange={(e) => setRoomCapacity(parseInt(e.target.value) || 2)} className="block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Tariff (Internal)</label>
                  <input required type="number" value={roomTariffInternal} onChange={(e) => setRoomTariffInternal(parseFloat(e.target.value) || 0)} className="block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Tariff (External)</label>
                  <input required type="number" value={roomTariffExternal} onChange={(e) => setRoomTariffExternal(parseFloat(e.target.value) || 0)} className="block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Status</label>
                <select value={roomStatus} onChange={(e) => setRoomStatus(e.target.value)} className="block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white">
                  <option value="available">Available</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="occupied">Occupied</option>
                </select>
              </div>
              <Button type="submit" disabled={isPending} className="w-full justify-center bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-2.5 cursor-pointer">{isPending ? 'Saving...' : 'Save Room'}</Button>
            </form>
          </div>
        </div>
      )}

      {/* BOOKING APPROVAL OVERRIDE MODAL */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-slate-900 border border-slate-850 rounded-3xl p-6 shadow-2xl relative">
            <button onClick={() => setSelectedBooking(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
            <h2 className="text-lg font-bold text-white mb-1">Process Booking Application</h2>
            <p className="text-xs text-slate-400 mb-6">Reviewing request #{selectedBooking.id.substring(0, 8).toUpperCase()}</p>
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1.5">
                <p><span className="font-semibold text-white">Guest:</span> {selectedBooking.guest?.full_name} ({selectedBooking.guest?.phone})</p>
                <p><span className="font-semibold text-white">Guest House:</span> {selectedBooking.guest_house?.name}</p>
                <p><span className="font-semibold text-white">Dates:</span> {selectedBooking.check_in} to {selectedBooking.check_out}</p>
                <p><span className="font-semibold text-white">Total Amount:</span> ₹{selectedBooking.total_amount}</p>
                <p><span className="font-semibold text-white">Purpose:</span> {selectedBooking.purpose}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Administrative Remarks</label>
                <textarea rows={3} placeholder="Provide reasons/comments for approval decision..." value={adminRemarks} onChange={(e) => setAdminRemarks(e.target.value)} className="block w-full px-3 py-2 bg-slate-955 border border-slate-800 rounded-xl text-xs text-white" />
              </div>
              <div className="flex gap-4 pt-2">
                <Button onClick={() => handleAdminApproval('approved')} className="flex-1 justify-center bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl py-2 cursor-pointer font-semibold text-xs">Approve</Button>
                <Button onClick={() => handleAdminApproval('rejected')} className="flex-1 justify-center bg-rose-600 hover:bg-rose-500 text-white rounded-xl py-2 cursor-pointer font-semibold text-xs">Reject</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
