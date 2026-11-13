import {fileURLToPath} from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
import Mux from '@mux/mux-node';
import {createClient} from '@supabase/supabase-js';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const env=path.join(root,'.env.local');process.loadEnvFile(env);
const mux=new Mux({tokenId:process.env.MUX_TOKEN_ID,tokenSecret:process.env.MUX_TOKEN_SECRET});
function putEnv(file,values){let source=fs.existsSync(file)?fs.readFileSync(file,'utf8'):'';for(const [key,value] of Object.entries(values)){source=source.split('\n').filter(line=>!line.startsWith(key+'=')).join('\n').trimEnd();source+='\n'+key+'='+JSON.stringify(value)+'\n';}fs.writeFileSync(file,source,{mode:0o600});fs.chmodSync(file,0o600);}
try{
 let id=process.env.MUX_SIGNING_KEY_ID;let privateKey=process.env.MUX_SIGNING_PRIVATE_KEY;
 if(!id||!privateKey){const key=await mux.system.signingKeys.create();if(!key.id||!key.private_key)throw Error('Mux did not return signing credentials.');id=key.id;privateKey=key.private_key;putEnv(env,{MUX_SIGNING_KEY_ID:id,MUX_SIGNING_PRIVATE_KEY:privateKey});}
 const parent=path.dirname(root);const parentPackage=path.join(parent,'package.json');let adminEnv=process.env.ADMIN_ENV_FILE;
 if(!adminEnv&&fs.existsSync(parentPackage)&&JSON.parse(fs.readFileSync(parentPackage,'utf8')).name==='mixpro')adminEnv=path.join(parent,'.env');
 if(adminEnv)putEnv(adminEnv,{MUX_SIGNING_KEY_ID:id,MUX_SIGNING_PRIVATE_KEY:privateKey});
 const db=createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}});let count=0;
 for(let offset=0;;offset+=250){const page=await db.from('videos').select('id,asset_id').eq('status','ready').order('id').range(offset,offset+249);if(page.error)throw page.error;for(const video of page.data){if(!video.asset_id)continue;const asset=await mux.video.assets.retrieve(video.asset_id);let signed=asset.playback_ids?.find(p=>p.policy==='signed');if(!signed)signed=await mux.video.assets.createPlaybackId(video.asset_id,{policy:'signed'});for(const publicId of asset.playback_ids?.filter(p=>p.policy==='public')||[])await mux.video.assets.deletePlaybackId(video.asset_id,publicId.id);const saved=await db.from('videos').update({playback_id:signed.id,video_url:null}).eq('id',video.id);if(saved.error)throw saved.error;count++;}if(page.data.length<250)break;}
 console.log(`Secure playback configured for ${count} ready videos. Signing credentials were saved locally, without printing them. Restart both apps.`);
}catch(error){console.error('Secure playback setup failed:',error.message);process.exitCode=1;}
