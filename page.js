'use client';
import {useState,useEffect,useMemo} from 'react';

// ALL NETWORK DATA IS SYNTHETIC (invented for this demo, not Amazon data).
// gust = mph, rain = mm/hour, snow = cm/hour. Saved scenarios are illustrative approximations, not official records.
const R={
 us:{name:'Southeast US',hint:'Start with Hurricane Ian to see the full effect. "Live now" shows today\'s real weather, which is often calm.',
  P:{CLT:[500,90],BNA:[200,70],BHM:[150,200],ATL:[320,200],SAV:[510,235],JAX:[520,330],MCO:[480,420],TPA:[360,440],RSW:[400,510],MIA:[590,500]},
  NM:{CLT:'Charlotte',BNA:'Nashville',BHM:'Birmingham',ATL:'Atlanta',SAV:'Savannah',JAX:'Jacksonville',MCO:'Orlando',TPA:'Tampa',RSW:'Fort Myers',MIA:'Miami'},
  C:{CLT:[35.22,-80.84],BNA:[36.16,-86.78],BHM:[33.52,-86.80],ATL:[33.75,-84.39],SAV:[32.08,-81.09],JAX:[30.33,-81.66],MCO:[28.54,-81.38],TPA:[27.95,-82.46],RSW:[26.64,-81.87],MIA:[25.76,-80.19]},
  L:[['BNA','ATL',6000,4300],['BNA','BHM',3000,1900],['BHM','ATL',5000,3600],['CLT','ATL',7000,5200],['CLT','SAV',3500,2300],['ATL','SAV',5500,3900],['ATL','JAX',9000,6400],['SAV','JAX',5000,3300],['JAX','MCO',8000,5900],['JAX','TPA',6000,4100],['ATL','TPA',5000,3200],['ATL','MCO',6500,4200],['MCO','TPA',4500,3000],['MCO','RSW',4000,2800],['TPA','RSW',4000,2900],['MCO','MIA',6000,4300],['RSW','MIA',3500,2100]],
  SC:{
   ian:{name:'Hurricane Ian replay',note:'Approximate, illustrative conditions modeled on the 2022 Florida landfall. Not an official record.',wx:{RSW:{gust:150,rain:25},TPA:{gust:90,rain:15},MCO:{gust:80,rain:12},MIA:{gust:35,rain:6},JAX:{gust:45,rain:5},SAV:{gust:25,rain:1},ATL:{gust:15,rain:0},CLT:{gust:10,rain:0},BNA:{gust:10,rain:0},BHM:{gust:10,rain:0}}},
   rain:{name:'Heavy rain day',note:'Illustrative: steady heavy rain across central and south Florida, little wind.',wx:{MCO:{gust:25,rain:14},TPA:{gust:20,rain:12},MIA:{gust:22,rain:16},RSW:{gust:20,rain:10},JAX:{gust:15,rain:8},ATL:{gust:10,rain:6},SAV:{gust:12,rain:6},CLT:{gust:8,rain:2},BNA:{gust:8,rain:1},BHM:{gust:8,rain:2}}},
   wind:{name:'Heavy wind front',note:'Illustrative: strong gusts from a cold front across Georgia, the Carolinas and Alabama.',wx:{ATL:{gust:65,rain:1},CLT:{gust:70,rain:1},BHM:{gust:60,rain:0},BNA:{gust:55,rain:0},SAV:{gust:62,rain:0},JAX:{gust:58,rain:0},MCO:{gust:45,rain:0},TPA:{gust:40,rain:0},RSW:{gust:30,rain:0},MIA:{gust:25,rain:0}}}}},
 de:{name:'Germany',hint:'Start with the snowstorm. "Live now" shows today\'s real weather (Open-Meteo), which is often calm.',
  P:{HAM:[330,60],BER:[570,110],HAN:[330,160],LEJ:[520,240],CGN:[140,260],FRA:[300,340],NUE:[480,410],STR:[300,470],MUC:[470,525]},
  NM:{HAM:'Hamburg',BER:'Berlin',HAN:'Hannover',LEJ:'Leipzig',CGN:'Cologne',FRA:'Frankfurt',NUE:'Nuremberg',STR:'Stuttgart',MUC:'Munich'},
  C:{HAM:[53.55,10.0],BER:[52.52,13.4],HAN:[52.37,9.73],LEJ:[51.34,12.37],CGN:[50.94,6.96],FRA:[50.11,8.68],NUE:[49.45,11.08],STR:[48.78,9.18],MUC:[48.14,11.58]},
  L:[['HAM','BER',5000,3600],['HAM','HAN',6000,4300],['HAN','BER',6000,4200],['HAN','LEJ',5500,3800],['BER','LEJ',5000,3500],['HAN','CGN',5500,3900],['HAN','FRA',7000,5100],['LEJ','FRA',5000,3300],['LEJ','NUE',5000,3400],['CGN','FRA',6000,4400],['FRA','NUE',6500,4600],['FRA','STR',6000,4300],['NUE','MUC',6000,4500],['STR','MUC',6000,4200],['NUE','STR',3500,2200]],
  SC:{snow:{name:'Snowstorm in northern and central Germany',note:'Illustrative: heavy snow and wind closing highways around Hannover, Berlin and Leipzig.',wx:{HAN:{gust:50,rain:2,snow:4},BER:{gust:40,rain:1,snow:3},HAM:{gust:55,rain:2,snow:3},LEJ:{gust:35,rain:1,snow:5},FRA:{gust:30,rain:0,snow:2.5},CGN:{gust:25,rain:0,snow:1},NUE:{gust:35,rain:1,snow:3.5},STR:{gust:20,rain:0,snow:1},MUC:{gust:25,rain:0,snow:2}}}}}

 ,west:{name:'Western North America',hint:'Illustrative West Coast and inland freight network. Live now uses current Open-Meteo conditions at each hub.',
  P:{SEA:[150,80],PDX:[180,170],SFO:[130,310],LAX:[220,450],LAS:[390,400],PHX:[410,500],SLC:[400,260],DEN:[560,250]},
  NM:{SEA:'Seattle',PDX:'Portland',SFO:'San Francisco',LAX:'Los Angeles',LAS:'Las Vegas',PHX:'Phoenix',SLC:'Salt Lake City',DEN:'Denver'},
  C:{SEA:[47.61,-122.33],PDX:[45.52,-122.68],SFO:[37.77,-122.42],LAX:[34.05,-118.24],LAS:[36.17,-115.14],PHX:[33.45,-112.07],SLC:[40.76,-111.89],DEN:[39.74,-104.99]},
  L:[['SEA','PDX',5200,3600],['PDX','SFO',5000,3400],['SFO','LAX',7000,5100],['LAX','LAS',4500,3200],['LAS','PHX',4200,3000],['SLC','LAS',3800,2600],['PDX','SLC',4000,2800],['SLC','DEN',5200,3700],['LAS','DEN',3500,2400],['PHX','DEN',4000,2700],['LAX','PHX',5000,3600]],
  SC:{heat:{name:'Southwest heat and wind',note:'Illustrative scenario, not a historical weather record.',wx:{PHX:{gust:45,rain:0},LAS:{gust:48,rain:0},DEN:{gust:40,rain:1},LAX:{gust:28,rain:0},SLC:{gust:38,rain:0}}}}},
 ,north:{name:'Northeast North America',hint:'Illustrative Northeast corridor network. Live now uses current Open-Meteo conditions at each hub.',
  P:{BOS:[540,90],NYC:[450,190],PHL:[400,290],WAS:[360,400],PIT:[210,290],BUF:[140,180],CLE:[110,300],ALB:[330,100]},
  NM:{BOS:'Boston',NYC:'New York',PHL:'Philadelphia',WAS:'Washington DC',PIT:'Pittsburgh',BUF:'Buffalo',CLE:'Cleveland',ALB:'Albany'},
  C:{BOS:[42.36,-71.06],NYC:[40.71,-74.01],PHL:[39.95,-75.16],WAS:[38.91,-77.04],PIT:[40.44,-80.00],BUF:[42.89,-78.88],CLE:[41.50,-81.69],ALB:[42.65,-73.76]},
  L:[['BOS','NYC',6000,4300],['ALB','BOS',4000,2700],['ALB','NYC',4500,3200],['BUF','ALB',4000,2800],['BUF','CLE',4500,3100],['CLE','PIT',4000,2800],['PIT','NYC',5000,3500],['PIT','PHL',4500,3100],['NYC','PHL',7000,5200],['PHL','WAS',6500,4700],['NYC','WAS',5000,3600]],
  SC:{winter:{name:'Northeast winter storm',note:'Illustrative snow and wind scenario; not an official forecast.',wx:{BUF:{gust:55,rain:1,snow:5},CLE:{gust:45,rain:2,snow:3},PIT:{gust:40,rain:2,snow:2},ALB:{gust:50,rain:1,snow:4},BOS:{gust:45,rain:2,snow:3},NYC:{gust:35,rain:3,snow:1}}}}},
 ,uk:{name:'United Kingdom & Ireland',hint:'Illustrative UK and Ireland freight network. Live now uses current Open-Meteo conditions at each hub.',
  P:{EDI:[210,70],MAN:[280,190],LON:[380,350],BHM:[300,280],BRI:[250,370],NCL:[300,100],CAR:[100,190],DUB:[80,280]},
  NM:{EDI:'Edinburgh',MAN:'Manchester',LON:'London',BHM:'Birmingham',BRI:'Bristol',NCL:'Newcastle',CAR:'Cardiff',DUB:'Dublin'},
  C:{EDI:[55.95,-3.19],MAN:[53.48,-2.24],LON:[51.51,-0.13],BHM:[52.49,-1.89],BRI:[51.45,-2.59],NCL:[54.98,-1.61],CAR:[51.48,-3.18],DUB:[53.35,-6.26]},
  L:[['EDI','NCL',3500,2400],['EDI','MAN',4500,3200],['NCL','MAN',4000,2800],['MAN','BHM',5000,3600],['BHM','LON',7000,5100],['BHM','BRI',3500,2400],['BRI','CAR',3000,2100],['CAR','DUB',2800,1900],['MAN','DUB',3200,2200],['LON','BRI',4500,3200]],
  SC:{wind:{name:'Atlantic wind and rain',note:'Illustrative high-wind and heavy-rain scenario; not an official forecast.',wx:{EDI:{gust:60,rain:5},NCL:{gust:55,rain:4},MAN:{gust:50,rain:8},DUB:{gust:58,rain:6},CAR:{gust:42,rain:7},BRI:{gust:35,rain:4}}}}},
 ,india:{name:'India North & West',hint:'Illustrative India freight network. Live now uses current Open-Meteo conditions at each hub.',
  P:{DEL:[330,80],JAI:[220,190],LKO:[470,180],AMD:[150,340],BOM:[250,470],IDR:[350,340],PUN:[310,420],AGR:[390,210]},
  NM:{DEL:'Delhi',JAI:'Jaipur',LKO:'Lucknow',AMD:'Ahmedabad',BOM:'Mumbai',IDR:'Indore',PUN:'Pune',AGR:'Agra'},
  C:{DEL:[28.61,77.21],JAI:[26.91,75.79],LKO:[26.85,80.95],AMD:[23.02,72.57],BOM:[19.08,72.88],IDR:[22.72,75.86],PUN:[18.52,73.86],AGR:[27.18,78.01]},
  L:[['DEL','JAI',6000,4300],['DEL','AGR',4500,3100],['DEL','LKO',5500,3900],['JAI','AMD',4000,2800],['JAI','IDR',3500,2400],['AGR','IDR',4000,2700],['AMD','BOM',6500,4700],['AMD','IDR',3500,2300],['IDR','PUN',4000,2800],['PUN','BOM',5000,3600]],
  SC:{monsoon:{name:'Monsoon rain scenario',note:'Illustrative heavy-rain scenario; not an official forecast.',wx:{BOM:{gust:30,rain:18},PUN:{gust:28,rain:14},AMD:{gust:35,rain:12},IDR:{gust:25,rain:10},DEL:{gust:20,rain:3},LKO:{gust:22,rain:8}}}}}

};
const cl=x=>Math.max(0,Math.min(1,x));
// Rule: gusts above 35 mph start cutting capacity (full at 90); rain cuts up to 50%; snow cuts up to 60%.
const cutOf=w=>Math.max(cl((w.gust-35)/55),.5*cl((w.rain-2)/18),.6*cl(((w.snow||0)-.5)/3.5));

// Min-cost rerouting: for each damaged lane (largest shortfall first), repeatedly find the cheapest path
// (Bellman-Ford) through lanes that still have spare capacity and push as much as the bottleneck allows.
// Lanes are handled one at a time, so this is a greedy approximation of the full multi-flow optimum.
function reroute(Rg,lanes){
 const ids=Object.keys(Rg.P),cap={},plans=[];let total=0,cost=0;
 lanes.forEach(l=>cap[l.key]=l.spare);
 const E=lanes.map(l=>({...l,w:Math.hypot(Rg.P[l.a][0]-Rg.P[l.b][0],Rg.P[l.a][1]-Rg.P[l.b][1])/100*.4+.2}));
 for(const d of lanes.filter(l=>l.over>0).sort((x,y)=>y.over-x.over)){
  let need=d.over;
  for(let guard=0;need>.5&&guard<20;guard++){
   const dist=Object.fromEntries(ids.map(i=>[i,Infinity])),prev={};dist[d.a]=0;
   for(let i=0;i<ids.length;i++)for(const e of E){if(e.key===d.key||cap[e.key]<1)continue;for(const[u,v]of[[e.a,e.b],[e.b,e.a]])if(dist[u]+e.w<dist[v]){dist[v]=dist[u]+e.w;prev[v]=[u,e]}}
   if(dist[d.b]===Infinity)break;
   const path=[];let n=d.b;while(n!==d.a){const[u,e]=prev[n];path.push({e,n});n=u}
   const push=Math.min(need,...path.map(p=>cap[p.e.key]));
   path.forEach(p=>cap[p.e.key]-=push);need-=push;total+=push;cost+=push*dist[d.b];
   plans.push({from:d.a,to:d.b,via:path.slice(1).map(p=>p.n).reverse(),units:push,unit:dist[d.b]});
  }
 }
 return{total,cost,plans};
}
function calc(Rg,cuts,sel){
 const lanes=Rg.L.map(([a,b,c,v])=>{const cut=Math.max(cuts[a]||0,cuts[b]||0);const eff=c*(1-Math.min(.95,cut*.95));return{a,b,c,v,eff,over:Math.max(0,v-eff),spare:Math.max(0,eff-v),key:a+'-'+b}});
 const gap=lanes.reduce((s,l)=>s+l.over,0),lost=lanes.filter(l=>l.over>0).reduce((s,l)=>s+(l.c-l.eff),0);
 const sol=reroute(Rg,lanes);let rem=gap;
 const div=sel.div?Math.min(rem,sol.total):0;rem-=div;
 const cap=sel.cap?Math.min(rem,.35*lost):0;rem-=cap;
 const prm=sel.prm?rem:0,late=sel.prm?0:rem;
 return{lanes,gap,lost,sol,div,cap,rem,prm,late,cost:(sel.div&&sol.total?sol.cost*div/sol.total:0)+cap*1.6+prm*.3};
}

const f=n=>Math.round(n).toLocaleString('en-US');
const OPTS=[['div','Divert volume to unaffected lanes'],['cap','Add temporary capacity'],['pri','Prioritize SLA-critical packages'],['prm','Adjust delivery promises (+1 day)']];
const col=u=>u>1?'var(--bad)':u>.85?'var(--warn)':'var(--ok)';
const MEANING={'Rip Current Statement':'Dangerous currents for swimmers at beaches. Does not affect trucks or lanes.','Flood Watch':'Flooding is possible but has not started. Some roads could be affected later.','Flood Warning':'Flooding is happening, usually along rivers. A few local roads may close.','Coastal Flood Advisory':'Minor flooding near the coast at high tide. Low impact on trucking.','Coastal Flood Statement':'Update on minor coastal flooding. Low impact on trucking.'};
const SEVERE=/hurricane|tropical|tornado|storm surge|high wind|extreme wind|blizzard|ice storm|winter storm/i;

function LiveBox({live,Rg,us}){
 if(!live)return <p className="note">Loading current conditions...</p>;
 if(live.error)return <p className="note">{live.error} Pick a saved scenario instead.</p>;
 const ids=Object.keys(live.nodes),N=Rg.NM;
 const gid=ids.reduce((a,b)=>live.nodes[b].gust>live.nodes[a].gust?b:a),rid=ids.reduce((a,b)=>live.nodes[b].rain>live.nodes[a].rain?b:a);
 const g=live.nodes[gid].gust,rn=live.nodes[rid].rain,hit=ids.filter(i=>cutOf(live.nodes[i])>0);
 const lvl=hit.length?'Disruptive':g>=20?'Breezy':'Calm',color=hit.length?'var(--bad)':g>=20?'var(--warn)':'var(--ok)';
 const sev=(live.alerts||[]).filter(a=>SEVERE.test(a.event));
 return(<div className="verdict" style={{borderLeft:'5px solid '+color}}>
  <b>Live weather right now: {lvl}</b>
  <div className="note" style={{color:'var(--ink)'}}>{hit.length?`Wind, rain or snow is strong enough to cut capacity at: ${hit.map(i=>N[i]).join(', ')}.`:`No hub is hit hard enough to lose capacity. The windiest hub is ${N[gid]} at ${Math.round(g)} mph gusts (capacity only starts dropping above 35 mph). The wettest is ${N[rid]} at ${rn.toFixed(1)} mm precipitation in the selected hour (heavy rain starts at about 2 mm/hour).`}</div>
  <div className="note" style={{color:'var(--ink)',marginTop:6}}><b>Network impact:</b> {hit.length||sev.length?'Possible. Look at the map and the numbers below.':'None. The network runs normally, so overflow is 0.'}</div>
  <div className="note" style={{marginTop:6}}>Open-Meteo hourly readings nearest the current local time. Data fetched at {new Date(live.fetchedAt).toLocaleTimeString()}. Values are model-derived weather estimates, not roadside sensors; official severe-weather alerts are not integrated into this regional view.</div>
 </div>);
}

function Forecast({Rg,lanes}){
 const ids=Object.keys(Rg.P),[hub,setHub]=useState(null),[gr,setGr]=useState(3);
 const h=ids.includes(hub)?hub:ids.includes('ATL')?'ATL':ids[0];
 const inc=lanes.filter(l=>l.a===h||l.b===h),base=inc.reduce((s,l)=>s+l.v,0)/inc.reduce((s,l)=>s+l.c,0);
 const pts=Array.from({length:14},(_,d)=>base*Math.pow(1+gr/100,d)+.02*Math.sin(d*2*Math.PI/7));
 const br=pts.findIndex(v=>v>1),W=700,H=150,pad=28,x=d=>pad+d*(W-2*pad)/13,y=v=>H-24-(Math.min(v,1.3)-.6)*(H-44)/.7;
 return(<section className="card"><h2>Look ahead: capacity forecast for the next 14 days</h2>
  <div className="row"><label className="note">Hub: <select value={h} onChange={e=>setHub(e.target.value)}>{ids.map(i=><option key={i} value={i}>{Rg.NM[i]}</option>)}</select></label>
  <label className="note" style={{flex:1,minWidth:200}}>Assumed demand growth (peak season): {gr}% per day<input type="range" min="0" max="5" step=".5" value={gr} onChange={e=>setGr(+e.target.value)} style={{width:'100%'}}/></label></div>
  <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Forecast load versus capacity for 14 days">
   <line x1={pad} x2={W-pad} y1={y(1)} y2={y(1)} strokeDasharray="5 4" style={{stroke:'var(--bad)'}}/><text className="lbl" x={W-pad} y={y(1)-5} textAnchor="end" style={{fill:'var(--bad)'}}>100% of capacity</text>
   <polyline fill="none" strokeWidth="3" style={{stroke:'var(--ok)'}} points={pts.map((v,d)=>x(d)+','+y(v)).join(' ')}/>
   {pts.map((v,d)=><g key={d}><circle cx={x(d)} cy={y(v)} r={v>1?5:3} style={{fill:v>1?'var(--bad)':'var(--ok)'}}><title>Day {d+1}: {Math.round(v*100)}% of capacity</title></circle>{d%2===0&&<text x={x(d)} y={H-6} fontSize="11" textAnchor="middle" style={{fill:'var(--mute)'}}>D{d+1}</text>}</g>)}
  </svg>
  <p className="verdict">{br>=0?`${Rg.NM[h]} is forecast to pass 100% of capacity on day ${br+1}. That gives the planner about ${br} days to add capacity or shift volume before packages are at risk.`:`${Rg.NM[h]} stays under capacity for the next 14 days at this growth rate.`}</p>
  <p className="note">Simulated: starts from {Rg.NM[h]}'s current load ({Math.round(base*100)}% of capacity) and grows at the rate you set. It is a simple growth rule, not a trained forecast.</p></section>);
}

export default function Home(){
 const [rg,setRg]=useState('us'),[sid,setSid]=useState('ian'),[liveD,setLiveD]=useState({}),[refreshKey,setRefreshKey]=useState(0),[k,setK]=useState(100);
 const [sel,setSel]=useState({div:false,cap:false,pri:false,prm:false}),[ex,setEx]=useState(null),[rec,setRec]=useState(null);
 const Rg=R[rg],live=liveD[rg];
 useEffect(()=>{if(sid!=='live'||liveD[rg])return;let cancelled=false;const set=v=>{if(!cancelled)setLiveD(d=>({...d,[rg]:v}))},fail=()=>set({error:'Live weather is unavailable right now. Try refresh or choose a saved scenario.'});
  const ids=Object.keys(Rg.C||{});
  Promise.all(ids.map(async id=>{const [latitude,longitude]=Rg.C[id];const url=`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=wind_gusts_10m&hourly=wind_gusts_10m,precipitation,snowfall&wind_speed_unit=mph&precipitation_unit=mm&timezone=auto&forecast_days=1`;const res=await fetch(url,{cache:'no-store'});if(!res.ok)throw new Error('weather');const j=await res.json();if(!j.hourly?.time?.length||!j.current?.time)throw new Error('missing weather timestamp');const targetHour=j.current.time.slice(0,13);let ix=j.hourly.time.findIndex(t=>t.slice(0,13)===targetHour);if(ix<0)ix=0;const val=k=>j.hourly[k]?.[ix];if(val('wind_gusts_10m')==null||val('precipitation')==null)throw new Error('incomplete weather');return [id,{gust:j.current.wind_gusts_10m??val('wind_gusts_10m'),rain:val('precipitation'),snow:val('snowfall')??0,observedAt:j.hourly.time[ix],timezone:j.timezone||null}]})).then(rows=>set({nodes:Object.fromEntries(rows),alerts:[],fetchedAt:new Date().toISOString(),source:'Open-Meteo'})).catch(fail);
  return()=>{cancelled=true};
 },[sid,rg,refreshKey,liveD,Rg]);
 useEffect(()=>setEx(null),[sid,rg,k,sel]);
 useEffect(()=>setRec(null),[sid,rg,k]);
 const wx=sid==='live'?live?.nodes:Rg.SC[sid]?.wx;
 const cuts=useMemo(()=>Object.fromEntries(Object.keys(Rg.P).map(id=>[id,wx&&wx[id]?cutOf(wx[id])*(sid==='live'?1:k/100):0])),[wx,k,Rg,sid]);
 const liveReady=sid!=='live'||!!(live?.nodes&&Object.keys(live.nodes).length===Object.keys(Rg.P).length);
 const r=calc(Rg,cuts,sel),nsel=Object.values(sel).filter(Boolean).length,t=Math.max(1,r.gap),N=Rg.NM;
 const w=r.lanes.filter(l=>l.over>0).sort((a,b)=>b.over-a.over).slice(0,4),uc=r.sol.total?r.sol.cost/r.sol.total:0;
 const tog=key=>setSel(s=>({...s,[key]:!s[key]})),pick=x=>{setRg(x);setSid(Object.keys(R[x].SC)[0]||'live');setLiveD(d=>({...d,[x]:undefined}));setSel({div:false,cap:false,pri:false,prm:false});setRec(null);setK(100)};
 const desc={div:`Cheapest feasible detours through lanes that still have room: up to ${f(r.sol.total)} packages/day at about $${uc.toFixed(2)} each.${r.gap>0&&r.sol.total<r.gap*.25?' Little room because most nearby lanes are also damaged.':''}`,cap:`Recovers up to ${f(.35*r.lost)} packages/day. $1.60 each. Takes hours to stand up.`,pri:'Critical packages (about 35% of overflow) go first. Free, but the rest still arrive late.',prm:`Resets dates on ${f(r.rem)} remaining packages before customers are let down. $0.30 each in credits.`};
 const recommend=()=>{if(!liveReady){setRec('Live weather is incomplete or unavailable. Refresh weather before generating a recommendation.');return;}const r0=calc(Rg,cuts,{}),u0=r0.sol.total?r0.sol.cost/r0.sol.total:0;let m=r0.gap;const useDiv=r0.sol.total>0&&u0<=2.3,d=useDiv?Math.min(m,r0.sol.total):0;m-=d;const useCap=m>.5,c=useCap?Math.min(m,.35*r0.lost):0;m-=c;const usePrm=m>.5;setSel({div:useDiv,cap:useCap,pri:false,prm:usePrm});setRec(!r0.gap?'Nothing to fix: every lane is within capacity.':`Used operational fixes before changing promises: ${useDiv?`reroute ${f(d)} packages (about $${u0.toFixed(2)} each), `:'rerouting was skipped because no lane has room or it costs too much, '}${useCap?`add temporary capacity for ${f(c)} ($1.60 each), `:''}${usePrm?`and reset promises only on the ${f(m)} packages nothing else can carry. Each reset is ranked at an assumed $2 trust cost on top of the $0.30 credit, so it comes last.`:'so no promise changes are needed.'} You can switch any response on or off to override this.`)};
 const chosen=OPTS.filter(([key])=>sel[key]).map(o=>o[1]);
 const facts={region:Rg.name,scenario:sid==='live'?'Live conditions':Rg.SC[sid].name,intensityPercent:k,overCapacityPerDay:Math.round(r.gap),stillLate:Math.round(r.late),promisesReset:Math.round(r.prm),planCostPerDay:Math.round(r.cost),responsesChosen:chosen,worstLanes:w.map(l=>`${N[l.a]} to ${N[l.b]}: capacity ${Math.round(l.c)} to ${Math.round(l.eff)}, volume ${l.v}, short ${Math.round(l.over)}`),reroutes:r.sol.plans.slice(0,3).map(p=>`${N[p.from]} to ${N[p.to]} via ${p.via.map(i=>N[i]).join(' and ')}: ${Math.round(p.units)} packages at $${p.unit.toFixed(2)} each`)};
 const template=()=>!facts.overCapacityPerDay?`Under "${facts.scenario}", every lane stays within capacity, so no packages are at risk.`:`Under "${facts.scenario}", about ${f(facts.overCapacityPerDay)} packages a day no longer fit on damaged lanes, mainly ${facts.worstLanes.slice(0,2).map(s=>s.split(':')[0]).join(' and ')}. ${chosen.length?`Your plan (${chosen.join(', ').toLowerCase()}) leaves ${f(facts.stillLate)} late and resets promises on ${f(facts.promisesReset)}, at $${f(facts.planCostPerDay)} per day.`:'You have not chosen a response yet, so all of them would be late.'} ${sel.prm?'Resetting promises is cheap but spends customer trust.':facts.stillLate>0?'No option here is free: you trade cost against late packages and customer trust.':'Everything is protected, but check what that costs.'} This is a simulation with invented data.`;
 const explain=async()=>{setEx({loading:true});try{const res=await fetch('/api/explain',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(facts)});const j=await res.json();if(res.ok&&j.text)return setEx({text:j.text,source:'Gemini AI'});throw 0}catch(e){setEx({text:template(),source:'Template (Gemini not available)'})}};
 const hint={fontSize:'13px',margin:'0 0 8px'};
 return(<main>
  <h1>Network Watch</h1>
  <p className="sub">When bad weather closes lanes, which packages miss their promise, and what should the planner do? Simulated transportation network with weather scenarios.</p>
  <section className="card warnbox"><b>Synthetic data.</b> The networks (hubs, lanes, volumes, costs) are invented for this demo and are not Amazon data. Weather scenarios are illustrative approximations; "Live now" uses real current conditions. The model is rule-based, not machine learning.</section>
  <section className="card steps"><h2>You are a network planner. Weather is hitting the network.</h2><ol>
   <li><b>Pick a region and scenario</b> and watch lines turn red where lanes can no longer carry the volume.</li>
   <li><b>Read the damage:</b> "Still late" is how many packages per day will miss their promised date.</li>
   <li><b>Click responses</b> and watch late fall while cost rises. You are trading cost against customer trust.</li>
   <li><b>Press "Explain this plan"</b> for a plain-language summary, then check the 14-day forecast below.</li></ol></section>
  <div className="grid">
   <section className="card"><h2>Network: {Rg.name}, lane load under weather</h2>
    <svg viewBox="0 0 700 560" role="img" aria-label="Map of hubs and lanes colored by utilization">
     {r.lanes.map(l=>{const[x1,y1]=Rg.P[l.a],[x2,y2]=Rg.P[l.b];return <line key={l.key} x1={x1} y1={y1} x2={x2} y2={y2} strokeLinecap="round" strokeWidth={l.c/1400+1} style={{stroke:col(l.v/Math.max(1,l.eff))}}><title>{N[l.a]} to {N[l.b]}: {f(l.v)} packages vs {f(l.eff)} capacity</title></line>})}
     {Object.entries(Rg.P).map(([id,[x,y]])=>{const c=cuts[id];return <g key={id}><circle cx={x} cy={y} r="9" strokeWidth="3" style={{fill:'var(--panel)',stroke:c>.5?'var(--bad)':c>.15?'var(--warn)':'var(--ok)'}}/><text className="lbl" x={x+14} y={y+4}>{N[id]}</text></g>})}
    </svg>
    <div className="legend">Teal: under 85% of remaining capacity. Amber: 85-100%. Red: over capacity. Line width: original capacity.</div></section>
   <section className="card"><h2>1. Region and weather</h2>
    <div className="row">{Object.entries(R).map(([id,region])=>[id,region.name]).map(([id,n])=><button key={id} className="chip" aria-pressed={rg===id} onClick={()=>pick(id)}>{n}</button>)}</div>
    <p className="note" style={hint}>{Rg.hint}</p>
    <div className="row">{[...Object.entries(Rg.SC).map(([id,s])=>[id,s.name]),['live','Live now']].map(([id,n])=><button key={id} className="chip" aria-pressed={sid===id} onClick={()=>setSid(id)}>{n}</button>)}</div>
    {sid==='live'?<><LiveBox live={live} Rg={Rg} us={false}/><button className="chip" type="button" onClick={()=>{setLiveD(d=>({...d,[rg]:undefined}));setRefreshKey(v=>v+1)}}>Refresh live weather</button></>:<p className="note">{Rg.SC[sid].note}</p>}
    {sid==='live'?<p className="note">Live mode uses the fetched weather readings directly. Intensity controls apply only to saved scenarios.</p>:<label className="note">Weather intensity: {k}%<input type="range" min="0" max="100" value={k} onChange={e=>setK(+e.target.value)} style={{width:'100%'}}/></label>}
    {!liveReady&&<p className="verdict">Waiting for complete live weather data. Recommendations are disabled until all hubs have readings.</p>}
    <div className="stats" aria-live="polite" style={{gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))'}}>{[['Over capacity / day',f(r.gap)],['Delivered on time',f(r.div+r.cap)],['Given a new date',f(r.prm)],['Still late',f(r.late)],['Plan cost / day','$'+f(r.cost)]].map(([a,b])=><div key={a}><small>{a}</small><span className="big">{b}</span></div>)}</div>
    <div className="bar" aria-hidden="true">{[[r.div,'var(--ok)'],[r.cap,'var(--mute)'],[r.prm,'var(--warn)'],[r.late,'var(--bad)']].map(([v,c],i)=><i key={i} style={{width:v/t*100+'%',background:c}}/>)}</div>
    <p className="note">Packages are counted per lane, so one that crosses two damaged lanes is counted twice. Treat totals as an upper bound.</p>
    <p className="verdict" aria-live="polite">{!r.gap?'No overflow under the selected conditions. Live mode uses actual weather readings; saved scenarios can be adjusted with the intensity control.':nsel?`With your plan: ${f(r.late)} packages still late, ${f(r.prm)} given a new date, cost $${f(r.cost)} per day.`:`Doing nothing: ${f(r.gap)} packages per day miss their promise. Pick a response below.`}</p>
    <h2>2. Choose your response</h2>
    <button type="button" className="chip" onClick={recommend} disabled={!liveReady} style={{marginBottom:8,fontWeight:700,opacity:liveReady?1:.5}}>Recommend a plan</button>
    {rec&&<p className="verdict">{rec}</p>}
    {OPTS.filter(([key])=>key!=='div'||r.sol.total>0.5).map(([key,n])=><button key={key} className="opt" aria-pressed={sel[key]} onClick={()=>tog(key)}><b>{n}</b><span>{desc[key]}</span></button>)}
    {sel.div&&r.sol.plans.length>0&&<><h2>Reroutes the solver chose</h2><ul className="why">{r.sol.plans.slice(0,4).map((p,i)=><li key={i}>{N[p.from]} to {N[p.to]} via {p.via.map(x=>N[x]).join(' and ')}: {f(p.units)} packages at ${p.unit.toFixed(2)} each.</li>)}</ul></>}
    <h2 style={{marginTop:12}}>Why these lanes</h2><ul className="why">{w.length?w.map(l=><li key={l.key}>{N[l.a]} to {N[l.b]}: capacity down {Math.round((1-l.eff/l.c)*100)}% ({f(l.c)} to {f(l.eff)}), volume {f(l.v)}, short by {f(l.over)}.</li>):<li>All lanes within capacity.</li>}</ul>
    <h2 style={{marginTop:12}}>3. Explain this plan</h2>
    <button className="go" type="button" onClick={explain} disabled={ex?.loading} style={{font:'inherit',fontWeight:700,background:'var(--sel)',color:'var(--selt)',border:0,borderRadius:6,padding:'10px 16px',cursor:'pointer',width:'100%'}}>{ex?.loading?'Writing...':'Explain this plan'}</button>
    {ex?.text&&<div className="verdict"><div>{ex.text}</div><div className="note">Source: {ex.source}. Written only from the numbers above.</div></div>}</section>
  </div>
  <Forecast Rg={Rg} lanes={r.lanes}/>
  <section className="card"><h2>Weather at each hub</h2>
   {wx?<table><thead><tr><th>Hub</th><th>Gust (mph)</th><th>Rain (mm/h)</th><th>Snow (cm/h)</th><th>Capacity cut</th></tr></thead><tbody>{Object.keys(Rg.P).map(id=><tr key={id}><td>{N[id]}</td><td>{wx[id]?Math.round(wx[id].gust):'no data'}</td><td>{wx[id]?(+wx[id].rain).toFixed(1):'no data'}</td><td>{wx[id]?(+(wx[id].snow||0)).toFixed(1):'no data'}</td><td>{Math.round(cuts[id]*100)}%</td></tr>)}</tbody></table>:<p className="note">No weather data loaded.</p>}
   <p className="note">Rule: gusts above 35 mph start cutting a hub's capacity (full cut at 90 mph). Heavy rain cuts up to 50% and heavy snow up to 60%. A lane loses capacity based on its worse end.</p></section>
 </main>);
}
