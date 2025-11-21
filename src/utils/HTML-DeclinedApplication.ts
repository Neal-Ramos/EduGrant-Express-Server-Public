export const declineHTML = (
  applicantName: string,
  applicantStudentId: string,
  applicanteEmail: string,
): string => `
    <!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Application Declined</title>
<style>
  body,table,td { font-family: Arial, Helvetica, sans-serif; font-size:16px; color:#222; }
  .email-wrap { width:100%; background:#f4f4f5; padding:30px 0; }
  .email-body { width:100%; max-width:600px; margin:0 auto; background:#ffffff; border-radius:8px; overflow:hidden; }
  .pad { padding:24px; }
  .header { background: linear-gradient(90deg,#7f1d1d,#b91c1c); color:#fff; padding:20px 24px; }
  .brand { font-size:20px; font-weight:700; }
  .lead { font-size:18px; margin:12px 0 0; line-height:1.25; }
  .status-pill { display:inline-block; padding:6px 10px; border-radius:999px; font-weight:700; font-size:13px; background:#FEE2E2; color:#991b1b; }
  .foot { font-size:13px; color:#666; line-height:1.4; }
  .muted { color:#9aa0a6; font-size:13px; }
</style>
</head>
<body>
  <table class="email-wrap" width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr>
      <td align="center">
        <table class="email-body" cellpadding="0" cellspacing="0" role="presentation">
          <!-- Header -->
          <tr>
            <td class="header" align="left">
              <div class="brand">EduGrant</div>
              <div class="lead">Application status update</div>
            </td>
          </tr>

          <!-- Main content -->
          <tr>
            <td class="pad" align="left">
              <p>Hi <strong>${applicantName}</strong>,</p>

              <div>
                <span class="status-pill">Declined</span>
                <h2>We regret to inform you — your application was not selected.</h2>
                <p>Application ID: <strong>${applicantStudentId}</strong></p>
                <p>We truly appreciate the time and effort you put into your application. Unfortunately, we are unable to offer you a scholarship at this time. We encourage you to apply again in future opportunities.</p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:18px 24px; background:#fafafa; border-top:1px solid #eee;">
              <table width="100%">
                <tr>
                  <td class="foot">
                    <span class="muted">This message was sent to ${applicanteEmail}</span>
                  </td>
                  <td align="right">
                    <img src="https://via.placeholder.com/72x40?text=Logo" alt="Logo" width="72" height="40">
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
