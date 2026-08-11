import db from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://workontap.com'

  let textContent = `# WorkOnTap - Home Service Platform\n\n`
  textContent += `> WorkOnTap connects customers with verified, professional home service providers for plumbing, electrical, cleaning, carpentry, painting, moving, and more.\n\n`
  
  textContent += `## Core Pages\n`
  textContent += `- [Home](${baseUrl}/)\n`
  textContent += `- [Services](${baseUrl}/services)\n`
  textContent += `- [Blogs](${baseUrl}/blogs)\n`
  textContent += `- [About Us](${baseUrl}/about)\n`
  textContent += `- [Contact Us](${baseUrl}/contact)\n`
  textContent += `- [FAQ](${baseUrl}/faq)\n`
  textContent += `- [Help](${baseUrl}/help)\n`
  textContent += `- [Terms of Service](${baseUrl}/terms)\n`
  textContent += `- [Privacy Policy](${baseUrl}/privacy)\n`
  textContent += `- [Data Deletion](${baseUrl}/data-deletion)\n\n`

  // 1. Fetch Active Services
  try {
    const services = await db.query(`
      SELECT s.id, s.name, s.slug, s.short_description, s.description, s.base_price, sc.name as category_name
      FROM services s
      LEFT JOIN service_categories sc ON s.category_id = sc.id
      WHERE s.is_active = 1
      ORDER BY sc.display_order ASC, s.name ASC
    `)

    if (services && services.length > 0) {
      textContent += `## Available Services\n`
      for (const service of services) {
        const serviceUrl = `${baseUrl}/services/${service.slug || service.id}`
        const rawDesc = service.short_description || service.description || ''
        const cleanDesc = rawDesc ? rawDesc.replace(/\s+/g, ' ').trim() : ''
        const priceStr = service.base_price ? ` (Starting at $${service.base_price})` : ''
        
        if (cleanDesc) {
          textContent += `- [${service.name}](${serviceUrl}): ${cleanDesc}${priceStr}\n`
        } else {
          textContent += `- [${service.name}](${serviceUrl})${priceStr}\n`
        }
      }
      textContent += `\n`
    }
  } catch (error) {
    console.error('Error fetching Services for llms.txt:', error)
  }

  // 2. Fetch Published Blogs
  try {
    const blogs = await db.query(`
      SELECT id, title, slug, meta_description, author, created_at
      FROM blogs
      WHERE is_published = 1
      ORDER BY created_at DESC
    `)

    if (blogs && blogs.length > 0) {
      textContent += `## Latest Blog Posts\n`
      for (const blog of blogs) {
        const blogUrl = `${baseUrl}/blogs/${blog.slug || blog.id}`
        const desc = blog.meta_description ? `: ${blog.meta_description.replace(/\s+/g, ' ').trim()}` : ''
        textContent += `- [${blog.title}](${blogUrl})${desc}\n`
      }
      textContent += `\n`
    }
  } catch (error) {
    console.error('Error fetching Blogs for llms.txt:', error)
  }

  return new Response(textContent, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
