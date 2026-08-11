'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAdminTheme } from '../layout'

const PAGE_SIZE = 10

function Pagination({ total, page, setPage, isDarkMode }) {
  const totalPages = Math.ceil(total / PAGE_SIZE)
  const pages = []
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      pages.push(i)
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...')
    }
  }

  return (
    <div className="flex items-center justify-between mt-6 flex-wrap gap-3">
      <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
        {total === 0
          ? 'No results'
          : totalPages <= 1
            ? `${total} total`
            : `Showing ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, total)} of ${total} total`}
      </p>
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className={`px-3 py-1.5 rounded-lg text-sm disabled:opacity-40 transition ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}
          >‹</button>
          {pages.map((p, i) => (
            p === '...'
              ? <span key={`e-${i}`} className="px-2 text-slate-400 text-sm">…</span>
              : <button key={p} onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition ${page === p
                  ? 'bg-teal-600 text-white shadow-sm'
                  : isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}>{p}</button>
          ))}
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className={`px-3 py-1.5 rounded-lg text-sm disabled:opacity-40 transition ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}
          >›</button>
        </div>
      )}
    </div>
  )
}

export default function SeoSettings() {
  const router = useRouter()
  const { isDarkMode } = useAdminTheme()
  const [settings, setSettings] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState({ key: 'page_name', direction: 'asc' })

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/admin/me')
      if (!res.ok) {
        router.push('/admin/login')
        return
      }
      loadSettings()
    } catch {
      router.push('/admin/login')
    }
  }

  const loadSettings = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/seo')
      const data = await res.json()
      if (data.success) {
        setSettings(data.data || [])
      }
    } catch (error) {
      console.error('Error loading seo settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteSetting = async (id) => {
    if (!confirm('Are you sure you want to delete this SEO setting?')) return
    try {
      const res = await fetch(`/api/admin/seo/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) loadSettings()
    } catch (error) {
      console.error('Error deleting seo setting:', error)
    }
  }

  const handleSort = (key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const filteredAndSortedSettings = useMemo(() => {
    let result = [...settings]

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(setting => 
        setting.page_name?.toLowerCase().includes(term) || 
        setting.meta_title?.toLowerCase().includes(term)
      )
    }

    result.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })

    return result
  }, [settings, searchTerm, sortConfig])

  useEffect(() => {
    setPage(1)
  }, [searchTerm, sortConfig])

  const startIndex = (page - 1) * PAGE_SIZE
  const endIndex = startIndex + PAGE_SIZE
  const pagedSettings = filteredAndSortedSettings.slice(startIndex, endIndex)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-500 border-t-transparent"></div>
      </div>
    )
  }

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return null
    return sortConfig.direction === 'asc' ? <span>↑</span> : <span>↓</span>
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={`text-3xl sm:text-4xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            SEO Settings
          </h1>
          <p className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>
            Manage global and per-page SEO metadata
          </p>
        </div>
        <Link
          href="/admin/seo/new"
          className="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2 shrink-0"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add SEO Setting
        </Link>
      </div>

      <div className={`p-4 mb-6 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'} flex items-center gap-4`}>
        <div className="relative flex-1 max-w-md">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by page name or title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 rounded-lg border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-teal-500`}
          />
        </div>
      </div>

      <div className={`rounded-xl border overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b ${isDarkMode ? 'border-slate-800 bg-slate-900/50' : 'border-gray-200 bg-gray-50'}`}>
                <th className={`p-4 font-medium text-sm cursor-pointer ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`} onClick={() => handleSort('page_name')}>
                  Page Name <SortIcon columnKey="page_name" />
                </th>
                <th className={`p-4 font-medium text-sm cursor-pointer ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`} onClick={() => handleSort('meta_title')}>
                  Meta Title <SortIcon columnKey="meta_title" />
                </th>
                <th className={`p-4 font-medium text-sm cursor-pointer ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`} onClick={() => handleSort('updated_at')}>
                  Updated <SortIcon columnKey="updated_at" />
                </th>
                <th className={`p-4 font-medium text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-700'} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pagedSettings.length > 0 ? (
                pagedSettings.map((setting) => (
                  <tr key={setting.id} className={`border-b last:border-0 ${isDarkMode ? 'border-slate-800 hover:bg-slate-800/50' : 'border-gray-100 hover:bg-gray-50'}`}>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        setting.page_name === 'global'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                      }`}>
                        {setting.page_name}
                      </span>
                    </td>
                    <td className={`p-4 text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                      {setting.meta_title || '-'}
                    </td>
                    <td className={`p-4 text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                      {new Date(setting.updated_at).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/seo/edit/${setting.id}`} className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-gray-500 hover:bg-gray-100'}`}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        <button onClick={() => deleteSetting(setting.id)} className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'text-red-400 hover:bg-red-500/20' : 'text-red-500 hover:bg-red-50'}`}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className={`p-8 text-center ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                    No SEO settings found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <Pagination total={filteredAndSortedSettings.length} page={page} setPage={setPage} isDarkMode={isDarkMode} />
    </div>
  )
}
