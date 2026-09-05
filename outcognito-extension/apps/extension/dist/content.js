function r(i){if(!i)return"0s";const s=Math.floor(i/3600),c=Math.floor(i%3600/60),t=i%60;return s>0?`${s}h ${c}m`:c>0?`${c}m ${t}s`:`${t}s`}const e=document.createElement("div");e.id="outcognito-glass-root";e.innerHTML=`
  <div class="outcognito-header">Outcognito</div>
  
  <div class="outcognito-stats-grid">
    <div class="outcognito-stat-box">
      <div class="outcognito-label">Total Time</div>
      <div class="outcognito-value" id="outcognito-total-time">0s</div>
    </div>
    <div class="outcognito-stat-box">
      <div class="outcognito-label">AI Time</div>
      <div class="outcognito-value" id="outcognito-ai-time">0s</div>
    </div>
    <div class="outcognito-stat-box full-width">
      <div class="outcognito-label">Tab Switches</div>
      <div class="outcognito-value" id="outcognito-tab-switches">0</div>
    </div>
  </div>

  <div class="outcognito-header" style="font-size: 11px; margin-top: 4px;">Time By Niche</div>
  <div class="outcognito-categories-section" id="outcognito-category-bars">
    <!-- Bars will be injected here dynamically -->
  </div>
`;document.body.appendChild(e);chrome.runtime.onMessage.addListener((i,s,c)=>{i.type==="TOGGLE_DASHBOARD"&&(e.classList.toggle("active"),e.classList.contains("active")&&chrome.runtime.sendMessage({type:"GET_DAILY_STATS"},t=>{var g;if(t!=null&&t.success&&t.data){const o=t.data,u=((g=o.categorySeconds)==null?void 0:g.ai)||0;document.getElementById("outcognito-total-time").innerText=r(o.activeSeconds),document.getElementById("outcognito-ai-time").innerText=r(u),document.getElementById("outcognito-tab-switches").innerText=(o.tabSwitches||0).toString();const n=document.getElementById("outcognito-category-bars");if(n.innerHTML="",!o.categorySeconds||Object.keys(o.categorySeconds).length===0){n.innerHTML='<div class="outcognito-label" style="text-align:center; opacity:0.5;">No data yet</div>';return}Object.entries(o.categorySeconds).sort((a,d)=>d[1]-a[1]).forEach(([a,d])=>{const l=d,v=o.activeSeconds>0?l/o.activeSeconds*100:0;n.innerHTML+=`
              <div class="outcognito-category-row">
                <div class="outcognito-category-header">
                  <span>${a}</span>
                  <span>${r(l)}</span>
                </div>
                <div class="outcognito-bar-bg">
                  <div class="outcognito-bar-fill" style="width: ${v}%;"></div>
                </div>
              </div>
            `})}}))});
