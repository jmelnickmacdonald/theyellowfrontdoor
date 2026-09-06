
async function cancelEmail(id){
  const response=await fetch(`https://api.resend.com/emails/${encodeURIComponent(id)}/cancel`,{
    method:"POST",
    headers:{
      "Authorization":`Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type":"application/json"
    }
  });
  const data=await response.json().catch(()=>({}));
  return {ok:response.ok,data};
}

export default async function handler(req,res){
  if(req.method!=="POST") return res.status(405).json({error:"Method not allowed"});
  if(!process.env.RESEND_API_KEY) return res.status(500).json({error:"RESEND_API_KEY is not configured"});

  const {scheduledEmailIds=[]}=req.body||{};
  if(!Array.isArray(scheduledEmailIds) || scheduledEmailIds.length===0){
    return res.status(200).json({ok:true,canceled:[]});
  }

  const results=[];
  for(const id of scheduledEmailIds){
    try{
      const result=await cancelEmail(id);
      results.push({id,ok:result.ok,error:result.ok?null:(result.data?.message||"Could not cancel scheduled email")});
    }catch(e){
      results.push({id,ok:false,error:e.message});
    }
  }

  return res.status(200).json({
    ok:results.every(r=>r.ok),
    canceled:results
  });
}
