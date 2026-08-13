import Link from 'next/link';
import db from '@/lib/db';
import { getSeoForPath } from '@/lib/seo';
import ServiceLocationClientPage from './ServiceLocationClientPage';

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const { serviceId, locationSlug } = resolvedParams;
  const path = `/services/${serviceId}/${locationSlug}`;

  const seoData = await getSeoForPath(path);

  const formattedLocName = locationSlug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  const fallbackTitle = `Best ${serviceId.charAt(0).toUpperCase() + serviceId.slice(1)} Services in ${formattedLocName}, BC | WorkOnTap`;
  const fallbackDesc = `Book top-rated local ${serviceId} professionals in ${formattedLocName}, BC. Fast response, background-checked pros, transparent pricing. Book online today!`;

  return {
    title: seoData.title && seoData.title !== 'WorkOnTap - Home Maintenance Services' ? seoData.title : fallbackTitle,
    description: seoData.description && seoData.description !== 'Book trusted local pros for your home maintenance needs' ? seoData.description : fallbackDesc,
    keywords: seoData.keywords,
    alternates: {
      canonical: seoData.canonical || `https://workontap.com/services/${serviceId}/${locationSlug}`,
    },
    openGraph: {
      title: seoData.ogTitle || fallbackTitle,
      description: seoData.ogDescription || fallbackDesc,
      images: seoData.ogImage ? [{ url: seoData.ogImage }] : [],
    },
    robots: seoData.robots || 'index, follow',
  };
}

export default async function ServiceLocationPage({ params }) {
  const resolvedParams = await params;
  const { serviceId, locationSlug } = resolvedParams;

  let service = null;
  let serviceLocation = null;
  let allLocations = [];

  try {
    // 1. Fetch Service Data
    const services = await db.query(
      `SELECT s.*, sc.name as category_name, sc.icon as category_icon
       FROM services s
       LEFT JOIN service_categories sc ON s.category_id = sc.id
       WHERE (s.slug = ? OR s.id = ?) AND s.is_active = 1 LIMIT 1`,
      [serviceId, serviceId]
    );
    if (services && services.length > 0) {
      service = services[0];
    }

    // 2. Fetch Service Location Record if available
    if (service) {
      const locRows = await db.query(
        `SELECT * FROM service_locations 
         WHERE service_id = ? AND (location_slug = ? OR LOWER(location_name) = ?) AND is_active = 1 LIMIT 1`,
        [service.id, locationSlug, locationSlug.replace(/-/g, ' ')]
      );
      if (locRows && locRows.length > 0) {
        serviceLocation = locRows[0];
      }
    }

    // 3. Fetch list of available Metro Vancouver locations for internal links
    const locList = await db.query(
      `SELECT DISTINCT location_name, location_slug FROM service_locations WHERE is_active = 1 ORDER BY location_name ASC LIMIT 20`
    );
    allLocations = locList || [];
  } catch (e) {
    console.error('Error fetching service location page data:', e);
  }

  // Format Location Name
  const locationName = serviceLocation?.location_name || locationSlug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return (
    <ServiceLocationClientPage
      service={service}
      serviceLocation={serviceLocation}
      serviceId={serviceId}
      locationSlug={locationSlug}
      locationName={locationName}
      allLocations={allLocations}
    />
  );
}
