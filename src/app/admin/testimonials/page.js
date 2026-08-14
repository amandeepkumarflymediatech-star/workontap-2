'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminTheme } from '../layout'

const PAGE_SIZE = 8
const emptyForm = { name: '', stars: 5, text: '', is_active: 1, display_order: 0 }

function StarPicker({ value, onChange }) {
  return (
    <div className="flex gap-1.5 items-center">
      {[1, 2, 3, 4, 5].map(s => (
        <button key={s} type="button" onClick={() => onChange(s)}
          className={`text-3xl transition-transform hover:scale-110 ${s <= value ? 'text-amber-400 drop-shadow-sm' : 'text-slate-300 hover:text-amber-200'}`}>
          ★
        </button>
      ))}
      <span className="text-sm font-semibold text-slate-500 ml-1">{value}/5</span>
    </div>
  )
}

export default function TestimonialsAdmin() {
  const router = useRouter()
  const { isDarkMode } = useAdminTheme()
  const [testimonials, setTestimonials] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [page, setPage] = useState(1)
  const [successMsg, setSuccessMsg] = useState('')

  // Theme shortcuts
  const bg = isDarkMode ? 'bg-slate-900' : 'bg-slate-50'
  const cardBg = isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
  const textPrimary = isDarkMode ? 'text-white' : 'text-slate-900'
  const textMuted = isDarkMode ? 'text-slate-400' : 'text-slate-500'
  const inputCls = `w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition ${
    isDarkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white'
  }`

  useEffect(() => {
    fetch('/api/admin/me').then(r => { if (!r.ok) router.push('/admin/login'); else loadTestimonials() }).catch(() => router.push('/admin/login'))
  }, [])

  const loadTestimonials = async () => {
    setLoading(true)
    try {
      const r = await fetch('/api/admin/testimonials')
      const d = await r.json()
      if (d.success) { setTestimonials(d.data || []); setPage(1) }
    } finally { setLoading(false) }
  }

  const flash = (msg) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 3000) }

  const startEdit = (t) => { setEditing(t); setForm({ name: t.name, stars: t.stars, text: t.text, is_active: t.is_active, display_order: t.display_order }) }
  const cancelEdit = () => { setEditing(null); setForm(emptyForm) }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const url = editing ? `/api/admin/testimonials/${editing.id}` : '/api/admin/testimonials'
      const method = editing ? 'PUT' : 'POST'
      const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const d = await r.json()
      if (d.success) {
        cancelEdit()
        flash(editing ? '✅ Testimonial updated!' : '✅ Testimonial added!')
        loadTestimonials()
      }
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    await fetch(`/api/admin/testimonials/${id}`, { method: 'DELETE' })
    setDeleteConfirm(null)
    flash('🗑️ Testimonial deleted.')
    loadTestimonials()
  }

  const toggleActive = async (t) => {
    await fetch(`/api/admin/testimonials/${t.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...t, is_active: t.is_active ? 0 : 1 })
    })
    loadTestimonials()
  }

  const totalPages = Math.ceil(testimonials.length / PAGE_SIZE)
  const paged = testimonials.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className={`min-h-screen ${bg} p-5 md:p-8`}>

      {/* ── Page Header ── */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className={`text-2xl font-extrabold ${textPrimary}`}>💬 Voices of Trust</h1>
          <p className={`text-sm mt-1 ${textMuted}`}>Manage testimonials shown on the homepage</p>
        </div>
        <div className="flex gap-3">
          {[
            { label: 'Total', val: testimonials.length, color: 'bg-teal-50 text-teal-700 border-teal-100' },
            { label: 'Active', val: testimonials.filter(t => t.is_active).length, color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
            { label: 'Hidden', val: testimonials.filter(t => !t.is_active).length, color: 'bg-slate-100 text-slate-500 border-slate-200' },
          ].map(s => (
            <div key={s.label} className={`hidden md:flex flex-col items-center px-4 py-2 rounded-xl border text-sm font-bold ${s.color}`}>
              <span className="text-xl font-black">{s.val}</span>
              <span className="text-xs font-medium opacity-70">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Success Toast ── */}
      {successMsg && (
        <div className="mb-4 px-4 py-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm font-medium flex items-center gap-2 animate-pulse">
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* ── LEFT: INLINE FORM ── */}
        <div className="xl:col-span-1">
          <div className={`rounded-2xl border shadow-sm sticky top-6 ${cardBg}`}>
            {/* Form Header */}
            <div className={`px-6 py-4 border-b flex items-center justify-between ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}>
              <div>
                <h2 className={`font-bold text-base ${textPrimary}`}>{editing ? '✏️ Edit Testimonial' : '➕ New Testimonial'}</h2>
                <p className={`text-xs mt-0.5 ${textMuted}`}>{editing ? `Editing: ${editing.name}` : 'Add a customer review'}</p>
              </div>
              {editing && (
                <button onClick={cancelEdit} className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 font-medium transition">
                  Cancel
                </button>
              )}
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5">
              {/* Name */}
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${textMuted}`}>Customer Name</label>
                <input type="text" required value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Sarah M." className={inputCls} />
              </div>

              {/* Stars */}
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${textMuted}`}>Rating</label>
                <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-200'}`}>
                  <StarPicker value={form.stars} onChange={v => setForm(f => ({ ...f, stars: v }))} />
                </div>
              </div>

              {/* Review Text */}
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${textMuted}`}>Review</label>
                <textarea required value={form.text}
                  onChange={e => setForm(f => ({ ...f, text: e.target.value }))}
                  placeholder="Write the customer's experience..." rows={5}
                  className={`${inputCls} resize-none`} />
                <p className={`text-xs mt-1 ${textMuted}`}>{form.text.length} characters</p>
              </div>

              {/* Order + Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${textMuted}`}>Order</label>
                  <input type="number" min={0} value={form.display_order}
                    onChange={e => setForm(f => ({ ...f, display_order: parseInt(e.target.value) || 0 }))}
                    className={inputCls} />
                </div>
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${textMuted}`}>Visibility</label>
                  <select value={form.is_active}
                    onChange={e => setForm(f => ({ ...f, is_active: parseInt(e.target.value) }))}
                    className={inputCls}>
                    <option value={1}>✅ Active</option>
                    <option value={0}>🙈 Hidden</option>
                  </select>
                </div>
              </div>

              {/* Submit */}
              <button type="submit" disabled={saving}
                className="w-full py-3 rounded-xl font-bold text-sm bg-teal-600 hover:bg-teal-700 active:scale-[0.98] text-white shadow-lg shadow-teal-100 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                {saving
                  ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Saving...</>
                  : editing ? '💾 Save Changes' : '➕ Add Testimonial'}
              </button>
            </form>

            {/* Preview card */}
            {(form.name || form.text) && (
              <div className={`mx-6 mb-6 p-4 rounded-xl border ${isDarkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-50 border-slate-100'}`}>
                <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${textMuted}`}>Preview</p>
                <p className="text-amber-400 text-sm mb-1">{'★'.repeat(form.stars)}{'☆'.repeat(5 - form.stars)}</p>
                <p className={`text-sm italic mb-2 line-clamp-3 ${textMuted}`}>&quot;{form.text || '...'}&quot;</p>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-teal-500 flex items-center justify-center text-white text-xs font-bold">
                    {form.name.charAt(0).toUpperCase() || '?'}
                  </div>
                  <span className={`text-xs font-semibold ${textPrimary}`}>{form.name || 'Customer Name'}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: TABLE ── */}
        <div className="xl:col-span-2">
          <div className={`rounded-2xl border shadow-sm overflow-hidden ${cardBg}`}>
            {/* Table Header */}
            <div className={`px-6 py-4 border-b flex items-center justify-between ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}>
              <h3 className={`font-bold text-sm ${textPrimary}`}>All Testimonials ({testimonials.length})</h3>
              <span className={`text-xs ${textMuted}`}>Sorted by display order</span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-teal-500 border-t-transparent" />
              </div>
            ) : testimonials.length === 0 ? (
              <div className={`text-center py-20 ${textMuted}`}>
                <div className="text-6xl mb-4">💬</div>
                <p className="font-semibold mb-1">No testimonials yet</p>
                <p className="text-xs">Use the form on the left to add your first review</p>
              </div>
            ) : (
              <>
                <div className="divide-y divide-slate-100">
                  {paged.map(t => (
                    <div key={t.id} className={`p-5 transition group ${editing?.id === t.id ? (isDarkMode ? 'bg-teal-900/20 border-l-2 border-teal-500' : 'bg-teal-50/60 border-l-2 border-teal-500') : isDarkMode ? 'hover:bg-slate-700/30' : 'hover:bg-slate-50'}`}>
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm">
                          {t.name.charAt(0).toUpperCase()}
                        </div>

                        <div className="flex-1 min-w-0">
                          {/* Name + stars + badge */}
                          <div className="flex items-center flex-wrap gap-2 mb-1">
                            <span className={`font-bold text-sm ${textPrimary}`}>{t.name}</span>
                            <span className="text-amber-400 text-xs">{'★'.repeat(t.stars)}<span className="text-slate-200">{'★'.repeat(5 - t.stars)}</span></span>
                            <button onClick={() => toggleActive(t)}
                              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold transition ${t.is_active ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>
                              {t.is_active ? 'Active' : 'Hidden'}
                            </button>
                            <span className={`text-xs ${textMuted}`}>#{t.display_order}</span>
                          </div>

                          {/* Review text */}
                          <p className={`text-sm line-clamp-2 ${textMuted}`}>{t.text}</p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition">
                          <button onClick={() => startEdit(t)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${editing?.id === t.id ? 'bg-teal-600 text-white' : isDarkMode ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}>
                            {editing?.id === t.id ? 'Editing' : 'Edit'}
                          </button>
                          <button onClick={() => setDeleteConfirm(t)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-600 transition">
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className={`px-6 py-4 border-t flex items-center justify-between flex-wrap gap-3 ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}>
                    <p className={`text-xs ${textMuted}`}>
                      Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, testimonials.length)} of {testimonials.length}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-40 transition ${isDarkMode ? 'bg-slate-700 border border-slate-600 text-slate-300 hover:bg-slate-600' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                        ‹ Prev
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                        .reduce((acc, p, idx, arr) => {
                          if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...')
                          acc.push(p)
                          return acc
                        }, [])
                        .map((p, i) => p === '...'
                          ? <span key={`e${i}`} className={`px-2 text-xs ${textMuted}`}>…</span>
                          : <button key={p} onClick={() => setPage(p)}
                            className={`w-8 h-8 rounded-lg text-xs font-bold transition ${page === p ? 'bg-teal-600 text-white shadow-sm' : isDarkMode ? 'bg-slate-700 border border-slate-600 text-slate-300 hover:bg-slate-600' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                            {p}
                          </button>
                        )}
                      <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-40 transition ${isDarkMode ? 'bg-slate-700 border border-slate-600 text-slate-300 hover:bg-slate-600' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                        Next ›
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-sm rounded-2xl shadow-2xl border p-6 text-center ${cardBg}`}>
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center text-3xl mx-auto mb-4">🗑️</div>
            <h3 className={`text-lg font-bold mb-1 ${textPrimary}`}>Delete Testimonial?</h3>
            <p className={`text-sm mb-6 ${textMuted}`}>
              Remove review by <strong className={textPrimary}>{deleteConfirm.name}</strong>?<br />This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteConfirm.id)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-700 text-white transition shadow-lg shadow-red-100">
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`.line-clamp-2{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}.line-clamp-3{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;}`}</style>
    </div>
  )
}
