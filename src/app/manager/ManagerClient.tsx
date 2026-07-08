'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { updateBookingStatus } from '@/app/actions/admin'
import { logout } from '@/app/auth/actions'
import {
  Building2,
  Shield,
  LogOut,
  CheckCircle2,
  X,
  Clock,
  FileText,
  Calendar,
  DollarSign
} from 'lucide-react'
import { User } from '@supabase/supabase-js'
import { Booking } from '@/types/database'

interface ManagerClientProps {
  user: User
  bookings: Booking[]
}

export default function ManagerClient({ user, bookings }: ManagerClientProps) {
  const router = useRouter()
  const [, startTransition] = useTransition()

  // Tabs
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending')

  // Remarks state
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [managerRemarks, setManagerRemarks] = useState('')

  // Process Manager action
  const handleManagerApproval = async (status: 'approved' | 'rejected') => {
    if (!selectedBooking) return
    startTransition(async () => {
      const res = await updateBookingStatus(
        selectedBooking.id,
        status,
        managerRemarks || `Processed by Manager ${user.user_metadata?.full_name}`,
        'manager'
      )
      if (res.error) {
        alert(res.error)
      } else {
        setSelectedBooking(null)
        setManagerRemarks('')
        router.refresh()
      }
    })
  }

  // Filter bookings
  const pendingBookings = bookings.filter((b) => b.status === 'pending_manager')

  // Stats
  const totalRevenue = bookings
    .filter((b) => b.payment_status === 'paid')
    .reduce((sum, b) => sum + (b.total_amount || 0), 0)

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
              <span className="text-sm font-semibold text-white">{user.user_metadata?.full_name || 'Manager'}</span>
              <span className="text-xs text-sky-500 capitalize font-semibold flex items-center gap-1 justify-end">
                <Shield className="h-3 w-3" />
                Cluster Manager
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

      {/* Main dashboard body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-indigo-400" />
              Cluster Coordinator Controls
            </h1>
            <p className="text-slate-400 text-sm">Cluster-wide booking oversight, final approval workflows, and revenue reviews.</p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex p-1 bg-slate-900 border border-slate-800 rounded-xl w-fit">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-300 relative ${
                activeTab === 'pending' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Pending Approvals
              {pendingBookings.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold">
                  {pendingBookings.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-300 ${
                activeTab === 'all' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Cluster Bookings
            </button>
          </div>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/10">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Pending Final Approval</span>
              <span className="text-2xl font-bold text-white">{pendingBookings.length}</span>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/10">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Total Approved bookings</span>
              <span className="text-2xl font-bold text-white">{bookings.filter((b) => b.status === 'approved').length}</span>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/10">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Total Revenue (Captured)</span>
              <span className="text-2xl font-bold text-white">₹{totalRevenue}</span>
            </div>
          </div>
        </div>

        {/* PENDING APPROVALS TAB */}
        {activeTab === 'pending' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {pendingBookings.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-900 rounded-2xl text-slate-500">
                <CheckCircle2 className="h-10 w-10 mx-auto text-slate-700 mb-3" />
                <p>No bookings awaiting final cluster approval.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pendingBookings.map((b) => (
                  <div key={b.id} className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-white">Ref: #{b.id.substring(0, 8).toUpperCase()}</span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          <Clock className="h-3 w-3" /> Pending Final Review
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 space-y-1">
                        <p><span className="font-semibold text-slate-300">Guest:</span> {b.guest?.full_name} ({b.guest?.phone})</p>
                        <p><span className="font-semibold text-slate-300">Department/Designation:</span> {b.guest?.department || 'N/A'} - {b.guest?.designation || 'N/A'}</p>
                        <p><span className="font-semibold text-slate-300">Location:</span> {b.guest_house?.name}</p>
                        <p><span className="font-semibold text-slate-300">Room:</span> Room {b.room?.room_number} ({b.room?.type})</p>
                        <p><span className="font-semibold text-slate-300">Dates:</span> {b.check_in} to {b.check_out}</p>
                        <p><span className="font-semibold text-slate-300">Amount:</span> ₹{b.total_amount}</p>
                        <p><span className="font-semibold text-slate-300">Purpose:</span> {b.purpose}</p>
                        {b.caretaker_remarks && (
                          <p className="p-2 bg-slate-950/65 rounded border border-slate-850 mt-2 text-[11px]">
                            <span className="font-semibold text-indigo-400 block">Caretaker Recommendation Remarks:</span>
                            {b.caretaker_remarks}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button onClick={() => setSelectedBooking(b)} className="w-full justify-center bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs py-2 mt-4 cursor-pointer">
                      Review & Approve
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ALL BOOKINGS TAB */}
        {activeTab === 'all' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {bookings.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-900 rounded-2xl text-slate-500">
                <Calendar className="h-10 w-10 mx-auto text-slate-700 mb-3" />
                <p>No bookings registered in the cluster.</p>
              </div>
            ) : (
              <div className="border border-slate-900 rounded-2xl overflow-hidden bg-slate-900/10">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-900 bg-slate-900/30 text-slate-400 uppercase tracking-wider font-semibold">
                        <th className="p-4">Reference</th>
                        <th className="p-4">Guest</th>
                        <th className="p-4">Guest House</th>
                        <th className="p-4">Room</th>
                        <th className="p-4">Dates</th>
                        <th className="p-4">Amount</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Payment</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900 text-slate-350">
                      {bookings.map((b) => (
                        <tr key={b.id} className="hover:bg-slate-900/20">
                          <td className="p-4 font-bold text-white">#{b.id.substring(0, 8).toUpperCase()}</td>
                          <td className="p-4">
                            <span className="text-white block font-medium">{b.guest?.full_name}</span>
                            <span className="text-[10px] text-slate-500 block">{b.guest?.phone}</span>
                          </td>
                          <td className="p-4">{b.guest_house?.name}</td>
                          <td className="p-4">Room {b.room?.room_number} ({b.room?.type})</td>
                          <td className="p-4">{b.check_in} to {b.check_out}</td>
                          <td className="p-4 font-bold text-white">₹{b.total_amount}</td>
                          <td className="p-4 capitalize">{b.status.replace('_', ' ')}</td>
                          <td className="p-4 capitalize">{b.payment_status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* MANAGER DECISION MODAL */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-slate-900 border border-slate-850 rounded-3xl p-6 shadow-2xl relative">
            <button onClick={() => setSelectedBooking(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
            <h2 className="text-lg font-bold text-white mb-1">Process Final Approval</h2>
            <p className="text-xs text-slate-400 mb-6">Application #{selectedBooking.id.substring(0, 8).toUpperCase()}</p>
            
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1.5">
                <p><span className="font-semibold text-white">Guest Name:</span> {selectedBooking.guest?.full_name} ({selectedBooking.guest?.phone})</p>
                <p><span className="font-semibold text-white">Location:</span> {selectedBooking.guest_house?.name}</p>
                <p><span className="font-semibold text-white">Dates:</span> {selectedBooking.check_in} to {selectedBooking.check_out}</p>
                <p><span className="font-semibold text-white">Total Amount:</span> ₹{selectedBooking.total_amount}</p>
                <p><span className="font-semibold text-white">Purpose:</span> {selectedBooking.purpose}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Coordinator Remarks</label>
                <textarea
                  rows={3}
                  placeholder="Provide final comments for approval..."
                  value={managerRemarks}
                  onChange={(e) => setManagerRemarks(e.target.value)}
                  className="block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600"
                />
              </div>

              <div className="flex gap-4 pt-2">
                <Button onClick={() => handleManagerApproval('approved')} className="flex-1 justify-center bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl py-2 cursor-pointer font-semibold text-xs">Approve Application</Button>
                <Button onClick={() => handleManagerApproval('rejected')} className="flex-1 justify-center bg-rose-600 hover:bg-rose-500 text-white rounded-xl py-2 cursor-pointer font-semibold text-xs">Reject</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
