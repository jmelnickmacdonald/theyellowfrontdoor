
export function escapeHtml(value=""){
  return String(value)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function paragraph(value=""){
  return String(value)
    .split(/\n{2,}/)
    .map(p => `<p style="margin:0 0 18px;font-size:16px;line-height:1.7;color:#132447;">${escapeHtml(p).replace(/\n/g,"<br>")}</p>`)
    .join("");
}

export function proposalEmailHtml({
  clientName,
  businessName,
  intro,
  proposalUrl,
  buttonLabel="View your proposal",
  closing="Have a look through everything when you have a chance. If there’s anything you want to talk through or change, just reply here.",
  preheader="Your project proposal is ready."
}){
  const name = escapeHtml(clientName || "there");
  const business = escapeHtml(businessName || "");
  const url = escapeHtml(proposalUrl || "#");

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <title>Your proposal</title>
</head>
<body style="margin:0;padding:0;background:#f7f6f1;font-family:Montserrat,Arial,sans-serif;color:#132447;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f7f6f1;">
    <tr>
      <td align="center" style="padding:34px 16px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:620px;background:#ffffff;border:1px solid #dedad1;">
          <tr>
            <td style="padding:38px 42px 16px;">
              <div style="font-size:12px;letter-spacing:.16em;text-transform:uppercase;font-weight:700;color:#596674;margin-bottom:12px;">The Yellow Front Door</div>
              <div style="height:5px;width:58px;background:#fcd346;margin-bottom:28px;"></div>

              <p style="margin:0 0 18px;font-size:16px;line-height:1.7;color:#132447;">Hi ${name},</p>

              ${paragraph(intro)}

              <p style="margin:0 0 24px;font-size:16px;line-height:1.7;color:#132447;">
                I’ve pulled everything into your project proposal so you can see the scope, timing, investment, and next steps all together.
              </p>

              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:4px 0 28px;">
                <tr>
                  <td bgcolor="#fcd346" style="border-radius:0;">
                    <a href="${url}" style="display:inline-block;padding:14px 22px;font-size:14px;font-weight:800;color:#132447;text-decoration:none;">${escapeHtml(buttonLabel)} →</a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 18px;font-size:16px;line-height:1.7;color:#132447;">${escapeHtml(closing)}</p>

              <p style="margin:26px 0 4px;font-size:16px;line-height:1.7;color:#132447;">Julianna</p>
              <p style="margin:0;font-size:13px;line-height:1.5;color:#596674;">The Yellow Front Door</p>
              ${business ? `<p style="margin:18px 0 0;font-size:12px;color:#8a8f96;">Proposal for ${business}</p>` : ""}
            </td>
          </tr>
          <tr>
            <td style="padding:22px 42px 30px;">
              <div style="border-top:1px solid #ece9e2;padding-top:18px;font-size:11px;line-height:1.6;color:#8a8f96;">
                Warm, practical websites, marketing, and client systems for small businesses.
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function reminderEmailHtml({
  clientName,
  businessName,
  proposalUrl,
  stage=1
}){
  const name = escapeHtml(clientName || "there");
  const business = escapeHtml(businessName || "your project");
  const url = escapeHtml(proposalUrl || "#");

  const copy = stage === 2
    ? {
        heading: "One last little nudge",
        body: `I just wanted to bring your ${business} proposal back to the top of your inbox before I leave you to it. There’s absolutely no need to reply unless you have questions. I just didn’t want it to disappear into the depths of email.`
      }
    : {
        heading: "Just popping this back up",
        body: `I wanted to make sure your ${business} proposal didn’t get buried. If you’ve had a chance to look and want to talk anything through, I’m very happy to.`
      };

  return `<!doctype html>
<html>
<body style="margin:0;padding:0;background:#f7f6f1;font-family:Montserrat,Arial,sans-serif;color:#132447;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f7f6f1;">
    <tr><td align="center" style="padding:30px 16px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:620px;background:#fff;border:1px solid #dedad1;">
        <tr><td style="padding:36px 42px;">
          <div style="font-size:12px;letter-spacing:.16em;text-transform:uppercase;font-weight:700;color:#596674;">The Yellow Front Door</div>
          <div style="height:5px;width:58px;background:#fcd346;margin:12px 0 26px;"></div>
          <p style="margin:0 0 18px;font-size:16px;line-height:1.7;">Hi ${name},</p>
          <p style="margin:0 0 18px;font-size:16px;line-height:1.7;"><strong>${escapeHtml(copy.heading)}.</strong> ${escapeHtml(copy.body)}</p>
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:8px 0 26px;">
            <tr><td bgcolor="#fcd346"><a href="${url}" style="display:inline-block;padding:13px 20px;font-size:14px;font-weight:800;color:#132447;text-decoration:none;">View your proposal →</a></td></tr>
          </table>
          <p style="margin:0;font-size:16px;line-height:1.7;">Julianna</p>
          <p style="margin:2px 0 0;font-size:13px;color:#596674;">The Yellow Front Door</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
