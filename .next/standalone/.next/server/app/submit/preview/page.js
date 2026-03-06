(()=>{var e={};e.id=888,e.ids=[888],e.modules={47849:e=>{"use strict";e.exports=require("next/dist/client/components/action-async-storage.external")},72934:e=>{"use strict";e.exports=require("next/dist/client/components/action-async-storage.external.js")},55403:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external")},54580:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external.js")},94749:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external")},45869:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},20399:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},73693:(e,t,o)=>{"use strict";o.r(t),o.d(t,{GlobalError:()=>s.a,__next_app__:()=>u,originalPathname:()=>p,pages:()=>c,routeModule:()=>h,tree:()=>d}),o(54298),o(81786),o(8811),o(35866);var i=o(23191),n=o(88716),a=o(37922),s=o.n(a),r=o(95231),l={};for(let e in r)0>["default","tree","pages","GlobalError","originalPathname","__next_app__","routeModule"].indexOf(e)&&(l[e]=()=>r[e]);o.d(t,l);let d=["",{children:["submit",{children:["preview",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(o.bind(o,54298)),"C:\\Users\\toto\\Downloads\\GlobeTrotter\\app\\submit\\preview\\page.tsx"]}]},{}]},{layout:[()=>Promise.resolve().then(o.bind(o,81786)),"C:\\Users\\toto\\Downloads\\GlobeTrotter\\app\\submit\\layout.tsx"]}]},{layout:[()=>Promise.resolve().then(o.bind(o,8811)),"C:\\Users\\toto\\Downloads\\GlobeTrotter\\app\\layout.tsx"],"not-found":[()=>Promise.resolve().then(o.t.bind(o,35866,23)),"next/dist/client/components/not-found-error"]}],c=["C:\\Users\\toto\\Downloads\\GlobeTrotter\\app\\submit\\preview\\page.tsx"],p="/submit/preview/page",u={require:o,loadChunk:()=>Promise.resolve()},h=new i.AppPageRouteModule({definition:{kind:n.x.APP_PAGE,page:"/submit/preview/page",pathname:"/submit/preview",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:d}})},86157:(e,t,o)=>{Promise.resolve().then(o.bind(o,42648))},62048:(e,t,o)=>{Promise.resolve().then(o.bind(o,69632))},42648:(e,t,o)=>{"use strict";o.d(t,{default:()=>a});var i=o(10326),n=o(17577);function a(){let[e,t]=(0,n.useState)([]),o=(0,n.useRef)(null);return((0,n.useRef)(0),(0,n.useRef)(null),(0,n.useRef)(.3),0===e.length)?null:i.jsx("div",{className:"floating-icons-container",children:(0,i.jsxs)("div",{ref:o,className:"floating-icons-layer",style:{animation:"none",top:"-100%"},children:[i.jsx("div",{className:"icon-group",children:e.map(e=>i.jsx("div",{className:"floating-icon",style:{width:e.size,height:e.size,opacity:e.opacity},children:e.svg},e.id))}),i.jsx("div",{className:"icon-group",children:e.map(e=>i.jsx("div",{className:"floating-icon",style:{width:e.size,height:e.size,opacity:e.opacity},children:e.svg},`${e.id}-clone`))})]})})}},69632:(e,t,o)=>{"use strict";o.r(t),o.d(t,{default:()=>d,dynamic:()=>r});var i=o(10326),n=o(35047),a=o(17577),s=o(46226);o(13445);let r="force-dynamic";function l(){let e=(0,n.useRouter)(),t=(0,n.useSearchParams)().get("id");(0,a.useMemo)(()=>t?`/api/pdf?id=${encodeURIComponent(String(t))}`:"",[t]);let[o,r]=(0,a.useState)(null),[l,d]=(0,a.useState)(null),[c,p]=(0,a.useState)(!1),u=(0,a.useRef)(null),h=(0,a.useRef)(null),[x,g]=(0,a.useState)(104),[f,m]=(0,a.useState)(0),[b,v]=(0,a.useState)(!1),[y,w]=(0,a.useState)(!1),$=(0,a.useCallback)(async()=>{if(t)try{let e=await fetch(`/api/pdf?id=${encodeURIComponent(String(t))}`);if(!e.ok)return;let o=await e.blob(),i=URL.createObjectURL(o),n=document.createElement("a");n.href=i,n.download=`globetrotter_${t}.pdf`,document.body.appendChild(n),n.click(),n.remove(),URL.revokeObjectURL(i)}catch{}},[t]),j=(0,a.useCallback)(()=>{try{localStorage.removeItem("submit_step1_draft_v1")}catch{}if(t){try{localStorage.removeItem(`submit_step2_${t}`)}catch{}try{localStorage.removeItem(`submit_step3_${t}`)}catch{}}e.push("/submit")},[t,e]),P=(0,a.useCallback)(()=>{t&&e.push(`/map?id=${encodeURIComponent(String(t))}`)},[t,e]);return(0,i.jsxs)("main",{className:"submit-page",style:{height:"100dvh",overflow:"hidden",position:"relative"},children:[i.jsx("section",{className:"container",style:{maxWidth:820},children:i.jsx("div",{className:"card",children:(0,i.jsxs)("header",{ref:h,className:"submit-header",children:[i.jsx("h1",{className:"submit-title",children:"Mon anecdote Globetrotter"}),i.jsx("p",{className:"submit-subtitle",children:"Partage ton voyage avec nous"}),(0,i.jsxs)("div",{className:"submit-banner",children:[i.jsx(s.default,{src:"/img/logo.png",alt:"GlobeTrotter",className:"submit-banner-logo",width:48,height:48,priority:!0}),i.jsx("div",{className:"submit-banner-text",children:"Seul, en groupe ou pour le travail dans tous les voyages il y a de l'aventure !"})]}),i.jsx("p",{className:"submit-hint",children:"Aper\xe7u de ton livret PDF"}),(0,i.jsxs)("div",{className:"submit-steps",children:[i.jsx("div",{className:"steps-line"}),i.jsx("div",{className:"steps-progress"}),i.jsx("div",{className:"step","aria-label":"Recherche",children:i.jsx("svg",{viewBox:"0 0 24 24",width:"22",height:"22",children:i.jsx("path",{fill:"currentColor",d:"M10 18a8 8 0 1 1 5.293-14.293A8 8 0 0 1 10 18Zm0-2a6 6 0 1 0 0-12 6 6 0 0 0 0 12Zm11 3.586-5.121-5.12 1.414-1.415 5.12 5.121L21 19.586Z"})})}),i.jsx("div",{className:"step","aria-label":"Voyage",children:i.jsx("svg",{viewBox:"0 0 24 24",width:"22",height:"22",children:i.jsx("path",{fill:"currentColor",d:"M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9L2 14v2l8-2.5V19l-2 1.5V22l3-1 3 1v-1.5L13 19v-5.5l8 2.5Z"})})}),i.jsx("div",{className:"step active","aria-label":"Livre",children:i.jsx("svg",{viewBox:"0 0 24 24",width:"22",height:"22",children:i.jsx("path",{fill:"currentColor",d:"M6 2h11a3 3 0 0 1 3 3v15.5a1.5 1.5 0 0 1-2.25 1.304L14 19H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm0 2v13h8.5l3.5 1.944V5a 1 1 0 0 0-1-1H6Z"})})})]})]})})}),i.jsx("div",{style:{height:`calc(100dvh - ${x}px - ${f}px)`,display:"grid",placeItems:"center",padding:12},children:t?o?(0,i.jsxs)("div",{style:{position:"relative",width:"100%",maxWidth:"240px",aspectRatio:"1240 / 1748",borderRadius:12,border:"2px solid #e7e5e4",boxShadow:"0 8px 16px rgba(0,0,0,0.1)",cursor:l?"zoom-in":"default",transition:"transform 0.2s ease",backgroundColor:"#fff"},onClick:()=>{l&&p(!0)},onMouseEnter:e=>e.currentTarget.style.transform="rotate(-1deg) scale(1.03)",onMouseLeave:e=>e.currentTarget.style.transform="rotate(0deg) scale(1)",children:[i.jsx("img",{src:o,alt:"Aper\xe7u PDF",style:{width:"100%",height:"100%",objectFit:"contain",borderRadius:10}}),i.jsx("div",{style:{position:"absolute",top:-12,right:-12,background:"rgba(255,255,255,0.95)",borderRadius:"50%",width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,boxShadow:"0 2px 8px rgba(0,0,0,0.15)",zIndex:2},children:"\uD83D\uDCCC"})]}):i.jsx("div",{style:{color:"var(--muted)"},children:"G\xe9n\xe9ration de l'aper\xe7u…"}):i.jsx("div",{style:{padding:16,textAlign:"center"},children:"Identifiant manquant."})}),(0,i.jsxs)("div",{ref:u,style:{position:"fixed",left:0,right:0,bottom:0,padding:"12px 16px",paddingBottom:"calc(env(safe-area-inset-bottom, 0px) + 12px)",display:"grid",gap:12,gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))",alignItems:"center",background:"rgba(255,255,255,.92)",WebkitBackdropFilter:"saturate(150%) blur(8px)",backdropFilter:"saturate(150%) blur(8px)",borderTop:"1px solid rgba(0,0,0,.06)",boxShadow:"0 -4px 14px rgba(0,0,0,.06)",zIndex:30},children:[i.jsx("button",{className:"checkin-btn ready",onClick:$,style:{cursor:"pointer"},children:i.jsx("span",{className:"checkin-inner",children:"T\xe9l\xe9charger le PDF"})}),i.jsx("button",{className:"checkin-btn",onClick:j,style:{cursor:"pointer"},children:i.jsx("span",{className:"checkin-inner",children:"Partager une nouvelle anecdote"})}),i.jsx("button",{className:"checkin-btn",onClick:P,style:{cursor:"pointer"},children:i.jsx("span",{className:"checkin-inner",children:"Voir mon voyage sur la carte"})})]}),c&&l&&i.jsx("div",{role:"dialog","aria-modal":"true",onClick:()=>p(!1),style:{position:"fixed",inset:0,background:"rgba(0,0,0,.7)",display:"grid",placeItems:"center",zIndex:50},children:i.jsx("img",{src:l,alt:"Aper\xe7u agrandi",style:{maxWidth:"92vw",maxHeight:"92dvh",borderRadius:8,boxShadow:"0 6px 20px rgba(0,0,0,.35)",objectFit:"contain"}})})]})}function d(){return i.jsx(a.Suspense,{fallback:i.jsx("div",{children:"Loading..."}),children:i.jsx(l,{})})}},13445:(e,t,o)=>{"use strict";o.d(t,{A:()=>a,n:()=>s});var i=o(39642),n=o(91723);async function a(e){let t=document.createElement("div");t.style.position="fixed",t.style.left="-9999px",t.style.top="0",t.style.width="1240px",t.style.height="1748px",document.body.appendChild(t);let o=[e.stage1,e.stage2,e.stage3].filter(Boolean),a=e.bon_plans?.slice(0,3)||[],{backgroundImage:s,blocks:r}=(0,n.wN)();t.innerHTML=`
    <div style="
      position: relative;
      width: 1240px;
      height: 1748px;
      background: url('${s}') center/cover no-repeat;
      font-family: 'Montserrat', 'Arial Black', sans-serif;
    ">
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800;900&display=swap" rel="stylesheet">
      
      <!-- Photo -->
      <div style="
        position: absolute;
        left: ${r.photo.left}px;
        top: ${r.photo.top}px;
        width: ${r.photo.width}px;
        height: ${r.photo.height}px;
        overflow: hidden;
        background: #c8d8d0;
      ">
        ${e.photo_url?`
          <img 
            src="${e.photo_url}" 
            crossorigin="anonymous"
            style="width: 100%; height: 100%; object-fit: cover;"
          />
        `:`
          <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 80px;">🌍</div>
        `}
      </div>

      <!-- Arr\xeat 1 -->
      ${o[0]?`
        <div style="position: absolute; left: ${r.stop1.left}px; top: ${r.stop1.top}px; font-size: ${r.stop1.fontSize}px; font-weight: ${r.stop1.fontWeight}; color: ${r.stop1.color}; max-width: 200px; line-height: 1.2;">
          ${o[0]}
        </div>
      `:""}

      <!-- Arr\xeat 2 -->
      ${o[1]?`
        <div style="position: absolute; left: ${r.stop2.left}px; top: ${r.stop2.top}px; font-size: ${r.stop2.fontSize}px; font-weight: ${r.stop2.fontWeight}; color: ${r.stop2.color}; max-width: 200px; line-height: 1.2;">
          ${o[1]}
        </div>
      `:""}

      <!-- Arr\xeat 3 -->
      ${o[2]?`
        <div style="position: absolute; left: ${r.stop3.left}px; top: ${r.stop3.top}px; font-size: ${r.stop3.fontSize}px; font-weight: ${r.stop3.fontWeight}; color: ${r.stop3.color}; max-width: 200px; line-height: 1.2;">
          ${o[2]}
        </div>
      `:""}

      <!-- Bon Plan 1 -->
      ${a[0]&&r.bonPlan1?`
        <div style="position: absolute; left: ${r.bonPlan1.left}px; top: ${r.bonPlan1.top}px; font-size: ${r.bonPlan1.fontSize}px; font-weight: ${r.bonPlan1.fontWeight}; color: ${r.bonPlan1.color}; max-width: 200px; line-height: 1.2;">
          ${a[0].address||a[0].type||(a[0].latitude&&a[0].longitude?`${Number(a[0].latitude).toFixed(4)}, ${Number(a[0].longitude).toFixed(4)}`:"Bon Plan 1")}
        </div>
      `:""}

      <!-- Bon Plan 2 -->
      ${a[1]&&r.bonPlan2?`
        <div style="position: absolute; left: ${r.bonPlan2.left}px; top: ${r.bonPlan2.top}px; font-size: ${r.bonPlan2.fontSize}px; font-weight: ${r.bonPlan2.fontWeight}; color: ${r.bonPlan2.color}; max-width: 200px; line-height: 1.2;">
          ${a[1].address||a[1].type||(a[1].latitude&&a[1].longitude?`${Number(a[1].latitude).toFixed(4)}, ${Number(a[1].longitude).toFixed(4)}`:"Bon Plan 2")}
        </div>
      `:""}

      <!-- Bon Plan 3 -->
      ${a[2]&&r.bonPlan3?`
        <div style="position: absolute; left: ${r.bonPlan3.left}px; top: ${r.bonPlan3.top}px; font-size: ${r.bonPlan3.fontSize}px; font-weight: ${r.bonPlan3.fontWeight}; color: ${r.bonPlan3.color}; max-width: 200px; line-height: 1.2;">
          ${a[2].address||a[2].type||(a[2].latitude&&a[2].longitude?`${Number(a[2].latitude).toFixed(4)}, ${Number(a[2].longitude).toFixed(4)}`:"Bon Plan 3")}
        </div>
      `:""}

      <!-- Nom -->
      <div style="position: absolute; left: ${r.name.left}px; top: ${r.name.top}px; font-size: ${r.name.fontSize}px; font-weight: ${r.name.fontWeight}; color: ${r.name.color}; text-transform: uppercase; letter-spacing: 3px;">
        ${e.display_name}
      </div>

      <!-- Destination -->
      <div style="position: absolute; left: ${r.destination.left}px; top: ${r.destination.top}px; font-size: ${r.destination.fontSize}px; font-weight: ${r.destination.fontWeight}; color: ${r.destination.color};">
        ${e.city}, ${e.country}
      </div>

      <!-- Anecdote -->
      <div style="position: absolute; left: ${r.anecdote.left}px; top: ${r.anecdote.top}px; width: ${r.anecdote.width}px; font-size: ${r.anecdote.fontSize}px; font-weight: ${r.anecdote.fontWeight}; line-height: 1.5; color: ${r.anecdote.color}; max-height: 150px; overflow: hidden;">
        ${e.anecdote_text||""}
      </div>
    </div>
  `,await new Promise(e=>setTimeout(e,500));let l=await (0,i.default)(t,{scale:2,useCORS:!0,allowTaint:!0,backgroundColor:"#ffffff"});return document.body.removeChild(t),new Promise(e=>{l.toBlob(t=>{e(t)},"image/png",.95)})}async function s(e,t){let o=new FormData;if(o.append("image",t,`${e}.png`),o.append("submissionId",e),!(await fetch("/api/save-boarding-pass",{method:"POST",body:o})).ok)throw Error("Failed to save boarding pass image")}},91723:(e,t,o)=>{"use strict";o.d(t,{T2:()=>a,UY:()=>r,_K:()=>s,wN:()=>n});let i={backgroundImage:"/img/tampon d embarcation.png",blocks:{photo:{left:587,top:60,width:590,height:663},stop1:{left:297,top:515,fontSize:24,color:"#1a1a1a",fontWeight:800},stop2:{left:312,top:648,fontSize:24,color:"#1a1a1a",fontWeight:800},stop3:{left:327,top:792,fontSize:24,color:"#1a1a1a",fontWeight:800},bonPlan1:{left:450,top:515,fontSize:20,color:"#1a1a1a",fontWeight:600},bonPlan2:{left:465,top:648,fontSize:20,color:"#1a1a1a",fontWeight:600},bonPlan3:{left:480,top:792,fontSize:20,color:"#1a1a1a",fontWeight:600},name:{left:283,top:1064,fontSize:34,color:"white",fontWeight:900},destination:{left:869,top:1176,fontSize:40,color:"#1a1a1a",fontWeight:900},anecdote:{left:500,top:1349,width:450,fontSize:22,color:"#2a2a2a",fontWeight:700}}};function n(){return i}async function a(e){console.warn("Cannot save config: window is undefined")}function s(){return JSON.parse(JSON.stringify(i))}function r(){}},81786:(e,t,o)=>{"use strict";o.r(t),o.d(t,{default:()=>d});var i=o(19510);o(71159);var n=o(68570);let a=(0,n.createProxy)(String.raw`C:\Users\toto\Downloads\GlobeTrotter\app\components\FloatingIconsBackground.tsx`),{__esModule:s,$$typeof:r}=a;a.default;let l=(0,n.createProxy)(String.raw`C:\Users\toto\Downloads\GlobeTrotter\app\components\FloatingIconsBackground.tsx#default`);function d({children:e}){return(0,i.jsxs)(i.Fragment,{children:[i.jsx(l,{}),i.jsx("div",{style:{position:"relative",zIndex:1},children:e})]})}},54298:(e,t,o)=>{"use strict";o.r(t),o.d(t,{$$typeof:()=>s,__esModule:()=>a,default:()=>l,dynamic:()=>r});var i=o(68570);let n=(0,i.createProxy)(String.raw`C:\Users\toto\Downloads\GlobeTrotter\app\submit\preview\page.tsx`),{__esModule:a,$$typeof:s}=n;n.default;let r=(0,i.createProxy)(String.raw`C:\Users\toto\Downloads\GlobeTrotter\app\submit\preview\page.tsx#dynamic`),l=(0,i.createProxy)(String.raw`C:\Users\toto\Downloads\GlobeTrotter\app\submit\preview\page.tsx#default`)}};var t=require("../../../webpack-runtime.js");t.C(e);var o=e=>t(t.s=e),i=t.X(0,[948,858,226,642,404],()=>o(73693));module.exports=i})();