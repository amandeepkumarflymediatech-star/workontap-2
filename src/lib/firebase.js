import fs from 'fs';
import path from 'path';

/**
 * 🚀 Safe Firebase Admin SDK Initialization (firebase-admin v14+)
 * Project: workontap-6e005
 */

let adminApp = null;
let messaging = null;

try {
  const { initializeApp, cert, getApps } = require('firebase-admin/app');
  const { getMessaging } = require('firebase-admin/messaging');

  const apps = getApps();
  if (apps.length === 0) {
    let credential = null;

    // 1. Check for google.json file in project root
    const possiblePaths = [
      path.join(process.cwd(), 'google.json'),
      path.resolve('google.json'),
      path.join(__dirname, '../../google.json'),
      path.join(__dirname, '../../../google.json'),
    ];

    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        try {
          const serviceAccount = JSON.parse(fs.readFileSync(p, 'utf8'));
          credential = cert(serviceAccount);
          console.log(`✅ [Firebase Admin] Loaded Service Account from google.json`);
          break;
        } catch (e) {
          // ignore
        }
      }
    }

    // 2. Check for environment variables
    if (!credential) {
      const projectId = process.env.FIREBASE_PROJECT_ID || 'workontap-6e005';
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      const privateKey = process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined;

      if (clientEmail && privateKey) {
        credential = cert({
          projectId,
          clientEmail,
          privateKey,
        });
        console.log('✅ [Firebase Admin] Initialized with Service Account from .env');
      }
    }

    const projectId = process.env.FIREBASE_PROJECT_ID || 'workontap-6e005';
    adminApp = initializeApp(credential ? { credential } : { projectId });
    if (credential) {
      console.log('✅ [Firebase Admin] Initialized with Service Account Credential');
    } else {
      console.log('⚠️ [Firebase Admin] Initialized with Project ID fallback');
    }
  } else {
    adminApp = apps[0];
  }

  if (adminApp) {
    messaging = getMessaging(adminApp);
  }
} catch (error) {
  console.warn('⚠️ [Firebase Admin] Module notice:', error.message);
}

export { messaging };
export default adminApp;
