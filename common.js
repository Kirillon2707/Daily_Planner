// common.js — общие справочники и работа с localStorage для прототипа «Ежедневник пользовательских задач»
(function(){
  const APP = {
    LS_KEY: 'diary_items_v1',
    LS_USER: 'diary_whoami_v1',
    categories: [{"id": 1, "name": "Учёба", "desc": "Учебные задания, пары, дедлайны"}, {"id": 2, "name": "Работа", "desc": "Рабочие задачи и проекты"}, {"id": 3, "name": "Быт", "desc": "Дом, уборка, покупки"}, {"id": 4, "name": "Финансы", "desc": "Платежи, бюджет, счета"}, {"id": 5, "name": "Здоровье", "desc": "Врачи, спорт, сон"}, {"id": 6, "name": "IT", "desc": "Обновления, бэкапы, настройки"}, {"id": 7, "name": "Личное", "desc": "Встречи, звонки, дела"}, {"id": 8, "name": "Саморазвитие", "desc": "Книги, курсы, навыки"}],
    priorities: [{"id": 1, "name": "Низкий", "weight": 1, "desc": "Можно отложить, не критично"}, {"id": 2, "name": "Средний", "weight": 2, "desc": "Желательно сделать в срок"}, {"id": 3, "name": "Высокий", "weight": 3, "desc": "Критично, влияет на результат/дедлайн"}],
    statuses: [{"id": 1, "name": "План", "done": false, "desc": "Создано, но ещё не начато"}, {"id": 2, "name": "В работе", "done": false, "desc": "Выполняется сейчас"}, {"id": 3, "name": "На паузе", "done": false, "desc": "Временно остановлено"}, {"id": 4, "name": "Готово", "done": true, "desc": "Завершено успешно"}, {"id": 5, "name": "Отменено", "done": true, "desc": "Не будет выполняться"}],
    users: [{"login": "guest", "email": "guest@demo.ru", "role": "Guest", "state": "Active"}, {"login": "user1", "email": "user1@demo.ru", "role": "User", "state": "Active"}, {"login": "user2", "email": "user2@demo.ru", "role": "User", "state": "Inactive"}, {"login": "user3", "email": "user3@demo.ru", "role": "User", "state": "Active"}, {"login": "ivanov_a", "email": "ivanov_a@demo.ru", "role": "Admin", "state": "Active"}],
    seed: [{"id": 1, "kind": "task", "title": "Сделать ЛР1 по МДК 06.01", "desc": "", "date": "2026-01-18", "time": "09:00", "category": "Учёба", "priority": "Высокий", "status": "В работе", "user": "ivanov_a", "reminder": {"enabled": false, "minutes": 15}, "repeat": "none", "createdAt": "2026-01-01T00:00:00"}, {"id": 2, "kind": "task", "title": "Подготовить конспект по теме ИС", "desc": "", "date": "2026-01-20", "time": "09:00", "category": "Учёба", "priority": "Средний", "status": "План", "user": "ivanov_a", "reminder": {"enabled": false, "minutes": 15}, "repeat": "none", "createdAt": "2026-01-01T00:00:00"}, {"id": 3, "kind": "task", "title": "Купить продукты", "desc": "", "date": "2026-01-15", "time": "09:00", "category": "Быт", "priority": "Средний", "status": "План", "user": "user1", "reminder": {"enabled": false, "minutes": 15}, "repeat": "none", "createdAt": "2026-01-01T00:00:00"}, {"id": 4, "kind": "task", "title": "Оплатить интернет", "desc": "", "date": "2026-01-16", "time": "09:00", "category": "Финансы", "priority": "Высокий", "status": "План", "user": "user1", "reminder": {"enabled": false, "minutes": 15}, "repeat": "none", "createdAt": "2026-01-01T00:00:00"}, {"id": 5, "kind": "task", "title": "Тренировка (зал)", "desc": "", "date": "2026-01-16", "time": "09:00", "category": "Здоровье", "priority": "Средний", "status": "План", "user": "user2", "reminder": {"enabled": false, "minutes": 15}, "repeat": "none", "createdAt": "2026-01-01T00:00:00"}, {"id": 6, "kind": "task", "title": "Записаться к стоматологу", "desc": "", "date": "2026-01-25", "time": "09:00", "category": "Здоровье", "priority": "Высокий", "status": "План", "user": "user2", "reminder": {"enabled": false, "minutes": 15}, "repeat": "none", "createdAt": "2026-01-01T00:00:00"}, {"id": 7, "kind": "task", "title": "Подготовить презентацию к защите", "desc": "", "date": "2026-01-22", "time": "09:00", "category": "Учёба", "priority": "Высокий", "status": "В работе", "user": "ivanov_a", "reminder": {"enabled": false, "minutes": 15}, "repeat": "none", "createdAt": "2026-01-01T00:00:00"}, {"id": 8, "kind": "task", "title": "Уборка комнаты", "desc": "", "date": "2026-01-17", "time": "09:00", "category": "Быт", "priority": "Низкий", "status": "План", "user": "user1", "reminder": {"enabled": false, "minutes": 15}, "repeat": "none", "createdAt": "2026-01-01T00:00:00"}, {"id": 9, "kind": "task", "title": "Сдать отчёт по практике", "desc": "", "date": "2026-01-19", "time": "09:00", "category": "Учёба", "priority": "Высокий", "status": "В работе", "user": "ivanov_a", "reminder": {"enabled": false, "minutes": 15}, "repeat": "none", "createdAt": "2026-01-01T00:00:00"}, {"id": 10, "kind": "task", "title": "Сделать резервную копию ПК", "desc": "", "date": "2026-01-30", "time": "09:00", "category": "IT", "priority": "Средний", "status": "План", "user": "user3", "reminder": {"enabled": false, "minutes": 15}, "repeat": "none", "createdAt": "2026-01-01T00:00:00"}, {"id": 11, "kind": "task", "title": "Обновить драйверы видеокарты", "desc": "", "date": "2026-02-01", "time": "09:00", "category": "IT", "priority": "Низкий", "status": "План", "user": "user3", "reminder": {"enabled": false, "minutes": 15}, "repeat": "none", "createdAt": "2026-01-01T00:00:00"}, {"id": 12, "kind": "task", "title": "Позвонить родственникам", "desc": "", "date": "2026-01-16", "time": "09:00", "category": "Личное", "priority": "Низкий", "status": "План", "user": "user2", "reminder": {"enabled": false, "minutes": 15}, "repeat": "none", "createdAt": "2026-01-01T00:00:00"}, {"id": 13, "kind": "task", "title": "Заполнить план на неделю", "desc": "", "date": "2026-01-15", "time": "09:00", "category": "Личное", "priority": "Средний", "status": "Готово", "user": "ivanov_a", "reminder": {"enabled": false, "minutes": 15}, "repeat": "none", "createdAt": "2026-01-01T00:00:00"}, {"id": 14, "kind": "task", "title": "Прочитать 20 стр. книги", "desc": "", "date": "2026-01-16", "time": "09:00", "category": "Саморазвитие", "priority": "Низкий", "status": "План", "user": "user2", "reminder": {"enabled": false, "minutes": 15}, "repeat": "none", "createdAt": "2026-01-01T00:00:00"}, {"id": 15, "kind": "task", "title": "Проверить бюджет за месяц", "desc": "", "date": "2026-01-31", "time": "09:00", "category": "Финансы", "priority": "Средний", "status": "План", "user": "user1", "reminder": {"enabled": false, "minutes": 15}, "repeat": "none", "createdAt": "2026-01-01T00:00:00"}, {"id": 16, "kind": "event", "title": "Пара (МДК 06.01)", "desc": "", "date": "2026-01-16", "time": "09:00", "category": "Учёба", "priority": "Высокий", "status": "Актуально", "user": "ivanov_a", "reminder": {"enabled": true, "minutes": 15}, "repeat": "none", "createdAt": "2026-01-01T00:00:00"}, {"id": 17, "kind": "event", "title": "Дедлайн ЛР1", "desc": "", "date": "2026-01-18", "time": "23:00", "category": "Учёба", "priority": "Высокий", "status": "Актуально", "user": "ivanov_a", "reminder": {"enabled": true, "minutes": 15}, "repeat": "none", "createdAt": "2026-01-01T00:00:00"}, {"id": 18, "kind": "event", "title": "Оплата интернета (напоминание)", "desc": "", "date": "2026-01-16", "time": "12:00", "category": "Финансы", "priority": "Высокий", "status": "Актуально", "user": "user1", "reminder": {"enabled": true, "minutes": 15}, "repeat": "none", "createdAt": "2026-01-01T00:00:00"}, {"id": 19, "kind": "event", "title": "Тренировка", "desc": "", "date": "2026-01-16", "time": "18:30", "category": "Здоровье", "priority": "Средний", "status": "Актуально", "user": "user2", "reminder": {"enabled": true, "minutes": 15}, "repeat": "none", "createdAt": "2026-01-01T00:00:00"}, {"id": 20, "kind": "event", "title": "Созвон с группой", "desc": "", "date": "2026-01-17", "time": "16:00", "category": "Учёба", "priority": "Средний", "status": "Актуально", "user": "ivanov_a", "reminder": {"enabled": true, "minutes": 15}, "repeat": "none", "createdAt": "2026-01-01T00:00:00"}, {"id": 21, "kind": "event", "title": "День рождения друга", "desc": "", "date": "2026-01-28", "time": "00:00", "category": "Личное", "priority": "Средний", "status": "Актуально", "user": "user2", "reminder": {"enabled": true, "minutes": 15}, "repeat": "none", "createdAt": "2026-01-01T00:00:00"}, {"id": 22, "kind": "event", "title": "Проверка бэкапа", "desc": "", "date": "2026-01-30", "time": "20:00", "category": "IT", "priority": "Средний", "status": "Актуально", "user": "user3", "reminder": {"enabled": true, "minutes": 15}, "repeat": "none", "createdAt": "2026-01-01T00:00:00"}, {"id": 23, "kind": "event", "title": "Уборка (напоминание)", "desc": "", "date": "2026-01-17", "time": "11:00", "category": "Быт", "priority": "Низкий", "status": "Актуально", "user": "user1", "reminder": {"enabled": true, "minutes": 15}, "repeat": "none", "createdAt": "2026-01-01T00:00:00"}, {"id": 24, "kind": "event", "title": "Отправить отчёт преподавателю", "desc": "", "date": "2026-01-19", "time": "19:00", "category": "Учёба", "priority": "Высокий", "status": "Актуально", "user": "ivanov_a", "reminder": {"enabled": true, "minutes": 15}, "repeat": "none", "createdAt": "2026-01-01T00:00:00"}, {"id": 25, "kind": "event", "title": "Планирование недели", "desc": "", "date": "2026-01-18", "time": "10:00", "category": "Личное", "priority": "Низкий", "status": "Актуально", "user": "user2", "reminder": {"enabled": true, "minutes": 15}, "repeat": "none", "createdAt": "2026-01-01T00:00:00"}]
  };

  const pad = (n)=> String(n).padStart(2,'0');
  const toISODate = (d)=> `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;

  const getWhoami = ()=> {
    const raw = sessionStorage.getItem(APP.LS_USER);
    if(raw) try { return JSON.parse(raw); } catch {}
    // по умолчанию — user1, как в ЛР3
    const def = { login: 'user1', role: 'User' };
    sessionStorage.setItem(APP.LS_USER, JSON.stringify(def));
    return def;
  };

  const setWhoami = (who)=> {
    sessionStorage.setItem(APP.LS_USER, JSON.stringify(who));
  };

  const loadItems = ()=> {
    const raw = localStorage.getItem(APP.LS_KEY);
    if(!raw){
      localStorage.setItem(APP.LS_KEY, JSON.stringify(APP.seed));
      return APP.seed.slice();
    }
    try {
      const items = JSON.parse(raw);
      return Array.isArray(items) ? items : APP.seed.slice();
    } catch {
      return APP.seed.slice();
    }
  };

  const saveItems = (items)=> localStorage.setItem(APP.LS_KEY, JSON.stringify(items));

  const nextId = (items)=> (items.reduce((m,x)=>Math.max(m, Number(x.id||0)), 0) || 0) + 1;

  const statusIsDone = (statusName)=> {
    const st = APP.statuses.find(s=>s.name===statusName);
    return st ? !!st.done : false;
  };

  const reminderTime = (item)=> {
    if(!item.reminder?.enabled) return '—';
    // время напоминания = (date time) - minutes
    const minutes = Number(item.reminder.minutes || 0);
    const t = (item.time || '').trim();
    if(!t) return '—';
    const [hh,mm] = t.split(':').map(Number);
    if(!Number.isFinite(hh) || !Number.isFinite(mm)) return '—';
    const d = new Date(`${item.date}T${pad(hh)}:${pad(mm)}:00`);
    d.setMinutes(d.getMinutes() - minutes);
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const fmtKind = (k)=> k==='event' ? 'Событие' : 'Задача';

  const badgeClass = (item)=> {
    if(item.kind==='event') return 'badge text-bg-info';
    const done = statusIsDone(item.status);
    return done ? 'badge text-bg-success' : 'badge text-bg-primary';
  };

  const priorityBadge = (name)=> {
    const p = APP.priorities.find(x=>x.name===name);
    const w = p ? p.weight : 2;
    if(w>=3) return 'badge text-bg-danger';
    if(w===2) return 'badge text-bg-warning';
    return 'badge text-bg-secondary';
  };

  const exportCSV = (rows)=> {
    const esc = (s)=> String(s ?? '').replaceAll('"','""');
    const header = ['id','kind','date','time','title','category','priority','status','user','reminder_enabled','reminder_minutes','repeat'];
    const lines = [header.join(',')];
    rows.forEach(r=> {
      const line = [
        r.id, r.kind, r.date, r.time, r.title, r.category, r.priority, r.status, r.user,
        r.reminder?.enabled ? 1 : 0, r.reminder?.minutes ?? '', r.repeat ?? 'none'
      ].map(v=>`"${esc(v)}"`).join(',');
      lines.push(line);
    });
    const blob = new Blob([lines.join('\n')], {type:'text/csv;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'diary_export.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  window.DIARY = {
    APP,
    pad,
    toISODate,
    getWhoami,
    setWhoami,
    loadItems,
    saveItems,
    nextId,
    statusIsDone,
    reminderTime,
    fmtKind,
    badgeClass,
    priorityBadge,
    exportCSV,
  };
})();
