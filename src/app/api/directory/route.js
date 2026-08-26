import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

const CANADIAN_CITIES = [
  'Abbotsford', 'Airdrie', 'Brampton', 'Brandon', 'Burnaby', 
  'Calgary', 'Charlottetown', 'Conception Bay South', 'Coquitlam', 
  'Corner Brook', 'Cornwall', 'Dieppe', 'Edmonton', 'Fort McMurray', 
  'Fredericton', 'Gatineau', 'Glace Bay', 'Grande Prairie', 'Halifax', 
  'Hamilton', 'Iqaluit', 'Kelowna', 'Kitchener', 'Laval', 
  'Lethbridge', 'Levis', 'London', 'Longueuil', 'Markham', 
  'Medicine Hat', 'Mississauga', 'Moncton', 'Moose Jaw', 'Mount Pearl', 
  'New Glasgow', 'Ottawa', 'Paradise', 'Portage la Prairie', 'Prince Albert', 
  'Quebec City', 'Red Deer', 'Regina', 'Richmond', 'Saguenay', 
  'Saint John', 'Saskatoon', 'Sherbrooke', "St. John's"
];

function generateSlug(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

export async function GET() {
  try {
    const sql = `
      SELECT 
        s.name as service_name, 
        s.slug as service_slug,
        s.description,
        s.short_description,
        sl.location_name,
        sl.location_slug,
        sl.slug as full_slug
      FROM service_locations sl
      JOIN services s ON sl.service_id = s.id
      WHERE sl.is_active = 1 AND s.is_active = 1
      ORDER BY sl.location_name ASC, s.name ASC
    `;
    const data = await query(sql);
    
    return NextResponse.json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('Error fetching directory data:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch directory', error: error.message },
      { status: 500 }
    );
  }
}
