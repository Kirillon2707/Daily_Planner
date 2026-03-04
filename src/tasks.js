// tasks.js — экран «Список задач» (ЛР3 рис. 2): фильтры, таблица, экспорт CSV
(function(){
  const who = document.getElementById('whoami');
  const whoami = DIARY.getWhoami();
  who.textContent = `${whoami.login} · ${whoami.role}`;

  const q = document.getElementById('q');
  const dFrom = document.getElementById('dFrom');
  const dTo = document.getElementById('dTo');
  const fltCat = document.getElementById('fltCat');
  const fltPr = document.getElementById('fltPr');
  const fltSt = document.getElementById('fltSt');
  const tbl = document.getElementById('tbl');
  const stats = document.getElementById('stats');

  const today = new Date();
  const toISO = DIARY.toISODate;

  // defaults: текущий месяц
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd = new Date(today.getFullYear(), today.getMonth()+1, 0);
  dFrom.value = toISO(monthStart);
  dTo.value = toISO(monthEnd);

  DIARY.APP.categories.forEach(c=>{
    const opt = document.createElement('option');
    opt.value = c.name; opt.textContent = c.name;
    fltCat.appendChild(opt);
  });
  DIARY.APP.priorities.forEach(p=>{
    const opt = document.createElement('option');
    opt.value = p.name; opt.textContent = p.name;
    fltPr.appendChild(opt);
  });
  DIARY.APP.statuses.forEach(s=>{
    const opt = document.createElement('option');
    opt.value = s.name; opt.textContent = s.name;
    fltSt.appendChild(opt);
  });

  const inRange = (d, a, b)=> (!a || d>=a) && (!b || d<=b);

  const render = ()=>{
    const items = DIARY.loadItems().filter(x=>x.kind==='task'); // список задач
    const qq = (q.value||'').trim().toLowerCase();
    const a = dFrom.value;
    const b = dTo.value;
    const cat = fltCat.value;
    const pr = fltPr.value;
    const st = fltSt.value;

    const rows = items.filter(x=>{
      if(!inRange(x.date, a, b)) return false;
      if(cat && x.category!==cat) return false;
      if(pr && x.priority!==pr) return false;
      if(st && x.status!==st) return false;
      if(qq){
        const s = `${x.title||''} ${x.desc||''}`.toLowerCase();
        if(!s.includes(qq)) return false;
      }
      return true;
    }).sort((x,y)=>(x.date||'').localeCompare(y.date||'') || (x.time||'').localeCompare(y.time||'') || (x.id-y.id));

    tbl.innerHTML = '';
    rows.forEach((x)=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${x.id}</td>
        <td>${x.date}</td>
        <td>${x.time || '—'}</td>
        <td class="text-truncate-2" style="max-width: 380px;">
          <div class="fw-semibold">${x.title}</div>
          <div class="small text-muted">${x.desc || ''}</div>
        </td>
        <td>${x.category}</td>
        <td><span class="${DIARY.priorityBadge(x.priority)}">${x.priority}</span></td>
        <td><span class="${DIARY.badgeClass(x)}">${x.status}</span></td>
        <td class="text-end">
          <a class="btn btn-sm btn-outline-dark me-1" href="task.html?id=${x.id}"><i class="bi bi-pen"></i></a>
          <button class="btn btn-sm btn-outline-danger" data-act="del"><i class="bi bi-trash"></i></button>
        </td>
      `;
      tr.querySelector('[data-act="del"]').addEventListener('click', ()=>{
        if(confirm(`Удалить задачу #${x.id}?`)){
          const next = DIARY.loadItems().filter(i=>i.id!==x.id);
          DIARY.saveItems(next);
          render();
        }
      });
      tbl.appendChild(tr);
    });

    stats.textContent = `Показано: ${rows.length}. Период: ${a || '—'} … ${b || '—'}.`;
  };

  document.getElementById('btnReset').addEventListener('click', ()=>{
    q.value=''; fltCat.value=''; fltPr.value=''; fltSt.value='';
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth()+1, 0);
    dFrom.value = toISO(monthStart);
    dTo.value = toISO(monthEnd);
    render();
  });

  document.getElementById('btnExport').addEventListener('click', ()=>{
    const items = DIARY.loadItems().filter(x=>x.kind==='task');
    // экспортируем с учётом фильтров — просто берем текущую таблицу через повтор фильтра
    const qq = (q.value||'').trim().toLowerCase();
    const a = dFrom.value;
    const b = dTo.value;
    const cat = fltCat.value;
    const pr = fltPr.value;
    const st = fltSt.value;

    const rows = items.filter(x=>{
      if(!inRange(x.date, a, b)) return false;
      if(cat && x.category!==cat) return false;
      if(pr && x.priority!==pr) return false;
      if(st && x.status!==st) return false;
      if(qq){
        const s = `${x.title||''} ${x.desc||''}`.toLowerCase();
        if(!s.includes(qq)) return false;
      }
      return true;
    });

    DIARY.exportCSV(rows);
  });

  [q, dFrom, dTo, fltCat, fltPr, fltSt].forEach(el=>{
    el.addEventListener('input', render);
    el.addEventListener('change', render);
  });

  render();
})();
