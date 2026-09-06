// Shared TYFD proposal-copy email endpoint for Vercel.
// Put this file at /api/email-proposal.js
//
// Required Vercel environment variables:
// RESEND_API_KEY
// RESEND_FROM_EMAIL
//
// Optional:
// TYFD_REPLY_TO

function esc(value=""){
  return String(value)
    .replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")
    .replaceAll('"',"&quot;").replaceAll("'","&#039;");
}

function clean(value,max=500){
  return String(value ?? "").trim().slice(0,max);
}

function acceptedDate(iso){
  try{
    return new Intl.DateTimeFormat("en-CA",{
      timeZone:"America/Halifax",
      year:"numeric",month:"long",day:"numeric",hour:"numeric",minute:"2-digit"
    }).format(new Date(iso));
  }catch{return clean(iso,80)}
}

export default async function handler(req,res){
  if(req.method!=="POST"){
    res.setHeader("Allow","POST");
    return res.status(405).json({error:"Method not allowed"});
  }

  const apiKey=process.env.RESEND_API_KEY;
  const fromEmail=process.env.RESEND_FROM_EMAIL;
  const replyTo=process.env.TYFD_REPLY_TO||fromEmail;

  if(!apiKey||!fromEmail){
    return res.status(500).json({error:"Email service is not configured."});
  }

  const body=req.body||{};
  const proposalId=clean(body.proposalId,120);
  const projectTitle=clean(body.projectTitle,180);
  const clientName=clean(body.clientName,160);
  const fullName=clean(body.fullName,160);
  const email=clean(body.email,220);
  const signature=clean(body.signature,160);
  const acceptedAt=clean(body.acceptedAt,80);
  const proposalUrl=clean(body.proposalUrl,700);
  const summary=clean(body.summary,500);

  if(!proposalId||!projectTitle||!clientName||!fullName||!email||!signature||!acceptedAt){
    return res.status(400).json({error:"Missing proposal details."});
  }

  // Basic email sanity check. Resend does final validation too.
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)){
    return res.status(400).json({error:"Invalid email address."});
  }

  const when=acceptedDate(acceptedAt);
  const subject=`Your ${clientName} project proposal`;

  const html=`
  <div style="font-family:Arial,sans-serif;max-width:650px;margin:auto;color:#132447;line-height:1.6">
    <div style="padding:34px 0 20px;border-bottom:1px solid #dedad1">
      <div style="font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#B86B4B;font-weight:700">The Yellow Front Door</div>
      <h1 style="font-size:31px;line-height:1.08;margin:10px 0 0;color:#132447">Your project is officially underway.</h1>
    </div>

    <p style="margin-top:26px">Hi ${esc(fullName)},</p>
    <p>This email confirms your electronic acceptance of <strong>${esc(projectTitle)}</strong>.</p>

    <div style="margin:26px 0;padding:22px;background:#f7f6f1;border-left:4px solid #fcd346">
      <p style="margin:0 0 8px"><strong>Proposal:</strong> ${esc(proposalId)}</p>
      ${summary ? `<p style="margin:0 0 8px"><strong>Project:</strong> ${esc(summary)}</p>` : ""}
      <p style="margin:0 0 8px"><strong>Accepted:</strong> ${esc(when)}</p>
      <p style="margin:0"><strong>Electronic signature:</strong> ${esc(signature)}</p>
    </div>

    <p>Keep this email for your records. The Yellow Front Door has also received the signed acceptance details.</p>

    ${proposalUrl ? `<p style="margin-top:26px"><a href="${esc(proposalUrl)}" style="display:inline-block;background:#132447;color:#fff;text-decoration:none;padding:12px 18px;border-radius:4px;font-weight:700">View your proposal</a></p>` : ""}

    <div style="margin-top:34px;padding-top:18px;border-top:1px solid #dedad1;color:#596674;font-size:13px">
      ${esc(proposalId)} · The Yellow Front Door
    </div>
  </div>`;

  try{
    const r=await fetch("https://api.resend.com/emails",{
      method:"POST",
      headers:{"Authorization":`Bearer ${apiKey}`,"Content-Type":"application/json"},
      body:JSON.stringify({
        from:`The Yellow Front Door <${fromEmail}>`,
        to:[email],
        reply_to:replyTo,
        subject,
        html
      })
    });

    const data=await r.json();
    if(!r.ok){
      console.error("Resend error:",data);
      return res.status(502).json({error:"Email provider rejected the request."});
    }
    return res.status(200).json({ok:true,id:data.id});
  }catch(error){
    console.error(error);
    return res.status(500).json({error:"Unable to send email."});
  }
}
