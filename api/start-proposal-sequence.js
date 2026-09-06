
import { proposalEmailHtml, reminderEmailHtml } from "../emails/proposal-email-template.js";

function addBusinessDays(date,days){
  const d=new Date(date);
  let remaining=days;
  while(remaining>0){
    d.setDate(d.getDate()+1);
    const day=d.getDay();
    if(day!==0 && day!==6) remaining--;
  }
  d.setHours(10,0,0,0);
  return d;
}

function safeKey(value=""){
  return String(value).toLowerCase().replace(/[^a-z0-9_-]+/g,"-").slice(0,80);
}

async function sendResendEmail(payload,idempotencyKey){
  const response=await fetch("https://api.resend.com/emails",{
    method:"POST",
    headers:{
      "Authorization":`Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type":"application/json",
      "Idempotency-Key":idempotencyKey
    },
    body:JSON.stringify(payload)
  });

  const data=await response.json().catch(()=>({}));
  return {ok:response.ok,status:response.status,data};
}

export default async function handler(req,res){
  if(req.method!=="POST") return res.status(405).json({error:"Method not allowed"});
  if(!process.env.RESEND_API_KEY) return res.status(500).json({error:"RESEND_API_KEY is not configured"});
  if(!process.env.RESEND_FROM_EMAIL) return res.status(500).json({error:"RESEND_FROM_EMAIL is not configured"});

  const {
    clientName,
    clientEmail,
    businessName,
    intro,
    proposalUrl,
    proposalId
  }=req.body||{};

  if(!clientName || !clientEmail || !businessName || !intro || !proposalUrl || !proposalId){
    return res.status(400).json({error:"Missing required proposal email details."});
  }

  const from=process.env.RESEND_FROM_EMAIL;
  const replyTo=process.env.TYFD_REPLY_TO || undefined;
  const sequenceKey=safeKey(proposalId);

  const base=(subject,html,scheduledAt)=>({
    from,
    to:[clientEmail],
    subject,
    html,
    ...(replyTo?{reply_to:replyTo}:{}),
    ...(scheduledAt?{scheduled_at:scheduledAt}: {})
  });

  const first=await sendResendEmail(
    base(
      `Your ${businessName} proposal is ready`,
      proposalEmailHtml({clientName,businessName,intro,proposalUrl})
    ),
    `proposal-${sequenceKey}-initial`
  );

  if(!first.ok){
    return res.status(400).json({error:first.data?.message || "Could not send the proposal email."});
  }

  const reminder1At=addBusinessDays(new Date(),3).toISOString();
  const reminder2At=addBusinessDays(new Date(),7).toISOString();

  const reminder1=await sendResendEmail(
    base(
      `A quick note about your ${businessName} proposal`,
      reminderEmailHtml({clientName,businessName,proposalUrl,stage:1}),
      reminder1At
    ),
    `proposal-${sequenceKey}-reminder-1`
  );

  const reminder2=await sendResendEmail(
    base(
      `Your ${businessName} proposal`,
      reminderEmailHtml({clientName,businessName,proposalUrl,stage:2}),
      reminder2At
    ),
    `proposal-${sequenceKey}-reminder-2`
  );

  if(!reminder1.ok || !reminder2.ok){
    return res.status(207).json({
      ok:true,
      warning:"The first email was sent, but one or more reminders could not be scheduled.",
      sentEmailId:first.data?.id || null,
      reminder1:{id:reminder1.data?.id||null,error:reminder1.ok?null:(reminder1.data?.message||"Scheduling failed"),scheduledAt:reminder1At},
      reminder2:{id:reminder2.data?.id||null,error:reminder2.ok?null:(reminder2.data?.message||"Scheduling failed"),scheduledAt:reminder2At}
    });
  }

  return res.status(200).json({
    ok:true,
    sentEmailId:first.data?.id || null,
    scheduledEmailIds:[reminder1.data?.id,reminder2.data?.id].filter(Boolean),
    reminders:[
      {id:reminder1.data?.id,scheduledAt:reminder1At},
      {id:reminder2.data?.id,scheduledAt:reminder2At}
    ]
  });
}
