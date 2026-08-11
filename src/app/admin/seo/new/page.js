'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAdminTheme } from '../../layout'

export default function NewSeoSetting() {
  const router = useRouter()
  const { isDarkMode } = useAdminTheme()
  
  const [newSetting, setNewSetting] = useState({
    page_name: '', meta_title: '', meta_description: '', keywords: '', 
    canonical_url: '', og_title: '', og_description: '', og_image: '', 
    header_scripts: '', footer_scripts: ''
  })

  const addSetting = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/admin/seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSetting)
      })
      const data = await res.json()
      if (data.success) {
        router.push('/admin/seo')
      } else {
        alert(data.message)
      }
    } catch (error) {
      console.error('Error adding seo setting:', error)
    }
  }

  const inputClasses = `w-full px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-teal-500`
  const labelClasses = `block text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-700'}`

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8 flex items-center gap-4">
        <Link href="/admin/seo" className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-gray-100 text-gray-600'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Add SEO Setting
          </h1>
        </div>
      </div>

      <div className={`rounded-xl shadow-lg border overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'} max-w-4xl mx-auto`}>
        <form onSubmit={addSetting}>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className={labelClasses}>Page Name / Route *</label>
                <input type="text" required value={newSetting.page_name}
                  onChange={(e) => setNewSetting({ ...newSetting, page_name: e.target.value })}
                  placeholder="e.g. home, about-us, or global"
                  className={inputClasses}
                />
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                  Use &quot;global&quot; to apply header/footer scripts globally across the site.
                </p>
              </div>

              <div>
                <label className={labelClasses}>Meta Title</label>
                <input type="text" value={newSetting.meta_title}
                  onChange={(e) => setNewSetting({ ...newSetting, meta_title: e.target.value })}
                  className={inputClasses}
                />
              </div>
              
              <div>
                <label className={labelClasses}>Canonical URL</label>
                <input type="url" value={newSetting.canonical_url}
                  onChange={(e) => setNewSetting({ ...newSetting, canonical_url: e.target.value })}
                  className={inputClasses}
                />
              </div>

              <div className="md:col-span-2">
                <label className={labelClasses}>Keywords</label>
                <input type="text" value={newSetting.keywords}
                  onChange={(e) => setNewSetting({ ...newSetting, keywords: e.target.value })}
                  placeholder="Comma separated keywords"
                  className={inputClasses}
                />
              </div>

              <div className="md:col-span-2">
                <label className={labelClasses}>Meta Description</label>
                <textarea rows="3" value={newSetting.meta_description}
                  onChange={(e) => setNewSetting({ ...newSetting, meta_description: e.target.value })}
                  className={inputClasses}
                />
              </div>

              <div className="md:col-span-2 border-t pt-4 mt-2 border-gray-200 dark:border-gray-700">
                <h4 className={`font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Open Graph (Social Sharing)</h4>
              </div>

              <div>
                <label className={labelClasses}>OG Title</label>
                <input type="text" value={newSetting.og_title}
                  onChange={(e) => setNewSetting({ ...newSetting, og_title: e.target.value })}
                  className={inputClasses}
                />
              </div>

              <div>
                <label className={labelClasses}>OG Image URL</label>
                <input type="url" value={newSetting.og_image}
                  onChange={(e) => setNewSetting({ ...newSetting, og_image: e.target.value })}
                  className={inputClasses}
                />
              </div>

              <div className="md:col-span-2">
                <label className={labelClasses}>OG Description</label>
                <textarea rows="2" value={newSetting.og_description}
                  onChange={(e) => setNewSetting({ ...newSetting, og_description: e.target.value })}
                  className={inputClasses}
                />
              </div>

              <div className="md:col-span-2 border-t pt-4 mt-2 border-gray-200 dark:border-gray-700">
                <h4 className={`font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Custom Scripts</h4>
              </div>

              <div className="md:col-span-2">
                <label className={labelClasses}>Header Scripts (&lt;head&gt;)</label>
                <textarea rows="4" value={newSetting.header_scripts}
                  onChange={(e) => setNewSetting({ ...newSetting, header_scripts: e.target.value })}
                  placeholder="<!-- e.g., Google Analytics script -->"
                  className={`${inputClasses} font-mono text-sm`}
                />
              </div>

              <div className="md:col-span-2">
                <label className={labelClasses}>Footer Scripts (before &lt;/body&gt;)</label>
                <textarea rows="4" value={newSetting.footer_scripts}
                  onChange={(e) => setNewSetting({ ...newSetting, footer_scripts: e.target.value })}
                  placeholder="<!-- e.g., Live chat widget script -->"
                  className={`${inputClasses} font-mono text-sm`}
                />
              </div>
            </div>
          </div>
          
          <div className={`p-6 border-t ${isDarkMode ? 'border-slate-800' : 'border-gray-200'} flex justify-end gap-3`}>
            <Link href="/admin/seo"
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              Cancel
            </Link>
            <button type="submit" className="px-6 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-medium hover:opacity-90 transition-opacity">
              Save Setting
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
