export const authHTML = (code: string): string => {
  return `
  <!doctype html>
  <html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Your EduGrant Verification Code</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f5f5f5;font-family:Arial,Helvetica,sans-serif;color:#111;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
      <tr>
        <td align="center" style="padding:24px;">
          <table role="presentation" width="100%" style="max-width:600px;background:#ffffff;border-radius:8px;overflow:hidden;">
            <tr>
              <td style="padding:24px;text-align:left;">
                <h1 style="margin:0 0 16px 0;font-size:22px;font-weight:bold;color:#111;">
                  Your verification code
                </h1>
                <p style="margin:0 0 20px 0;font-size:16px;color:#333;">
                  Please use the code below to finish verifying your email address with <strong>EduGrant</strong>.
                  This code is valid for a short time only.
                </p>
                <p style="margin:0;padding:12px 20px;background:#f0f0f0;border-radius:6px;
                           font-family:monospace;font-size:24px;font-weight:bold;text-align:center;letter-spacing:3px;color:#111;">
                  ${code}
                </p>
                <p style="margin:20px 0 0 0;font-size:14px;color:#666;">
                  Enter this code in the app or website to continue. If you didn’t request this code, you can safely ignore this email.
                </p>
              </td>
            </tr>
          </table>
          <p style="margin-top:20px;font-size:12px;color:#999;">&copy; ${new Date().getFullYear()} EduGrant. All rights reserved.</p>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
};
