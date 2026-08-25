'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, Eye, MessageSquare, RefreshCw, X, Mail, Filter, ChevronDown, Calendar, DollarSign, User, Briefcase, Grid, List, Menu } from 'lucide-react'
import { useAdminTheme } from '../layout'

const STATUS_CONFIG = {
  open: {
    label: 'Open',
    light: { color: 'bg-red-100 text-red-700 border-red-200', dot: 'bg-red-500' },
    dark: { color: 'bg-red-500/20 text-red-400 border-red-500/30', dot: 'bg-red-400' }
  },
  reviewing: {
    label: 'Reviewing',
    light: { color: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
    dark: { color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', dot: 'bg-amber-400' }
  },
  resolved: {
    label: 'Resolved',
    light: { color: 'bg-green-100 text-green-700 border-green-200', dot: 'bg-green-500' },
    dark: { color: 'bg-green-500/20 text-green-400 border-green-500/30', dot: 'bg-green-400' }
  },
  closed: {
    label: 'Closed',
    light: { color: 'bg-gray-100 text-gray-600 border-gray-200', dot: 'bg-gray-400' },
    dark: { color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', dot: 'bg-gray-400' }
  },
}

export default function AdminDisputesPage() {
  const { isDarkMode } = useAdminTheme()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [newStatus, setNewStatus] = useState('')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const [showMobileFilter, setShowMobileFilter] = useState(false)
  const [expandedMobileCard, setExpandedMobileCard] = useState(null)
  const [viewMode, setViewMode] = useState('auto')
  const [captureAmount, setCaptureAmount] = useState('')
  const [providerAmount, setProviderAmount] = useState('')

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/disputes')
      const json = await res.json()
      if (json.success) setData(json.data)
    } catch {
      showToast('error', 'Failed to load disputes')
    } finally {
      setLoading(false)
    }
  }

  const showToast = (type, msg) => {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 4000)
  }

  const handleUpdate = async () => {
    if (!newStatus) return showToast('error', 'Please select a status')
    setSaving(true)
    try {
      const res = await fetch('/api/admin/disputes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dispute_id: selected.id, status: newStatus, admin_notes: adminNotes })
      })
      const json = await res.json()
      if (json.success) {
        const emailNote = json.emailsSent ? ' — emails sent to both parties ✉️' : ''
        showToast('success', json.message + emailNote)
        setSelected(null); setAdminNotes(''); setNewStatus('')
        loadData()
      } else {
        showToast('error', json.message)
      }
    } catch {
      showToast('error', 'Failed to update dispute')
    } finally {
      setSaving(false)
    }
  }

  const handleProcess = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/disputes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dispute_id: selected.id,
          status: 'resolved',
          admin_notes: adminNotes,
          action: 'process',
          capture_amount: captureAmount,
          provider_amount: providerAmount
        })
      })
      const json = await res.json()
      if (json.success) {
        showToast('success', json.message)
        setSelected(null); setAdminNotes(''); setNewStatus('')
        loadData()
      } else {
        showToast('error', json.message)
      }
    } catch {
      showToast('error', 'Failed to process dispute')
    } finally {
      setSaving(false)
    }
  }

  const openModal = (d) => {
    window.open('/admin/disputes/' + d.id, '_blank')
  }

  const toggleMobileCard = (id) => {
    setExpandedMobileCard(expandedMobileCard === id ? null : id)
  }

  const fmt = (n) => `$${parseFloat(n || 0).toFixed(2)}`
  const fmtDate = (d) => d ? new Date(d).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
  }) : '—'

  const fmtShortDate = (d) => d ? new Date(d).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  }) : '—'

  const filtered = (data?.disputes || []).filter(d => filter === 'all' || d.status === filter)
  const willEmail = newStatus === 'resolved' || newStatus === 'closed'

  const dm = isDarkMode
  const card = `rounded-xl border ${dm ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}`
  const txt = dm ? 'text-white' : 'text-gray-900'
  const sub = dm ? 'text-slate-400' : 'text-gray-500'
  const s = data?.summary || {}

  // Breakpoint at 1150px - below that use cards, above use table
  const getViewMode = () => {
    if (viewMode !== 'auto') return viewMode
    return window.innerWidth >= 1150 ? 'table' : 'cards'
  }

  if (loading) return (
    <div className={`min-h-screen flex items-center justify-center ${dm ? 'bg-slate-950' : 'bg-gray-50'}`}>
      <div className="flex flex-col items-center gap-3 px-4">
        <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
        <p className={`text-sm ${sub}`}>Loading disputes...</p>
      </div>
    </div>
  )

  return (
    <div className={`min-h-screen ${dm ? 'bg-slate-950' : 'bg-gray-50'}`}>
      <div className="px-4 sm:px-5 md:px-6 lg:px-7 xl:px-8 py-4 sm:py-5 md:py-6 lg:py-7 xl:py-8 max-w-7xl mx-auto">

        {/* Toast Notification */}
        {toast && (
          <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-xl text-white text-sm 
            ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'} 
            animate-slide-down max-w-sm`}>
            <div className="flex items-center gap-2">
              {toast.type === 'success' ? '✅' : '⚠️'}
              <span className="flex-1">{toast.msg}</span>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 md:mb-6">
          <div>
            <h1 className={`text-xl sm:text-2xl md:text-3xl font-bold ${txt}`}>Dispute Management</h1>
            <p className={`text-xs sm:text-sm md:text-base mt-1 ${sub}`}>Review and resolve customer disputes</p>
          </div>
          <div className="flex items-center gap-2">
            {/* View Toggle - Visible on all screens */}
            <div className="flex items-center gap-1 p-1 rounded-lg border mr-2">
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'table' ? (dm ? 'bg-slate-700 text-white' : 'bg-gray-200 text-gray-900') : (dm ? 'text-slate-400 hover:text-white' : 'text-gray-500 hover:text-gray-900')}`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'cards' ? (dm ? 'bg-slate-700 text-white' : 'bg-gray-200 text-gray-900') : (dm ? 'text-slate-400 hover:text-white' : 'text-gray-500 hover:text-gray-900')}`}
                title="Card View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('auto')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'auto' ? (dm ? 'bg-slate-700 text-white' : 'bg-gray-200 text-gray-900') : (dm ? 'text-slate-400 hover:text-white' : 'text-gray-500 hover:text-gray-900')}`}
                title="Auto (1150px breakpoint)"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </button>
            </div>

            {/* Filter Button - Hidden on larger screens */}
            <button onClick={() => setShowMobileFilter(!showMobileFilter)}
              className={`lg:hidden flex items-center gap-2 px-4 py-2 rounded-xl text-sm border transition-colors
                ${dm ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-white text-gray-700 border-gray-200'}`}>
              <Filter className="w-4 h-4" />
              Filter
              <ChevronDown className={`w-4 h-4 transition-transform ${showMobileFilter ? 'rotate-180' : ''}`} />
            </button>

            {/* Refresh Button */}
            <button onClick={loadData}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm border transition-colors
                ${dm ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700' : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'}`}>
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Mobile Filter Dropdown - Hidden above 1150px */}
        {showMobileFilter && (
          <div className={`lg:hidden mb-4 p-3 rounded-xl border ${dm ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
            <div className="grid grid-cols-2 gap-2">
              {['all', 'open', 'reviewing', 'resolved', 'closed'].map(f => (
                <button key={f} onClick={() => { setFilter(f); setShowMobileFilter(false); }}
                  className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-all
                    ${filter === f
                      ? dm ? 'bg-red-500/20 text-red-400' : 'bg-red-500 text-white'
                      : dm ? 'bg-slate-700 text-slate-400' : 'bg-gray-100 text-gray-600'
                    }`}>
                  {f === 'all' ? 'All' : STATUS_CONFIG[f]?.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Stats Cards - Responsive Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-5 md:mb-6">
          {[
            {
              label: 'Open', value: s.open_count, icon: '🚨',
              light: 'bg-red-50 border-red-200', dark: 'bg-red-500/10 border-red-500/20',
              tl: 'text-red-600', td: 'text-red-400'
            },
            {
              label: 'Reviewing', value: s.reviewing_count, icon: '🔍',
              light: 'bg-amber-50 border-amber-200', dark: 'bg-amber-500/10 border-amber-500/20',
              tl: 'text-amber-600', td: 'text-amber-400'
            },
            {
              label: 'Resolved', value: s.resolved_count, icon: '✅',
              light: 'bg-green-50 border-green-200', dark: 'bg-green-500/10 border-green-500/20',
              tl: 'text-green-600', td: 'text-green-400'
            },
            {
              label: 'Closed', value: s.closed_count, icon: '🔒',
              light: 'bg-gray-50 border-gray-200', dark: 'bg-gray-500/10 border-gray-500/20',
              tl: 'text-gray-600', td: 'text-gray-400'
            },
          ].map(stat => (
            <div key={stat.label}
              className={`rounded-xl sm:rounded-2xl p-3 sm:p-4 border ${dm ? stat.dark : stat.light}
                transform transition-transform hover:scale-[1.02] active:scale-[0.98]`}>
              <div className="text-xl sm:text-2xl mb-1 sm:mb-2">{stat.icon}</div>
              <div className={`text-lg sm:text-xl md:text-2xl font-bold ${dm ? stat.td : stat.tl}`}>
                {stat.value || 0}
              </div>
              <div className={`text-xs sm:text-sm mt-1 ${sub}`}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Filter Tabs - Visible above 1150px */}
        <div className="hidden lg:block mb-5 md:mb-6">
          <div className="flex gap-2">
            {['all', 'open', 'reviewing', 'resolved', 'closed'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all
                  ${filter === f
                    ? dm ? 'bg-red-500/20 text-red-400' : 'bg-red-500 text-white'
                    : dm ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                  }`}>
                {f === 'all' ? 'All' : STATUS_CONFIG[f]?.label}
                {f === 'open' && s.open_count > 0 && (
                  <span className={`ml-2 px-1.5 py-0.5 text-xs rounded-full
                    ${filter === f
                      ? dm ? 'bg-red-400/20 text-red-300' : 'bg-white/30 text-white'
                      : dm ? 'bg-red-500/20 text-red-400' : 'bg-red-500 text-white'
                    }`}>{s.open_count}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="space-y-4">
          {/* Cards View - Shown below 1150px or when manually selected */}
          {(getViewMode() === 'cards') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.length === 0 ? (
                <div className="col-span-full">
                  <EmptyState dm={dm} filter={filter} />
                </div>
              ) : (
                filtered.map(d => {
                  const cfg = STATUS_CONFIG[d.status] || STATUS_CONFIG.open
                  const ss = dm ? cfg.dark : cfg.light

                  return (
                    <div key={d.id}
                      className={`${card} overflow-hidden hover:shadow-lg transition-all duration-200 
                        ${d.status === 'open' ? (dm ? 'ring-1 ring-red-500/20' : 'ring-1 ring-red-200') : ''}`}>

                      <div className="p-4">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <h3 className={`font-semibold text-sm sm:text-base ${txt} truncate`}>
                                {d.booking_number}
                              </h3>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium inline-flex items-center gap-1 border ${ss.color} flex-shrink-0`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${ss.dot}`} />
                                {cfg.label}
                              </span>
                            </div>
                            <p className={`text-xs sm:text-sm ${sub} truncate`}>{d.service_name}</p>
                          </div>
                          <span className={`text-sm sm:text-base font-bold flex-shrink-0 ${dm ? 'text-green-400' : 'text-green-600'}`}>
                            {fmt(d.service_price)}
                          </span>
                        </div>

                        {/* Customer & Provider */}
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div className={`p-2 rounded-lg ${dm ? 'bg-slate-800' : 'bg-gray-100'}`}>
                            <div className="flex items-center gap-1 mb-1">
                              <User className={`w-3 h-3 ${sub}`} />
                              <p className={`text-xs ${sub}`}>Customer</p>
                            </div>
                            <p className={`text-sm font-medium truncate ${txt}`}>{d.customer_name}</p>
                            <p className={`text-xs truncate ${sub}`}>{d.customer_email}</p>
                          </div>
                          <div className={`p-2 rounded-lg ${dm ? 'bg-slate-800' : 'bg-gray-100'}`}>
                            <div className="flex items-center gap-1 mb-1">
                              <Briefcase className={`w-3 h-3 ${sub}`} />
                              <p className={`text-xs ${sub}`}>Provider</p>
                            </div>
                            <p className={`text-sm font-medium truncate ${txt}`}>{d.provider_name || '—'}</p>
                            {d.provider_email && (
                              <p className={`text-xs truncate ${sub}`}>{d.provider_email}</p>
                            )}
                          </div>
                        </div>

                        {/* Dispute Reason */}
                        <div className={`mb-3 p-2 rounded-lg ${dm ? 'bg-slate-800' : 'bg-gray-100'}`}>
                          <p className={`text-xs ${sub} mb-1`}>Dispute Reason</p>
                          <p className={`text-sm line-clamp-2 ${dm ? 'text-slate-300' : 'text-gray-700'}`}>
                            {d.reason}
                          </p>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-slate-700">
                          <div className="flex items-center gap-1">
                            <Calendar className={`w-3 h-3 ${sub}`} />
                            <span className={`text-xs ${sub}`}>{fmtShortDate(d.created_at)}</span>
                          </div>
                          <button onClick={() => openModal(d)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                              ${dm ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-red-500 text-white hover:bg-red-600'}`}>
                            <Eye className="w-3 h-3" /> Review
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          )}

          {/* Table View - Shown above 1150px or when manually selected */}
          {(getViewMode() === 'table') && (
            <div className={`rounded-xl lg:rounded-2xl border overflow-hidden ${dm ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}`}>
              {filtered.length === 0 ? (
                <EmptyState dm={dm} filter={filter} desktop />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className={`border-b ${dm ? 'bg-slate-800/50 border-slate-700' : 'bg-gray-50 border-gray-200'}`}>
                      <tr>
                        {['Booking', 'Customer', 'Provider', 'Reason', 'Status', 'Raised', 'Action'].map(h => (
                          <th key={h} className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ${sub}`}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${dm ? 'divide-slate-800' : 'divide-gray-100'}`}>
                      {filtered.map(d => {
                        const cfg = STATUS_CONFIG[d.status] || STATUS_CONFIG.open
                        const ss = dm ? cfg.dark : cfg.light
                        return (
                          <tr key={d.id}
                            className={`${dm ? 'hover:bg-slate-800/50' : 'hover:bg-gray-50'} 
                              ${d.status === 'open' ? (dm ? 'bg-red-500/5' : 'bg-red-50/30') : ''}
                              transition-colors`}>
                            <td className="px-4 py-3">
                              <div className="flex flex-col">
                                <p className={`font-medium ${txt} text-sm`}>{d.booking_number}</p>
                                <p className={`text-xs ${sub} mt-0.5`}>{d.service_name}</p>
                                <p className={`text-xs font-semibold mt-1 ${dm ? 'text-green-400' : 'text-green-600'}`}>
                                  {fmt(d.service_price)}
                                </p>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-col">
                                <p className={`font-medium ${txt} text-sm`}>{d.customer_name}</p>
                                <p className={`text-xs ${sub} truncate max-w-[150px]`} title={d.customer_email}>
                                  {d.customer_email}
                                </p>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-col">
                                <p className={`font-medium ${txt} text-sm`}>{d.provider_name || '—'}</p>
                                {d.provider_email && (
                                  <p className={`text-xs ${sub} truncate max-w-[150px]`} title={d.provider_email}>
                                    {d.provider_email}
                                  </p>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 max-w-[200px]">
                              <p className={`text-xs line-clamp-2 ${dm ? 'text-slate-300' : 'text-gray-700'}`} title={d.reason}>
                                {d.reason}
                              </p>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${ss.color}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${ss.dot}`} />
                                {cfg.label}
                              </span>
                            </td>
                            <td className={`px-4 py-3 text-xs whitespace-nowrap ${sub}`}>
                              {fmtShortDate(d.created_at)}
                            </td>
                            <td className="px-4 py-3">
                              <button onClick={() => openModal(d)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                                  ${dm ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-red-500 text-white hover:bg-red-600'}`}>
                                <Eye className="w-3 h-3" /> Review
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Global Styles */}
      <style jsx>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .animate-slide-down {
          animation: slideDown 0.2s ease-out;
        }
        
        .animate-slide-up {
          animation: slideUp 0.3s ease-out;
        }
        
        .animate-fade-in {
          animation: fadeIn 0.2s ease-out;
        }
        
        @media (min-width: 640px) {
          .animate-slide-up {
            animation: fadeIn 0.2s ease-out;
          }
        }
      `}</style>
    </div>
  )
}

function EmptyState({ dm, desktop, filter }) {
  return (
    <div className={`${desktop ? 'rounded-2xl p-8 sm:p-12' : 'rounded-xl p-6 sm:p-8'} text-center border
      ${dm ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}`}>
      <CheckCircle className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 ${dm ? 'text-slate-700' : 'text-gray-300'}`} />
      <p className={`text-base sm:text-lg ${dm ? 'text-slate-400' : 'text-gray-500'}`}>No disputes found</p>
      <p className={`text-xs sm:text-sm mt-2 ${dm ? 'text-slate-500' : 'text-gray-400'}`}>
        {filter === 'all' ? 'All disputes are resolved' : `No ${filter} disputes at the moment`}
      </p>
    </div>
  )
}
