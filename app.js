/* ══════════════════════════════════════════════════════════
   RESTROHUB — SIMPLIFIED VERSION
   sections:
   1. Storage helpers
   2. Seed data
   3. Auth & Permissions
   4. Navigation & UI
   5. Dashboard
   6. Floor plan (Fabric.js)
   7. Sessions & POS (cash only)
   8. Kitchen
   9. Products (with images)
   10. Reservations
   11. Financial reports (with profit calc)
   12. Settings
   13. Export utilities
══════════════════════════════════════════════════════════ */

/* ══════════════════════════════════════════════════════════
   1. STORAGE HELPERS
══════════════════════════════════════════════════════════ */
const G = k => { try { const d = localStorage.getItem(k); return d ? JSON.parse(d) : null; } catch { return null; } };
const S = (k, v) => {
  try { localStorage.setItem(k, JSON.stringify(v)); }
  catch (e) {
    if (e.name === 'QuotaExceededError') {
      toast('مساحة التخزين ممتلئة! احذف بعض الصور أو البيانات', 'err');
    } else console.error(e);
  }
};
const NI = c => { const a = G(c) || []; return a.length ? Math.max(...a.map(i => i.id || 0)) + 1 : 1; };
const UP = (c, id, d) => { const a = G(c) || []; const i = a.findIndex(x => x.id === id); if (i !== -1) { a[i] = { ...a[i], ...d }; S(c, a); return true; } return false; };
const DL = (c, id) => S(c, (G(c) || []).filter(x => x.id !== id));

const td = () => new Date().toISOString().split('T')[0];
const fT = iso => iso ? new Date(iso).toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' }) : '';
const fD = iso => iso ? new Date(iso).toLocaleDateString('ar-IQ') : '';
const fDT = iso => iso ? `${fD(iso)} ${fT(iso)}` : '';
const fC = n => { const i = G('ri') || {}; return `${Number(n || 0).toLocaleString('ar-IQ')} ${i.currency || 'ل.ع'}`; };

const addA = (txt, color = '#f0a500') => {
  const a = G('act') || [];
  a.unshift({ txt, time: new Date().toISOString(), color, userId: CU?.id });
  if (a.length > 50) a.pop();
  S('act', a);
};

/* ══════════════════════════════════════════════════════════
   2. SEED DATA
══════════════════════════════════════════════════════════ */
const seed = () => {
  if (G('rh_v5')) return;

  S('ri', { name: 'مطعم الأصيل', currency: 'ل.ع', tax: 10, phone: '+964 770 000 0000', address: 'بغداد' });

  S('tables', [
    { id: 1, number: 1, capacity: 2, status: 'free', sessionId: null, x: 100, y: 100, shape: 'square' },
    { id: 2, number: 2, capacity: 4, status: 'free', sessionId: null, x: 280, y: 100, shape: 'square' },
    { id: 3, number: 3, capacity: 4, status: 'free', sessionId: null, x: 460, y: 100, shape: 'round' },
    { id: 4, number: 4, capacity: 6, status: 'free', sessionId: null, x: 100, y: 310, shape: 'rect' },
    { id: 5, number: 5, capacity: 4, status: 'free', sessionId: null, x: 340, y: 310, shape: 'round' },
    { id: 6, number: 6, capacity: 2, status: 'free', sessionId: null, x: 520, y: 310, shape: 'square' },
  ]);

  // Simplified products: code, name, cost, price, image, category, emoji (fallback)
  S('products', [
    { id: 1, code: '001', name: 'شاورما دجاج', cost: 12000, price: 25000, image: null, category: 'رئيسي', emoji: '🌯' },
    { id: 2, code: '002', name: 'بطاطا مقلية', cost: 5000, price: 15000, image: null, category: 'جانبي', emoji: '🍟' },
    { id: 3, code: '003', name: 'كوكاكولا', cost: 2000, price: 5000, image: null, category: 'مشروبات', emoji: '🥤' },
    { id: 4, code: '004', name: 'كنافة', cost: 5000, price: 12000, image: null, category: 'حلويات', emoji: '🍮' },
    { id: 5, code: '005', name: 'شيش طاووق', cost: 15000, price: 30000, image: null, category: 'رئيسي', emoji: '🍢' },
    { id: 6, code: '006', name: 'عصير طازج', cost: 2500, price: 7000, image: null, category: 'مشروبات', emoji: '🍊' },
  ]);

  S('users', [
    { id: 1, name: 'المدير العام', email: 'admin@example.com', password: '123456', role: 'manager' },
    { id: 2, name: 'أحمد الكاشير', email: 'cashier@example.com', password: '123456', role: 'cashier' },
    { id: 3, name: 'محمد النادل', email: 'waiter@example.com', password: '123456', role: 'waiter' },
    { id: 4, name: 'الشيف علي', email: 'kitchen@example.com', password: '123456', role: 'kitchen' },
  ]);

  S('sessions', []);
  S('orders', []);
  S('invoices', []);
  S('expenses', []);
  S('reservations', [
    { id: 1, customerName: 'أبو علي', phone: '07701234567', tableId: 3, date: td(), time: '13:00', guests: 4, status: 'confirmed', notes: '' },
    { id: 2, customerName: 'أم حسين', phone: '07709876543', tableId: 5, date: td(), time: '19:30', guests: 2, status: 'pending', notes: 'طاولة هادئة' },
  ]);
  S('act', [{ txt: 'تم تهيئة النظام', time: new Date().toISOString(), color: '#00bfa5' }]);
  S('rh_v5', true);
};

/* ══════════════════════════════════════════════════════════
   3. AUTH & PERMISSIONS
══════════════════════════════════════════════════════════ */
let CU = null;

const PERMS = {
  manager: {
    screens: ['dashboard', 'tables', 'kitchen', 'products', 'reservations', 'reports', 'settings'],
    actions: ['startSession','endSession','addOrder','pay','manageProducts','manageReservations','viewReports','manageSettings','manageUsers','manageExpenses','cancelInvoice','editLayout','addTable','deleteTable','dashboardFull']
  },
  cashier: {
    screens: ['dashboard', 'tables', 'reports'],
    actions: ['addOrder', 'pay', 'viewReports', 'dashboardLimited']
  },
  waiter: {
    screens: ['tables', 'kitchen'],
    actions: ['startSession', 'addOrder', 'requestBill', 'viewKitchen']
  },
  kitchen: {
    screens: ['kitchen'],
    actions: ['markReady', 'viewKitchen']
  }
};
const can = a => !!CU && PERMS[CU.role]?.actions.includes(a);
const canSee = s => !!CU && PERMS[CU.role]?.screens.includes(s);

const quickLogin = (em) => { document.getElementById('lemail').value = em; document.getElementById('lpass').value = '123456'; doLogin(); };

const doLogin = () => {
  const em = document.getElementById('lemail').value.trim(), pw = document.getElementById('lpass').value;
  const u = (G('users') || []).find(x => x.email === em && x.password === pw);
  if (u) {
    CU = u;
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('mainApp').classList.add('on');
    buildSidebar(); setupUI();
    go(PERMS[CU.role].screens[0]);
  } else document.getElementById('lerr').textContent = 'البريد أو كلمة المرور غير صحيحة';
};
const doLogout = () => { CU = null; document.getElementById('mainApp').classList.remove('on'); document.getElementById('loginScreen').style.display = 'flex'; };

const setupUI = () => {
  if (!CU) return;
  const rA = { manager: 'مدير', cashier: 'كاشير', waiter: 'نادل', kitchen: 'مطبخ' };
  document.getElementById('uNm').textContent = CU.name;
  document.getElementById('uRl').textContent = rA[CU.role] || CU.role;
  document.getElementById('uAv').textContent = CU.name[0];
  const i = G('ri') || {}; document.getElementById('sbRn').textContent = i.name || '—';
};

const buildSidebar = () => {
  const nav = document.getElementById('sbNav');
  const items = [
    { id: 'dashboard', lbl: 'لوحة التحكم', ic: '◈', sec: 'الرئيسية' },
    { id: 'tables', lbl: 'الطاولات', ic: '⊞', sec: 'التشغيل' },
    { id: 'kitchen', lbl: 'المطبخ', ic: '◎', sec: 'التشغيل' },
    { id: 'products', lbl: 'المنتجات', ic: '◧', sec: 'الإدارة' },
    { id: 'reservations', lbl: 'الحجوزات', ic: '◷', sec: 'الإدارة' },
    { id: 'reports', lbl: 'التقارير', ic: '◈', sec: 'الإدارة' },
    { id: 'settings', lbl: 'الإعدادات', ic: '◉', sec: 'الإدارة' },
  ];
  let html = '', lastSec = null;
  items.forEach(it => {
    if (!canSee(it.id)) return;
    if (it.sec !== lastSec) { html += `<div class="sb-sec">${it.sec}</div>`; lastSec = it.sec; }
    html += `<button class="sb-it" onclick="go('${it.id}')"><span class="sb-ic">${it.ic}</span> ${it.lbl}</button>`;
  });
  nav.innerHTML = html;
};

/* ══════════════════════════════════════════════════════════
   4. NAVIGATION & UI HELPERS
══════════════════════════════════════════════════════════ */
const go = id => {
  if (!canSee(id)) { toast('لا صلاحية للوصول', 'err'); return; }
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.sb-it').forEach(b => b.classList.remove('active'));
  document.getElementById(id)?.classList.add('active');
  document.querySelector(`.sb-it[onclick="go('${id}')"]`)?.classList.add('active');
  const renderers = {
    dashboard: renderDash, tables: renderFloorPlan, kitchen: renderKitchen,
    products: renderProds, reservations: renderRes, reports: renderReports, settings: renderSet
  };
  (renderers[id] || Function)();
};

const toast = (msg, type = 'ok') => {
  const c = document.getElementById('toasts');
  const t = document.createElement('div');
  t.className = `toast t-${type}`; t.textContent = msg;
  c.appendChild(t);
  setTimeout(() => t.remove(), 3200);
};

const modal = html => { document.getElementById('mBox').innerHTML = html; document.getElementById('mBox').classList.remove('wide'); document.getElementById('mBg').style.display = 'flex'; };
const modalWide = html => { document.getElementById('mBox').innerHTML = html; document.getElementById('mBox').classList.add('wide'); document.getElementById('mBg').style.display = 'flex'; };
const closeM = () => { document.getElementById('mBg').style.display = 'none'; document.getElementById('mBox').classList.remove('wide'); };

const confDel = (col, id, nm) => modal(`<div class="modal-t">تأكيد الحذف</div>
  <p style="color:var(--muted);font-size:.82rem;margin-bottom:18px">سيتم حذف <strong style="color:var(--fog)">${nm}</strong> نهائياً.</p>
  <div class="modal-ft">
    <button class="btn b-ghost" onclick="closeM()">إلغاء</button>
    <button class="btn b-rose" onclick="doDel('${col}',${id})">حذف</button>
  </div>`);

const doDel = (col, id) => {
  DL(col, id); toast('تم الحذف'); closeM();
  const r = { products: renderProds, reservations: renderRes, users: renderUsrs, expenses: renderExpenses };
  (r[col] || Function)();
};

document.getElementById('mBg').addEventListener('click', e => { if (e.target === document.getElementById('mBg')) closeM(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeM(); closePOS(); } });
document.getElementById('lpass').addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });

/* ══════════════════════════════════════════════════════════
   5. DASHBOARD
══════════════════════════════════════════════════════════ */
let cS = null;
const renderDash = () => {
  const inv = (G('invoices') || []).filter(i => i.status !== 'cancelled');
  const tbls = G('tables') || [], ords = G('orders') || [];
  const ts = td();
  const tInv = inv.filter(i => i.date && i.date.startsWith(ts));
  const tRev = tInv.reduce((s, i) => s + (i.grandTotal || 0), 0);
  const tOrd = ords.filter(o => o.orderTime && o.orderTime.startsWith(ts));
  const occ = tbls.filter(t => t.status === 'occupied').length;

  let statsHtml = '';
  if (can('dashboardFull')) {
    const exp = G('expenses') || [];
    const tExp = exp.filter(e => e.date && e.date.startsWith(ts)).reduce((s, e) => s + (e.amount || 0), 0);
    // profit from today's orders
    const prods = G('products') || [];
    let tProfit = 0;
    tOrd.forEach(o => (o.items || []).forEach(it => {
      const p = prods.find(x => x.id === it.productId);
      if (p) tProfit += ((p.price || 0) - (p.cost || 0)) * it.qty;
    }));
    tProfit -= tExp;
    statsHtml = `
      <div class="stat s-amber"><div class="st-v">${fC(tRev)}</div><div class="st-l">مبيعات اليوم</div></div>
      <div class="stat s-rose"><div class="st-v">${fC(tExp)}</div><div class="st-l">مصروفات اليوم</div></div>
      <div class="stat s-teal"><div class="st-v">${fC(tProfit)}</div><div class="st-l">صافي الربح</div></div>
      <div class="stat s-sky"><div class="st-v">${tOrd.length}</div><div class="st-l">طلبات اليوم</div></div>`;
  } else {
    statsHtml = `
      <div class="stat s-amber"><div class="st-v">${fC(tRev)}</div><div class="st-l">مبيعات اليوم</div></div>
      <div class="stat s-teal"><div class="st-v">${tOrd.length}</div><div class="st-l">طلبات اليوم</div></div>
      <div class="stat s-ember"><div class="st-v">${occ}/${tbls.length}</div><div class="st-l">طاولات مشغولة</div></div>
      <div class="stat s-sky"><div class="st-v">${tInv.length}</div><div class="st-l">فواتير اليوم</div></div>`;
  }
  document.getElementById('dashStats').innerHTML = statsHtml;

  const now = new Date();
  document.getElementById('dDate').textContent = now.toLocaleDateString('ar-IQ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const days = [], sales = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const ds = d.toISOString().split('T')[0];
    days.push(d.toLocaleDateString('ar-IQ', { weekday: 'short', day: 'numeric' }));
    sales.push(inv.filter(v => v.date && v.date.startsWith(ds)).reduce((s, v) => s + (v.grandTotal || 0), 0));
  }
  const ctx = document.getElementById('cSales').getContext('2d');
  if (cS) cS.destroy();
  cS = new Chart(ctx, {
    type: 'line',
    data: { labels: days, datasets: [{ data: sales, borderColor: '#f0a500', backgroundColor: 'rgba(240,165,0,0.05)', borderWidth: 2, tension: .4, fill: true, pointBackgroundColor: '#f0a500', pointRadius: 4, pointBorderColor: '#1e2330', pointBorderWidth: 2 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#4a5168', font: { family: 'IBM Plex Sans Arabic', size: 11 } } }, y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#4a5168', font: { family: 'IBM Plex Sans Arabic' } } } } }
  });

  const acts = G('act') || [];
  document.getElementById('actFd').innerHTML = acts.slice(0, 8).map(a => `<div class="ai"><div class="ad" style="background:${a.color}"></div><div><div class="at">${a.txt}</div><div class="am">${fT(a.time)} — ${fD(a.time)}</div></div></div>`).join('') || '<div style="color:var(--muted);font-size:.77rem;text-align:center;padding:18px">لا توجد نشاطات</div>';
};

/* ══════════════════════════════════════════════════════════
   6. FLOOR PLAN (Fabric.js — tables with real chairs)
══════════════════════════════════════════════════════════ */
let fpCanvas = null;
let fpSelectedId = null;
let fpTimer = null;

const renderFloorPlan = () => {
  const tools = document.getElementById('fpTools');
  let toolsHtml = '';
  if (can('addTable')) toolsHtml += `<button class="btn b-amber b-sm" onclick="openAddTableM()">+ إضافة طاولة</button>`;
  toolsHtml += `<button class="btn b-ghost b-sm" onclick="renderFloorPlan()">↺ تحديث</button>`;
  tools.innerHTML = toolsHtml;

  const tbls = G('tables') || [];
  const fr = tbls.filter(t => t.status === 'free').length;
  const oc = tbls.filter(t => t.status === 'occupied').length;
  document.getElementById('tblSum').textContent = `متاحة: ${fr}  ·  مشغولة: ${oc}  ·  إجمالي: ${tbls.length}`;
  document.getElementById('fpInfo').innerHTML = can('editLayout')
    ? `<b>اسحب الطاولات</b> لترتيب القاعة — اضغط على طاولة لتحديدها`
    : `اضغط على طاولة لعرض الخيارات`;

  const container = document.getElementById('fpBox');
  const cw = Math.max(container.clientWidth - 20, 700);
  const ch = 540;
  const canvasEl = document.getElementById('fpCanvas');
  canvasEl.width = cw; canvasEl.height = ch;

  if (fpCanvas) fpCanvas.dispose();
  fpCanvas = new fabric.Canvas('fpCanvas', { selection: false, backgroundColor: 'transparent', preserveObjectStacking: true });
  fpCanvas.setDimensions({ width: cw, height: ch });

  drawAllTables();

  fpCanvas.on('mouse:down', e => {
    if (!e.target) { fpClearSelection(); return; }
    const tid = e.target.tableId;
    if (tid) fpSelectTable(tid);
  });

  fpCanvas.on('object:modified', e => {
    if (!can('editLayout')) return;
    const obj = e.target;
    if (obj.tableGroupId) UP('tables', obj.tableGroupId, { x: obj.left, y: obj.top });
  });

  if (fpTimer) clearInterval(fpTimer);
  fpTimer = setInterval(() => {
    drawAllTables();
    if (fpSelectedId) fpSelectTable(fpSelectedId, true);
  }, 1000);
};

const drawAllTables = () => {
  if (!fpCanvas) return;
  const tbls = G('tables') || [];
  const sess = G('sessions') || [];
  const prevSel = fpSelectedId;
  fpCanvas.clear();

  tbls.forEach(t => {
    const s = sess.find(x => x.id === t.sessionId);
    const isSelected = t.id === prevSel;
    const group = buildTableGroup(t, s, isSelected);
    fpCanvas.add(group);
  });

  fpCanvas.renderAll();
};

const buildTableGroup = (t, session, isSelected) => {
  const statusColor = { free: '#00bfa5', occupied: '#f0a500', reserved: '#3d9cf0' }[t.status] || '#4a5168';
  const objects = [];
  const capacity = t.capacity || 4;
  const chairColor = '#5a3920';
  const chairStroke = '#3d2818';
  const chairSize = 20;
  const tableColor = '#8b6239';

  if (t.shape === 'round') {
    const tableRadius = 42;
    const chairDistance = tableRadius + 22;

    for (let i = 0; i < capacity; i++) {
      const angle = (i / capacity) * Math.PI * 2 - Math.PI / 2;
      const cx = Math.cos(angle) * chairDistance;
      const cy = Math.sin(angle) * chairDistance;
      objects.push(new fabric.Rect({
        left: cx, top: cy, width: chairSize, height: chairSize, rx: 5, ry: 5,
        fill: chairColor, stroke: chairStroke, strokeWidth: 1.5,
        originX: 'center', originY: 'center',
        shadow: 'rgba(0,0,0,0.4) 0 2px 3px',
      }));
      const backAngle = angle + Math.PI;
      const backDist = chairSize / 2 + 2;
      objects.push(new fabric.Rect({
        left: cx + Math.cos(backAngle) * backDist,
        top: cy + Math.sin(backAngle) * backDist,
        width: chairSize - 4, height: 3,
        fill: chairStroke,
        originX: 'center', originY: 'center',
        angle: (angle * 180 / Math.PI) + 90,
      }));
    }

    objects.push(new fabric.Circle({ left: 2, top: 3, radius: tableRadius, fill: 'rgba(0,0,0,0.35)', originX: 'center', originY: 'center' }));
    objects.push(new fabric.Circle({ left: 0, top: 0, radius: tableRadius, fill: tableColor, stroke: statusColor, strokeWidth: 2.5, originX: 'center', originY: 'center' }));
    objects.push(new fabric.Circle({ left: 0, top: 0, radius: tableRadius - 6, fill: 'transparent', stroke: 'rgba(0,0,0,0.18)', strokeWidth: 1, originX: 'center', originY: 'center' }));
    objects.push(new fabric.Circle({ left: 0, top: 0, radius: tableRadius - 12, fill: 'transparent', stroke: 'rgba(0,0,0,0.12)', strokeWidth: 1, originX: 'center', originY: 'center' }));

  } else if (t.shape === 'rect') {
    const tw = 140, th = 70;
    const chairsPerSide = Math.ceil(capacity / 2);
    const remaining = capacity - chairsPerSide;

    for (let i = 0; i < chairsPerSide; i++) {
      const cx = -tw / 2 + (tw / (chairsPerSide + 1)) * (i + 1);
      objects.push(new fabric.Rect({ left: cx, top: -th / 2 - 16, width: chairSize, height: chairSize, rx: 5, ry: 5, fill: chairColor, stroke: chairStroke, strokeWidth: 1.5, originX: 'center', originY: 'center', shadow: 'rgba(0,0,0,0.4) 0 2px 3px' }));
      objects.push(new fabric.Rect({ left: cx, top: -th / 2 - 7, width: chairSize - 4, height: 3, fill: chairStroke, originX: 'center', originY: 'center' }));
    }
    for (let i = 0; i < remaining; i++) {
      const cx = -tw / 2 + (tw / (remaining + 1)) * (i + 1);
      objects.push(new fabric.Rect({ left: cx, top: th / 2 + 16, width: chairSize, height: chairSize, rx: 5, ry: 5, fill: chairColor, stroke: chairStroke, strokeWidth: 1.5, originX: 'center', originY: 'center', shadow: 'rgba(0,0,0,0.4) 0 2px 3px' }));
      objects.push(new fabric.Rect({ left: cx, top: th / 2 + 7, width: chairSize - 4, height: 3, fill: chairStroke, originX: 'center', originY: 'center' }));
    }

    objects.push(new fabric.Rect({ left: 2, top: 3, width: tw, height: th, rx: 8, ry: 8, fill: 'rgba(0,0,0,0.35)', originX: 'center', originY: 'center' }));
    objects.push(new fabric.Rect({ left: 0, top: 0, width: tw, height: th, rx: 8, ry: 8, fill: tableColor, stroke: statusColor, strokeWidth: 2.5, originX: 'center', originY: 'center' }));
    objects.push(new fabric.Line([-tw / 2 + 14, -6, tw / 2 - 14, -6], { stroke: 'rgba(0,0,0,0.15)', strokeWidth: 1 }));
    objects.push(new fabric.Line([-tw / 2 + 14, 6, tw / 2 - 14, 6], { stroke: 'rgba(0,0,0,0.15)', strokeWidth: 1 }));

  } else {
    const ts = 78;
    let chairCount = Math.min(capacity, 4);
    const positions = [
      { x: 0, y: -ts / 2 - 16 }, { x: 0, y: ts / 2 + 16 },
      { x: -ts / 2 - 16, y: 0 }, { x: ts / 2 + 16, y: 0 },
    ];
    for (let i = 0; i < chairCount; i++) {
      const pos = positions[i];
      objects.push(new fabric.Rect({ left: pos.x, top: pos.y, width: chairSize, height: chairSize, rx: 5, ry: 5, fill: chairColor, stroke: chairStroke, strokeWidth: 1.5, originX: 'center', originY: 'center', shadow: 'rgba(0,0,0,0.4) 0 2px 3px' }));
      const dirX = pos.x === 0 ? 0 : (pos.x > 0 ? -1 : 1);
      const dirY = pos.y === 0 ? 0 : (pos.y > 0 ? -1 : 1);
      objects.push(new fabric.Rect({
        left: pos.x + dirX * (chairSize / 2 + 1), top: pos.y + dirY * (chairSize / 2 + 1),
        width: dirX ? 3 : chairSize - 4, height: dirY ? 3 : chairSize - 4,
        fill: chairStroke, originX: 'center', originY: 'center',
      }));
    }

    objects.push(new fabric.Rect({ left: 2, top: 3, width: ts, height: ts, rx: 7, ry: 7, fill: 'rgba(0,0,0,0.35)', originX: 'center', originY: 'center' }));
    objects.push(new fabric.Rect({ left: 0, top: 0, width: ts, height: ts, rx: 7, ry: 7, fill: tableColor, stroke: statusColor, strokeWidth: 2.5, originX: 'center', originY: 'center' }));
    objects.push(new fabric.Line([-ts / 2 + 10, 0, ts / 2 - 10, 0], { stroke: 'rgba(0,0,0,0.15)', strokeWidth: 1 }));
  }

  objects.push(new fabric.Text(String(t.number), {
    left: 0, top: -4, fontSize: 22, fontFamily: 'Syne, sans-serif', fontWeight: '800',
    fill: '#fff', originX: 'center', originY: 'center', shadow: 'rgba(0,0,0,0.6) 0 1px 2px',
  }));
  objects.push(new fabric.Text(`👥${t.capacity}`, {
    left: 0, top: 14, fontSize: 10, fontFamily: 'IBM Plex Sans Arabic', fontWeight: '600',
    fill: 'rgba(255,255,255,0.8)', originX: 'center', originY: 'center',
  }));

  if (t.status === 'occupied' && session) {
    const diff = Math.floor((Date.now() - new Date(session.startTime)) / 1000);
    const h = Math.floor(diff / 3600), m = Math.floor((diff % 3600) / 60);
    const timeStr = `${h ? h + 'س ' : ''}${m}د`;
    const topOffset = t.shape === 'round' ? -80 : (t.shape === 'rect' ? -68 : -75);
    objects.push(new fabric.Rect({ left: 0, top: topOffset, width: 62, height: 22, rx: 11, ry: 11, fill: 'rgba(240,165,0,0.95)', originX: 'center', originY: 'center', shadow: 'rgba(0,0,0,0.3) 0 2px 4px' }));
    objects.push(new fabric.Text(`⏱ ${timeStr}`, { left: 0, top: topOffset, fontSize: 10, fontFamily: 'IBM Plex Sans Arabic', fontWeight: '700', fill: '#0d0f14', originX: 'center', originY: 'center' }));
  }

  if (isSelected) {
    const ringR = t.shape === 'round' ? 72 : (t.shape === 'rect' ? 98 : 62);
    objects.push(new fabric.Circle({ left: 0, top: 0, radius: ringR, fill: 'transparent', stroke: '#a855f7', strokeWidth: 2, strokeDashArray: [6, 4], originX: 'center', originY: 'center', opacity: 0.8 }));
  }

  const group = new fabric.Group(objects, {
    left: t.x || 100, top: t.y || 100,
    hasControls: false, hasBorders: false,
    lockRotation: true, lockScalingX: true, lockScalingY: true,
    selectable: can('editLayout'),
    hoverCursor: 'pointer', subTargetCheck: false,
  });
  group.tableId = t.id;
  group.tableGroupId = t.id;
  return group;
};

const fpSelectTable = (id, silent = false) => {
  fpSelectedId = id;
  const tbls = G('tables') || [];
  const sess = G('sessions') || [];
  const t = tbls.find(x => x.id === id);
  if (!t) return;
  if (!silent) drawAllTables();

  const s = sess.find(x => x.id === t.sessionId);
  const stLbl = { free: 'متاحة', occupied: 'مشغولة', reserved: 'محجوزة' }[t.status] || t.status;

  document.getElementById('fpSpTitle').textContent = `طاولة ${t.number}`;
  let info = `${stLbl} · سعة ${t.capacity} أشخاص`;
  if (s) {
    const diff = Math.floor((Date.now() - new Date(s.startTime)) / 1000);
    const h = Math.floor(diff / 3600), m = Math.floor((diff % 3600) / 60);
    info += ` · منذ ${h ? h + 'س ' : ''}${m}د · إجمالي: ${fC(s.total || 0)}`;
  }
  document.getElementById('fpSpInfo').textContent = info;

  let actsHtml = '';
  if (t.status === 'free') {
    if (can('startSession')) actsHtml += `<button class="btn b-teal b-sm" onclick="startSess(${t.id})">▶ بدء جلسة</button>`;
    if (can('addOrder')) actsHtml += `<button class="btn b-ghost b-sm" onclick="openPOS(${t.id},false)">+ إضافة طلب</button>`;
  } else if (t.status === 'occupied') {
    if (can('addOrder')) actsHtml += `<button class="btn b-teal b-sm" onclick="openPOS(${t.id},false)">+ إضافة طلب</button>`;
    if (can('pay')) actsHtml += `<button class="btn b-amber b-sm" onclick="openPOS(${t.id},true)">💳 تسديد</button>`;
    if (can('endSession') && !can('pay')) actsHtml += `<button class="btn b-rose b-sm" onclick="requestBill(${t.id})">🧾 طلب الفاتورة</button>`;
  }
  if (can('editLayout')) actsHtml += `<button class="btn b-ghost b-sm" onclick="openEditTableM(${t.id})">✏ تعديل</button>`;
  if (can('deleteTable') && t.status === 'free') actsHtml += `<button class="btn b-rose b-sm" onclick="confirmDelTable(${t.id})">🗑 حذف</button>`;

  document.getElementById('fpSpActs').innerHTML = actsHtml;
  document.getElementById('fpSelPanel').classList.add('on');
};

const fpClearSelection = () => {
  fpSelectedId = null;
  document.getElementById('fpSelPanel').classList.remove('on');
  drawAllTables();
};

const openAddTableM = () => {
  const tbls = G('tables') || [];
  const nextNum = tbls.length ? Math.max(...tbls.map(t => t.number)) + 1 : 1;
  modal(`<div class="modal-t">إضافة طاولة جديدة</div>
    <div class="fgr">
      <div class="fg"><label>رقم الطاولة</label><input type="number" id="ntNum" value="${nextNum}"></div>
      <div class="fg"><label>السعة</label><input type="number" id="ntCap" value="4" min="1"></div>
    </div>
    <div class="fg"><label>الشكل</label>
      <select id="ntShape">
        <option value="square">مربع (2-4 أشخاص)</option>
        <option value="rect">مستطيل (4-8 أشخاص)</option>
        <option value="round">دائري (2-6 أشخاص)</option>
      </select>
    </div>
    <div class="modal-ft">
      <button class="btn b-ghost" onclick="closeM()">إلغاء</button>
      <button class="btn b-amber" onclick="addTable()">إضافة</button>
    </div>`);
};

const addTable = () => {
  const num = parseInt(document.getElementById('ntNum').value);
  const cap = parseInt(document.getElementById('ntCap').value);
  const shape = document.getElementById('ntShape').value;
  if (!num || num < 1) { toast('رقم غير صحيح', 'err'); return; }
  const tbls = G('tables') || [];
  if (tbls.find(t => t.number === num)) { toast('الرقم مستخدم مسبقاً', 'err'); return; }
  tbls.push({ id: NI('tables'), number: num, capacity: cap, status: 'free', sessionId: null, x: 200, y: 200, shape });
  S('tables', tbls);
  addA(`إضافة طاولة ${num}`, '#00bfa5');
  toast('✓ تمت الإضافة'); closeM(); renderFloorPlan();
};

const openEditTableM = id => {
  const t = (G('tables') || []).find(x => x.id === id);
  if (!t) return;
  modal(`<div class="modal-t">تعديل طاولة ${t.number}</div>
    <div class="fgr">
      <div class="fg"><label>الرقم</label><input type="number" id="etNum" value="${t.number}"></div>
      <div class="fg"><label>السعة</label><input type="number" id="etCap" value="${t.capacity}" min="1"></div>
    </div>
    <div class="fg"><label>الشكل</label>
      <select id="etShape">
        <option value="square" ${t.shape === 'square' ? 'selected' : ''}>مربع</option>
        <option value="rect" ${t.shape === 'rect' ? 'selected' : ''}>مستطيل</option>
        <option value="round" ${t.shape === 'round' ? 'selected' : ''}>دائري</option>
      </select>
    </div>
    <div class="modal-ft">
      <button class="btn b-ghost" onclick="closeM()">إلغاء</button>
      <button class="btn b-amber" onclick="saveEditTable(${id})">حفظ</button>
    </div>`);
};
const saveEditTable = id => {
  UP('tables', id, {
    number: parseInt(document.getElementById('etNum').value),
    capacity: parseInt(document.getElementById('etCap').value),
    shape: document.getElementById('etShape').value,
  });
  toast('✓ تم التعديل'); closeM(); renderFloorPlan();
};

const confirmDelTable = id => {
  const t = (G('tables') || []).find(x => x.id === id);
  modal(`<div class="modal-t">حذف طاولة ${t?.number}</div>
    <p style="color:var(--muted);font-size:.82rem;margin-bottom:18px">هل أنت متأكد؟</p>
    <div class="modal-ft">
      <button class="btn b-ghost" onclick="closeM()">إلغاء</button>
      <button class="btn b-rose" onclick="doDelTable(${id})">حذف</button>
    </div>`);
};
const doDelTable = id => {
  const t = (G('tables') || []).find(x => x.id === id);
  DL('tables', id);
  addA(`حذف طاولة ${t?.number}`, '#e84060');
  toast('✓ تم الحذف'); closeM(); fpClearSelection(); renderFloorPlan();
};

/* ══════════════════════════════════════════════════════════
   7. SESSIONS & POS (cash only, no stock tracking)
══════════════════════════════════════════════════════════ */
const startSess = id => {
  if (!can('startSession')) { toast('لا صلاحية', 'err'); return; }
  const tbls = G('tables') || [], t = tbls.find(x => x.id === id);
  if (!t || t.status !== 'free') { toast('الطاولة غير متاحة', 'err'); return; }
  const sess = G('sessions') || [];
  const s = { id: NI('sessions'), tableId: id, startTime: new Date().toISOString(), lastOrderTime: null, total: 0, staffId: CU?.id };
  sess.push(s); S('sessions', sess);
  UP('tables', id, { status: 'occupied', sessionId: s.id });
  addA(`بدء جلسة طاولة ${t.number}`, '#00bfa5');
  toast(`تم بدء جلسة الطاولة ${t.number}`);
  renderFloorPlan();
  setTimeout(() => fpSelectTable(id), 100);
};

const endSess = (tableId) => {
  const tbls = G('tables') || [], sess = G('sessions') || [], t = tbls.find(x => x.id === tableId);
  if (!t) return;
  const s = sess.find(x => x.id === t.sessionId);
  if (!s) return;
  const i = G('ri') || {}, tax = (i.tax || 0) / 100, sub = s.total || 0, taxA = Math.round(sub * tax), grand = sub + taxA;
  const inv = G('invoices') || [];
  inv.push({
    id: NI('invoices'), sessionId: s.id, tableId, tableNumber: t.number,
    subtotal: sub, tax: taxA, grandTotal: grand,
    paymentMethod: 'cash', status: 'paid',
    date: new Date().toISOString(), staffId: CU?.id
  });
  S('invoices', inv);
  S('sessions', sess.filter(x => x.id !== s.id));
  UP('tables', tableId, { status: 'free', sessionId: null });
  addA(`تسديد طاولة ${t.number} — ${fC(grand)}`, '#e84060');
  toast(`✓ تم التسديد: ${fC(grand)}`);
  closePOS(); fpClearSelection(); renderFloorPlan();
};

const requestBill = tableId => {
  const t = (G('tables') || []).find(x => x.id === tableId);
  addA(`النادل طلب فاتورة للطاولة ${t?.number}`, '#3d9cf0');
  toast('✓ تم إرسال طلب الفاتورة للكاشير');
};

let pTbl = null, pItm = {}, pChk = false;
const openPOS = (tableId, chk = false) => {
  if (chk && !can('pay')) { toast('لا صلاحية للدفع', 'err'); return; }
  if (!chk && !can('addOrder')) { toast('لا صلاحية', 'err'); return; }
  pTbl = tableId; pItm = {}; pChk = chk;
  const t = (G('tables') || []).find(x => x.id === tableId);
  const sess = G('sessions') || [];
  const s = t ? sess.find(x => x.id === t.sessionId) : null;
  document.getElementById('posT').textContent = `طاولة ${t?.number} — ${chk ? 'تسديد الفاتورة' : 'إضافة طلبات'}`;
  document.getElementById('posM').textContent = s ? `بدأت: ${fT(s.startTime)} · الإجمالي: ${fC(s.total)}` : 'جلسة جديدة';
  document.getElementById('posSnd').style.display = chk ? 'none' : '';
  document.getElementById('posRh').textContent = chk ? 'طلبات الجلسة' : 'الطلب الحالي';
  const mb = document.getElementById('pMnBtn');
  if (chk) { mb.textContent = '💵 تسديد نقداً'; mb.className = 'pos-main-btn pmb-pay'; }
  else { mb.textContent = '↑ إرسال للمطبخ'; mb.className = 'pos-main-btn pmb-send'; }
  renderPProds(); renderPOrd();
  document.getElementById('posPanel').style.display = 'flex';
};
const closePOS = () => { document.getElementById('posPanel').style.display = 'none'; pTbl = null; pItm = {}; };

const renderPProds = (cat = '') => {
  const pr = G('products') || [];
  const cats = [...new Set(pr.map(p => p.category))];
  document.getElementById('pCats').innerHTML = `<button class="c-pill${!cat ? ' on' : ''}" onclick="renderPProds('')">الكل</button>` + cats.map(c => `<button class="c-pill${cat === c ? ' on' : ''}" onclick="renderPProds('${c}')">${c}</button>`).join('');
  const lst = cat ? pr.filter(p => p.category === cat) : pr;
  document.getElementById('pGrid').innerHTML = lst.length ? lst.map(p => {
    const img = p.image
      ? `<img src="${p.image}" alt="${p.name}">`
      : `<span>${p.emoji || '🍽'}</span>`;
    return `<div class="pr-c" onclick="addOrd(${p.id})">
      <div class="pr-img">${img}</div>
      <div class="pr-info">
        <div class="pr-code">#${p.code || '—'}</div>
        <div class="pr-nm">${p.name}</div>
        <div class="pr-pr">${fC(p.price)}</div>
      </div>
    </div>`;
  }).join('') : '<div style="grid-column:1/-1;text-align:center;color:var(--muted);padding:40px;font-size:.82rem">لا توجد منتجات</div>';
};

const addOrd = id => {
  const p = (G('products') || []).find(x => x.id === id);
  if (!p) return;
  pItm[id] ? pItm[id].qty++ : (pItm[id] = { ...p, qty: 1 });
  renderPOrd();
};
const chgQ = (id, d) => {
  if (!pItm[id]) return;
  pItm[id].qty += d;
  if (pItm[id].qty <= 0) delete pItm[id];
  renderPOrd();
};

const renderPOrd = () => {
  const newItems = Object.values(pItm);
  const el = document.getElementById('pOrdL');
  let html = '';
  if (pChk && pTbl) {
    const t = (G('tables') || []).find(x => x.id === pTbl);
    const sess = G('sessions') || [];
    const s = t ? sess.find(x => x.id === t.sessionId) : null;
    if (s) {
      const ords = (G('orders') || []).filter(o => o.sessionId === s.id);
      ords.forEach(o => (o.items || []).forEach(it => {
        html += `<div class="oi oi-old"><div class="oi-nm">${it.emoji || ''} ${it.name}</div><span class="qn">×${it.qty}</span><div class="oi-sub">${fC(it.price * it.qty)}</div></div>`;
      }));
    }
  }
  if (newItems.length) {
    html += newItems.map(x => `<div class="oi"><div class="oi-nm">${x.emoji || ''} ${x.name}</div><div class="qc"><button class="qb" onclick="chgQ(${x.id},-1)">−</button><span class="qn">${x.qty}</span><button class="qb" onclick="chgQ(${x.id},1)">+</button></div><div class="oi-sub">${fC(x.price * x.qty)}</div></div>`).join('');
  }
  if (!html) html = '<div style="text-align:center;color:var(--muted);padding:28px 0;font-size:.77rem">اضغط على منتج</div>';
  el.innerHTML = html;

  const i = G('ri') || {}, tax = (i.tax || 0) / 100;
  let sub = newItems.reduce((s, x) => s + x.price * x.qty, 0);
  if (pChk && pTbl) {
    const t = (G('tables') || []).find(x => x.id === pTbl);
    const sess = G('sessions') || [];
    const s = t ? sess.find(x => x.id === t.sessionId) : null;
    if (s) sub += s.total || 0;
  }
  const tA = Math.round(sub * tax), gr = sub + tA;
  document.getElementById('pSub').textContent = fC(sub);
  document.getElementById('pTxL').textContent = `ضريبة ${i.tax || 0}%`;
  document.getElementById('pTxV').textContent = fC(tA);
  document.getElementById('pGrd').textContent = fC(gr);
};

const pMain = () => pChk ? checkout() : sendOrd();

const sendOrd = () => {
  const it = Object.values(pItm);
  if (!it.length) { toast('أضف منتجات أولاً', 'err'); return; }
  if (!pTbl) return;
  const tbls = G('tables') || [], t = tbls.find(x => x.id === pTbl);
  if (!t) return;
  if (t.status === 'free') {
    if (can('startSession')) startSess(pTbl);
    else { toast('لا صلاحية لبدء جلسة', 'err'); return; }
  }
  const uT = (G('tables') || []).find(x => x.id === pTbl), sess = G('sessions') || [];
  const s = sess.find(x => x.id === uT?.sessionId);
  if (!s) { toast('لا توجد جلسة نشطة', 'err'); return; }

  const ords = G('orders') || [], tot = it.reduce((s, x) => s + x.price * x.qty, 0);
  const orderId = NI('orders');
  ords.push({
    id: orderId, sessionId: s.id, tableId: pTbl, tableNumber: uT.number,
    items: it.map(x => ({ productId: x.id, name: x.name, qty: x.qty, price: x.price, cost: x.cost, emoji: x.emoji, code: x.code })),
    total: tot, status: 'pending',
    orderTime: new Date().toISOString(), staffId: CU?.id
  });
  S('orders', ords);
  UP('sessions', s.id, { total: (s.total || 0) + tot, lastOrderTime: new Date().toISOString() });

  addA(`طلب — طاولة ${uT.number} (${it.length} أصناف)`, '#8892a4');
  toast(`✓ تم إرسال ${it.length} صنف للمطبخ`);
  closePOS(); renderFloorPlan();
};

const checkout = () => {
  if (!pTbl) return;
  const t = (G('tables') || []).find(x => x.id === pTbl);
  if (!t || t.status !== 'occupied') { toast('لا توجد جلسة نشطة', 'err'); return; }
  if (Object.keys(pItm).length > 0) { toast('أرسل الطلب الحالي للمطبخ أولاً', 'err'); return; }
  endSess(pTbl);
};

/* ══════════════════════════════════════════════════════════
   8. KITCHEN
══════════════════════════════════════════════════════════ */
let kitTimer = null;
const renderKitchen = () => {
  const ords = G('orders') || [];
  const pnd = ords.filter(o => o.status === 'pending');
  document.getElementById('kitCnt').textContent = pnd.length ? `${pnd.length} طلب معلق` : 'المطبخ هادئ';
  const renderCards = () => {
    document.getElementById('kitGrid').innerHTML = pnd.length ? pnd.map(o => {
      const elapsed = Math.floor((Date.now() - new Date(o.orderTime)) / 1000);
      const em = Math.floor(elapsed / 60), es = elapsed % 60;
      const isLate = em >= 15;
      return `<div class="kc ${isLate ? 'late' : ''}">
        <div class="kc-hd">
          <div><div class="kc-tbl">طاولة ${o.tableNumber || '—'}</div><div class="kc-elapsed">⏱ ${em}د ${String(es).padStart(2, '0')}ث</div></div>
          <div class="kc-tm">${fT(o.orderTime)}</div>
        </div>
        <div class="kc-body">${(o.items || []).map(it => `<div class="ki"><span class="ki-nm">${it.emoji || ''} ${it.name}</span><span class="ki-q">×${it.qty}</span></div>`).join('')}</div>
        <div class="kc-ft">
          <span class="kc-pnd">${isLate ? '⚠ متأخر' : '⏳ قيد التحضير'}</span>
          ${can('markReady') ? `<button class="btn b-teal b-sm" onclick="mReady(${o.id})">✓ جاهز</button>` : ''}
        </div>
      </div>`;
    }).join('') : `<div class="k-empty"><div class="k-ei">🍽</div><div>لا توجد طلبات معلقة</div></div>`;
  };
  renderCards();
  if (kitTimer) clearInterval(kitTimer);
  kitTimer = setInterval(() => {
    if (document.getElementById('kitchen').classList.contains('active')) renderCards();
  }, 1000);
};
const mReady = id => {
  if (!can('markReady')) { toast('لا صلاحية', 'err'); return; }
  UP('orders', id, { status: 'ready', readyTime: new Date().toISOString() });
  addA(`طلب رقم ${id} — جاهز`, '#00bfa5');
  toast('✓ الطلب جاهز للتقديم');
  renderKitchen();
};

/* ══════════════════════════════════════════════════════════
   9. PRODUCTS (with image support)
══════════════════════════════════════════════════════════ */

/* Compress and convert image to Base64 */
const compressImage = (file, maxWidth = 400, maxHeight = 400, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    if (!file) { reject('No file'); return; }
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        let w = img.width, h = img.height;
        if (w > maxWidth || h > maxHeight) {
          const ratio = Math.min(maxWidth / w, maxHeight / h);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => reject('Invalid image');
      img.src = e.target.result;
    };
    reader.onerror = () => reject('Read error');
    reader.readAsDataURL(file);
  });
};

const renderProds = () => {
  const pr = G('products') || [];
  const cats = [...new Set(pr.map(p => p.category))];
  const catSel = document.getElementById('prodFilterCat');
  if (catSel) {
    const cur = catSel.value;
    catSel.innerHTML = `<option value="">كل الفئات</option>` + cats.map(c => `<option value="${c}" ${c === cur ? 'selected' : ''}>${c}</option>`).join('');
  }

  const search = (document.getElementById('prodSearch')?.value || '').toLowerCase();
  const fcat = document.getElementById('prodFilterCat')?.value || '';

  let filtered = pr.filter(p => {
    if (search && !p.name.toLowerCase().includes(search) && !(p.code || '').toLowerCase().includes(search)) return false;
    if (fcat && p.category !== fcat) return false;
    return true;
  });

  const body = document.getElementById('prodBd');
  if (!filtered.length) { body.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--muted);padding:40px">لا توجد منتجات</td></tr>'; return; }

  body.innerHTML = filtered.map(p => {
    const profit = (p.price || 0) - (p.cost || 0);
    const margin = p.price ? Math.round((profit / p.price) * 100) : 0;
    const img = p.image
      ? `<img src="${p.image}" alt="${p.name}">`
      : `<span>${p.emoji || '🍽'}</span>`;
    return `<tr>
      <td><span class="prod-code">#${p.code || '—'}</span></td>
      <td><div class="prod-thumb">${img}</div></td>
      <td><strong style="color:#fff">${p.name}</strong>${p.category ? `<div><span class="bdg b-m" style="margin-top:4px;font-size:.6rem">${p.category}</span></div>` : ''}</td>
      <td><span class="bdg b-m">${p.category || '—'}</span></td>
      <td style="color:var(--muted)">${(p.cost || 0).toLocaleString()}</td>
      <td style="color:var(--amber);font-weight:700">${(p.price || 0).toLocaleString()}</td>
      <td><strong style="color:var(--teal)">${profit.toLocaleString()}</strong><div style="font-size:.68rem;color:var(--muted);margin-top:2px;">${margin}%</div></td>
      <td><div style="display:flex;gap:4px">
        <button class="btn b-ghost b-sm" onclick="openProdM(${p.id})">✏</button>
        <button class="btn b-rose b-sm" onclick="confDel('products',${p.id},'${p.name.replace(/'/g, "\\'")}')">🗑</button>
      </div></td>
    </tr>`;
  }).join('');
};

let tempImageData = null; // holds uploaded image during modal session

const openProdM = (id = null) => {
  const pr = G('products') || [];
  const p = id ? pr.find(x => x.id === id) : null;
  tempImageData = p?.image || null;

  const cats = ['رئيسي', 'جانبي', 'مشروبات', 'حلويات', 'مقبلات'];
  const emjs = ['🌯', '🍔', '🍢', '🍟', '🥤', '🍮', '🍊', '🥗', '🍕', '🍜', '🍖', '🥘'];

  // Auto-generate next code
  let nextCode = p?.code || '';
  if (!id) {
    const maxCode = pr.reduce((max, x) => {
      const n = parseInt(x.code || '0');
      return n > max ? n : max;
    }, 0);
    nextCode = String(maxCode + 1).padStart(3, '0');
  }

  modalWide(`<div class="modal-t">${p ? 'تعديل منتج' : 'إضافة منتج جديد'}</div>

    <div style="display:grid;grid-template-columns:200px 1fr;gap:20px;">
      <div>
        <label style="display:block;font-size:.65rem;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--muted);margin-bottom:6px;">صورة المنتج</label>
        <div class="img-upload-box ${tempImageData ? 'has-img' : ''}" id="imgBox" onclick="document.getElementById('imgFile').click()">
          ${tempImageData ? `<img src="${tempImageData}" alt=""><button class="img-remove-btn" onclick="removeProdImage(event)">✕</button>` : `<div class="img-upload-placeholder"><div class="img-upload-placeholder-ic">📷</div><div>اضغط لاختيار صورة</div><div style="font-size:.7rem;margin-top:4px;opacity:.7">JPG, PNG (حد أقصى 2MB)</div></div>`}
        </div>
        <input type="file" id="imgFile" accept="image/*" style="display:none" onchange="handleProdImage(event)">
      </div>

      <div>
        <div class="fgr">
          <div class="fg"><label>رقم المنتج</label><input id="pCode" value="${nextCode}" placeholder="001"></div>
          <div class="fg"><label>الأيقونة الاحتياطية</label><select id="pE">${emjs.map(e => `<option value="${e}" ${p?.emoji === e ? 'selected' : ''}>${e}</option>`).join('')}</select></div>
        </div>
        <div class="fg"><label>اسم المنتج</label><input id="pN" value="${p?.name || ''}" placeholder="مثال: شاورما دجاج"></div>
        <div class="fg"><label>الفئة</label><select id="pCat">${cats.map(c => `<option value="${c}" ${p?.category === c ? 'selected' : ''}>${c}</option>`).join('')}</select></div>
        <div class="fgr">
          <div class="fg"><label>سعر التكلفة</label><input type="number" id="pC" value="${p?.cost || ''}" placeholder="0"></div>
          <div class="fg"><label>سعر البيع</label><input type="number" id="pP" value="${p?.price || ''}" placeholder="0"></div>
        </div>
      </div>
    </div>

    <div class="modal-ft">
      <button class="btn b-ghost" onclick="closeM()">إلغاء</button>
      <button class="btn b-amber" onclick="saveProd(${id || 'null'})">حفظ</button>
    </div>`);
};

const handleProdImage = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) {
    toast('حجم الصورة كبير جداً (الحد الأقصى 2MB)', 'err');
    return;
  }
  try {
    tempImageData = await compressImage(file);
    const box = document.getElementById('imgBox');
    box.classList.add('has-img');
    box.innerHTML = `<img src="${tempImageData}" alt=""><button class="img-remove-btn" onclick="removeProdImage(event)">✕</button>`;
    toast('✓ تم تحميل الصورة');
  } catch (err) {
    toast('فشل تحميل الصورة', 'err');
  }
};

const removeProdImage = (e) => {
  e.stopPropagation();
  tempImageData = null;
  const box = document.getElementById('imgBox');
  box.classList.remove('has-img');
  box.innerHTML = `<div class="img-upload-placeholder"><div class="img-upload-placeholder-ic">📷</div><div>اضغط لاختيار صورة</div><div style="font-size:.7rem;margin-top:4px;opacity:.7">JPG, PNG (حد أقصى 2MB)</div></div>`;
  document.getElementById('imgFile').value = '';
};

const saveProd = id => {
  const name = document.getElementById('pN').value.trim();
  const code = document.getElementById('pCode').value.trim();
  if (!name) { toast('أدخل اسم المنتج', 'err'); return; }
  if (!code) { toast('أدخل رقم المنتج', 'err'); return; }

  // Validate unique code
  const existing = (G('products') || []).find(x => x.code === code && x.id !== id);
  if (existing) { toast(`رقم المنتج #${code} مستخدم مسبقاً`, 'err'); return; }

  const d = {
    code,
    name,
    emoji: document.getElementById('pE').value,
    cost: parseFloat(document.getElementById('pC').value) || 0,
    price: parseFloat(document.getElementById('pP').value) || 0,
    category: document.getElementById('pCat').value,
    image: tempImageData,
  };

  if (id) { UP('products', id, d); toast('✓ تم التعديل'); }
  else { const a = G('products') || []; a.push({ id: NI('products'), ...d }); S('products', a); toast('✓ تمت الإضافة'); }

  addA(`${id ? 'تعديل' : 'إضافة'} منتج: ${name}`, '#a855f7');
  tempImageData = null;
  closeM();
  renderProds();
};

/* ══════════════════════════════════════════════════════════
   10. RESERVATIONS
══════════════════════════════════════════════════════════ */
const renderRes = () => {
  const res = G('reservations') || [], tbls = G('tables') || [];
  const el = document.getElementById('resLst');
  if (!res.length) { el.innerHTML = '<div class="empty-state"><div class="empty-state-ic">📅</div><div>لا توجد حجوزات</div></div>'; return; }
  const srt = [...res].sort((a, b) => a.date > b.date ? 1 : a.date < b.date ? -1 : a.time > b.time ? 1 : -1);
  const scls = { confirmed: 'b-t', pending: 'b-a', cancelled: 'b-r' };
  const slbl = { confirmed: 'مؤكد', pending: 'معلق', cancelled: 'ملغي' };
  el.innerHTML = srt.map(r => {
    const t = tbls.find(x => x.id === r.tableId);
    return `<div class="rc">
      <div class="rt-box"><div class="rt-h">${r.time}</div><div class="rt-d">${r.date}</div></div>
      <div class="ri"><div class="ri-nm">${r.customerName}</div><div class="ri-det">${r.phone} · ${t ? 'طاولة ' + t.number : '—'} · ${r.guests} أشخاص${r.notes ? ` · ${r.notes}` : ''}</div></div>
      <div class="ra">
        <span class="bdg ${scls[r.status] || 'b-m'}">${slbl[r.status] || r.status}</span>
        <div style="display:flex;gap:5px"><button class="btn b-ghost b-sm" onclick="openResM(${r.id})">تعديل</button><button class="btn b-rose b-sm" onclick="confDel('reservations',${r.id},'${r.customerName.replace(/'/g, "\\'")}')">حذف</button></div>
      </div>
    </div>`;
  }).join('');
};
const openResM = (id = null) => {
  const res = G('reservations') || [], tbls = G('tables') || [], r = id ? res.find(x => x.id === id) : null;
  modal(`<div class="modal-t">${r ? 'تعديل الحجز' : 'حجز جديد'}</div>
    <div class="fgr">
      <div class="fg"><label>اسم العميل</label><input id="rN" value="${r?.customerName || ''}"></div>
      <div class="fg"><label>الهاتف</label><input id="rPh" value="${r?.phone || ''}"></div>
    </div>
    <div class="fgr">
      <div class="fg"><label>التاريخ</label><input type="date" id="rD" value="${r?.date || td()}"></div>
      <div class="fg"><label>الوقت</label><input type="time" id="rT" value="${r?.time || '12:00'}"></div>
    </div>
    <div class="fgr">
      <div class="fg"><label>الطاولة</label><select id="rTb">${tbls.map(t => `<option value="${t.id}" ${r?.tableId === t.id ? 'selected' : ''}>طاولة ${t.number}</option>`).join('')}</select></div>
      <div class="fg"><label>الأشخاص</label><input type="number" id="rG" value="${r?.guests || 2}" min="1"></div>
    </div>
    <div class="fgr">
      <div class="fg"><label>الحالة</label><select id="rSt"><option value="pending" ${r?.status === 'pending' ? 'selected' : ''}>معلق</option><option value="confirmed" ${r?.status === 'confirmed' ? 'selected' : ''}>مؤكد</option><option value="cancelled" ${r?.status === 'cancelled' ? 'selected' : ''}>ملغي</option></select></div>
      <div class="fg"><label>ملاحظات</label><input id="rNt" value="${r?.notes || ''}"></div>
    </div>
    <div class="modal-ft"><button class="btn b-ghost" onclick="closeM()">إلغاء</button><button class="btn b-amber" onclick="saveRes(${id || 'null'})">حفظ</button></div>`);
};
const saveRes = id => {
  const nm = document.getElementById('rN').value.trim();
  if (!nm) { toast('أدخل اسم العميل', 'err'); return; }
  const d = { customerName: nm, phone: document.getElementById('rPh').value.trim(), date: document.getElementById('rD').value, time: document.getElementById('rT').value, tableId: parseInt(document.getElementById('rTb').value), guests: parseInt(document.getElementById('rG').value) || 1, status: document.getElementById('rSt').value, notes: document.getElementById('rNt').value.trim() };
  if (id) { UP('reservations', id, d); toast('تم التعديل'); }
  else { const a = G('reservations') || []; a.push({ id: NI('reservations'), ...d }); S('reservations', a); toast('تمت الإضافة'); }
  closeM(); renderRes();
};

/* ══════════════════════════════════════════════════════════
   11. FINANCIAL REPORTS (with profit calculation)
══════════════════════════════════════════════════════════ */
let cR = null;
let currentRepTab = 'overview';

const setReportTab = (t) => {
  currentRepTab = t;
  document.querySelectorAll('[data-rtab]').forEach(x => x.classList.remove('on'));
  document.querySelector(`[data-rtab="${t}"]`)?.classList.add('on');
  ['repOverview', 'repInvoices', 'repExpenses'].forEach(id => document.getElementById(id).style.display = 'none');
  if (t === 'overview') { document.getElementById('repOverview').style.display = ''; renderReportsOverview(); }
  else if (t === 'invoices') { document.getElementById('repInvoices').style.display = ''; renderAllInvoices(); }
  else if (t === 'expenses') { document.getElementById('repExpenses').style.display = ''; renderExpenses(); }
};

const renderReports = () => {
  document.getElementById('tabExp').style.display = can('manageExpenses') ? '' : 'none';
  setReportTab(currentRepTab === 'expenses' && !can('manageExpenses') ? 'overview' : currentRepTab);
};

/* Calculate profit per product: (price - cost) * qty sold */
const calcProductProfits = () => {
  const ords = G('orders') || [];
  const prods = G('products') || [];
  const stats = {}; // id -> {name, emoji, qtySold, revenue, profit}

  ords.forEach(o => (o.items || []).forEach(it => {
    const p = prods.find(x => x.id === it.productId);
    if (!p) return;
    if (!stats[it.productId]) {
      stats[it.productId] = { id: p.id, name: p.name, emoji: p.emoji, code: p.code, qtySold: 0, revenue: 0, profit: 0 };
    }
    stats[it.productId].qtySold += it.qty;
    stats[it.productId].revenue += (it.price || 0) * it.qty;
    const cost = it.cost !== undefined ? it.cost : (p.cost || 0);
    stats[it.productId].profit += ((it.price || 0) - cost) * it.qty;
  }));

  return Object.values(stats);
};

const renderReportsOverview = () => {
  const inv = (G('invoices') || []).filter(i => i.status !== 'cancelled');
  const tR = inv.reduce((s, i) => s + (i.grandTotal || 0), 0);
  const tD = inv.filter(i => i.date && i.date.startsWith(td())).reduce((s, i) => s + (i.grandTotal || 0), 0);
  const avg = inv.length ? Math.round(tR / inv.length) : 0;

  // Calculate total profit from product margins
  const productStats = calcProductProfits();
  const totalGrossProfit = productStats.reduce((s, x) => s + x.profit, 0);

  let statsHtml;
  if (can('manageExpenses')) {
    const exp = G('expenses') || [];
    const tExp = exp.reduce((s, e) => s + (e.amount || 0), 0);
    const netProfit = totalGrossProfit - tExp;
    statsHtml = `
      <div class="stat s-teal"><div class="st-v">${fC(tR)}</div><div class="st-l">إجمالي الإيرادات</div></div>
      <div class="stat s-purple"><div class="st-v">${fC(totalGrossProfit)}</div><div class="st-l">ربح المنتجات</div></div>
      <div class="stat s-rose"><div class="st-v">${fC(tExp)}</div><div class="st-l">إجمالي المصروفات</div></div>
      <div class="stat s-amber"><div class="st-v">${fC(netProfit)}</div><div class="st-l">صافي الربح</div></div>`;
  } else {
    statsHtml = `
      <div class="stat s-teal"><div class="st-v">${fC(tR)}</div><div class="st-l">إجمالي الإيرادات</div></div>
      <div class="stat s-amber"><div class="st-v">${inv.length}</div><div class="st-l">إجمالي الفواتير</div></div>
      <div class="stat s-ember"><div class="st-v">${fC(avg)}</div><div class="st-l">متوسط الفاتورة</div></div>
      <div class="stat s-sky"><div class="st-v">${fC(tD)}</div><div class="st-l">مبيعات اليوم</div></div>`;
  }
  document.getElementById('repSt').innerHTML = statsHtml;

  // Category pie
  const ords = G('orders') || [];
  const cm = {};
  ords.forEach(o => (o.items || []).forEach(it => {
    const p = (G('products') || []).find(x => x.id === it.productId);
    const c = p?.category || 'أخرى';
    cm[c] = (cm[c] || 0) + it.price * it.qty;
  }));

  const ctx = document.getElementById('cRep').getContext('2d');
  if (cR) cR.destroy();
  if (Object.keys(cm).length) {
    cR = new Chart(ctx, {
      type: 'doughnut',
      data: { labels: Object.keys(cm), datasets: [{ data: Object.values(cm), backgroundColor: ['#f0a500', '#00bfa5', '#e05c2a', '#3d9cf0', '#e84060', '#a855f7'], borderColor: '#1e2330', borderWidth: 3 }] },
      options: { responsive: true, maintainAspectRatio: false, cutout: '65%', plugins: { legend: { position: 'bottom', labels: { color: '#8892a4', font: { family: 'IBM Plex Sans Arabic' }, padding: 12 } } } }
    });
  }

  // Invoices
  const srt = [...inv].sort((a, b) => new Date(b.date) - new Date(a.date));
  document.getElementById('invLst').innerHTML = srt.length ? srt.slice(0, 15).map(i => `<div class="inv-row"><div><div class="inv-id">فاتورة #${i.id} — طاولة ${i.tableNumber || '—'}</div><div class="inv-m">${fT(i.date)} · ${fD(i.date)}</div></div><div style="text-align:left"><div class="inv-amt">${fC(i.grandTotal)}</div><span class="bdg b-m" style="font-size:.62rem">💵 نقداً</span></div></div>`).join('')
    : '<div style="color:var(--muted);font-size:.77rem;text-align:center;padding:18px">لا توجد فواتير</div>';

  // Top profit products
  const byProfit = [...productStats].sort((a, b) => b.profit - a.profit).slice(0, 5);
  document.getElementById('topProfit').innerHTML = byProfit.length ? byProfit.map((p, i) =>
    `<div class="ir-rank-item"><div class="ir-rank-num">${i + 1}</div><div class="ir-rank-nm">${p.emoji || ''} ${p.name}</div><div class="ir-rank-val">${fC(p.profit)}</div></div>`
  ).join('') : '<div style="color:var(--muted);text-align:center;padding:20px;font-size:.8rem">لا توجد بيانات بعد</div>';

  // Top sellers
  const bySales = [...productStats].sort((a, b) => b.qtySold - a.qtySold).slice(0, 5);
  document.getElementById('topSellers').innerHTML = bySales.length ? bySales.map((p, i) =>
    `<div class="ir-rank-item"><div class="ir-rank-num">${i + 1}</div><div class="ir-rank-nm">${p.emoji || ''} ${p.name}</div><div class="ir-rank-val">×${p.qtySold}</div></div>`
  ).join('') : '<div style="color:var(--muted);text-align:center;padding:20px;font-size:.8rem">لا توجد بيانات بعد</div>';
};

const renderAllInvoices = () => {
  const inv = G('invoices') || [];
  const srt = [...inv].sort((a, b) => new Date(b.date) - new Date(a.date));
  document.getElementById('allInvLst').innerHTML = srt.length ? srt.map(i => {
    const cancelled = i.status === 'cancelled';
    return `<div class="inv-row">
      <div>
        <div class="inv-id">فاتورة #${i.id} — طاولة ${i.tableNumber || '—'} ${cancelled ? '<span class="bdg b-r">ملغاة</span>' : ''}</div>
        <div class="inv-m">${fT(i.date)} · ${fD(i.date)} · 💵 نقداً</div>
      </div>
      <div style="display:flex;align-items:center;gap:10px;">
        <div class="inv-amt ${cancelled ? 'cancelled' : ''}">${fC(i.grandTotal)}</div>
        ${can('cancelInvoice') && !cancelled ? `<button class="btn b-rose b-sm" onclick="cancelInvoice(${i.id})">إلغاء</button>` : ''}
      </div>
    </div>`;
  }).join('') : '<div style="color:var(--muted);font-size:.77rem;text-align:center;padding:18px">لا توجد فواتير</div>';
};

const cancelInvoice = id => {
  modal(`<div class="modal-t">إلغاء الفاتورة #${id}</div>
    <p style="color:var(--muted);font-size:.82rem;margin-bottom:18px">سيتم وضع علامة "ملغاة" على هذه الفاتورة.</p>
    <div class="modal-ft">
      <button class="btn b-ghost" onclick="closeM()">تراجع</button>
      <button class="btn b-rose" onclick="doCancelInv(${id})">إلغاء الفاتورة</button>
    </div>`);
};
const doCancelInv = id => {
  UP('invoices', id, { status: 'cancelled', cancelledAt: new Date().toISOString(), cancelledBy: CU?.id });
  addA(`إلغاء فاتورة #${id}`, '#e84060');
  toast('✓ تم إلغاء الفاتورة');
  closeM();
  renderAllInvoices();
};

const renderExpenses = () => {
  const exp = G('expenses') || [];
  const srt = [...exp].sort((a, b) => new Date(b.date) - new Date(a.date));
  document.getElementById('expLst').innerHTML = srt.length ? srt.map(e => `
    <div class="exp-row">
      <div>
        <div class="exp-ti">${e.title}</div>
        <div class="exp-meta">${e.category || 'عام'} · ${fD(e.date)}${e.notes ? ` · ${e.notes}` : ''}</div>
      </div>
      <div style="display:flex;align-items:center;gap:10px;">
        <div class="exp-amt">− ${fC(e.amount)}</div>
        <button class="btn b-rose b-sm" onclick="confDel('expenses',${e.id},'${e.title.replace(/'/g, "\\'")}')">حذف</button>
      </div>
    </div>`).join('') : '<div style="color:var(--muted);font-size:.77rem;text-align:center;padding:18px">لا توجد مصروفات</div>';
};

const openExpM = () => modal(`<div class="modal-t">إضافة مصروف</div>
  <div class="fg"><label>الوصف</label><input id="eTi" placeholder="مثال: فاتورة كهرباء"></div>
  <div class="fgr">
    <div class="fg"><label>المبلغ</label><input type="number" id="eAmt" placeholder="0"></div>
    <div class="fg"><label>الفئة</label><select id="eCat"><option>عام</option><option>إيجار</option><option>كهرباء/ماء</option><option>رواتب</option><option>مشتريات</option><option>صيانة</option><option>مواصلات</option></select></div>
  </div>
  <div class="fg"><label>التاريخ</label><input type="date" id="eDt" value="${td()}"></div>
  <div class="fg" style="margin-bottom:0"><label>ملاحظات</label><input id="eNt" placeholder="—"></div>
  <div class="modal-ft"><button class="btn b-ghost" onclick="closeM()">إلغاء</button><button class="btn b-amber" onclick="saveExp()">إضافة</button></div>`);

const saveExp = () => {
  const ti = document.getElementById('eTi').value.trim();
  const amt = parseFloat(document.getElementById('eAmt').value);
  if (!ti) { toast('أدخل الوصف', 'err'); return; }
  if (!amt || amt <= 0) { toast('أدخل مبلغاً صحيحاً', 'err'); return; }
  const exp = G('expenses') || [];
  exp.push({ id: NI('expenses'), title: ti, amount: amt, category: document.getElementById('eCat').value, date: document.getElementById('eDt').value, notes: document.getElementById('eNt').value.trim(), createdBy: CU?.id, createdAt: new Date().toISOString() });
  S('expenses', exp);
  addA(`مصروف: ${ti} — ${fC(amt)}`, '#e84060');
  toast('✓ تمت الإضافة');
  closeM();
  renderExpenses();
};

/* ══════════════════════════════════════════════════════════
   12. SETTINGS
══════════════════════════════════════════════════════════ */
const renderSet = () => {
  const i = G('ri') || {};
  document.getElementById('sNm').value = i.name || '';
  document.getElementById('sCr').value = i.currency || 'ل.ع';
  document.getElementById('sTx').value = i.tax || 0;
  document.getElementById('sPh').value = i.phone || '';
  document.getElementById('sAd').value = i.address || '';
  renderUsrs();
};
const saveSet = () => {
  S('ri', { name: document.getElementById('sNm').value.trim(), currency: document.getElementById('sCr').value.trim(), tax: parseFloat(document.getElementById('sTx').value) || 0, phone: document.getElementById('sPh').value.trim(), address: document.getElementById('sAd').value.trim() });
  document.getElementById('sbRn').textContent = document.getElementById('sNm').value || '—';
  toast('✓ تم حفظ الإعدادات');
};
const renderUsrs = () => {
  const us = G('users') || [];
  const rA = { manager: 'مدير', cashier: 'كاشير', waiter: 'نادل', kitchen: 'مطبخ' };
  document.getElementById('usrBd').innerHTML = us.map(u => `<tr>
    <td style="color:#fff;font-weight:600">${u.name}</td>
    <td style="color:var(--muted);font-size:.75rem">${u.email}</td>
    <td><span class="bdg b-m">${rA[u.role] || u.role}</span></td>
    <td><div style="display:flex;gap:5px;justify-content:flex-end;">
      ${u.id !== CU?.id ? `<button class="btn b-ghost b-sm" onclick="openUsrM(${u.id})">تعديل</button><button class="btn b-rose b-sm" onclick="confDel('users',${u.id},'${u.name.replace(/'/g, "\\'")}')">حذف</button>` : '<span style="font-size:.68rem;color:var(--muted)">أنت</span>'}
    </div></td>
  </tr>`).join('');
};
const openUsrM = (id = null) => {
  const us = G('users') || [];
  const u = id ? us.find(x => x.id === id) : null;
  modal(`<div class="modal-t">${u ? 'تعديل مستخدم' : 'مستخدم جديد'}</div>
    <div class="fg"><label>الاسم</label><input id="uNm" value="${u?.name || ''}" placeholder="—"></div>
    <div class="fg"><label>البريد</label><input type="email" id="uEm" value="${u?.email || ''}" placeholder="—"></div>
    <div class="fg"><label>كلمة المرور</label><input type="password" id="uPw" value="${u?.password || ''}" placeholder="••••••"></div>
    <div class="fg" style="margin-bottom:0"><label>الدور</label><select id="uRlSel">
      <option value="manager" ${u?.role === 'manager' ? 'selected' : ''}>مدير — صلاحية كاملة</option>
      <option value="cashier" ${u?.role === 'cashier' ? 'selected' : ''}>كاشير — دفع وتقارير</option>
      <option value="waiter" ${u?.role === 'waiter' ? 'selected' : ''}>نادل — طاولات ومطبخ</option>
      <option value="kitchen" ${u?.role === 'kitchen' ? 'selected' : ''}>مطبخ — فقط الطلبات</option>
    </select></div>
    <div class="modal-ft"><button class="btn b-ghost" onclick="closeM()">إلغاء</button><button class="btn b-amber" onclick="saveUsr(${id || 'null'})">حفظ</button></div>`);
};
const saveUsr = (id) => {
  const nm = document.getElementById('uNm').value.trim(), em = document.getElementById('uEm').value.trim(), pw = document.getElementById('uPw').value;
  if (!nm || !em || !pw) { toast('أكمل الحقول', 'err'); return; }
  const us = G('users') || [];
  if (!id && us.find(u => u.email === em)) { toast('البريد مستخدم', 'err'); return; }
  const d = { name: nm, email: em, password: pw, role: document.getElementById('uRlSel').value };
  if (id) { UP('users', id, d); toast('تم التعديل'); }
  else { us.push({ id: NI('users'), ...d }); S('users', us); toast('تمت الإضافة'); }
  closeM(); renderUsrs();
};
const resetAll = () => {
  if (confirm('⚠ هل أنت متأكد؟ سيتم حذف كل البيانات نهائياً.')) {
    localStorage.clear();
    toast('جارٍ إعادة التحميل...', 'info');
    setTimeout(() => location.reload(), 1500);
  }
};

/* ══════════════════════════════════════════════════════════
   13. EXPORT UTILITIES (Excel & PDF)
══════════════════════════════════════════════════════════ */
const exportProductsExcel = () => {
  const prods = G('products') || [];
  const data = prods.map(p => ({
    'رقم المنتج': p.code || '',
    'الاسم': p.name,
    'الفئة': p.category || '',
    'سعر التكلفة': p.cost || 0,
    'سعر البيع': p.price || 0,
    'الربح': (p.price || 0) - (p.cost || 0),
    'هامش الربح %': p.price ? Math.round((((p.price || 0) - (p.cost || 0)) / p.price) * 100) : 0,
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'المنتجات');
  XLSX.writeFile(wb, `RestroHub_Products_${td()}.xlsx`);
  toast('✓ تم تصدير Excel');
};

const exportProductsPDF = () => {
  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(16);
    doc.text('RestroHub - Products Report', 14, 15);
    doc.setFontSize(10);
    doc.text(`Date: ${fD(new Date().toISOString())}`, 14, 22);

    const prods = G('products') || [];
    const rows = prods.map(p => [
      p.code || '-',
      p.name,
      p.category || '-',
      (p.cost || 0).toLocaleString(),
      (p.price || 0).toLocaleString(),
      ((p.price || 0) - (p.cost || 0)).toLocaleString(),
      p.price ? Math.round((((p.price || 0) - (p.cost || 0)) / p.price) * 100) + '%' : '0%',
    ]);

    doc.autoTable({
      head: [['Code', 'Name', 'Category', 'Cost', 'Price', 'Profit', 'Margin']],
      body: rows,
      startY: 28,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [240, 165, 0], textColor: 20 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    doc.save(`RestroHub_Products_${td()}.pdf`);
    toast('✓ تم تصدير PDF');
  } catch (e) {
    console.error(e);
    toast('خطأ في التصدير', 'err');
  }
};

/* ══════════════════════════════════════════════════════════
   BOOT
══════════════════════════════════════════════════════════ */
seed();
