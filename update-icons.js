import 'dotenv/config';
import db from './src/lib/db.js';

async function updateIcons() {
    try {
        await db.execute("UPDATE service_categories SET icon = 'star-outline' WHERE name = 'Featured Packages'");
        await db.execute("UPDATE service_categories SET icon = 'cube-outline' WHERE name = 'Moving Services'");
        await db.execute("UPDATE service_categories SET icon = 'sparkles-outline' WHERE name = 'Cleaning'");
        await db.execute("UPDATE service_categories SET icon = 'hammer-outline' WHERE name = 'Handyman'");
        
        console.log('Icons updated successfully');
        
        const rows = await db.query('SELECT id, name, icon FROM service_categories');
        console.table(rows);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

updateIcons();
