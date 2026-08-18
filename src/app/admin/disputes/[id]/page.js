'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { CheckCircle, Eye, MessageSquare, RefreshCw, X, Mail, Filter, ChevronDown, Calendar, DollarSign, User, Briefcase, Grid, List, Menu, ArrowLeft } from 'lucide-react'
import { useAdminTheme } from '../../layout'

export default function DisputeDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { isDarkMode } = useAdminTheme()
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [adminNotes, setAdminNotes] = useState('')
  const [newStatus, setNewStatus] = useState('')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const [captureAmount, setCaptureAmount] = useState('')
  const [providerAmount, setProviderAmount] = useState('')

  useEffect(() => { loadData() }, [id])

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/disputes/${id}`)
      const json = await res.json()
      if (json.success) {
        const d = json.dispute
        setSelected(d)
        setAdminNotes(d.admin_notes || '')
        setNewStatus(d.status)
        setCaptureAmount(d.captured_amount !== null ? d.captured_amount : (d.authorized_amount || d.service_price))
        setProviderAmount(d.resolved_provider_amount !== null ? d.resolved_provider_amount : (d.provider_amount || 0))
      } else {
        showToast('error', json.message || 'Failed to load dispute')
      }
    } catch {
      showToast('error', 'Failed to load dispute')
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

  const fmt = (n) => `$${parseFloat(n || 0).toFixed(2)}`
  const fmtShortDate = (d) => d ? new Date(d).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  }) : '—'

  const dm = isDarkMode
  const txt = dm ? 'text-white' : 'text-gray-900'
  const sub = dm ? 'text-slate-400' : 'text-gray-500'

  if (loading) return (
    <div className={`min-h-screen flex items-center justify-center ${dm ? 'bg-slate-950' : 'bg-gray-50'}`}>
      <div className="flex flex-col items-center gap-3 px-4">
        <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
        <p className={`text-sm ${sub}`}>Loading dispute details...</p>
      </div>
    </div>
  )

  if (!selected) return (
    <div className={`min-h-screen flex flex-col items-center justify-center ${dm ? 'bg-slate-950' : 'bg-gray-50'}`}>
      <p className={`text-xl font-medium mb-4 ${txt}`}>Dispute not found</p>
      <button onClick={() => window.close()} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Close Window</button>
    </div>
  )

  return (
    <div className={`min-h-screen ${dm ? 'bg-slate-950' : 'bg-gray-50'}`}>
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
      <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-slate-800 flex items-center gap-4 sticky top-0 z-20 backdrop-blur-md bg-white/70 dark:bg-slate-950/70">
        <button onClick={() => window.close()} className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors ${sub}`}>
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className={`text-lg sm:text-xl font-bold flex items-center gap-2 ${txt}`}>
            ⚠️ Dispute Review
          </h1>
          <p className={`text-xs sm:text-sm ${sub}`}>#{selected.booking_number} • {selected.service_name}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* Quick Info Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-xl ${dm ? 'bg-slate-800' : 'bg-white shadow-sm border border-gray-200'}`}>
            <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${sub}`}>Amount</p>
            {selected.payment_status === 'authorized' ? (
              <div>
                <p className={`text-lg sm:text-xl font-bold ${dm ? 'text-amber-400' : 'text-amber-600'}`}>
                  Authorized: {fmt(selected.authorized_amount || selected.service_price)}
                </p>
                <p className={`text-xs mt-0.5 ${sub}`}>— not yet captured</p>
              </div>
            ) : (
              <p className={`text-lg sm:text-xl font-bold ${dm ? 'text-green-400' : 'text-green-600'}`}>
                {fmt(selected.captured_amount || selected.service_price)}
              </p>
            )}
          </div>
          <div className={`p-4 rounded-xl ${dm ? 'bg-slate-800' : 'bg-white shadow-sm border border-gray-200'}`}>
            <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${sub}`}>Raised</p>
            <p className={`text-lg font-medium ${txt}`}>{fmtShortDate(selected.created_at)}</p>
          </div>
        </div>

        {/* Stripe Hold Expiry Warning */}
        {(() => {
          if (selected.payment_status === 'authorized' && selected.booking_created_at) {
            const bookingDate = new Date(selected.booking_created_at.replace(/-/g, '/')) // Safari safe
            const expiryDate = new Date(bookingDate.getTime() + 7 * 24 * 60 * 60 * 1000)
            const daysRemaining = Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24))
            if (daysRemaining <= 7 && daysRemaining >= 0) {
              return (
                <div className={`flex items-start gap-3 p-4 sm:p-5 rounded-xl border
                  ${daysRemaining <= 2 ? (dm ? 'bg-red-500/10 border-red-500/20' : 'bg-red-50 border-red-200') : (dm ? 'bg-amber-500/10 border-amber-500/20' : 'bg-amber-50 border-amber-200')}`}>
                  <div className={`w-5 h-5 flex-shrink-0 mt-0.5 text-xl leading-none`}>⏳</div>
                  <div>
                    <p className={`text-sm sm:text-base font-semibold ${daysRemaining <= 2 ? (dm ? 'text-red-400' : 'text-red-700') : (dm ? 'text-amber-400' : 'text-amber-700')}`}>
                      Hold Expiry Warning
                    </p>
                    <p className={`text-xs sm:text-sm mt-1 ${daysRemaining <= 2 ? (dm ? 'text-red-300' : 'text-red-600') : (dm ? 'text-amber-300' : 'text-amber-600')}`}>
                      The Stripe authorization will expire in {daysRemaining} days. Capture funds before it expires!
                    </p>
                  </div>
                </div>
              )
            }
          }
          return null
        })()}

        {/* Party Information */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl ${dm ? 'bg-slate-800' : 'bg-white shadow-sm border border-gray-200'}`}>
          <div>
            <p className={`text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5 ${sub}`}>
              <User className="w-3.5 h-3.5" /> Customer
            </p>
            <p className={`text-base font-medium ${txt}`}>{selected.customer_name}</p>
            <p className={`text-sm mt-0.5 ${sub} break-words`}>{selected.customer_email}</p>
          </div>
          <div className="sm:border-l sm:border-gray-200 dark:sm:border-slate-700 sm:pl-4">
            <p className={`text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5 ${sub}`}>
              <Briefcase className="w-3.5 h-3.5" /> Provider
            </p>
            <p className={`text-base font-medium ${txt}`}>{selected.provider_name || '—'}</p>
            {selected.provider_email && (
              <p className={`text-sm mt-0.5 ${sub} break-words`}>{selected.provider_email}</p>
            )}
          </div>
        </div>

        {/* Customer's Reason */}
        <div className={`border-l-4 rounded-xl p-4 sm:p-5 ${dm ? 'bg-red-500/10 border-l-red-500' : 'bg-red-50 border-l-red-500 border border-red-100 border-l-4'}`}>
          <p className={`text-xs font-bold uppercase tracking-wide mb-2 ${dm ? 'text-red-400' : 'text-red-700'}`}>
            Customer&apos;s Dispute Reason
          </p>
          <p className={`text-sm sm:text-base leading-relaxed ${dm ? 'text-red-300' : 'text-red-800'}`}>
            {selected.reason}
          </p>
        </div>

        {/* Previous Notes */}
        {selected.admin_notes && (
          <div className={`border-l-4 border-l-blue-500 rounded-xl p-4 sm:p-5 ${dm ? 'bg-blue-500/10' : 'bg-blue-50 border border-blue-100 border-l-4'}`}>
            <p className={`text-xs font-bold uppercase tracking-wide mb-2 ${dm ? 'text-blue-400' : 'text-blue-700'}`}>
              Previous Admin Notes
            </p>
            <p className={`text-sm sm:text-base ${dm ? 'text-blue-300' : 'text-blue-800'}`}>{selected.admin_notes}</p>
          </div>
        )}

        {/* Financial Processing */}
        {selected.payment_status === 'authorized' && (
          <div className={`p-4 sm:p-6 rounded-xl border ${dm ? 'bg-slate-800/50 border-slate-700' : 'bg-white shadow-sm border-gray-200'}`}>
            <p className={`text-sm font-bold uppercase tracking-wide mb-4 ${dm ? 'text-slate-300' : 'text-gray-700'}`}>Process Funds</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${sub}`}>Charge the customer</label>
                <div className="relative">
                  <span className={`absolute left-3 top-1/2 -translate-y-1/2 font-medium ${sub}`}>$</span>
                  <input type="number" step="0.01" min="0" 
                    value={captureAmount} onChange={e => setCaptureAmount(e.target.value)}
                    className={`w-full pl-8 pr-3 py-2.5 border rounded-lg text-sm outline-none transition-colors
                      ${dm ? 'bg-slate-900 border-slate-700 text-white focus:border-slate-500' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-gray-400 focus:bg-white'}`}
                  />
                </div>
              </div>
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${sub}`}>Pay the provider</label>
                <div className="relative">
                  <span className={`absolute left-3 top-1/2 -translate-y-1/2 font-medium ${sub}`}>$</span>
                  <input type="number" step="0.01" min="0"
                    value={providerAmount} onChange={e => setProviderAmount(e.target.value)}
                    className={`w-full pl-8 pr-3 py-2.5 border rounded-lg text-sm outline-none transition-colors
                      ${dm ? 'bg-slate-900 border-slate-700 text-white focus:border-slate-500' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-gray-400 focus:bg-white'}`}
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-5 flex justify-end">
              <button onClick={handleProcess} disabled={saving}
                className={`w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-bold shadow-md transition-all
                  ${saving ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5 hover:shadow-lg'}
                  ${dm ? 'bg-amber-600 text-white hover:bg-amber-500' : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'}`}>
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : (
                  'Process Funds'
                )}
              </button>
            </div>
          </div>
        )}

        {/* Update Status Form */}
        <div className={`p-4 sm:p-6 rounded-xl border ${dm ? 'bg-slate-800 border-slate-700' : 'bg-white shadow-sm border-gray-200'}`}>
          <p className={`text-sm font-bold uppercase tracking-wide mb-4 ${dm ? 'text-slate-300' : 'text-gray-700'}`}>Update Status</p>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
            {['open', 'reviewing', 'resolved', 'closed'].map(s => (
              <button key={s} onClick={() => setNewStatus(s)}
                className={`py-2 px-1 rounded-lg text-xs font-semibold capitalize border transition-all flex items-center justify-center gap-1.5
                  ${newStatus === s
                    ? (s === 'resolved' ? (dm ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-green-50 border-green-500 text-green-700')
                     : s === 'closed' ? (dm ? 'bg-slate-700 border-slate-500 text-white' : 'bg-gray-100 border-gray-400 text-gray-800')
                     : s === 'reviewing' ? (dm ? 'bg-amber-500/20 border-amber-500 text-amber-400' : 'bg-amber-50 border-amber-500 text-amber-700')
                     : (dm ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-red-50 border-red-500 text-red-700'))
                    : (dm ? 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100')
                  }`}>
                <span className={`w-1.5 h-1.5 rounded-full 
                  ${newStatus === s
                    ? (s === 'resolved' ? 'bg-green-500' : s === 'closed' ? 'bg-gray-500' : s === 'reviewing' ? 'bg-amber-500' : 'bg-red-500')
                    : (dm ? 'bg-slate-600' : 'bg-gray-300')
                  }`} />
                {s}
              </button>
            ))}
          </div>

          <label className={`block text-xs font-semibold mb-2 flex items-center gap-1.5 ${sub}`}>
            <MessageSquare className="w-3.5 h-3.5" /> Admin Notes
          </label>
          <textarea
            rows="3"
            placeholder="Add internal notes about this dispute..."
            value={adminNotes}
            onChange={e => setAdminNotes(e.target.value)}
            className={`w-full p-3 rounded-xl text-sm border outline-none transition-colors resize-none
              ${dm ? 'bg-slate-900 border-slate-700 text-white focus:border-slate-500' : 'bg-gray-50 border-gray-200 text-gray-900 focus:bg-white focus:border-gray-400'}`}
          />
          
          <div className="mt-5 flex justify-end gap-3">
            <button onClick={handleUpdate} disabled={saving}
              className={`w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-bold transition-all
                ${saving ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5 shadow-md hover:shadow-lg'}
                ${dm ? 'bg-red-600 text-white hover:bg-red-500' : 'bg-red-500 text-white hover:bg-red-600'}`}>
              {saving ? 'Saving...' : 'Save Update'}
            </button>
          </div>
        </div>
        
      </div>
    </div>
  )
}
