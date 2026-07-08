import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { logout } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { Building2, User, LogOut, Calendar, Home, History } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const role = user.user_metadata?.role || 'guest'
  const fullName = user.user_metadata?.full_name || 'Guest User'
  const email = user.email
  const department = user.user_metadata?.department || 'N/A'
  const designation = user.user_metadata?.designation || 'N/A'

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
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
              <span className="text-sm font-semibold text-white">{fullName}</span>
              <span className="text-xs text-slate-500 capitalize">{role} Account</span>
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

      {/* Main content grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Welcome back, {fullName}</h1>
          <p className="text-slate-400 text-sm">Manage your guest house reservations and applications.</p>
        </div>

        {/* Profile Card & Shortcuts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* User profile info */}
          <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 md:col-span-1">
            <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <User className="h-4 w-4 text-indigo-400" />
              Profile Details
            </h2>
            <div className="space-y-3.5">
              <div>
                <span className="text-slate-500 text-xs block">Email Address</span>
                <span className="text-sm text-slate-200">{email}</span>
              </div>
              <div>
                <span className="text-slate-500 text-xs block">Department</span>
                <span className="text-sm text-slate-200">{department}</span>
              </div>
              <div>
                <span className="text-slate-500 text-xs block">Designation</span>
                <span className="text-sm text-slate-200">{designation}</span>
              </div>
              <div>
                <span className="text-slate-500 text-xs block">Account Authorization Role</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 capitalize mt-1">
                  {role}
                </span>
              </div>
            </div>
          </div>

          {/* Quick actions & bookings stub */}
          <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 md:col-span-2 flex flex-col justify-between">
            <div>
              <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-indigo-400" />
                Active Bookings
              </h2>
              <div className="border border-dashed border-slate-800 rounded-xl p-8 text-center text-slate-500">
                <Home className="h-8 w-8 mx-auto text-slate-600 mb-3" />
                <p className="text-sm">No active reservations found.</p>
                <p className="text-xs text-slate-600 mt-1">New booking requests can be made in Phase 6.</p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-900 flex flex-wrap gap-3">
              <Button disabled size="sm" className="bg-indigo-600 text-white cursor-pointer">
                New Booking Request
              </Button>
              <Button disabled size="sm" variant="outline" className="text-slate-300 border-slate-800 hover:bg-slate-900 cursor-pointer">
                <History className="h-3.5 w-3.5" />
                View Booking History
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
