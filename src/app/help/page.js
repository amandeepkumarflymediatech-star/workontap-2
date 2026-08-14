'use client'

import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useState } from 'react'

const faqs = [
  {
    icon: '📅',
    category: 'Booking',
    question: 'How do I book a service?',
    answer: 'Simply search for the service you need, select a date and time, and confirm your booking. You\'ll receive instant confirmation and can track your booking status in "My Bookings".'
  },
  {
    icon: '🔍',
    category: 'Services',
    question: 'How do I find the right service?',
    answer: 'Use our search bar at the top of the page. Type what you need (e.g., "fix leaking tap") and we\'ll show you relevant services. You can also browse by categories.'
  },
  {
    icon: '📍',
    category: 'Coverage',
    question: 'What areas do you serve?',
    answer: 'We currently serve Metro Vancouver and surrounding areas including Burnaby, Surrey, Richmond, Coquitlam, and more. We\'re expanding to new cities soon!'
  },
  {
    icon: '✅',
    category: 'Trust & Safety',
    question: 'How are service providers vetted?',
    answer: 'All our pros undergo background checks, license verification, and are fully insured. You can see their ratings and read verified reviews before booking.'
  },
  {
    icon: '❌',
    category: 'Booking',
    question: 'What if I need to cancel?',
    answer: 'Free cancellation up to 24 hours before the scheduled time. Cancel anytime from your "My Bookings" page with no penalty.'
  },
  {
    icon: '💳',
    category: 'Payment',
    question: 'How do I pay?',
    answer: 'Pay securely through our platform after the job is completed. We accept all major credit cards and digital wallets. No payment is charged until the work is done.'
  },
  {
    icon: '⭐',
    category: 'Reviews',
    question: 'How do I leave a review?',
    answer: 'After your job is marked complete, you\'ll receive an email or in-app prompt to rate and review your experience. Your feedback helps maintain our quality standards.'
  },
  {
    icon: '🛡️',
    category: 'Trust & Safety',
    question: 'What if I\'m not satisfied with the work?',
    answer: 'We offer a WorkOnTap Satisfaction Guarantee. If you\'re not happy, contact us within 48 hours and we\'ll make it right — at no extra cost to you.'
  },
]

const quickLinks = [
  {
    href: '/help/booking',
    icon: '📖',
    title: 'Booking Guide',
    desc: 'Step-by-step booking help',
    color: 'from-blue-500 to-blue-600',
    bg: 'bg-blue-50 hover:bg-blue-100 border-blue-100',
  },
  {
    href: '/help/payment',
    icon: '💰',
    title: 'Payment Help',
    desc: 'Billing, refunds & receipts',
    color: 'from-emerald-500 to-emerald-600',
    bg: 'bg-emerald-50 hover:bg-emerald-100 border-emerald-100',
  },
  {
    href: '/contact',
    icon: '💬',
    title: 'Contact Support',
    desc: 'Talk to our team',
    color: 'from-violet-500 to-violet-600',
    bg: 'bg-violet-50 hover:bg-violet-100 border-violet-100',
  },
  {
    href: '/how-it-works',
    icon: '⚡',
    title: 'How It Works',
    desc: 'Learn the platform',
    color: 'from-amber-500 to-amber-600',
    bg: 'bg-amber-50 hover:bg-amber-100 border-amber-100',
  },
]

const categories = ['All', 'Booking', 'Services', 'Payment', 'Coverage', 'Trust & Safety', 'Reviews']

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState(null)
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch] = useState('')

  const filtered = faqs.filter(f => {
    const matchCat = activeCategory === 'All' || f.category === activeCategory
    const matchSearch = !search || f.question.toLowerCase().includes(search.toLowerCase()) || f.answer.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased">
      <Header />

      {/* ── Hero ── */}
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-60 h-60 bg-teal-400/10 rounded-full blur-3xl" />
        </div>
        <div className="relative container mx-auto px-6 py-16 max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-emerald-400 text-sm font-semibold mb-5">
            🛟 Help Center
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
            How can we <span className="text-emerald-400">help you?</span>
          </h1>
          <p className="text-slate-300 text-lg mb-8 max-w-xl mx-auto">
            Find answers to common questions or reach out to our support team
          </p>

          {/* Search bar */}
          <div className="relative max-w-xl mx-auto">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setOpenFaq(null) }}
              placeholder="Search questions, topics..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white/15 text-sm backdrop-blur-sm transition"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition text-lg">×</button>
            )}
          </div>
        </div>
      </div>

      {/* ── Quick Links ── */}
      <div className="container mx-auto px-6 max-w-5xl -mt-6 relative z-10 mb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickLinks.map((link, i) => (
            <Link key={i} href={link.href}
              className={`flex flex-col items-center text-center p-5 rounded-2xl border transition group shadow-sm ${link.bg}`}>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${link.color} flex items-center justify-center text-2xl mb-3 shadow-sm group-hover:scale-110 transition-transform`}>
                {link.icon}
              </div>
              <div className="font-bold text-slate-900 text-sm">{link.title}</div>
              <div className="text-slate-500 text-xs mt-0.5">{link.desc}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── FAQ Section ── */}
      <div className="container mx-auto px-6 max-w-4xl pb-20">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2">Frequently Asked Questions</h2>
          <p className="text-slate-500 text-sm">Click a question to expand the answer</p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {categories.map(cat => (
            <button key={cat} onClick={() => { setActiveCategory(cat); setOpenFaq(null) }}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition border ${
                activeCategory === cat
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-100'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:text-emerald-700'
              }`}>
              {cat}
            </button>
          ))}
        </div>

        {/* FAQ list */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
            <div className="text-5xl mb-4">🔍</div>
            <p className="font-semibold text-slate-700 mb-1">No results found</p>
            <p className="text-slate-400 text-sm">Try a different search term or category</p>
            <button onClick={() => { setSearch(''); setActiveCategory('All') }}
              className="mt-4 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition">
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((faq, index) => (
              <div key={index}
                className={`bg-white rounded-2xl border overflow-hidden shadow-sm transition-all duration-300 ${
                  openFaq === index ? 'border-emerald-200 shadow-emerald-50 shadow-md' : 'border-slate-200 hover:border-slate-300'
                }`}>
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full text-left px-5 py-4 flex items-center gap-4 group">
                  <span className="text-2xl shrink-0">{faq.icon}</span>
                  <div className="flex-1 min-w-0">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full mr-2 ${
                      openFaq === index ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}>{faq.category}</span>
                    <span className="font-semibold text-slate-900 text-sm">{faq.question}</span>
                  </div>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all ${
                    openFaq === index ? 'bg-emerald-500 text-white rotate-45' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                  }`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                </button>

                {openFaq === index && (
                  <div className="px-5 pb-5 pt-0">
                    <div className="ml-10 pl-4 border-l-2 border-emerald-200">
                      <p className="text-slate-600 text-sm leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Still need help? */}
        <div className="mt-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl p-8 text-center text-white shadow-xl shadow-emerald-100">
          <div className="text-4xl mb-3">🤝</div>
          <h3 className="text-xl font-extrabold mb-2">Still need help?</h3>
          <p className="text-emerald-100 text-sm mb-5 max-w-sm mx-auto">
            Our support team is available 7 days a week. We typically respond within a few hours.
          </p>
          <Link href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-emerald-700 font-bold rounded-xl hover:bg-emerald-50 transition shadow-sm text-sm">
            💬 Contact Support
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  )
}