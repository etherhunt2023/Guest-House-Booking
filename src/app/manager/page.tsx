import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { logout } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { Building2, Shield, LogOut, FileText, CheckCircle2, TrendingUp } from 'lucide-react'

export default async function ManagerDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const role = user.user_metadata?.role || 'guest'
  const fullName = user.user_metadata?.full_name || 'Manager User'

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
              <span className="text-xs text-sky-500 capitalize font-semibold flex items-center gap-1 justify-end">
                <Shield className="h-3 w-3" />
                {role}
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

      {/* Main dashboard content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="h-5 w-5 text-indigo-400" />
            <h1 className="text-2xl font-bold text-white">Cluster Coordinator Controls</h1>
          </div>
          <p className="text-slate-400 text-sm">Cluster-wide booking oversight, final approval workflows, and reports.</p>
        </div>

        {/* Dashboard Stats Placeholders */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/10">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Pending Cluster Approvals</span>
              <span className="text-2xl font-bold text-white">0</span>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/10">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Approved Bookings (This Month)</span>
              <span className="text-2xl font-bold text-white">0</span>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/10">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Occupancy Rate</span>
              <span className="text-2xl font-bold text-white">0%</span>
            </div>
          </div>
        </div>

        {/* Informational Box */}
        <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6">
          <h2 className="text-base font-semibold text-white mb-3">Cluster Level Approvals</h2>
          <p className="text-sm text-slate-400 mb-4 leading-relaxed">
            As a Cluster Coordinator, you are responsible for the second/final approval layer (Phase 7), monitoring cluster-wide guest house occupancy calendars (Phase 8), and generating cluster-wide monthly reports (Phase 12).
          </p>
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-500/10 text-sky-400 border border-sky-500/20">
            Manager View
          </div>
        </div>
      </main>
    </div>
  )
}
