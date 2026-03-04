// task.js — форма создания/редактирования (ЛР3 рис. 3): поля, статусы, напоминание, повторы
(function(){
  const who = document.getElementById('whoami');
  const whoami = DIARY.getWhoami();
  who.textContent = `${whoami.login} · ${whoami.role}`;

  const url = new URL(window.location.href);
  const id = url.searchParams.get('id');
  const kindParam = url.searchParams.get('kind');

  const hdrTitle = document.getElementById('hdrTitle');
  const idLabel = document.getElementById('idLabel');
  const remAt = document.getElementById('remAt');

  const form = document.getElementById('form');
  const kind = document.getElementById('kind');
  const title = document.getElementById('title');
  const desc = document.getElementById('desc');
  const date = document.getElementById('date');
  const time = document.getElementById('time');
  const category = document.getElementById('category');
  const priority = document.getElementById('priority');
  const statusRadios = document.getElementById('statusRadios');
  const remOn = document.getElementById('remOn');
  const remMinutes = document.getElementById('remMinutes');
  const remMinutesWrap = document.getElementById('remMinutesWrap');
  const btnDelete = document.getElementById('btnDelete');
  const err = document.getElementById('err');

  // fill selects
  DIARY.APP.categories.forEach(c=>{
    const opt = document.createElement('option');
    opt.value = c.name; opt.textContent = c.name;
    category.appendChild(opt);
  });
  DIARY.APP.priorities.forEach(p=>{
    const opt = document.createElement('option');
    opt.value = p.name; opt.textContent = p.name;
    priority.appendChild(opt);
  });

  // statuses as radios (как в ЛР3)
  const mkRadio = (name, checked)=>{
    const id = 'st_' + name.replace(/\s+/g,'_');
    const wrap = document.createElement('div');
    wrap.className = 'form-check';
    wrap.innerHTML = `
      <input class="form-check-input" type="radio" name="status" id="${id}" value="${name}" ${checked ? 'checked' : ''}>
      <label class="form-check-label" for="${id}">${name}</label>
    `;
    return wrap;
  };

  const setInvalid = (el, yes)=> el.classList.toggle('is-invalid', !!yes);
  const setErr = (msg)=>{ err.textContent = msg; err.classList.remove('d-none'); };
  const clearErr = ()=> err.classList.add('d-none');

  const updateReminderUI = ()=>{
    const on = remOn.checked;
    remMinutesWrap.classList.toggle('d-none', !on);
    updateRemAt();
  };

  const updateRemAt = ()=>{
    const item = {
      date: date.value,
      time: time.value,
      reminder: { enabled: remOn.checked, minutes: Number(remMinutes.value||0) }
    };
    remAt.textContent = DIARY.reminderTime(item);
  };

  const getRepeat = ()=>{
    const el = document.querySelector('input[name="repeat"]:checked');
    return el ? el.value : 'none';
  };
  const setRepeat = (v)=>{
    const el = document.querySelector(`input[name="repeat"][value="${v}"]`);
    if(el) el.checked = true;
  };

  const getStatus = ()=>{
    const el = document.querySelector('input[name="status"]:checked');
    return el ? el.value : (DIARY.APP.statuses[0]?.name || 'План');
  };
  const setStatus = (v)=>{
    const el = document.querySelector(`input[name="status"][value="${v}"]`);
    if(el) el.checked = true;
  };

  const items = DIARY.loadItems();
  const existing = id ? items.find(x=>String(x.id)===String(id)) : null;

  // init statuses (под типично используемые)
  const baseStatuses = DIARY.APP.statuses.map(s=>s.name);
  baseStatuses.forEach((s, idx)=>{
    statusRadios.appendChild(mkRadio(s, idx===0));
  });

  const initNew = ()=>{
    hdrTitle.textContent = 'Задача: создание/редактирование';
    idLabel.textContent = 'new';
    kind.value = kindParam === 'event' ? 'event' : 'task';
    title.value = '';
    desc.value = '';
    date.valueAsDate = new Date();
    time.value = '18:00';
    category.value = DIARY.APP.categories[0]?.name || 'Учёба';
    priority.value = DIARY.APP.priorities[1]?.name || 'Средний';
    setStatus(baseStatuses[0] || 'План');
    remOn.checked = false;
    remMinutes.value = 15;
    setRepeat('none');
    btnDelete.classList.add('d-none');
    updateReminderUI();
  };

  const initExisting = ()=>{
    hdrTitle.textContent = `Запись #${existing.id}: редактирование`;
    idLabel.textContent = String(existing.id);
    kind.value = existing.kind || 'task';
    title.value = existing.title || '';
    desc.value = existing.desc || '';
    date.value = existing.date || DIARY.toISODate(new Date());
    time.value = existing.time || '';
    category.value = existing.category || (DIARY.APP.categories[0]?.name || '');
    priority.value = existing.priority || (DIARY.APP.priorities[1]?.name || 'Средний');
    setStatus(existing.status || baseStatuses[0] || 'План');
    remOn.checked = !!existing.reminder?.enabled;
    remMinutes.value = existing.reminder?.minutes ?? 15;
    setRepeat(existing.repeat || 'none');
    btnDelete.classList.remove('d-none');
    updateReminderUI();
  };

  if(existing) initExisting();
  else initNew();

  // events
  remOn.addEventListener('change', updateReminderUI);
  [date, time, remMinutes].forEach(el=>{
    el.addEventListener('input', updateRemAt);
    el.addEventListener('change', updateRemAt);
  });

  const validate = ()=>{
    clearErr();
    const t = (title.value||'').trim();
    let ok = true;

    if(t.length < 2){ setInvalid(title,true); ok=false; } else setInvalid(title,false);
    if(!date.value){ setInvalid(date,true); ok=false; } else setInvalid(date,false);

    if(remOn.checked){
      const m = Number(remMinutes.value);
      if(!Number.isFinite(m) || m<=0){
        ok = false;
        setErr('Для напоминания укажите число минут больше 0.');
      }
      if(!(time.value||'').trim()){
        ok = false;
        setErr('Для напоминания укажите время записи.');
      }
    }
    return ok;
  };

  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    if(!validate()) return;

    const next = DIARY.loadItems();
    const row = {
      id: existing ? existing.id : DIARY.nextId(next),
      kind: kind.value,
      title: (title.value||'').trim(),
      desc: (desc.value||'').trim(),
      date: date.value,
      time: time.value,
      category: category.value,
      priority: priority.value,
      status: getStatus(),
      user: whoami.login,
      reminder: {
        enabled: remOn.checked,
        minutes: Number(remMinutes.value||15)
      },
      repeat: getRepeat(),
      createdAt: existing?.createdAt || new Date().toISOString()
    };

    let out;
    if(existing) out = next.map(x=> x.id===row.id ? row : x);
    else out = [...next, row];

    DIARY.saveItems(out);
    window.location.href = 'tasks.html';
  });

  btnDelete.addEventListener('click', ()=>{
    if(!existing) return;
    if(confirm(`Удалить запись #${existing.id}?`)){
      const out = DIARY.loadItems().filter(x=>x.id!==existing.id);
      DIARY.saveItems(out);
      window.location.href = 'tasks.html';
    }
  });
})();
