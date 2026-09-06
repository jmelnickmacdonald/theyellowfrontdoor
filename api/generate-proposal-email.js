
function clean(value=""){
  return String(value).replace(/\s+/g," ").trim();
}

function sentence(value=""){
  const v=clean(value);
  if(!v) return "";
  return /[.!?]$/.test(v) ? v : `${v}.`;
}

export default async function handler(req,res){
  if(req.method!=="POST"){
    return res.status(405).json({error:"Method not allowed"});
  }

  const {
    clientName="",
    businessName="",
    whatTheyDo="",
    projectNote=""
  }=req.body||{};

  if(!clientName || !businessName || !projectNote){
    return res.status(400).json({
      error:"Client name, business name, and your short project note are required."
    });
  }

  const businessBit = clean(whatTheyDo)
    ? ` I really enjoyed hearing more about ${clean(businessName)} and the way you’ve built ${clean(whatTheyDo)}.`
    : ` I really enjoyed hearing more about ${clean(businessName)}.`;

  const intro =
    `Thanks so much for your patience while I pulled everything together.${businessBit} ` +
    `${sentence(projectNote)} I’ve tried to make sure the proposal reflects what we actually talked about, rather than turning it into something bigger or more complicated than it needs to be.`;

  return res.status(200).json({intro});
}
