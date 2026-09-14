/* BIG BROTHER — Purchase Payable Mobile V1 */
(function(){
'use strict';
const BASE_WIDTH=794;
function q(s,r=document){return r.querySelector(s)}
function qa(s,r=document){return Array.from(r.querySelectorAll(s))}
function make(tag,cls,html){const el=document.createElement(tag);if(cls)el.className=cls;if(html!==undefined)el.innerHTML=html;return el}
function canEdit(){return window.BB_PAYABLE_MOBILE_CAN_EDIT!==false}
function markRows(){
  const body=document.getElementById('tbody');
  if(!body)return;
  qa(':scope>tr',body).forEach(tr=>{
    const cells=tr.children;
    tr.classList.toggle('bb-empty',cells.length===1&&cells[0]?.hasAttribute('colspan'));
  });
  if(!canEdit()){
    qa('.pay-one',body).forEach(b=>{b.style.display='none'});
    qa('.rowcheck',body).forEach(c=>{c.disabled=true});
  }
  updateSelectedCount();
}
function updateSelectedCount(){
  const out=document.getElementById('bbSelectedCount');
  if(!out)return;
  const checked=qa('#tbody .rowcheck:checked').length;
  out.textContent=checked+' selected';
}
function fitDetail(){
  const modal=document.getElementById('detailModal');
  const content=document.getElementById('detailContent');
  const stage=content?.querySelector(':scope>.bb-detail-stage');
  if(!modal?.classList.contains('show')||!content||!stage)return;
  const available=Math.max(280,(modal.clientWidth||window.innerWidth)-16);
  const scale=Math.min(1,available/BASE_WIDTH);
  content.style.setProperty('--bb-preview-scale',String(scale));
  content.style.width=Math.ceil(BASE_WIDTH*scale)+'px';
  requestAnimationFrame(()=>{
    const h=Math.max(stage.scrollHeight,stage.offsetHeight,1);
    content.style.height=Math.ceil(h*scale)+'px';
  });
}
function prepareDetail(){
  const content=document.getElementById('detailContent');
  if(!content||!content.childNodes.length)return;
  if(content.querySelector(':scope>.bb-detail-stage')){fitDetail();return}
  const stage=make('div','bb-detail-stage');
  while(content.firstChild)stage.appendChild(content.firstChild);
  content.appendChild(stage);
  requestAnimationFrame(fitDetail);
  setTimeout(fitDetail,120);
  setTimeout(fitDetail,350);
}
function init(){
  const page=q('.page');
  const summary=q('.summary');
  if(!page||!summary)return;

  const head=make('div','bb-mobile-head');
  head.innerHTML='<div><h1>Payable Invoice</h1><p>Purchase payables · Secure Supabase</p></div><span class="bb-secure">SECURE</span>';
  page.insertBefore(head,summary);

  const cards=qa(':scope>.card',page);
  const filterCard=cards[0];
  const listCard=cards[1];
  if(filterCard)filterCard.classList.add('bb-status-card');
  if(listCard)listCard.classList.add('bb-payable-list');

  const toolbar=make('div','bb-mobile-toolbar');
  const filterBtn=make('button','bb-filter-btn','☰ Filters');
  toolbar.appendChild(filterBtn);
  const batch=document.getElementById('batchBtn');
  const refresh=document.getElementById('refreshBtn');
  if(batch)toolbar.appendChild(batch);
  if(refresh)toolbar.appendChild(refresh);
  summary.insertAdjacentElement('afterend',toolbar);

  if(!canEdit()&&batch)batch.style.display='none';

  const selectAll=document.getElementById('selectAll');
  const selectBar=make('div','bb-selectbar');
  const label=make('label');
  if(selectAll){label.appendChild(selectAll);label.appendChild(document.createTextNode(' Select all visible'));}
  else label.textContent='Selection';
  const selectedText=make('span','', '0 selected');selectedText.id='bbSelectedCount';
  selectBar.append(label,selectedText);
  if(listCard)listCard.insertAdjacentElement('beforebegin',selectBar);
  if(!canEdit())selectBar.style.display='none';

  const filters=q('.filters');
  const overlay=make('div','bb-filter-overlay');
  overlay.id='bbPayableFilterOverlay';
  const sheet=make('div','bb-filter-sheet');
  const sheetHead=make('div','bb-filter-sheet-head','<strong>Filter Payables</strong><button type="button" class="bb-filter-sheet-close">×</button>');
  sheet.appendChild(sheetHead);
  if(filters)sheet.appendChild(filters);
  overlay.appendChild(sheet);
  document.body.appendChild(overlay);
  const closeFilter=()=>overlay.classList.remove('show');
  filterBtn.addEventListener('click',()=>overlay.classList.add('show'));
  q('.bb-filter-sheet-close',sheet)?.addEventListener('click',closeFilter);
  overlay.addEventListener('click',e=>{if(e.target===overlay)closeFilter()});
  filters?.addEventListener('change',()=>setTimeout(closeFilter,80));

  const tbody=document.getElementById('tbody');
  if(tbody){
    new MutationObserver(markRows).observe(tbody,{childList:true,subtree:true});
    tbody.addEventListener('change',updateSelectedCount);
    tbody.addEventListener('click',()=>setTimeout(updateSelectedCount,0));
  }
  selectAll?.addEventListener('change',()=>setTimeout(updateSelectedCount,0));
  markRows();

  const detail=document.getElementById('detailContent');
  if(detail)new MutationObserver(()=>setTimeout(prepareDetail,0)).observe(detail,{childList:true});
  const detailModal=document.getElementById('detailModal');
  if(detailModal)new MutationObserver(()=>{if(detailModal.classList.contains('show'))setTimeout(prepareDetail,0)}).observe(detailModal,{attributes:true,attributeFilter:['class']});

  if(!canEdit()){
    document.getElementById('paymentModal')?.remove();
    document.getElementById('batchModal')?.remove();
  }

  window.addEventListener('resize',fitDetail);
  window.addEventListener('orientationchange',()=>setTimeout(fitDetail,120));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
