'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useAdminTheme } from '../../../layout'

const RichTextEditor = dynamic(() => import('../../../../../components/RichTextEditor'), { ssr: false })

export default function EditBlog({ params }) {
  const router = useRouter()
  const { isDarkMode } = useAdminTheme()
  const { id } = use(params)
  
  const [loading, setLoading] = useState(true)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [blog, setBlog] = useState({
    title: '', slug: '', content: '', author: '', image_url: '', 
    meta_title: '', meta_description: '', keywords: '', is_published: false
  })

  useEffect(() => {
    if (id) {
      fetchBlog()
    }
  }, [id])

  const fetchBlog = async () => {
    try {
      const res = await fetch(`/api/admin/blogs/${id}`)
      const data = await res.json()
      if (data.success && data.data) {
        setBlog({
          ...data.data,
          is_published: !!data.data.is_published
        })
      } else {
        alert('Blog not found')
        router.push('/admin/blogs')
      }
    } catch (error) {
      console.error('Error fetching blog:', error)
      router.push('/admin/blogs')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setBlog({ ...blog, image_url: data.url });
      } else {
        alert(data.message || 'Image upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const updateBlog = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch(`/api/admin/blogs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(blog)
      })
      const data = await res.json()
      if (data.success) {
        router.push('/admin/blogs')
      } else {
        alert(data.message)
      }
    } catch (error) {
      console.error('Error updating blog:', error)
    }
  }

  const inputClasses = `w-full px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-teal-500`
  const labelClasses = `block text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-700'}`

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-500 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8 flex items-center gap-4">
        <Link href="/admin/blogs" className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-gray-100 text-gray-600'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Edit Blog Post
          </h1>
        </div>
      </div>

      <div className={`rounded-xl shadow-lg border overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'} max-w-4xl mx-auto`}>
        <form onSubmit={updateBlog}>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className={labelClasses}>Title *</label>
                <input type="text" required value={blog.title || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    const slug = val.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
                    setBlog({ ...blog, title: val, slug: blog.id ? blog.slug : slug })
                  }}
                  className={inputClasses}
                />
              </div>
              <div>
                <label className={labelClasses}>Slug *</label>
                <input type="text" required value={blog.slug || ''}
                  onChange={(e) => setBlog({ ...blog, slug: e.target.value })}
                  className={inputClasses}
                />
              </div>
              <div>
                <label className={labelClasses}>Author</label>
                <input type="text" value={blog.author || ''}
                  onChange={(e) => setBlog({ ...blog, author: e.target.value })}
                  className={inputClasses}
                />
              </div>
              
              <div className="md:col-span-2">
                <label className={labelClasses}>Feature Image</label>
                <div className="flex items-center gap-4">
                  {blog.image_url && (
                    <img src={blog.image_url} alt="Preview" className="h-16 w-16 object-cover rounded-lg border border-gray-200" />
                  )}
                  <input type="file" accept="image/*"
                    onChange={handleImageUpload}
                    className={`file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold ${isDarkMode ? 'file:bg-slate-800 file:text-teal-400 text-slate-300' : 'file:bg-teal-50 file:text-teal-700 text-gray-600'}`}
                  />
                  {uploadingImage && <span className="text-sm text-teal-500 animate-pulse">Uploading...</span>}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className={labelClasses}>Content (HTML Supported)</label>
                <div className={`mt-1 ${isDarkMode ? 'dark-mode-ckeditor' : ''}`}>
                  <RichTextEditor 
                    value={blog.content || ''}
                    onChange={(data) => setBlog({ ...blog, content: data })}
                    placeholder="Write your blog post content here..."
                  />
                </div>
                {isDarkMode && (
                  <style jsx global>{`
                    .dark-mode-ckeditor .ck-editor__main .ck-content,
                    .dark-mode-ckeditor .ck-toolbar {
                      background-color: #1e293b !important;
                      color: #e2e8f0 !important;
                      border-color: #334155 !important;
                    }
                    .dark-mode-ckeditor .ck-button {
                      color: #cbd5e1 !important;
                    }
                    .dark-mode-ckeditor .ck-button:hover,
                    .dark-mode-ckeditor .ck-button.ck-on {
                      background-color: #334155 !important;
                    }
                  `}</style>
                )}
              </div>
              
              <div className="md:col-span-2 border-t pt-4 mt-2 border-gray-200 dark:border-gray-700">
                <h4 className={`font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>SEO Settings</h4>
              </div>
              <div>
                <label className={labelClasses}>Meta Title</label>
                <input type="text" value={blog.meta_title || ''}
                  onChange={(e) => setBlog({ ...blog, meta_title: e.target.value })}
                  className={inputClasses}
                />
              </div>
              <div>
                <label className={labelClasses}>Keywords</label>
                <input type="text" value={blog.keywords || ''}
                  onChange={(e) => setBlog({ ...blog, keywords: e.target.value })}
                  className={inputClasses}
                />
              </div>
              <div className="md:col-span-2">
                <label className={labelClasses}>Meta Description</label>
                <textarea rows="3" value={blog.meta_description || ''}
                  onChange={(e) => setBlog({ ...blog, meta_description: e.target.value })}
                  className={inputClasses}
                />
              </div>

              <div className="md:col-span-2 flex items-center mt-4">
                <input type="checkbox" id="is_published" checked={!!blog.is_published}
                  onChange={(e) => setBlog({ ...blog, is_published: e.target.checked })}
                  className="w-5 h-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                />
                <label htmlFor="is_published" className={`ml-2 text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                  Publish immediately
                </label>
              </div>
            </div>
          </div>
          
          <div className={`p-6 border-t ${isDarkMode ? 'border-slate-800' : 'border-gray-200'} flex justify-end gap-3`}>
            <Link href="/admin/blogs"
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              Cancel
            </Link>
            <button type="submit" disabled={uploadingImage} className="px-6 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
              Update Post
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
