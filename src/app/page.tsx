import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Building2, ShieldCheck, HelpCircle, ArrowRight, Star, Coffee, Wifi, MapPin } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Header */}
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
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-slate-400 hover:text-slate-200 transition-colors">Facilities</a>
            <a href="#destinations" className="text-sm text-slate-400 hover:text-slate-200 transition-colors">Locations</a>
            <a href="#help" className="text-sm text-slate-400 hover:text-slate-200 transition-colors">Helpdesk</a>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2 rounded-xl transition-all duration-300 shadow-lg shadow-indigo-600/10 cursor-pointer">
                Access Portal
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden flex-1 flex flex-col justify-center">
        {/* Glowing background shapes */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-10 right-10 w-[300px] h-[300px] bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-6">
            <ShieldCheck className="h-3.5 w-3.5" />
            Official Booking Channel
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-none max-w-4xl mx-auto">
            Government Guest House Booking Portal
          </h1>
          <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Exclusively for Prasar Bharati (Doordarshan & Akashvani) officers, staff, and guests. Reserve accommodations seamlessly across Dehradun cluster locations.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/login">
              <Button size="lg" className="w-full sm:w-auto justify-center bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-xl font-semibold shadow-xl shadow-indigo-600/20 transition-all duration-300 cursor-pointer">
                Book Accommodations
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="lg" variant="outline" className="w-full sm:w-auto justify-center border-slate-800 text-slate-300 hover:bg-slate-900 px-8 py-4 rounded-xl font-semibold transition-all duration-300 cursor-pointer">
                Create Guest Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Highlights / Features */}
      <section id="features" className="py-20 border-t border-slate-900 bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Premium Amenities & Facilities</h2>
            <p className="text-slate-500 text-sm mt-2">Expect high standards of service and comfort during your official visits.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-6 hover:border-slate-800 transition-all duration-300">
              <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl w-fit mb-4">
                <Coffee className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Catering Service</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Freshly prepared home-style meals and beverages served at the dining halls or via room service.
              </p>
            </div>

            <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-6 hover:border-slate-800 transition-all duration-300">
              <div className="p-3 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-xl w-fit mb-4">
                <Wifi className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">High-Speed WiFi</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Stay connected with high-speed internet access in common lounge spaces and guest suites.
              </p>
            </div>

            <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-6 hover:border-slate-800 transition-all duration-300">
              <div className="p-3 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl w-fit mb-4">
                <Star className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Comfortable Suites</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Air-conditioned suites, room heaters, attached bathrooms, and smart televisions for your leisure.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Destinations Section */}
      <section id="destinations" className="py-20 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Cluster Locations</h2>
            <p className="text-slate-500 text-sm mt-2">Available guest houses under the Prasar Bharati Dehradun Cluster.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-slate-900/20 border border-slate-900 rounded-2xl p-5 hover:border-indigo-500/20 transition-all duration-300">
              <MapPin className="h-5 w-5 text-indigo-400 mb-3" />
              <h3 className="font-semibold text-white">Dehradun</h3>
              <p className="text-xs text-slate-500 mt-1">Main Headquarter cluster office guest house.</p>
            </div>
            <div className="bg-slate-900/20 border border-slate-900 rounded-2xl p-5 hover:border-indigo-500/20 transition-all duration-300">
              <MapPin className="h-5 w-5 text-indigo-400 mb-3" />
              <h3 className="font-semibold text-white">Mussoorie</h3>
              <p className="text-xs text-slate-500 mt-1">Hill-station guest house adjacent to the TV tower facility.</p>
            </div>
            <div className="bg-slate-900/20 border border-slate-900 rounded-2xl p-5 hover:border-indigo-500/20 transition-all duration-300">
              <MapPin className="h-5 w-5 text-indigo-400 mb-3" />
              <h3 className="font-semibold text-white">Haridwar</h3>
              <p className="text-xs text-slate-500 mt-1">Ganges-cluster transit house for touring officials.</p>
            </div>
            <div className="bg-slate-900/20 border border-slate-900 rounded-2xl p-5 hover:border-indigo-500/20 transition-all duration-300">
              <MapPin className="h-5 w-5 text-indigo-400 mb-3" />
              <h3 className="font-semibold text-white">Rishikesh</h3>
              <p className="text-xs text-slate-500 mt-1">Yoga Capital cluster transit guest house.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="help" className="border-t border-slate-900 bg-slate-950 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-slate-500" />
            <span className="text-xs text-slate-500">© 2026 Prasar Bharati Cluster. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <HelpCircle className="h-3.5 w-3.5" />
              Support desk: support.dehradun@prasarbharati.gov.in
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}
