import crypto from "node:crypto";

const API_VERSION = "2022-11-28";
const PUBLIC_SITE_URL = "https://www.theyellowfrontdoor.ca";

function safeEqual(a,b){
  const aa=Buffer.from(String(a||""));
  const bb=Buffer.from(String(b||""));
  if(aa.length!==bb.length)return false;
  return crypto.timingSafeEqual(aa,bb);
}

function cleanSlug(value){
  const slug=String(value||"")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g,"-")
    .replace(/-+/g,"-")
    .replace(/^-|-$/g,"")
    .slice(0,100);

  if(!slug || !/^[a-z0-9][a-z0-9-]*$/.test(slug)){
    throw new Error("Invalid proposal slug.");
  }
  return slug;
}

async function github(url,options={}){
  const token=process.env.GITHUB_TOKEN;
  const response=await fetch(url,{
    ...options,
    headers:{
      "Authorization":`Bearer ${token}`,
      "Accept":"application/vnd.github+json",
      "X-GitHub-Api-Version":API_VERSION,
      "Content-Type":"application/json",
      ...(options.headers||{})
    }
  });

  let data={};
  try{data=await response.json();}catch{}
  return {response,data};
}

export default async function handler(req,res){
  if(req.method!=="POST"){
    res.setHeader("Allow","POST");
    return res.status(405).json({error:"Method not allowed"});
  }

  const required=[
    "GITHUB_TOKEN",
    "GITHUB_OWNER",
    "GITHUB_REPO",
    "GITHUB_BRANCH",
    "TYFD_PUBLISH_KEY"
  ];
  const missing=required.filter(name=>!process.env[name]);
  if(missing.length){
    return res.status(500).json({error:`Publishing is not configured: ${missing.join(", ")}`});
  }

  const {publishKey,slug:rawSlug,html,proposalTitle,overwrite=false}=req.body||{};

  if(!safeEqual(publishKey,process.env.TYFD_PUBLISH_KEY)){
    return res.status(401).json({error:"Invalid publisher key."});
  }

  if(typeof html!=="string" || html.length<200 || html.length>1_000_000){
    return res.status(400).json({error:"Proposal HTML is missing or too large."});
  }

  let slug;
  try{slug=cleanSlug(rawSlug);}
  catch(error){return res.status(400).json({error:error.message});}

  const owner=process.env.GITHUB_OWNER;
  const repo=process.env.GITHUB_REPO;
  const branch=process.env.GITHUB_BRANCH;
  const filePath=`${slug}.html`;
  const encodedPath=filePath.split("/").map(encodeURIComponent).join("/");
  const contentsUrl=`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${encodedPath}`;

  // Check whether the proposal already exists.
  const existing=await github(`${contentsUrl}?ref=${encodeURIComponent(branch)}`,{method:"GET"});

  let sha=null;
  if(existing.response.ok){
    sha=existing.data.sha;
    if(!overwrite){
      return res.status(409).json({
        error:"A proposal with this name already exists.",
        exists:true,
        publicUrl:`${PUBLIC_SITE_URL}/${slug}`
      });
    }
  }else if(existing.response.status!==404){
    return res.status(502).json({
      error:existing.data.message||"GitHub could not check the proposal file."
    });
  }

  const body={
    message:`${sha?"Update":"Publish"} proposal: ${proposalTitle||slug}`,
    content:Buffer.from(html,"utf8").toString("base64"),
    branch
  };
  if(sha)body.sha=sha;

  const saved=await github(contentsUrl,{
    method:"PUT",
    body:JSON.stringify(body)
  });

  if(!saved.response.ok){
    return res.status(502).json({
      error:saved.data.message||"GitHub could not save the proposal."
    });
  }

  return res.status(200).json({
    ok:true,
    updated:Boolean(sha),
    path:filePath,
    publicUrl:`${PUBLIC_SITE_URL}/${slug}`,
    commitSha:saved.data.commit?.sha||null
  });
}
