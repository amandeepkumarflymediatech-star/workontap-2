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

export default function Blogs() {
  const router = useRouter()
  const { isDarkMode } = useAdminTheme()
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' })

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
      loadBlogs()
    } catch {
      router.push('/admin/login')
    }
  }

  const loadBlogs = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/blogs')
      const data = await res.json()
      if (data.success) {
        setBlogs(data.data || [])
      }
    } catch (error) {
      console.error('Error loading blogs:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteBlog = async (id) => {
    if (!confirm('Are you sure you want to delete this blog?')) return
    try {
      const res = await fetch(`/api/admin/blogs/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) loadBlogs()
    } catch (error) {
      console.error('Error deleting blog:', error)
    }
  }

  const togglePublish = async (blog) => {
    try {
      const res = await fetch(`/api/admin/blogs/${blog.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...blog, is_published: !blog.is_published })
      })
      const data = await res.json()
      if (data.success) loadBlogs()
    } catch (error) {
      console.error('Error toggling publish status:', error)
    }
  }

  const handleSort = (key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const filteredAndSortedBlogs = useMemo(() => {
    let result = [...blogs]

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(blog => 
        blog.title?.toLowerCase().includes(term) || 
        blog.slug?.toLowerCase().includes(term) ||
        blog.author?.toLowerCase().includes(term)
      )
    }

    result.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })

    return result
  }, [blogs, searchTerm, sortConfig])

  useEffect(() => {
    setPage(1)
  }, [searchTerm, sortConfig])

  const startIndex = (page - 1) * PAGE_SIZE
  const endIndex = startIndex + PAGE_SIZE
  const pagedBlogs = filteredAndSortedBlogs.slice(startIndex, endIndex)

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
            Blogs
          </h1>
          <p className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>
            Manage blog posts and articles
          </p>
        </div>
        <Link
          href="/admin/blogs/new"
          className="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2 shrink-0"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Blog Post
        </Link>
      </div>

      <div className={`p-4 mb-6 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'} flex items-center gap-4`}>
        <div className="relative flex-1 max-w-md">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search blogs..."
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
                <th className={`p-4 font-medium text-sm cursor-pointer ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`} onClick={() => handleSort('title')}>
                  Title <SortIcon columnKey="title" />
                </th>
                <th className={`p-4 font-medium text-sm cursor-pointer ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`} onClick={() => handleSort('author')}>
                  Author <SortIcon columnKey="author" />
                </th>
                <th className={`p-4 font-medium text-sm cursor-pointer ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`} onClick={() => handleSort('created_at')}>
                  Date <SortIcon columnKey="created_at" />
                </th>
                <th className={`p-4 font-medium text-sm cursor-pointer ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`} onClick={() => handleSort('is_published')}>
                  Status <SortIcon columnKey="is_published" />
                </th>
                <th className={`p-4 font-medium text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-700'} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pagedBlogs.length > 0 ? (
                pagedBlogs.map((blog) => (
                  <tr key={blog.id} className={`border-b last:border-0 ${isDarkMode ? 'border-slate-800 hover:bg-slate-800/50' : 'border-gray-100 hover:bg-gray-50'}`}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {blog.image_url ? (
                          <img src={blog.image_url} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                        ) : (
                          <div className={`w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center ${isDarkMode ? 'bg-slate-800' : 'bg-gray-100'}`}>
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                        <div>
                          <p className={`font-medium line-clamp-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{blog.title}</p>
                          <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-gray-500'}`}>{blog.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className={`p-4 text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                      {blog.author || '-'}
                    </td>
                    <td className={`p-4 text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                      {new Date(blog.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${blog.is_published
                        ? 'bg-green-500/20 text-green-600 dark:text-green-400'
                        : 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'
                        }`}>
                        {blog.is_published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => togglePublish(blog)}
                          title={blog.is_published ? 'Unpublish' : 'Publish'}
                          className={`p-2 rounded-lg transition-colors ${
                            blog.is_published
                              ? isDarkMode ? 'text-yellow-400 hover:bg-yellow-500/20' : 'text-yellow-600 hover:bg-yellow-50'
                              : isDarkMode ? 'text-green-400 hover:bg-green-500/20' : 'text-green-600 hover:bg-green-50'
                          }`}
                        >
                          {blog.is_published ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          )}
                        </button>
                        <Link href={`/admin/blogs/edit/${blog.id}`} className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-gray-500 hover:bg-gray-100'}`}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        <button onClick={() => deleteBlog(blog.id)} className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'text-red-400 hover:bg-red-500/20' : 'text-red-500 hover:bg-red-50'}`}>
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
                  <td colSpan="5" className={`p-8 text-center ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                    No blogs found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <Pagination total={filteredAndSortedBlogs.length} page={page} setPage={setPage} isDarkMode={isDarkMode} />
    </div>
  )
}
