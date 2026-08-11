import db from '@/lib/db'

export async function getSeoForPath(rawPathname) {
  let pathname = (rawPathname || '/').trim()
  if (pathname.length > 1 && pathname.endsWith('/')) {
    pathname = pathname.slice(0, -1)
  }
  if (!pathname || pathname === '' || pathname === 'index') {
    pathname = '/'
  }

  let globalSeo = null
  let pageSeo = null
  let blogSeo = null
  let serviceSeo = null

  // 1. Fetch Global SEO
  try {
    const rows = await db.query("SELECT * FROM seo_settings WHERE LOWER(page_name) = 'global' LIMIT 1")
    if (rows && rows.length > 0) globalSeo = rows[0]
  } catch (e) {
    console.error('Error fetching global SEO:', e)
  }

  // Build page name variants
  const cleanName = pathname.replace(/^\//, '')
  const pageVariants = [
    pathname,
    cleanName,
    pathname.toLowerCase(),
    cleanName.toLowerCase()
  ]
  if (pathname === '/') {
    pageVariants.push('home', 'index', '')
  }

  // 2. Fetch Page SEO from seo_settings
  try {
    const rows = await db.query(
      `SELECT * FROM seo_settings WHERE LOWER(page_name) IN (?) LIMIT 1`,
      [pageVariants]
    )
    if (rows && rows.length > 0) pageSeo = rows[0]
  } catch (e) {
    console.error('Error fetching page SEO:', e)
  }

  const lastSegment = pathname.split('/').filter(Boolean).pop()

  // 3. Fetch Blog SEO if visiting a blog detail page (/blogs/:id_or_slug)
  if (pathname.includes('/blogs/') && lastSegment && lastSegment !== 'blogs') {
    try {
      const rows = await db.query(
        `SELECT * FROM blogs WHERE (slug = ? OR id = ?) AND is_published = 1 LIMIT 1`,
        [lastSegment, lastSegment]
      )
      if (rows && rows.length > 0) blogSeo = rows[0]
    } catch (e) {
      console.error('Error fetching blog SEO:', e)
    }
  }

  // 4. Fetch Service SEO if visiting a service detail page (/services/:id_or_slug)
  if (pathname.includes('/services/') && lastSegment && lastSegment !== 'services') {
    try {
      const rows = await db.query(
        `SELECT * FROM services WHERE (slug = ? OR id = ?) AND is_active = 1 LIMIT 1`,
        [lastSegment, lastSegment]
      )
      if (rows && rows.length > 0) serviceSeo = rows[0]
    } catch (e) {
      console.error('Error fetching service SEO:', e)
    }
  }

  const title = 
    blogSeo?.meta_title || 
    blogSeo?.title || 
    (serviceSeo ? `${serviceSeo.name} | WorkOnTap` : null) || 
    pageSeo?.meta_title || 
    globalSeo?.meta_title || 
    'WorkOnTap - Home Maintenance Services'

  const rawServiceDesc = serviceSeo?.short_description || serviceSeo?.description || null
  const cleanServiceDesc = rawServiceDesc ? rawServiceDesc.replace(/<[^>]*>?/gm, '').slice(0, 160) : null

  const description = 
    blogSeo?.meta_description || 
    cleanServiceDesc || 
    pageSeo?.meta_description || 
    globalSeo?.meta_description || 
    'Book trusted local pros for your home maintenance needs'

  const keywords = 
    blogSeo?.keywords || 
    (serviceSeo ? `${serviceSeo.name}, home service, workontap` : null) || 
    pageSeo?.keywords || 
    globalSeo?.keywords || 
    'home maintenance, plumbers, electricians, hvac, cleaners'

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://workontap.com'
  const canonical = 
    blogSeo?.canonical_url || 
    pageSeo?.canonical_url || 
    globalSeo?.canonical_url || 
    `${baseUrl}${pathname}`

  const robots = 
    blogSeo?.meta_robots || 
    pageSeo?.meta_robots || 
    globalSeo?.meta_robots || 
    'index, follow'

  const ogTitle = 
    blogSeo?.og_title || 
    pageSeo?.og_title || 
    title

  const ogDescription = 
    blogSeo?.og_description || 
    pageSeo?.og_description || 
    description

  let ogImage = 
    blogSeo?.og_image || 
    blogSeo?.image_url || 
    serviceSeo?.image_url || 
    pageSeo?.og_image || 
    globalSeo?.og_image || 
    null

  if (ogImage && ogImage.includes('localhost')) {
    ogImage = ogImage.replace('http://localhost:3000', baseUrl)
  }

  return {
    title,
    description,
    keywords,
    canonical,
    robots,
    ogTitle,
    ogDescription,
    ogImage,
    headerScripts: pageSeo?.header_scripts || globalSeo?.header_scripts || '',
    footerScripts: pageSeo?.footer_scripts || globalSeo?.footer_scripts || ''
  }
}
