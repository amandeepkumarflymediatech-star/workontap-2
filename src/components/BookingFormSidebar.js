export default function BookingFormSidebar() {
  return (
    <aside className="w-full flex-shrink-0">
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-2xl border border-gray-100 sticky top-24 overflow-hidden relative">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-gradient-to-br from-green-50 to-green-100 rounded-full opacity-50 blur-2xl pointer-events-none"></div>

        <div className="relative z-10">
          <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-green-500/30 transform -rotate-3 hover:rotate-0 transition-transform">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>

          <h3 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">Ready to start?</h3>
          <p className="text-gray-500 text-sm mb-8 leading-relaxed">Fill out this quick form and we&apos;ll connect you with the right professional in minutes.</p>

          <form className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Full Name</label>
              <input type="text" className="w-full px-4 py-3 rounded-xl bg-gray-50 border-0 ring-1 ring-gray-200 focus:ring-2 focus:ring-green-500 transition-all outline-none text-sm text-gray-900 placeholder-gray-400" placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Phone Number</label>
              <input type="tel" className="w-full px-4 py-3 rounded-xl bg-gray-50 border-0 ring-1 ring-gray-200 focus:ring-2 focus:ring-green-500 transition-all outline-none text-sm text-gray-900 placeholder-gray-400" placeholder="(555) 123-4567" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Service Needed</label>
              <select className="w-full px-4 py-3 rounded-xl bg-gray-50 border-0 ring-1 ring-gray-200 focus:ring-2 focus:ring-green-500 transition-all outline-none text-sm text-gray-900 appearance-none">
                <option value="">Select a service...</option>
                <option value="plumbing">Plumbing</option>
                <option value="electrical">Electrical</option>
                <option value="cleaning">Cleaning</option>
                <option value="hvac">HVAC</option>
              </select>
            </div>
            <div className="pt-4">
              <button type="button" className="w-full bg-gray-900 hover:bg-green-600 text-white font-semibold py-3.5 px-4 rounded-xl transition-colors duration-300 shadow-md flex items-center justify-center gap-2 group">
                Get a Free Quote
                <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </button>
            </div>
          </form>
        </div>
      </div>
    </aside>
  )
}
