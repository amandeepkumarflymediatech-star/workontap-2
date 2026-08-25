import db from '@/lib/db';
import { getSeoForPath } from '@/lib/seo';
import ServiceLocationClientPage from './ServiceLocationClientPage';
import ServiceDetailClientPage from './ServiceDetailClientPage';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';



export default async function ServiceDynamicPage({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams.serviceId;

  // 1. Check if it's a direct service slug
  const services = await db.query(
    `SELECT s.*, sc.name as category_name, sc.icon as category_icon, sc.image_url as category_image_url
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
      `SELECT s.*, sc.name as category_name, sc.icon as category_icon, sc.image_url as category_image_url
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
