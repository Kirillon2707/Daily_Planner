// today.js — экран «Сегодня» (ЛР3 рис. 1): период, поиск/фильтры, таблица и действия
(function(){
  const who = document.getElementById('whoami');
  const whoami = DIARY.getWhoami();
  who.textContent = `${whoami.login} · ${whoami.role}`;

  const today = new Date();
  const toISO = DIARY.toISODate;

  document.getElementById('todayLabel').textContent =
    `Текущая дата: ${String(today.getDate()).padStart(2,'0')}.${String(today.getMonth()+1).padStart(2,'0')}.${today.getFullYear()}`;

  const q = document.getElementById('q');
  const dFrom = document.getElementById('dFrom');
  const dTo = document.getElementById('dTo');
  const fltCat = document.getElementById('fltCat');
  const fltStatus = document.getElementById('fltStatus');
  const tbl = document.getElementById('tbl');

  const kpiCount = document.getElementById('kpiCount');
  const kpiDone = document.getElementById('kpiDone');
  const kpiOverdue = document.getElementById('kpiOverdue');

  // defaults: week around today
  const from = new Date(today); from.setDate(from.getDate()-3);
  const to = new Date(today); to.setDate(to.getDate()+3);
  dFrom.value = toISO(from);
  dTo.value = toISO(to);

  // fill selects
  DIARY.APP.categories.forEach(c=>{
    const opt = document.createElement('option');
    opt.value = c.name; opt.textContent = c.name;
    fltCat.appendChild(opt);
  });
  DIARY.APP.statuses.forEach(s=>{
    const opt = document.createElement('option');
    opt.value = s.name; opt.textContent = s.name;
    fltStatus.appendChild(opt);
  });

  // quick note
  const noteModal = new bootstrap.Modal(document.getElementById('noteModal'));
  const settingsModal = new bootstrap.Modal(document.getElementById('settingsModal'));
  const noteText = document.getElementById('noteText');
  noteText.value = localStorage.getItem('diary_quick_note') || '';

  document.getElementById('btnNotes').addEventListener('click', ()=> noteModal.show());
  document.getElementById('btnSaveNote').addEventListener('click', ()=>{
    localStorage.setItem('diary_quick_note', noteText.value || '');
    noteModal.hide();
  });

  // settings (demo user switch)
  const userSelect = document.getElementById('userSelect');
  DIARY.APP.users.forEach(u=>{
    const opt = document.createElement('option');
    opt.value = u.login;
    opt.textContent = `${u.login} (${u.role})`;
    userSelect.appendChild(opt);
  });
  userSelect.value = whoami.login;

  document.getElementById('btnSettings').addEventListener('click', ()=> settingsModal.show());
  document.getElementById('btnApplyUser').addEventListener('click', ()=>{
    const u = DIARY.APP.users.find(x=>x.login===userSelect.value) || {login:'user1', role:'User'};
    DIARY.setWhoami({login: u.login, role: u.role});
    location.reload();
  });

  const inRange = (d, a, b)=> (!a || d>=a) && (!b || d<=b);

  const render = ()=>{
    const items = DIARY.loadItems();

    const qq = (q.value||'').trim().toLowerCase();
    const a = dFrom.value;
    const b = dTo.value;
    const cat = fltCat.value;
    const st = fltStatus.value;

    const rows = items.filter(x=>{
      if(!inRange(x.date, a, b)) return false;
      if(cat && x.category!==cat) return false;
      if(st && x.status!==st) return false;
      if(qq){
        const s = `${x.title||''} ${x.desc||''}`.toLowerCase();
        if(!s.includes(qq)) return false;
      }
      return true;
    }).sort((x,y)=>(x.date||'').localeCompare(y.date||'') || (x.time||'').localeCompare(y.time||'') || (x.id-y.id));

    tbl.innerHTML = '';
    rows.forEach((x, idx)=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${idx+1}</td>
        <td><span class="badge text-bg-light border">${x.time || '—'}</span></td>
        <td>
          <div class="fw-semibold">${x.title}</div>
          <div class="small text-muted">${DIARY.fmtKind(x.kind)} · ${x.date}</div>
        </td>
        <td>${x.category}</td>
        <td><span class="${DIARY.priorityBadge(x.priority)}">${x.priority}</span></td>
        <td><span class="${DIARY.badgeClass(x)}">${x.status}</span></td>
        <td>${DIARY.reminderTime(x)}</td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-dark me-1" data-act="open"><i class="bi bi-eye"></i></button>
          <button class="btn btn-sm btn-outline-dark me-1" data-act="edit"><i class="bi bi-pen"></i></button>
          <button class="btn btn-sm btn-outline-danger me-1" data-act="del"><i class="bi bi-trash"></i></button>
          <button class="btn btn-sm btn-outline-success me-1" data-act="done"><i class="bi bi-check2"></i></button>
          <button class="btn btn-sm btn-outline-secondary" data-act="move"><i class="bi bi-arrow-right"></i></button>
        </td>
      `;

      tr.querySelector('[data-act="open"]').addEventListener('click', ()=>{
        alert(`${DIARY.fmtKind(x.kind)} #${x.id}\n${x.date} ${x.time||''}\n${x.title}\nКатегория: ${x.category}\nПриоритет: ${x.priority}\nСтатус: ${x.status}\nНапоминание: ${DIARY.reminderTime(x)}\nОписание: ${x.desc||'—'}`);
      });

      tr.querySelector('[data-act="edit"]').addEventListener('click', ()=>{
        window.location.href = `task.html?id=${x.id}`;
      });

      tr.querySelector('[data-act="del"]').addEventListener('click', ()=>{
        if(confirm(`Удалить запись #${x.id}?`)){
          const next = items.filter(i=>i.id!==x.id);
          DIARY.saveItems(next);
          render();
        }
      });

      tr.querySelector('[data-act="done"]').addEventListener('click', ()=>{
        // установить первый статус с done=true
        const doneStatus = (DIARY.APP.statuses.find(s=>s.done)?.name) || x.status;
        const next = items.map(i=> i.id===x.id ? {...i, status: doneStatus} : i);
        DIARY.saveItems(next);
        render();
      });

      tr.querySelector('[data-act="move"]').addEventListener('click', ()=>{
        const nd = prompt('Новая дата (YYYY-MM-DD):', x.date);
        if(!nd) return;
        const ok = /^\d{4}-\d{2}-\d{2}$/.test(nd);
        if(!ok){ alert('Неверный формат даты.'); return; }
        const next = items.map(i=> i.id===x.id ? {...i, date: nd} : i);
        DIARY.saveItems(next);
        render();
      });

      tbl.appendChild(tr);
    });

    const nowISO = toISO(today);
    const doneCount = rows.filter(r=>DIARY.statusIsDone(r.status)).length;
    const overdueCount = rows.filter(r=>!DIARY.statusIsDone(r.status) && r.date < nowISO).length;

    kpiCount.textContent = String(rows.length);
    kpiDone.textContent = String(doneCount);
    kpiOverdue.textContent = String(overdueCount);
  };

  [q, dFrom, dTo, fltCat, fltStatus].forEach(el=>{
    el.addEventListener('input', render);
    el.addEventListener('change', render);
  });

  document.getElementById('btnResetFilters').addEventListener('click', ()=>{
    q.value=''; fltCat.value=''; fltStatus.value='';
    const from = new Date(today); from.setDate(from.getDate()-3);
    const to = new Date(today); to.setDate(to.getDate()+3);
    dFrom.value = toISO(from);
    dTo.value = toISO(to);
    render();
  });

  document.getElementById('btnResetQ').addEventListener('click', ()=>{
    q.value=''; render();
  });

  render();
})();
