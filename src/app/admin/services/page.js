'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminTheme } from '../layout'
import Icon from '@/components/Icon';
import dynamic from 'next/dynamic';
import { FiSearch, FiFilter, FiChevronDown, FiX } from 'react-icons/fi'

const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), { ssr: false });

export default function Services() {
  const router = useRouter()
  const { isDarkMode } = useAdminTheme()
  const [services, setServices] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedService, setSelectedService] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6
  const [uploading, setUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState('')

  const [newService, setNewService] = useState({
    category_id: '', name: '', slug: '', description: '', short_description: '',
    base_price: '', additional_price: '', duration_minutes: '', image_url: '',
    use_cases: '', is_homepage: false, is_trending: false, is_popular: false, is_active: true
  })

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
      loadServices()   // ✅ auth pass hone ke baad
      loadCategories()
    } catch {
      router.push('/admin/login')
    }
  }

  const loadServices = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/services')
      const data = await res.json()
      if (data.success) setServices(data.data || [])
    } catch (error) {
      console.error('Error loading services:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const res = await fetch('/api/categories')
      const data = await res.json()
      if (data.success) setCategories(data.data || [])
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const handleImageUpload = async (e, isEdit = false) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result)
    reader.readAsDataURL(file)
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.success) {
        if (!isEdit) setNewService(prev => ({ ...prev, image_url: data.url }))
        else setSelectedService(prev => ({ ...prev, image_url: data.url }))
      } else {
        alert('Upload failed: ' + data.message)
      }
    } catch (error) {
      alert('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleImageRemove = async (isEdit = false) => {
    const currentUrl = isEdit ? selectedService?.image_url : newService.image_url
    if (currentUrl && currentUrl.startsWith('/uploads/')) {
      try {
        await fetch(`/api/upload?url=${encodeURIComponent(currentUrl)}`, { method: 'DELETE' })
      } catch (error) {
        console.error('Error deleting image:', error)
      }
    }
    setImagePreview('')
    if (!isEdit) setNewService(prev => ({ ...prev, image_url: '' }))
    else setSelectedService(prev => ({ ...prev, image_url: '' }))
  }
  const addService = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newService)
      })
      const data = await res.json()
      if (data.success) {
        setIsAddModalOpen(false)
        setImagePreview('')
        setNewService({
          category_id: '', name: '', slug: '', description: '', short_description: '',
          base_price: '', additional_price: '', duration_minutes: '', image_url: '',
          use_cases: '', is_homepage: false, is_trending: false, is_popular: false, is_active: true
        })
        loadServices()
        setCurrentPage(1)
      }
    } catch (error) {
      console.error('Error adding service:', error)
    }
  }

  const updateService = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/services', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedService)
      })
      const data = await res.json()
      if (data.success) {
        setIsEditModalOpen(false)
        setImagePreview('')
        setSelectedService(null)
        loadServices()
      }
    } catch (error) {
      console.error('Error updating service:', error)
    }
  }

  const deleteService = async (serviceId) => {
    if (!confirm('Are you sure you want to delete this service?')) return
    try {
      const res = await fetch(`/api/services?id=${serviceId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) { loadServices(); setCurrentPage(1) }
    } catch (error) {
      console.error('Error deleting service:', error)
    }
  }

  const toggleServiceStatus = async (service) => {
    const isActive = service.is_active === 1 || service.is_active === true
    try {
      const res = await fetch('/api/services', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...service, is_active: isActive ? 0 : 1 })
      })
      const data = await res.json()
      if (data.success) loadServices()
    } catch (error) {
      console.error('Error toggling service status:', error)
    }
  }

  // Helper
  const isActive = (service) => service.is_active === 1 || service.is_active === true

  // Multi-criteria filter & sort
  const filteredServices = services
    .filter(service => {
      // Category filter
      if (selectedCategory !== 'all' && String(service.category_id) !== String(selectedCategory)) {
        return false
      }
      // Status & Feature filter
      if (statusFilter === 'active' && !isActive(service)) return false
      if (statusFilter === 'inactive' && isActive(service)) return false
      if (statusFilter === 'homepage' && !service.is_homepage) return false
      if (statusFilter === 'trending' && !service.is_trending) return false
      if (statusFilter === 'popular' && !service.is_popular) return false

      // Search term filter
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase().trim()
        const matchName = service.name?.toLowerCase().includes(query)
        const matchCat = service.category_name?.toLowerCase().includes(query)
        const matchDesc = service.short_description?.toLowerCase().includes(query) || service.description?.toLowerCase().includes(query)
        const matchSlug = service.slug?.toLowerCase().includes(query)
        const matchPrice = String(service.base_price || '').includes(query)
        if (!matchName && !matchCat && !matchDesc && !matchSlug && !matchPrice) {
          return false
        }
      }
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'name_asc') return (a.name || '').localeCompare(b.name || '')
      if (sortBy === 'name_desc') return (b.name || '').localeCompare(a.name || '')
      if (sortBy === 'price_high') return parseFloat(b.base_price || 0) - parseFloat(a.base_price || 0)
      if (sortBy === 'price_low') return parseFloat(a.base_price || 0) - parseFloat(b.base_price || 0)
      if (sortBy === 'duration_desc') return (b.duration_minutes || 0) - (a.duration_minutes || 0)
      if (sortBy === 'oldest') return (a.id || 0) - (b.id || 0)
      return (b.id || 0) - (a.id || 0)
    })

  const hasActiveFilters = searchTerm !== '' || selectedCategory !== 'all' || statusFilter !== 'all' || sortBy !== 'newest'

  const clearAllFilters = () => {
    setSearchTerm('')
    setSelectedCategory('all')
    setStatusFilter('all')
    setSortBy('newest')
    setCurrentPage(1)
  }

  // Pagination
  const totalPages = Math.ceil(filteredServices.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentServices = filteredServices.slice(startIndex, startIndex + itemsPerPage)

  const goToPage = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(price)

  const formatDuration = (minutes) => {
    if (!minutes) return 'N/A'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h${mins > 0 ? ` ${mins}m` : ''}` : `${mins}m`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-500 border-t-transparent"></div>
      </div>
    )
  }

  const inputClass = `w-full px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-teal-500`
  const labelClass = `block text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-700'}`

  return (
    <div className="p-4 sm:p-6 lg:p-8">

      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={`text-3xl sm:text-4xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Services
          </h1>
          <p className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>
            Manage all services offered by your platform
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="mt-4 sm:mt-0 px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Service
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className={`p-4 sm:p-5 rounded-2xl border mb-6 transition-all shadow-sm ${
        isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
      }`}>
        {/* Top Row: Search Input & Mobile Filter Toggle */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 mb-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search services by name, category, description, slug, or price..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }}
              className={`w-full pl-10 ${searchTerm ? 'pr-9' : 'pr-4'} py-2.5 rounded-xl text-xs sm:text-sm border focus:outline-none focus:ring-2 focus:ring-teal-500 transition ${
                isDarkMode
                  ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-400'
                  : 'bg-slate-50 border-gray-200 text-gray-900 placeholder-gray-400'
              }`}
            />
            <FiSearch className={`w-4 h-4 absolute left-3.5 top-3.5 ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`} />
            {searchTerm && (
              <button
                type="button"
                onClick={() => { setSearchTerm(''); setCurrentPage(1) }}
                className={`absolute right-3 top-3 text-xs p-0.5 rounded-full ${
                  isDarkMode ? 'text-slate-400 hover:text-white' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <FiX className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="w-full lg:w-56">
            <select
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1) }}
              className={`w-full px-3 py-2.5 rounded-xl text-xs sm:text-sm border focus:outline-none focus:ring-2 focus:ring-teal-500 transition ${
                isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-gray-200 text-gray-900'
              }`}
            >
              <option value="all">All Categories ({categories.length})</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="w-full lg:w-56">
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1) }}
              className={`w-full px-3 py-2.5 rounded-xl text-xs sm:text-sm border focus:outline-none focus:ring-2 focus:ring-teal-500 transition ${
                isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-gray-200 text-gray-900'
              }`}
            >
              <option value="newest">📅 Newest First</option>
              <option value="oldest">📅 Oldest First</option>
              <option value="name_asc">🔤 Name (A - Z)</option>
              <option value="name_desc">🔤 Name (Z - A)</option>
              <option value="price_high">💵 Price: High to Low</option>
              <option value="price_low">💵 Price: Low to High</option>
              <option value="duration_desc">⏱️ Duration: Longest First</option>
            </select>
          </div>
        </div>

        {/* Status & Feature Filter Pills */}
        <div className="overflow-x-auto pb-1 -mx-1 px-1 lg:mx-0 lg:px-0 scrollbar-hide flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 flex-nowrap">
            {[
              { id: 'all', label: 'All Services' },
              { id: 'active', label: '🟢 Active' },
              { id: 'inactive', label: '⚪ Inactive' },
              { id: 'homepage', label: '🏠 Homepage' },
              { id: 'trending', label: '🔥 Trending' },
              { id: 'popular', label: '⭐ Popular' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => { setStatusFilter(tab.id); setCurrentPage(1) }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                  statusFilter === tab.id
                    ? 'bg-teal-500 text-white shadow-sm'
                    : isDarkMode
                      ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <span className={`text-xs whitespace-nowrap font-medium ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
            Showing {filteredServices.length} {filteredServices.length === 1 ? 'service' : 'services'}
          </span>
        </div>

        {/* Active Badges & Reset Bar */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between gap-3 mt-3 pt-3 border-t border-dashed dark:border-slate-800 border-gray-200 flex-wrap text-xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`font-semibold ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Active Filters:</span>
              {searchTerm && (
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${isDarkMode ? 'bg-slate-800 text-teal-400 border border-slate-700' : 'bg-teal-50 text-teal-700 border border-teal-200'}`}>
                  Search: &quot;{searchTerm}&quot; <button onClick={() => setSearchTerm('')}><FiX className="w-3 h-3" /></button>
                </span>
              )}
              {selectedCategory !== 'all' && (
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${isDarkMode ? 'bg-slate-800 text-teal-400 border border-slate-700' : 'bg-teal-50 text-teal-700 border border-teal-200'}`}>
                  Category: {categories.find(c => String(c.id) === String(selectedCategory))?.name || selectedCategory} <button onClick={() => setSelectedCategory('all')}><FiX className="w-3 h-3" /></button>
                </span>
              )}
              {statusFilter !== 'all' && (
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${isDarkMode ? 'bg-slate-800 text-teal-400 border border-slate-700' : 'bg-teal-50 text-teal-700 border border-teal-200'}`}>
                  Filter: {statusFilter} <button onClick={() => setStatusFilter('all')}><FiX className="w-3 h-3" /></button>
                </span>
              )}
              {sortBy !== 'newest' && (
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${isDarkMode ? 'bg-slate-800 text-teal-400 border border-slate-700' : 'bg-teal-50 text-teal-700 border border-teal-200'}`}>
                  Sort: {sortBy} <button onClick={() => setSortBy('newest')}><FiX className="w-3 h-3" /></button>
                </span>
              )}
            </div>
            <button onClick={clearAllFilters} className="text-red-600 dark:text-red-400 hover:underline font-semibold">
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {currentServices.length > 0 ? currentServices.map((service) => (

          <div
            key={service.id}
            className={`rounded-xl shadow-lg border overflow-hidden transition-opacity ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'} ${!isActive(service) ? 'opacity-60' : ''}`}
          >
            <div className="p-6">
              {/* Card Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {service.image_url ? (
                    <img src={service.image_url} alt={service.name} className="w-12 h-12 rounded-lg object-contain" />
                  ) : (
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${isDarkMode ? 'bg-slate-800' : 'bg-gray-100'}`}>
                      {service.category_icon ? <Icon name={service.category_icon} /> : '🔧'}
                    </div>
                  )}
                  <div>
                    <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{service.name}</h3>
                    <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{service.category_name}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${isActive(service) ? 'bg-green-500/20 text-green-600' : 'bg-red-500/20 text-red-500'}`}>
                  {isActive(service) ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Description */}
              <p className={`text-sm mb-4 line-clamp-2 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                {service.short_description || service.description || 'No description available'}
              </p>

              {/* Price */}
              <div className="mb-4">
                <div className="flex items-baseline gap-2">
                  <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{formatPrice(service.base_price)}</span>
                  <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>base price</span>
                </div>
                {service.additional_price > 0 && (
                  <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>+{formatPrice(service.additional_price)} additional</p>
                )}
              </div>

              {/* Duration */}
              <div className="flex items-center gap-2 mb-4">
                <svg className={`w-4 h-4 ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{formatDuration(service.duration_minutes)}</span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setSelectedService(service); setIsEditModalOpen(true) }}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isDarkMode ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                >
                  Edit
                </button>
                <button
                  onClick={() => toggleServiceStatus(service)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive(service)
                      ? isDarkMode ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                      : isDarkMode ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                >
                  {isActive(service) ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => deleteService(service.id)}
                  className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-red-400' : 'text-gray-400 hover:bg-red-50 hover:text-red-600'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-full">
            <div className={`text-center py-16 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}`}>
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <p className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>No services found</p>
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                {selectedCategory === 'all' ? 'Add your first service' : 'No services in this category'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-1 sm:gap-2 flex-wrap">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-2 sm:px-3 py-2 rounded-lg text-sm font-medium transition-all ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          {(() => {
            const pages = [];
            if (totalPages <= 5) {
              for (let i = 1; i <= totalPages; i++) pages.push(i);
            } else {
              if (currentPage <= 3) {
                pages.push(1, 2, 3, 4, '...', totalPages);
              } else if (currentPage >= totalPages - 2) {
                pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
              } else {
                pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
              }
            }
            return pages.map((page, idx) => (
              page === '...' ? (
                <span key={`ellipsis-${idx}`} className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                  ...
                </span>
              ) : (
                <button
                  key={`page-${page}`}
                  onClick={() => goToPage(page)}
                  className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg text-xs sm:text-sm font-medium transition-all ${currentPage === page ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md' : isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {page}
                </button>
              )
            ));
          })()}

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-2 sm:px-3 py-2 rounded-lg text-sm font-medium transition-all ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}

      {/* Add Service Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsAddModalOpen(false)} />
          <div className={`relative rounded-xl shadow-xl w-full max-w-2xl my-8 ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}>
            <div className={`p-6 border-b ${isDarkMode ? 'border-slate-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Add New Service</h3>
              <button onClick={() => { setIsAddModalOpen(false); setImagePreview('') }} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={addService}>
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div>
                  <label className={labelClass}>Category *</label>
                  <select required value={newService.category_id} onChange={(e) => setNewService({ ...newService, category_id: e.target.value })} className={inputClass}>
                    <option value="">Select a category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Service Name *</label>
                  <input type="text" required value={newService.name}
                    onChange={(e) => setNewService({ ...newService, name: e.target.value, slug: e.target.value.toLowerCase().trim().replace(/[\/]/g, '').replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-') })}
                    className={inputClass} placeholder="e.g., Appliance Installation" />
                </div>
                <div>
                  <label className={labelClass}>Slug *</label>
                  <input type="text" required value={newService.slug} onChange={(e) => setNewService({ ...newService, slug: e.target.value })} className={inputClass} placeholder="e.g., appliance-installation" />
                </div>
                <div>
                  <label className={labelClass}>Short Description</label>
                  <input type="text" value={newService.short_description} onChange={(e) => setNewService({ ...newService, short_description: e.target.value })} className={inputClass} placeholder="Brief description" maxLength="500" />
                </div>
                <div className="col-span-full">
                  <label className={labelClass}>Full Description</label>
                  <div className="mt-1">
                    <RichTextEditor
                      value={newService.description || ''}
                      onChange={(data) => setNewService({ ...newService, description: data })}
                      placeholder="Detailed description..."
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Base Price ($) *</label>
                    <input type="number" required step="0.01" min="0" value={newService.base_price} onChange={(e) => setNewService({ ...newService, base_price: e.target.value })} className={inputClass} placeholder="0.00" />
                  </div>
                  <div>
                    <label className={labelClass}>Additional Price ($)</label>
                    <input type="number" step="0.01" min="0" value={newService.additional_price} onChange={(e) => setNewService({ ...newService, additional_price: e.target.value })} className={inputClass} placeholder="0.00" />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Duration (minutes)</label>
                  <input type="number" min="0" value={newService.duration_minutes} onChange={(e) => setNewService({ ...newService, duration_minutes: e.target.value })} className={inputClass} placeholder="e.g., 120" />
                </div>
                <div>
                  <label className={labelClass}>Service Image</label>
                  {imagePreview && <img src={imagePreview} alt="Preview" className="w-32 h-32 object-contain rounded-lg border border-gray-300 mb-3" />}
                  <div className="flex items-center gap-3 mb-2">
                    <label className={`cursor-pointer px-4 py-2 rounded-lg font-medium transition-colors inline-block ${uploading ? 'opacity-50 cursor-not-allowed bg-gray-400' : isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, false)} disabled={uploading} className="hidden" />
                      {uploading ? 'Uploading...' : 'Choose Image'}
                    </label>
                    {(imagePreview || newService.image_url) && (
                      <button type="button" onClick={() => handleImageRemove(false)} disabled={uploading} className="px-4 py-2 rounded-lg font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                        Remove Image
                      </button>
                    )}
                    {newService.image_url && !imagePreview && <span className="text-sm text-green-600">✓ Image uploaded</span>}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Max 10MB. JPG, PNG, GIF, WebP</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {[['is_homepage', 'Homepage'], ['is_trending', 'Trending'], ['is_popular', 'Popular']].map(([key, label]) => (
                    <div key={key} className="flex items-center gap-2">
                      <input type="checkbox" id={`${key}_add`} checked={newService[key] || false} onChange={(e) => setNewService({ ...newService, [key]: e.target.checked })} className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500" />
                      <label htmlFor={`${key}_add`} className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>{label}</label>
                    </div>
                  ))}
                </div>
                <div>
                  <label className={labelClass}>Customers use this service for</label>
                  <textarea rows="3" value={newService.use_cases || ''} onChange={(e) => setNewService({ ...newService, use_cases: e.target.value })} className={inputClass} placeholder="Dishwasher Repair, Washer Repair, Dryer Repair..." />
                  <p className="text-xs text-gray-500 mt-1">Separate with commas.</p>
                </div>
              </div>
              <div className={`p-6 border-t ${isDarkMode ? 'border-slate-700' : 'border-gray-200'} flex justify-end gap-3`}>
                <button type="button" onClick={() => { setIsAddModalOpen(false); setImagePreview('') }} className={`px-4 py-2 rounded-lg font-medium ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-medium hover:opacity-90 transition-opacity">Add Service</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Service Modal */}
      {isEditModalOpen && selectedService && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsEditModalOpen(false)} />
          <div className={`relative rounded-xl shadow-xl w-full max-w-2xl my-8 ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}>
            <div className={`p-6 border-b ${isDarkMode ? 'border-slate-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Edit Service</h3>
              <button onClick={() => { setIsEditModalOpen(false); setImagePreview('') }} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={updateService}>
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div>
                  <label className={labelClass}>Category *</label>
                  <select required value={selectedService.category_id} onChange={(e) => setSelectedService({ ...selectedService, category_id: parseInt(e.target.value) })} className={inputClass}>
                    <option value="">Select a category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Service Name *</label>
                  <input type="text" required value={selectedService.name} onChange={(e) => setSelectedService({ ...selectedService, name: e.target.value, slug: e.target.value.toLowerCase().trim().replace(/[\/]/g, '').replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-') })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Slug *</label>
                  <input type="text" required value={selectedService.slug} onChange={(e) => setSelectedService({ ...selectedService, slug: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Short Description</label>
                  <input type="text" value={selectedService.short_description || ''} onChange={(e) => setSelectedService({ ...selectedService, short_description: e.target.value })} className={inputClass} maxLength="500" />
                </div>
                <div className="col-span-full">
                  <label className={labelClass}>Full Description</label>
                  <div className="mt-1">
                    <RichTextEditor
                      value={selectedService.description || ''}
                      onChange={(data) => setSelectedService({ ...selectedService, description: data })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Base Price ($) *</label>
                    <input type="number" required step="0.01" min="0" value={selectedService.base_price} onChange={(e) => setSelectedService({ ...selectedService, base_price: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Additional Price ($)</label>
                    <input type="number" step="0.01" min="0" value={selectedService.additional_price || ''} onChange={(e) => setSelectedService({ ...selectedService, additional_price: e.target.value })} className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Duration (minutes)</label>
                  <input type="number" min="0" value={selectedService.duration_minutes || ''} onChange={(e) => setSelectedService({ ...selectedService, duration_minutes: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Service Image</label>
                  {(imagePreview || selectedService?.image_url) && (
                    <img src={imagePreview || selectedService?.image_url} alt="Preview" className="w-32 h-32 object-contain rounded-lg border border-gray-300 mb-3" />
                  )}
                  <div className="flex items-center gap-3 mb-2">
                    <label className={`cursor-pointer px-4 py-2 rounded-lg font-medium transition-colors inline-block ${uploading ? 'opacity-50 cursor-not-allowed bg-gray-400' : isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, true)} disabled={uploading} className="hidden" />
                      {uploading ? 'Uploading...' : 'Change Image'}
                    </label>
                    {(imagePreview || selectedService?.image_url) && (
                      <button type="button" onClick={() => handleImageRemove(true)} disabled={uploading} className="px-4 py-2 rounded-lg font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                        Remove Image
                      </button>
                    )}
                    {selectedService?.image_url && !imagePreview && <span className="text-sm text-green-600">✓ Image uploaded</span>}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Max 10MB. JPG, PNG, GIF, WebP</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {[['is_homepage', 'Homepage'], ['is_trending', 'Trending'], ['is_popular', 'Popular']].map(([key, label]) => (
                    <div key={key} className="flex items-center gap-2">
                      <input type="checkbox" id={`${key}_edit`} checked={selectedService[key] === 1 || selectedService[key] === true || false} onChange={(e) => setSelectedService({ ...selectedService, [key]: e.target.checked })} className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500" />
                      <label htmlFor={`${key}_edit`} className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>{label}</label>
                    </div>
                  ))}
                </div>
                <div>
                  <label className={labelClass}>Customers use this service for</label>
                  <textarea rows="3" value={selectedService.use_cases || ''} onChange={(e) => setSelectedService({ ...selectedService, use_cases: e.target.value })} className={inputClass} placeholder="Dishwasher Repair, Washer Repair, Dryer Repair..." />
                  <p className="text-xs text-gray-500 mt-1">Separate with commas.</p>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="is_active_edit" checked={isActive(selectedService)} onChange={(e) => setSelectedService({ ...selectedService, is_active: e.target.checked ? 1 : 0 })} className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500" />
                  <label htmlFor="is_active_edit" className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>Active (visible to customers)</label>
                </div>
              </div>
              <div className={`p-6 border-t ${isDarkMode ? 'border-slate-700' : 'border-gray-200'} flex justify-end gap-3`}>
                <button type="button" onClick={() => { setIsEditModalOpen(false); setImagePreview('') }} className={`px-4 py-2 rounded-lg font-medium ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-medium hover:opacity-90 transition-opacity">Update Service</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}