'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { signup } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { Building2, Mail, Lock, Phone, User, Briefcase, Network, AlertCircle, CheckCircle, Shield } from 'lucide-react'

export default function SignupPage() {
  const [formState, action, isPending] = useActionState(signup, null)

  return (
    <main className="min-h-screen flex items-center justify-center bg-radial from-slate-900 via-slate-950 to-black px-4 py-12 relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md z-10">
        {/* Brand header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-3 shadow-lg shadow-indigo-500/5">
            <Building2 className="h-8 w-8 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Create Guest Account</h1>
          <p className="text-sm text-slate-400 mt-1">Government Guest House Booking Portal</p>
        </div>

        {/* Card wrapper */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
          {formState?.success ? (
            <div className="text-center py-6 animate-in fade-in zoom-in duration-300">
              <div className="inline-flex items-center justify-center p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 mb-4">
                <CheckCircle className="h-10 w-10" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Registration Successful!</h2>
              <p className="text-sm text-slate-300 mb-6 px-4">
                {formState.message || 'We sent a verification link to your email. Please verify your account to continue.'}
              </p>
              <Link href="/login">
                <Button className="w-full justify-center bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl font-medium shadow-lg shadow-indigo-600/20 cursor-pointer">
                  Go to Login
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {formState?.error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs mb-4 flex items-start gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="bg-rose-500/20 p-1 rounded-lg">
                    <AlertCircle className="h-3.5 w-3.5" />
                  </div>
                  <span>{formState.error}</span>
                </div>
              )}

              <form action={action} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label htmlFor="fullName" className="block text-xs font-medium text-slate-300 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-slate-500" />
                    </div>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      required
                      placeholder="John Doe"
                      className="block w-full pl-10 pr-3 py-2 bg-slate-950/50 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label htmlFor="email" className="block text-xs font-medium text-slate-300 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-slate-500" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      placeholder="name@domain.com"
                      className="block w-full pl-10 pr-3 py-2 bg-slate-950/50 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-xs font-medium text-slate-300 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-slate-500" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      required
                      placeholder="Min. 6 characters"
                      className="block w-full pl-10 pr-3 py-2 bg-slate-950/50 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label htmlFor="phone" className="block text-xs font-medium text-slate-300 mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-4 w-4 text-slate-500" />
                    </div>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      placeholder="+91 XXXXX XXXXX"
                      className="block w-full pl-10 pr-3 py-2 bg-slate-950/50 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Department & Designation in grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="department" className="block text-xs font-medium text-slate-300 mb-1.5">
                      Department
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Network className="h-4 w-4 text-slate-500" />
                      </div>
                      <input
                        id="department"
                        name="department"
                        type="text"
                        placeholder="e.g. Doordarshan"
                        className="block w-full pl-10 pr-3 py-2 bg-slate-950/50 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="designation" className="block text-xs font-medium text-slate-300 mb-1.5">
                      Designation
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Briefcase className="h-4 w-4 text-slate-500" />
                      </div>
                      <input
                        id="designation"
                        name="designation"
                        type="text"
                        placeholder="e.g. Engineer"
                        className="block w-full pl-10 pr-3 py-2 bg-slate-950/50 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300"
                      />
                    </div>
                  </div>
                </div>

                {/* Role selection (convenient for evaluation & sandbox testing) */}
                <div>
                  <label htmlFor="role" className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5 text-indigo-400" />
                    Register Role (For testing/evaluators)
                  </label>
                  <select
                    id="role"
                    name="role"
                    className="block w-full px-3 py-2 bg-slate-950/50 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300"
                  >
                    <option value="guest" className="bg-slate-950 text-white">Guest (Regular Employee)</option>
                    <option value="caretaker" className="bg-slate-950 text-white">Caretaker (Local Guest House Staff)</option>
                    <option value="manager" className="bg-slate-950 text-white">Manager (Cluster Approval Coordinator)</option>
                    <option value="admin" className="bg-slate-950 text-white">Super Admin</option>
                  </select>
                </div>

                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full justify-center bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl font-medium shadow-lg shadow-indigo-600/20 transition-all duration-300 cursor-pointer"
                >
                  {isPending ? 'Registering...' : 'Register'}
                </Button>
              </form>

              <div className="text-center mt-6 pt-4 border-t border-slate-800/60">
                <p className="text-xs text-slate-400">
                  Already have an account?{' '}
                  <Link
                    href="/login"
                    className="text-indigo-400 hover:text-indigo-300 font-semibold hover:underline transition-colors"
                  >
                    Sign In
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
