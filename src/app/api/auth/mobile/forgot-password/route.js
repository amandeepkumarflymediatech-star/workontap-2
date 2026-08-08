import { NextResponse } from 'next/server'
import { execute as query } from '@/lib/db'
import { sendEmail } from '@/lib/email'

export async function POST(request) {
    try {
        const { email } = await request.json()
        console.log('🔍 [Mobile Unified Forgot Password] Request for:', email)

        if (!email) {
            return NextResponse.json({ success: false, message: 'Email is required' }, { status: 400 })
        }

        const cleanEmail = (email || '').trim().toLowerCase();

        // 1. Check service_providers table
        const providers = await query(
            `SELECT id, name, email FROM service_providers WHERE LOWER(TRIM(email)) = ?`,
            [cleanEmail]
        )

        // 2. Check users table (Customer)
        const users = await query(
            `SELECT id, first_name, last_name, email FROM users WHERE LOWER(TRIM(email)) = ? AND role = 'user'`,
            [cleanEmail]
        )

        if (providers.length === 0 && users.length === 0) {
            console.log('ℹ️ No user or provider found with email:', cleanEmail)
            return NextResponse.json({ success: false, message: 'No account found with this email address' }, { status: 404 })
        }

        // Generate 6-digit OTP (15 minutes expiry)
        const otp = Math.floor(100000 + Math.random() * 900000).toString()

        let primaryName = 'User';
        let primaryType = 'pro';

        // Update service_providers if provider exists
        if (providers.length > 0) {
            await query(
                `UPDATE service_providers SET reset_token = ?, reset_token_expiry = DATE_ADD(NOW(), INTERVAL 15 MINUTE) WHERE id = ?`,
                [otp, providers[0].id]
            )
            primaryName = providers[0].name || 'Provider';
            primaryType = 'pro';
        }

        // Update users if customer exists
        if (users.length > 0) {
            await query(
                `UPDATE users SET reset_token = ?, reset_token_expiry = DATE_ADD(NOW(), INTERVAL 15 MINUTE) WHERE id = ?`,
                [otp, users[0].id]
            )
            if (providers.length === 0) {
                primaryName = `${users[0].first_name || ''} ${users[0].last_name || ''}`.trim() || 'Customer';
                primaryType = 'customer';
            }
        }

        // Send Email in background (non-blocking for 100x speed)
        console.log(`🔢 Sending OTP (${otp}) to ${cleanEmail}...`);
        sendEmail({
            to: cleanEmail,
            subject: 'Your WorkOnTap Verification Code',
            html: getOtpEmailHtml(primaryName, otp, primaryType),
            text: `Your WorkOnTap verification code is: ${otp}`
        }).then(emailResult => {
            console.log(`📨 Email result for ${cleanEmail}:`, emailResult.success ? 'SUCCESS' : `FAILURE (${emailResult.error})`);
        }).catch(emailErr => {
            console.error(`📨 Email error:`, emailErr.message);
        });

        return NextResponse.json({
            success: true,
            message: 'Verification code sent to your email',
            type: primaryType
        })

    } catch (error) {
        console.error('🔥 Mobile unified forgot-password error:', error)
        return NextResponse.json({ success: false, message: 'Failed to process request' }, { status: 500 })
    }
}

function getOtpEmailHtml(name, otp, type) {
    const isPro = type === 'pro';
    const primaryColor = isPro ? '#0f766e' : '#166534';
    const secondaryColor = isPro ? '#0891b2' : '#15803d';

    return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,${primaryColor},${secondaryColor});padding:40px 32px;text-align:center;">
            <div style="font-size:48px;margin-bottom:12px;">🔐</div>
            <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;">Verification Code</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 40px 32px;">
            <p style="margin:0 0 8px;font-size:18px;font-weight:600;color:#0f172a;">Hi ${name} 👋</p>
            <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.7;">
              We received a request to reset your WorkOnTap ${isPro ? 'provider ' : ''}account password. Use the verification code below to proceed:
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
              <tr><td align="center">
                <div style="display:inline-block;padding:16px 40px;background:#f1f5f9;color:${primaryColor};border-radius:12px;font-size:32px;font-weight:800;letter-spacing:8px;border:2px dashed ${primaryColor};">
                  ${otp}
                </div>
              </td></tr>
            </table>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;margin-bottom:24px;">
              <tr><td style="padding:16px 20px;">
                <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#64748b;">⏰ Code expires in 15 minutes</p>
                <p style="margin:4px 0;font-size:14px;color:#475569;">If you didn't request this, you can safely ignore this email.</p>
              </td></tr>
            </table>
            <hr style="border:none;border-top:1px solid #e2e8f0;margin:0 0 24px;" />
            <p style="margin:0;font-size:13px;color:#94a3b8;">Please do not share this code with anyone.</p>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 32px;background:#f8fafc;text-align:center;border-top:1px solid #e2e8f0;">
            <p style="margin:0;font-size:12px;color:#94a3b8;">© ${new Date().getFullYear()} WorkOnTap · Calgary, Alberta, Canada</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}
