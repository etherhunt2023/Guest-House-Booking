'use client'

import { useActionState, useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { login } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { Shield, Mail, Lock, AlertCircle, Building2, User } from 'lucide-react'

function LoginForm() {
  const searchParams = useSearchParams()
  const errorParam = searchParams.get('error')
  const messageParam = searchParams.get('message')

  const [activeTab, setActiveTab] = useState<'guest' | 'admin'>('guest')
  const [formState, action, isPending] = useActionState(login, null)

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
          <h1 className="text-2xl font-bold tracking-tight text-white">Prasar Bharati Cluster</h1>
          <p className="text-sm text-slate-400 mt-1">Government Guest House Booking Portal</p>
        </div>

        {/* Card wrapper */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
          {/* Tab selector */}
          <div className="flex p-1 bg-slate-950/80 rounded-2xl border border-slate-900 mb-6">
            <button
              onClick={() => setActiveTab('guest')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-xl transition-all duration-300 ${
                activeTab === 'guest'
                  ? 'bg-slate-800 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="h-3.5 w-3.5" />
              Guest / User
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-xl transition-all duration-300 ${
                activeTab === 'admin'
                  ? 'bg-slate-800 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Shield className="h-3.5 w-3.5" />
              Administrative
            </button>
          </div>

          <div className="mb-4">
            <h2 className="text-lg font-semibold text-white">
              {activeTab === 'guest' ? 'Guest Login' : 'Officer / Staff Login'}
            </h2>
            <p className="text-xs text-slate-400">
              {activeTab === 'guest'
                ? 'Sign in to book guest house rooms.'
                : 'Sign in for Caretaker, Manager, or Admin dashboard.'}
            </p>
          </div>

          {/* Feedback messages */}
          {messageParam && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs mb-4 flex items-start gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="bg-emerald-500/20 p-1 rounded-lg">
                <AlertCircle className="h-3.5 w-3.5" />
              </div>
              <span>{messageParam}</span>
            </div>
          )}

          {errorParam === 'auth-code-exchange-failed' && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs mb-4 flex items-start gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="bg-rose-500/20 p-1 rounded-lg">
                <AlertCircle className="h-3.5 w-3.5" />
              </div>
              <span>The authentication link is invalid or has expired. Please log in again.</span>
            </div>
          )}

          {formState?.error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs mb-4 flex items-start gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="bg-rose-500/20 p-1 rounded-lg">
                <AlertCircle className="h-3.5 w-3.5" />
              </div>
              <span>{formState.error}</span>
            </div>
          )}

          {/* Form */}
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

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="password" className="block text-xs font-medium text-slate-300">
                  Password
                </label>
                <Link
                  href="/reset-password"
                  className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="w-full justify-center bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl font-medium shadow-lg shadow-indigo-600/20 transition-all duration-300 cursor-pointer"
            >
              {isPending ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Guest Sign Up option */}
          {activeTab === 'guest' && (
            <div className="text-center mt-6 pt-4 border-t border-slate-800/60">
              <p className="text-xs text-slate-400">
                New guest?{' '}
                <Link
                  href="/signup"
                  className="text-indigo-400 hover:text-indigo-300 font-semibold hover:underline transition-colors"
                >
                  Create an account
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center bg-radial from-slate-900 via-slate-950 to-black px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-slate-400 text-sm font-medium">Loading portal...</p>
        </div>
      </main>
    }>
      <LoginForm />
    </Suspense>
  )
}
