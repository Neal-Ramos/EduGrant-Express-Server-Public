export const AdminAccountValidationHTML = (token: string, requesterName: string, requesterEmail: string): string=> {
    return `
    <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Admin Registration Request</title>
  </head>
  <body style="margin:0;padding:20px;background-color:#f4f4f4;font-family:Arial,Helvetica,sans-serif;color:#111;">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" 
                 style="max-width:600px;width:100%;background-color:#ffffff;border-radius:10px;
                        box-shadow:0 4px 12px rgba(0,0,0,0.08);padding:30px;">
            <tr>
              <td style="text-align:left;">
                <h2 style="color:#333;margin:0 0 15px;font-size:22px;">Admin Registration Request</h2>
                <p style="color:#555;font-size:16px;line-height:1.5;margin:0 0 20px;">
                  A new administrator has requested to create an account on <strong>EduGrant</strong>.  
                  Here are the details of the request:
                </p>
                <p style="color:#333;font-size:15px;line-height:1.6;margin:0 0 20px;">
                  <strong>Name:</strong> ${requesterName} <br />
                  <strong>Email:</strong> ${requesterEmail}
                </p>
                <p style="color:#555;font-size:16px;line-height:1.5;margin:0 0 25px;">
                  Please review this request and choose whether to approve or decline it.
                </p>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:20px 0;">
                <a href="https://server.edugrant.online/confirmRegistration?token=${token}"
                   style="display:inline-block;margin:6px;background-color:#28a745;color:#ffffff;
                          padding:14px 28px;text-decoration:none;border-radius:6px;
                          font-size:16px;font-weight:bold;">
                  ✅ Confirm Registration
                </a>
                <a href="https://server.edugrant.online/rejectRegistration?token=${token}"
                   style="display:inline-block;margin:6px;background-color:#dc3545;color:#ffffff;
                          padding:14px 28px;text-decoration:none;border-radius:6px;
                          font-size:16px;font-weight:bold;">
                  ❌ Decline Registration
                </a>
              </td>
            </tr>
            <tr>
              <td style="text-align:left;">
                <p style="color:#888;font-size:12px;line-height:1.4;margin-top:30px;">
                  If you did not expect this request, you can safely ignore this email.  
                  This message was sent automatically by EduGrant for security purposes.
                </p>
              </td>
            </tr>
          </table>
          <p style="margin-top:20px;font-size:12px;color:#aaa;">
            &copy; ${new Date().getFullYear()} EduGrant. All rights reserved.
          </p>
        </td>
      </tr>
    </table>
  </body>
  </html>
`
}