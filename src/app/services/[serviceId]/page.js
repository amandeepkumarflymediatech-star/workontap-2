import db from '@/lib/db';
import { getSeoForPath } from '@/lib/seo';
import ServiceLocationClientPage from './ServiceLocationClientPage';
import ServiceDetailClientPage from './ServiceDetailClientPage';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams.serviceId;
  const path = `/services/${slug}`;

  const seoData = await getSeoForPath(path);
  
  if (seoData && Object.keys(seoData).length > 0 && seoData.title && seoData.title !== 'WorkOnTap - Home Maintenance Services') {
    return {
      title: seoData.title,
      description: seoData.description,
      keywords: seoData.keywords,
      alternates: {
        canonical: seoData.canonical || `https://workontap.com${path}`,
      },
      openGraph: {
        title: seoData.ogTitle || seoData.title,
        description: seoData.ogDescription || seoData.description,
        images: seoData.ogImage ? [{ url: seoData.ogImage }] : [],
      },
      robots: seoData.robots || 'index, follow',
    };
  }

  // Try to parse if it's a location slug to give a better fallback
  const allServices = await db.query(
    `SELECT id, name, slug FROM services WHERE is_active = 1 ORDER BY LENGTH(slug) DESC`
  );
  
  let isLocation = false;
  let serviceName = '';
  let locationName = '';

  for (const s of allServices) {
    if (slug.startsWith(s.slug + '-')) {
      isLocation = true;
      serviceName = s.name;
      const locSlug = slug.substring(s.slug.length + 1);
      locationName = locSlug
        .split('-')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      break;
    }
  }

  if (isLocation) {
    return {
      title: `Best ${serviceName} Services in ${locationName}, BC | WorkOnTap`,
      description: `Book top-rated local ${serviceName} professionals in ${locationName}, BC. Fast response, background-checked pros, transparent pricing. Book online today!`,
    };
  }

  return {
    title: `Book Trusted Services | WorkOnTap`,
    description: `Book top-rated local professionals for your home maintenance needs. Fast response, transparent pricing. Book online today!`,
  };
}

export default async function ServiceDynamicPage({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams.serviceId;

  // 1. Check if it's a direct service slug
  const services = await db.query(
    `SELECT s.*, sc.name as category_name, sc.icon as category_icon
     FROM services s
     LEFT JOIN service_categories sc ON s.category_id = sc.id
     WHERE s.slug = ? AND s.is_active = 1 LIMIT 1`,
    [slug]
  );

  if (services && services.length > 0) {
    return <ServiceDetailClientPage serviceId={slug} />;
  }

  // 2. Check if it's a service-location slug combination (e.g. wifi-setup-richmond)
  const allServices = await db.query(
    `SELECT id, name, slug FROM services WHERE is_active = 1 ORDER BY LENGTH(slug) DESC`
  );
  
  let matchedService = null;
  let locationSlug = '';
  
  for (const s of allServices) {
    if (slug.startsWith(s.slug + '-')) {
      matchedService = s;
      locationSlug = slug.substring(s.slug.length + 1);
      break;
    }
  }

  if (matchedService && locationSlug) {
    // Try to get custom location data if it exists
    const locRows = await db.query(
      `SELECT * FROM service_locations 
       WHERE service_id = ? AND (location_slug = ? OR LOWER(location_name) = ?) AND is_active = 1 LIMIT 1`,
      [matchedService.id, locationSlug, locationSlug.replace(/-/g, ' ')]
    );

    const serviceLocation = (locRows && locRows.length > 0) ? locRows[0] : null;
    
    const locList = await db.query(
      `SELECT DISTINCT location_name, location_slug FROM service_locations WHERE is_active = 1 ORDER BY location_name ASC LIMIT 20`
    );
    
    const locationName = serviceLocation?.location_name || locationSlug
      .split('-')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    // Re-fetch full service data since we only queried id, name, slug above
    const fullServices = await db.query(
      `SELECT s.*, sc.name as category_name, sc.icon as category_icon
       FROM services s
       LEFT JOIN service_categories sc ON s.category_id = sc.id
       WHERE s.id = ? AND s.is_active = 1 LIMIT 1`,
      [matchedService.id]
    );
    
    const fullMatchedService = fullServices && fullServices.length > 0 ? fullServices[0] : matchedService;

    return (
      <ServiceLocationClientPage
        service={fullMatchedService}
        serviceLocation={serviceLocation}
        serviceId={fullMatchedService.slug}
        locationSlug={locationSlug}
        locationName={locationName}
        allLocations={locList || []}
      />
    );
  }

  console.log('--- DEBUG START ---');
  console.log('Incoming slug:', slug);
  console.log('Services check 1:', services?.length);
  console.log('Matched Service:', matchedService?.slug);
  console.log('Location Slug:', locationSlug);

  return notFound();
}
