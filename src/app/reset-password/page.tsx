'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { resetPassword } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { Building2, Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'

export default function ResetPasswordPage() {
  const [formState, action, isPending] = useActionState(resetPassword, null)

  return (
    <main className="min-h-screen flex items-center justify-center bg-radial from-slate-900 via-slate-950 to-black px-4 relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md z-10">
        {/* Brand logo & header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-3 shadow-lg shadow-indigo-500/5">
            <Building2 className="h-8 w-8 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Reset Password</h1>
          <p className="text-sm text-slate-400 mt-1">Government Guest House Booking Portal</p>
        </div>

        {/* Card wrapper */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
          {formState?.success ? (
            <div className="text-center py-6 animate-in fade-in zoom-in duration-300">
              <div className="inline-flex items-center justify-center p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 mb-4">
                <CheckCircle className="h-10 w-10" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Check Your Email</h2>
              <p className="text-sm text-slate-300 mb-6 px-4">
                {formState.message || 'We sent a password reset link to your email. Please check your inbox and spam folder.'}
              </p>
              <Link href="/login">
                <Button className="w-full justify-center bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl font-medium shadow-lg shadow-indigo-600/20 cursor-pointer">
                  Back to Login
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-white">Request Password Reset</h2>
                <p className="text-xs text-slate-400">
                  Enter your email address and we will send you a link to reset your password.
                </p>
              </div>

              {formState?.error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs mb-4 flex items-start gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="bg-rose-500/20 p-1 rounded-lg">
                    <AlertCircle className="h-3.5 w-3.5" />
                  </div>
                  <span>{formState.error}</span>
                </div>
              )}

              <form action={action} className="space-y-4">
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
                      className="block w-full pl-10 pr-3 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full justify-center bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl font-medium shadow-lg shadow-indigo-600/20 transition-all duration-300 cursor-pointer"
                >
                  {isPending ? 'Sending Link...' : 'Send Reset Link'}
                </Button>
              </form>

              <div className="text-center mt-6 pt-4 border-t border-slate-800/60">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold hover:underline transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
