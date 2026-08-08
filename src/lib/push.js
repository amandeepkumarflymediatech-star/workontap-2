import { Expo } from 'expo-server-sdk';
import { messaging } from './firebase.js';

let expo = new Expo();

/**
 * 🚀 Hybrid Push Notification Utility (Expo + Firebase Cloud Messaging)
 */

/**
 * Sends a push notification via Expo Push API and Firebase FCM
 * @param {string|string[]} tokens - Single token or array of tokens
 * @param {string} title - Title of the notification
 * @param {string} body - Body message
 * @param {Object} data - Optional data payload
 */
export async function sendPushNotification(tokens, title, body, data = {}) {
  const tokenList = Array.isArray(tokens) ? tokens : [tokens];
  const expoTokens = [];
  const fcmTokens = [];

  for (let t of tokenList) {
    if (!t) continue;
    if (Expo.isExpoPushToken(t)) {
      expoTokens.push(t);
    } else {
      // Native Firebase FCM Token
      fcmTokens.push(t);
    }
  }

  const results = { success: true, expo: null, fcm: null };

  // 1. Send via Expo Push Service
  if (expoTokens.length > 0) {
    const messages = expoTokens.map(pushToken => ({
      to: pushToken,
      sound: 'default',
      title,
      body,
      data,
      priority: 'high',
    }));

    let chunks = expo.chunkPushNotifications(messages);
    let tickets = [];
    try {
      for (let chunk of chunks) {
        let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      }
      results.expo = { success: true, tickets };
    } catch (err) {
      console.error('[Push] Expo Push Error:', err.message);
      results.expo = { success: false, error: err.message };
    }
  }

  // 2. Send via Firebase Admin Messaging (FCM)
  if (fcmTokens.length > 0 && messaging) {
    try {
      const stringData = {};
      if (data && typeof data === 'object') {
        for (const [k, v] of Object.entries(data)) {
          stringData[k] = typeof v === 'object' ? JSON.stringify(v) : String(v);
        }
      }

      const fcmResponse = await messaging.sendEachForMulticast({
        tokens: fcmTokens,
        notification: {
          title,
          body,
        },
        data: stringData,
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            color: '#115e59',
          },
        },
      });
      results.fcm = { success: true, successCount: fcmResponse.successCount, failureCount: fcmResponse.failureCount };
      console.log(`[Push] Firebase FCM Sent: ${fcmResponse.successCount} success, ${fcmResponse.failureCount} failed.`);
    } catch (fcmErr) {
      console.warn('[Push] FCM Direct Send Notice:', fcmErr.message);
      results.fcm = { success: false, error: fcmErr.message };
    }
  }

  if (expoTokens.length === 0 && fcmTokens.length === 0) {
    console.log('[Push] No tokens provided.');
    return { success: false, message: 'No tokens provided' };
  }

  return results;
}

/**
 * Helper to get user push tokens from database and send notification
 * @param {number} userId - ID of the user
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {Object} data - Optional payload
 * @param {Object} db - Database execute helper
 * @param {string} role - 'customer', 'provider', or 'admin'
 */
export async function notifyUser(userId, title, body, data = {}, db, role = 'customer') {
  try {
    const idCol = role === 'provider' ? 'provider_id' : (role === 'admin' ? 'id' : 'user_id');
    
    let tokens = [];
    if (role === 'admin') {
        const res = await db(
            `SELECT push_token FROM mobile_auth_users WHERE user_id = ? AND push_token IS NOT NULL`,
            [userId]
        );
        tokens = res;
    } else {
        const res = await db(
            `SELECT push_token FROM mobile_auth_users WHERE ${idCol} = ? AND push_token IS NOT NULL`,
            [userId]
        );
        tokens = res;
    }

    if (tokens.length === 0) {
      console.log(`[Push] No tokens found for user ${userId} (${role})`);
      return { success: false, message: 'User has no registered tokens' };
    }

    const tokenList = tokens.map(t => t.push_token);
    return await sendPushNotification(tokenList, title, body, data);
  } catch (error) {
    console.error(`[Push] Error notifying user ${userId}:`, error);
    return { success: false, error: error.message };
  }
}
