/* ══════════════════════════════════════════════════════════
   RESTROHUB — MAIN APP LOGIC
   sections:
   1. Storage helpers
   2. Seed data
   3. Auth & Permissions
   4. Navigation & UI
   5. Dashboard
   6. Floor plan (Fabric.js)
   7. Sessions & POS
   8. Kitchen
   9. Inventory system
   10. Reservations
   11. Financial reports
   12. Settings
   13. Export utilities (Excel/PDF)
══════════════════════════════════════════════════════════ */

/* ══════════════════════════════════════════════════════════
   1. STORAGE HELPERS
══════════════════════════════════════════════════════════ */
const G = k => { try { const d = localStorage.getItem(k); return d ? JSON.parse(d) : null; } catch { return null; } };
const S = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { console.error(e); } };
const NI = c => { const a = G(c) || []; return a.length ? Math.max(...a.map(i => i.id || 0)) + 1 : 1; };
const UP = (c, id, d) => { const a = G(c) || []; const i = a.findIndex(x => x.id === id); if (i !== -1) { a[i] = { ...a[i], ...d }; S(c, a); return true; } return false; };
const DL = (c, id) => S(c, (G(c) || []).filter(x => x.id !== id));

const td = () => new Date().toISOString().split('T')[0];
const fT = iso => iso ? new Date(iso).toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' }) : '';
const fD = iso => iso ? new Date(iso).toLocaleDateString('ar-IQ') : '';
const fDT = iso => iso ? `${fD(iso)} ${fT(iso)}` : '';
const fC = n => { const i = G('ri') || {}; return `${Number(n || 0).toLocaleString('ar-IQ')} ${i.currency || 'ل.ع'}`; };
const daysBetween = (d1, d2) => Math.ceil((new Date(d1) - new Date(d2)) / (1000 * 60 * 60 * 24));

const addA = (txt, color = '#f0a500') => {
  const a = G('act') || [];
  a.unshift({ txt, time: new Date().toISOString(), color, userId: CU?.id });
  if (a.length > 50) a.pop();
  S('act', a);
};

const logMovement = (productId, type, quantity, beforeStock, afterStock, referenceId = null, notes = '') => {
  const movements = G('stock_movements') || [];
  movements.push({
    id: NI('stock_movements'),
    product_id: productId,
    type, quantity, before_stock: beforeStock, after_stock: afterStock,
    reference_id: referenceId, notes,
    created_by: CU?.id || null,
    created_at: new Date().toISOString(),
  });
  S('stock_movements', movements);
};

/* ══════════════════════════════════════════════════════════
   2. SEED DATA
══════════════════════════════════════════════════════════ */
const seed = () => {
  if (G('rh_v4')) return;

  S('ri', { name: 'مطعم الأصيل', currency: 'ل.ع', tax: 10, phone: '+964 770 000 0000', address: 'بغداد' });

  S('tables', [
    { id: 1, number: 1, capacity: 2, status: 'free', sessionId: null, x: 100, y: 100, shape: 'square' },
    { id: 2, number: 2, capacity: 4, status: 'free', sessionId: null, x: 280, y: 100, shape: 'square' },
    { id: 3, number: 3, capacity: 4, status: 'free', sessionId: null, x: 460, y: 100, shape: 'round' },
    { id: 4, number: 4, capacity: 6, status: 'free', sessionId: null, x: 100, y: 310, shape: 'rect' },
    { id: 5, number: 5, capacity: 4, status: 'free', sessionId: null, x: 340, y: 310, shape: 'round' },
    { id: 6, number: 6, capacity: 2, status: 'free', sessionId: null, x: 520, y: 310, shape: 'square' },
  ]);

  S('suppliers', [
    { id: 1, name: 'مؤسسة البركة للمواد الغذائية', phone: '07701111111', email: 'baraka@example.com', address: 'سوق الشورجة، بغداد', balance: 0, notes: 'مورد اللحوم والدجاج' },
    { id: 2, name: 'شركة النور للمشروبات', phone: '07702222222', email: 'nour@example.com', address: 'الكاظمية، بغداد', balance: 0, notes: 'مورد المشروبات الغازية' },
    { id: 3, name: 'مخبز الأصالة', phone: '07703333333', email: '', address: 'الأعظمية، بغداد', balance: 0, notes: 'مورد الخبز والمخبوزات' },
  ]);

  const plusDays = d => { const x = new Date(); x.setDate(x.getDate() + d); return x.toISOString().split('T')[0]; };
  S('products', [
    { id: 1, name: 'شاورما دجاج', price: 25000, cost: 12000, stock: 50, minStock: 10, category: 'رئيسي', emoji: '🌯', supplier_id: 1, expiry_date: plusDays(3), alert_before_days: 2, sku: 'MEAT-001' },
    { id: 2, name: 'بطاطا مقلية', price: 15000, cost: 5000, stock: 80, minStock: 20, category: 'جانبي', emoji: '🍟', supplier_id: 1, expiry_date: plusDays(30), alert_before_days: 5, sku: 'VEG-001' },
    { id: 3, name: 'كوكاكولا', price: 5000, cost: 2000, stock: 100, minStock: 30, category: 'مشروبات', emoji: '🥤', supplier_id: 2, expiry_date: plusDays(180), alert_before_days: 14, sku: 'BEV-001' },
    { id: 4, name: 'كنافة', price: 12000, cost: 5000, stock: 8, minStock: 10, category: 'حلويات', emoji: '🍮', supplier_id: 3, expiry_date: plusDays(2), alert_before_days: 1, sku: 'DES-001' },
    { id: 5, name: 'شيش طاووق', price: 30000, cost: 15000, stock: 40, minStock: 8, category: 'رئيسي', emoji: '🍢', supplier_id: 1, expiry_date: plusDays(2), alert_before_days: 1, sku: 'MEAT-002' },
    { id: 6, name: 'عصير طازج', price: 7000, cost: 2500, stock: 60, minStock: 15, category: 'مشروبات', emoji: '🍊', supplier_id: 2, expiry_date: plusDays(5), alert_before_days: 2, sku: 'BEV-002' },
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
  S('stock_movements', []);
  S('purchase_orders', []);
  S('stock_takes', []);
  S('reservations', [
    { id: 1, customerName: 'أبو علي', phone: '07701234567', tableId: 3, date: td(), time: '13:00', guests: 4, status: 'confirmed', notes: '' },
    { id: 2, customerName: 'أم حسين', phone: '07709876543', tableId: 5, date: td(), time: '19:30', guests: 2, status: 'pending', notes: 'طاولة هادئة' },
  ]);
  S('act', [{ txt: 'تم تهيئة النظام', time: new Date().toISOString(), color: '#00bfa5' }]);
  S('rh_v4', true);
};

/* ══════════════════════════════════════════════════════════
   3. AUTH & PERMISSIONS
══════════════════════════════════════════════════════════ */
let CU = null;

const PERMS = {
  manager: {
    screens: ['dashboard', 'tables', 'kitchen', 'inventory', 'reservations', 'reports', 'settings'],
    actions: ['startSession','endSession','addOrder','pay','manageProducts','manageReservations','viewReports','manageSettings','manageUsers','manageExpenses','cancelInvoice','editLayout','addTable','deleteTable','dashboardFull','manageInventory','manageSuppliers','managePOs','doStockTake']
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
    { id: 'inventory', lbl: 'المخزون', ic: '◧', sec: 'الإدارة' },
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
    inventory: renderInventory, reservations: renderRes, reports: renderReports, settings: renderSet
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
  const r = { products: renderProds, reservations: renderRes, users: renderUsrs, expenses: renderExpenses, suppliers: renderSuppliers, stock_takes: renderStockTakes };
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
  const tbls = G('tables') || [], prods = G('products') || [], ords = G('orders') || [];
  const ts = td();
  const tInv = inv.filter(i => i.date && i.date.startsWith(ts));
  const tRev = tInv.reduce((s, i) => s + (i.grandTotal || 0), 0);
  const tOrd = ords.filter(o => o.orderTime && o.orderTime.startsWith(ts));
  const occ = tbls.filter(t => t.status === 'occupied').length;

  renderDashAlerts();

  let statsHtml = '';
  if (can('dashboardFull')) {
    const exp = G('expenses') || [];
    const tExp = exp.filter(e => e.date && e.date.startsWith(ts)).reduce((s, e) => s + (e.amount || 0), 0);
    const profit = tRev - tExp;
    statsHtml = `
      <div class="stat s-amber"><div class="st-v">${fC(tRev)}</div><div class="st-l">مبيعات اليوم</div></div>
      <div class="stat s-rose"><div class="st-v">${fC(tExp)}</div><div class="st-l">مصروفات اليوم</div></div>
      <div class="stat s-teal"><div class="st-v">${fC(profit)}</div><div class="st-l">صافي الربح</div></div>
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

const renderDashAlerts = () => {
  const container = document.getElementById('dashAlerts');
  if (!can('manageInventory')) { container.innerHTML = ''; return; }

  const prods = G('products') || [];
  const lowStock = prods.filter(p => p.stock <= p.minStock);
  const expiringProducts = prods.filter(p => {
    if (!p.expiry_date) return false;
    const days = daysBetween(p.expiry_date, new Date());
    return days <= (p.alert_before_days || 3) && days >= 0;
  });
  const expiredProducts = prods.filter(p => p.expiry_date && new Date(p.expiry_date) < new Date());

  let html = '';
  if (expiredProducts.length) {
    html += `<div class="alert-card critical"><div class="alert-ic">❌</div><div class="alert-body"><div class="alert-title">${expiredProducts.length} منتج منتهي الصلاحية</div><div class="alert-meta">${expiredProducts.slice(0, 3).map(p => p.name).join('، ')}${expiredProducts.length > 3 ? '...' : ''}</div></div><button class="btn b-rose b-sm" onclick="go('inventory')">مراجعة</button></div>`;
  }
  if (lowStock.length) {
    html += `<div class="alert-card"><div class="alert-ic">⚠</div><div class="alert-body"><div class="alert-title">${lowStock.length} منتج بمخزون منخفض</div><div class="alert-meta">${lowStock.slice(0, 3).map(p => `${p.name} (${p.stock})`).join('، ')}${lowStock.length > 3 ? '...' : ''}</div></div><button class="btn b-amber b-sm" onclick="quickReorder()">طلب شراء</button></div>`;
  }
  if (expiringProducts.length) {
    html += `<div class="alert-card info"><div class="alert-ic">🕐</div><div class="alert-body"><div class="alert-title">${expiringProducts.length} منتج قارب على انتهاء الصلاحية</div><div class="alert-meta">${expiringProducts.slice(0, 3).map(p => `${p.name} (${daysBetween(p.expiry_date, new Date())} أيام)`).join('، ')}</div></div><button class="btn b-sky b-sm" onclick="go('inventory')">مراجعة</button></div>`;
  }
  container.innerHTML = html;
};

const quickReorder = () => {
  go('inventory');
  setTimeout(() => setInvTab('purchases'), 100);
  setTimeout(() => openPOM(), 400);
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

/* Build realistic table with chairs around it */
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

    // Chairs around circle
    for (let i = 0; i < capacity; i++) {
      const angle = (i / capacity) * Math.PI * 2 - Math.PI / 2;
      const cx = Math.cos(angle) * chairDistance;
      const cy = Math.sin(angle) * chairDistance;
      // Chair seat (rounded rect)
      objects.push(new fabric.Rect({
        left: cx, top: cy,
        width: chairSize, height: chairSize,
        rx: 5, ry: 5,
        fill: chairColor, stroke: chairStroke, strokeWidth: 1.5,
        originX: 'center', originY: 'center',
        shadow: 'rgba(0,0,0,0.4) 0 2px 3px',
      }));
      // Chair back (thin rect toward table)
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

    // Table shadow
    objects.push(new fabric.Circle({
      left: 2, top: 3, radius: tableRadius,
      fill: 'rgba(0,0,0,0.35)', originX: 'center', originY: 'center',
    }));
    // Table top
    objects.push(new fabric.Circle({
      left: 0, top: 0, radius: tableRadius,
      fill: tableColor, stroke: statusColor, strokeWidth: 2.5,
      originX: 'center', originY: 'center',
    }));
    // Wood grain rings
    objects.push(new fabric.Circle({
      left: 0, top: 0, radius: tableRadius - 6,
      fill: 'transparent', stroke: 'rgba(0,0,0,0.18)', strokeWidth: 1,
      originX: 'center', originY: 'center',
    }));
    objects.push(new fabric.Circle({
      left: 0, top: 0, radius: tableRadius - 12,
      fill: 'transparent', stroke: 'rgba(0,0,0,0.12)', strokeWidth: 1,
      originX: 'center', originY: 'center',
    }));

  } else if (t.shape === 'rect') {
    const tw = 140, th = 70;
    const chairsPerSide = Math.ceil(capacity / 2);
    const remaining = capacity - chairsPerSide;

    // Top chairs
    for (let i = 0; i < chairsPerSide; i++) {
      const cx = -tw / 2 + (tw / (chairsPerSide + 1)) * (i + 1);
      objects.push(new fabric.Rect({
        left: cx, top: -th / 2 - 16, width: chairSize, height: chairSize, rx: 5, ry: 5,
        fill: chairColor, stroke: chairStroke, strokeWidth: 1.5,
        originX: 'center', originY: 'center',
        shadow: 'rgba(0,0,0,0.4) 0 2px 3px',
      }));
      objects.push(new fabric.Rect({
        left: cx, top: -th / 2 - 7, width: chairSize - 4, height: 3,
        fill: chairStroke, originX: 'center', originY: 'center',
      }));
    }
    // Bottom chairs
    for (let i = 0; i < remaining; i++) {
      const cx = -tw / 2 + (tw / (remaining + 1)) * (i + 1);
      objects.push(new fabric.Rect({
        left: cx, top: th / 2 + 16, width: chairSize, height: chairSize, rx: 5, ry: 5,
        fill: chairColor, stroke: chairStroke, strokeWidth: 1.5,
        originX: 'center', originY: 'center',
        shadow: 'rgba(0,0,0,0.4) 0 2px 3px',
      }));
      objects.push(new fabric.Rect({
        left: cx, top: th / 2 + 7, width: chairSize - 4, height: 3,
        fill: chairStroke, originX: 'center', originY: 'center',
      }));
    }

    // Table shadow
    objects.push(new fabric.Rect({
      left: 2, top: 3, width: tw, height: th, rx: 8, ry: 8,
      fill: 'rgba(0,0,0,0.35)', originX: 'center', originY: 'center',
    }));
    // Table top
    objects.push(new fabric.Rect({
      left: 0, top: 0, width: tw, height: th, rx: 8, ry: 8,
      fill: tableColor, stroke: statusColor, strokeWidth: 2.5,
      originX: 'center', originY: 'center',
    }));
    // Wood grain lines
    objects.push(new fabric.Line([-tw / 2 + 14, -6, tw / 2 - 14, -6], { stroke: 'rgba(0,0,0,0.15)', strokeWidth: 1 }));
    objects.push(new fabric.Line([-tw / 2 + 14, 6, tw / 2 - 14, 6], { stroke: 'rgba(0,0,0,0.15)', strokeWidth: 1 }));

  } else {
    // Square table
    const ts = 78;
    // 4 chairs on 4 sides
    let chairCount = Math.min(capacity, 4);
    const positions = [
      { x: 0, y: -ts / 2 - 16, rot: 0 },   // top
      { x: 0, y: ts / 2 + 16, rot: 180 },  // bottom
      { x: -ts / 2 - 16, y: 0, rot: -90 },  // left
      { x: ts / 2 + 16, y: 0, rot: 90 },    // right
    ];
    for (let i = 0; i < chairCount; i++) {
      const pos = positions[i];
      objects.push(new fabric.Rect({
        left: pos.x, top: pos.y, width: chairSize, height: chairSize, rx: 5, ry: 5,
        fill: chairColor, stroke: chairStroke, strokeWidth: 1.5,
        originX: 'center', originY: 'center',
        shadow: 'rgba(0,0,0,0.4) 0 2px 3px',
      }));
      // Chair back (thin line toward table)
      const dirX = pos.x === 0 ? 0 : (pos.x > 0 ? -1 : 1);
      const dirY = pos.y === 0 ? 0 : (pos.y > 0 ? -1 : 1);
      objects.push(new fabric.Rect({
        left: pos.x + dirX * (chairSize / 2 + 1),
        top: pos.y + dirY * (chairSize / 2 + 1),
        width: dirX ? 3 : chairSize - 4,
        height: dirY ? 3 : chairSize - 4,
        fill: chairStroke, originX: 'center', originY: 'center',
      }));
    }

    // Table shadow
    objects.push(new fabric.Rect({
      left: 2, top: 3, width: ts, height: ts, rx: 7, ry: 7,
      fill: 'rgba(0,0,0,0.35)', originX: 'center', originY: 'center',
    }));
    // Table top
    objects.push(new fabric.Rect({
      left: 0, top: 0, width: ts, height: ts, rx: 7, ry: 7,
      fill: tableColor, stroke: statusColor, strokeWidth: 2.5,
      originX: 'center', originY: 'center',
    }));
    // Wood grain
    objects.push(new fabric.Line([-ts / 2 + 10, 0, ts / 2 - 10, 0], { stroke: 'rgba(0,0,0,0.15)', strokeWidth: 1 }));
  }

  // Table number
  objects.push(new fabric.Text(String(t.number), {
    left: 0, top: -4, fontSize: 22, fontFamily: 'Syne, sans-serif', fontWeight: '800',
    fill: '#fff', originX: 'center', originY: 'center',
    shadow: 'rgba(0,0,0,0.6) 0 1px 2px',
  }));
  // Capacity label
  objects.push(new fabric.Text(`👥${t.capacity}`, {
    left: 0, top: 14, fontSize: 10, fontFamily: 'IBM Plex Sans Arabic', fontWeight: '600',
    fill: 'rgba(255,255,255,0.8)', originX: 'center', originY: 'center',
  }));

  // Timer badge
  if (t.status === 'occupied' && session) {
    const diff = Math.floor((Date.now() - new Date(session.startTime)) / 1000);
    const h = Math.floor(diff / 3600), m = Math.floor((diff % 3600) / 60);
    const timeStr = `${h ? h + 'س ' : ''}${m}د`;
    const topOffset = t.shape === 'round' ? -80 : (t.shape === 'rect' ? -68 : -75);
    objects.push(new fabric.Rect({
      left: 0, top: topOffset, width: 62, height: 22, rx: 11, ry: 11,
      fill: 'rgba(240,165,0,0.95)', originX: 'center', originY: 'center',
      shadow: 'rgba(0,0,0,0.3) 0 2px 4px',
    }));
    objects.push(new fabric.Text(`⏱ ${timeStr}`, {
      left: 0, top: topOffset, fontSize: 10, fontFamily: 'IBM Plex Sans Arabic', fontWeight: '700',
      fill: '#0d0f14', originX: 'center', originY: 'center',
    }));
  }

  // Selection ring
  if (isSelected) {
    const ringR = t.shape === 'round' ? 72 : (t.shape === 'rect' ? 98 : 62);
    objects.push(new fabric.Circle({
      left: 0, top: 0, radius: ringR,
      fill: 'transparent', stroke: '#a855f7', strokeWidth: 2, strokeDashArray: [6, 4],
      originX: 'center', originY: 'center', opacity: 0.8,
    }));
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
   7. SESSIONS & POS
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

const endSess = (tableId, pm) => {
  const tbls = G('tables') || [], sess = G('sessions') || [], t = tbls.find(x => x.id === tableId);
  if (!t) return;
  const s = sess.find(x => x.id === t.sessionId);
  if (!s) return;
  const i = G('ri') || {}, tax = (i.tax || 0) / 100, sub = s.total || 0, taxA = Math.round(sub * tax), grand = sub + taxA;
  const inv = G('invoices') || [];
  inv.push({ id: NI('invoices'), sessionId: s.id, tableId, tableNumber: t.number, subtotal: sub, tax: taxA, grandTotal: grand, paymentMethod: pm, status: 'paid', date: new Date().toISOString(), staffId: CU?.id });
  S('invoices', inv);
  S('sessions', sess.filter(x => x.id !== s.id));
  UP('tables', tableId, { status: 'free', sessionId: null });
  addA(`تسديد طاولة ${t.number} — ${fC(grand)}`, '#e84060');
  toast(`تم التسديد: ${fC(grand)}`);
  closePOS(); fpClearSelection(); renderFloorPlan();
};

const requestBill = tableId => {
  const t = (G('tables') || []).find(x => x.id === tableId);
  addA(`النادل طلب فاتورة للطاولة ${t?.number}`, '#3d9cf0');
  toast('✓ تم إرسال طلب الفاتورة للكاشير');
};

let pTbl = null, pItm = {}, pChk = false, pPay = 'cash';
const openPOS = (tableId, chk = false) => {
  if (chk && !can('pay')) { toast('لا صلاحية للدفع', 'err'); return; }
  if (!chk && !can('addOrder')) { toast('لا صلاحية', 'err'); return; }
  pTbl = tableId; pItm = {}; pChk = chk; pPay = 'cash';
  const t = (G('tables') || []).find(x => x.id === tableId);
  const sess = G('sessions') || [];
  const s = t ? sess.find(x => x.id === t.sessionId) : null;
  document.getElementById('posT').textContent = `طاولة ${t?.number} — ${chk ? 'تسديد الفاتورة' : 'إضافة طلبات'}`;
  document.getElementById('posM').textContent = s ? `بدأت: ${fT(s.startTime)} · الإجمالي: ${fC(s.total)}` : 'جلسة جديدة';
  document.getElementById('posSnd').style.display = chk ? 'none' : '';
  document.getElementById('pyRow').style.display = chk ? '' : 'none';
  document.getElementById('posRh').textContent = chk ? 'طلبات الجلسة' : 'الطلب الحالي';
  const mb = document.getElementById('pMnBtn');
  if (chk) { mb.textContent = 'تسديد الفاتورة'; mb.className = 'pos-main-btn pmb-pay'; }
  else { mb.textContent = '↑ إرسال للمطبخ'; mb.className = 'pos-main-btn pmb-send'; }
  ['cash', 'card', 'online'].forEach(m => document.getElementById(`pm-${m}`).className = `pm${m === pPay ? ' on' : ''}`);
  renderPProds(); renderPOrd();
  document.getElementById('posPanel').style.display = 'flex';
};
const closePOS = () => { document.getElementById('posPanel').style.display = 'none'; pTbl = null; pItm = {}; };
const renderPProds = (cat = '') => {
  const pr = G('products') || [];
  const cats = [...new Set(pr.map(p => p.category))];
  document.getElementById('pCats').innerHTML = `<button class="c-pill${!cat ? ' on' : ''}" onclick="renderPProds('')">الكل</button>` + cats.map(c => `<button class="c-pill${cat === c ? ' on' : ''}" onclick="renderPProds('${c}')">${c}</button>`).join('');
  const lst = cat ? pr.filter(p => p.category === cat) : pr;
  document.getElementById('pGrid').innerHTML = lst.map(p => {
    const oos = p.stock <= 0;
    return `<div class="pr-c ${oos ? 'oos' : ''}" onclick="${oos ? '' : `addOrd(${p.id})`}">
      <div class="pr-em">${p.emoji || '🍽'}</div>
      <div class="pr-nm">${p.name}</div>
      <div class="pr-pr">${fC(p.price)}</div>
      <div class="pr-stk">${oos ? 'نفد المخزون' : `متوفر: ${p.stock}`}</div>
    </div>`;
  }).join('');
};
const addOrd = id => {
  const p = (G('products') || []).find(x => x.id === id);
  if (!p) return;
  if (p.stock <= 0) { toast('نفد المخزون', 'err'); return; }
  if (pItm[id] && pItm[id].qty >= p.stock) { toast(`الحد الأقصى: ${p.stock}`, 'err'); return; }
  pItm[id] ? pItm[id].qty++ : (pItm[id] = { ...p, qty: 1 });
  renderPOrd();
};
const chgQ = (id, d) => {
  if (!pItm[id]) return;
  const p = (G('products') || []).find(x => x.id === id);
  if (d > 0 && p && pItm[id].qty >= p.stock) { toast(`الحد الأقصى: ${p.stock}`, 'err'); return; }
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
    html += newItems.map(x => `<div class="oi"><div class="oi-nm">${x.emoji} ${x.name}</div><div class="qc"><button class="qb" onclick="chgQ(${x.id},-1)">−</button><span class="qn">${x.qty}</span><button class="qb" onclick="chgQ(${x.id},1)">+</button></div><div class="oi-sub">${fC(x.price * x.qty)}</div></div>`).join('');
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

const selPay = m => { pPay = m; ['cash', 'card', 'online'].forEach(x => document.getElementById(`pm-${x}`).className = `pm${x === m ? ' on' : ''}`); };
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
  ords.push({ id: orderId, sessionId: s.id, tableId: pTbl, tableNumber: uT.number, items: it.map(x => ({ productId: x.id, name: x.name, qty: x.qty, price: x.price, emoji: x.emoji })), total: tot, status: 'pending', orderTime: new Date().toISOString(), staffId: CU?.id });
  S('orders', ords);
  UP('sessions', s.id, { total: (s.total || 0) + tot, lastOrderTime: new Date().toISOString() });

  const pr = G('products') || [];
  it.forEach(x => {
    const idx = pr.findIndex(p => p.id === x.id);
    if (idx !== -1) {
      const before = pr[idx].stock;
      pr[idx].stock = Math.max(0, before - x.qty);
      logMovement(x.id, 'sale', -x.qty, before, pr[idx].stock, orderId, `طلب طاولة ${uT.number}`);
    }
  });
  S('products', pr);
  addA(`طلب — طاولة ${uT.number} (${it.length} أصناف)`, '#8892a4');
  toast(`تم إرسال ${it.length} صنف للمطبخ`);
  closePOS(); renderFloorPlan();
};

const checkout = () => {
  if (!pTbl) return;
  const t = (G('tables') || []).find(x => x.id === pTbl);
  if (!t || t.status !== 'occupied') { toast('لا توجد جلسة نشطة', 'err'); return; }
  if (Object.keys(pItm).length > 0) { toast('أرسل الطلب الحالي للمطبخ أولاً', 'err'); return; }
  endSess(pTbl, pPay);
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
   9. INVENTORY SYSTEM
══════════════════════════════════════════════════════════ */
let currentInvTab = 'products';

const renderInventory = () => {
  if (!can('manageInventory')) { toast('لا صلاحية', 'err'); return; }
  const actions = document.getElementById('invActions');
  actions.innerHTML = `<button class="btn b-amber b-sm" onclick="openProdM()">+ إضافة منتج</button>`;
  setInvTab(currentInvTab);
};

const setInvTab = (tab) => {
  currentInvTab = tab;
  document.querySelectorAll('[data-itab]').forEach(b => b.classList.remove('on'));
  document.querySelector(`[data-itab="${tab}"]`)?.classList.add('on');
  ['invProducts', 'invMovements', 'invSuppliers', 'invPurchases', 'invStockTake', 'invReports'].forEach(id => {
    const el = document.getElementById(id); if (el) el.style.display = 'none';
  });
  const map = {
    products: { id: 'invProducts', fn: renderProds },
    movements: { id: 'invMovements', fn: renderMovements },
    suppliers: { id: 'invSuppliers', fn: renderSuppliers },
    purchases: { id: 'invPurchases', fn: renderPOs },
    stocktake: { id: 'invStockTake', fn: renderStockTakes },
    invreports: { id: 'invReports', fn: runInvReports },
  };
  const m = map[tab];
  if (m) { document.getElementById(m.id).style.display = ''; m.fn(); }
};

/* --- Products --- */
const renderProds = () => {
  const pr = G('products') || [];
  const sups = G('suppliers') || [];

  const cats = [...new Set(pr.map(p => p.category))];
  const catSel = document.getElementById('prodFilterCat');
  if (catSel) {
    const currentCat = catSel.value;
    catSel.innerHTML = `<option value="">كل الفئات</option>` + cats.map(c => `<option value="${c}" ${c === currentCat ? 'selected' : ''}>${c}</option>`).join('');
  }

  const search = (document.getElementById('prodSearch')?.value || '').toLowerCase();
  const fcat = document.getElementById('prodFilterCat')?.value || '';
  const fstk = document.getElementById('prodFilterStock')?.value || '';

  let filtered = pr.filter(p => {
    if (search && !p.name.toLowerCase().includes(search) && !(p.sku || '').toLowerCase().includes(search)) return false;
    if (fcat && p.category !== fcat) return false;
    if (fstk === 'low' && p.stock > p.minStock) return false;
    if (fstk === 'ok' && p.stock <= p.minStock) return false;
    if (fstk === 'expired') {
      if (!p.expiry_date) return false;
      const days = daysBetween(p.expiry_date, new Date());
      if (days > (p.alert_before_days || 3)) return false;
    }
    return true;
  });

  const body = document.getElementById('prodBd');
  if (!filtered.length) { body.innerHTML = '<tr><td colspan="10" style="text-align:center;color:var(--muted);padding:40px">لا توجد منتجات</td></tr>'; return; }

  body.innerHTML = filtered.map(p => {
    const sup = sups.find(s => s.id === p.supplier_id);
    const value = (p.stock || 0) * (p.cost || 0);
    const lowStock = p.stock <= p.minStock;

    let expHtml = '—';
    if (p.expiry_date) {
      const days = daysBetween(p.expiry_date, new Date());
      if (days < 0) expHtml = `<span class="bdg b-r">منتهي</span>`;
      else if (days <= (p.alert_before_days || 3)) expHtml = `<span class="bdg b-a">${days} أيام</span>`;
      else expHtml = `<span style="color:var(--dim);font-size:.75rem">${fD(p.expiry_date)}</span>`;
    }

    return `<tr>
      <td><strong style="color:#fff">${p.emoji || ''} ${p.name}</strong><div style="font-size:.68rem;color:var(--muted);margin-top:2px;">${p.sku || ''}</div></td>
      <td><span class="bdg b-m">${p.category}</span></td>
      <td style="color:var(--dim);font-size:.75rem">${sup ? sup.name : '—'}</td>
      <td style="color:var(--amber);font-weight:600">${(p.price || 0).toLocaleString()}</td>
      <td style="color:var(--muted)">${(p.cost || 0).toLocaleString()}</td>
      <td style="color:#fff;font-weight:700">${p.stock}</td>
      <td style="color:var(--teal);font-weight:600">${value.toLocaleString()}</td>
      <td>${lowStock ? `<span class="bdg b-r">⚠ منخفض</span>` : `<span class="bdg b-t">✓ طبيعي</span>`}</td>
      <td>${expHtml}</td>
      <td><div style="display:flex;gap:4px;flex-wrap:nowrap">
        ${lowStock ? `<button class="btn b-amber b-sm" onclick="quickReorderProduct(${p.id})" title="طلب شراء">🛒</button>` : ''}
        <button class="btn b-ghost b-sm" onclick="openProdM(${p.id})">✏</button>
        <button class="btn b-rose b-sm" onclick="confDel('products',${p.id},'${p.name.replace(/'/g, "\\'")}')">🗑</button>
      </div></td>
    </tr>`;
  }).join('');
};

const openProdM = (id = null) => {
  const pr = G('products') || [], p = id ? pr.find(x => x.id === id) : null;
  const sups = G('suppliers') || [];
  const cats = ['رئيسي', 'جانبي', 'مشروبات', 'حلويات', 'مقبلات'];
  const emjs = ['🌯', '🍔', '🍢', '🍟', '🥤', '🍮', '🍊', '🥗', '🍕', '🍜', '🍖', '🥘'];
  modalWide(`<div class="modal-t">${p ? 'تعديل منتج' : 'إضافة منتج'}</div>
    <div class="fgr3">
      <div class="fg"><label>الاسم</label><input id="pN" value="${p?.name || ''}"></div>
      <div class="fg"><label>الرمز (SKU)</label><input id="pSku" value="${p?.sku || ''}" placeholder="MEAT-001"></div>
      <div class="fg"><label>الأيقونة</label><select id="pE">${emjs.map(e => `<option value="${e}" ${p?.emoji === e ? 'selected' : ''}>${e}</option>`).join('')}</select></div>
    </div>
    <div class="fgr">
      <div class="fg"><label>الفئة</label><select id="pCat">${cats.map(c => `<option value="${c}" ${p?.category === c ? 'selected' : ''}>${c}</option>`).join('')}</select></div>
      <div class="fg"><label>المورد</label><select id="pSup"><option value="">— بدون —</option>${sups.map(s => `<option value="${s.id}" ${p?.supplier_id === s.id ? 'selected' : ''}>${s.name}</option>`).join('')}</select></div>
    </div>
    <div class="fgr">
      <div class="fg"><label>سعر البيع</label><input type="number" id="pP" value="${p?.price || ''}"></div>
      <div class="fg"><label>التكلفة</label><input type="number" id="pC" value="${p?.cost || ''}"></div>
    </div>
    <div class="fgr">
      <div class="fg"><label>المخزون الحالي</label><input type="number" id="pS" value="${p?.stock ?? 0}"></div>
      <div class="fg"><label>الحد الأدنى</label><input type="number" id="pM" value="${p?.minStock ?? 5}"></div>
    </div>
    <div class="fgr">
      <div class="fg"><label>تاريخ الصلاحية</label><input type="date" id="pExp" value="${p?.expiry_date || ''}"></div>
      <div class="fg"><label>تنبيه قبل (أيام)</label><input type="number" id="pExpAlert" value="${p?.alert_before_days ?? 3}" min="1"></div>
    </div>
    <div class="modal-ft">
      <button class="btn b-ghost" onclick="closeM()">إلغاء</button>
      <button class="btn b-amber" onclick="saveProd(${id || 'null'})">حفظ</button>
    </div>`);
};

const saveProd = id => {
  const name = document.getElementById('pN').value.trim();
  if (!name) { toast('أدخل الاسم', 'err'); return; }
  const newStock = parseInt(document.getElementById('pS').value) || 0;
  const sup = document.getElementById('pSup').value;
  const d = {
    name,
    sku: document.getElementById('pSku').value.trim(),
    emoji: document.getElementById('pE').value,
    price: parseFloat(document.getElementById('pP').value) || 0,
    cost: parseFloat(document.getElementById('pC').value) || 0,
    stock: newStock,
    minStock: parseInt(document.getElementById('pM').value) || 0,
    category: document.getElementById('pCat').value,
    supplier_id: sup ? parseInt(sup) : null,
    expiry_date: document.getElementById('pExp').value || null,
    alert_before_days: parseInt(document.getElementById('pExpAlert').value) || 3,
  };
  if (id) {
    const oldP = (G('products') || []).find(x => x.id === id);
    const oldStock = oldP?.stock || 0;
    UP('products', id, d);
    if (newStock !== oldStock) {
      logMovement(id, 'adjustment', newStock - oldStock, oldStock, newStock, null, 'تعديل يدوي من شاشة المنتج');
    }
    toast('تم التعديل');
  } else {
    const a = G('products') || [];
    const newId = NI('products');
    a.push({ id: newId, ...d });
    S('products', a);
    if (newStock > 0) logMovement(newId, 'adjustment', newStock, 0, newStock, null, 'كمية ابتدائية');
    toast('تمت الإضافة');
  }
  addA(`${id ? 'تعديل' : 'إضافة'} منتج: ${name}`, '#a855f7');
  closeM();
  renderProds();
};

const quickReorderProduct = pid => {
  const p = (G('products') || []).find(x => x.id === pid);
  if (!p) return;
  if (!p.supplier_id) { toast('لم يتم تعيين مورد لهذا المنتج', 'err'); return; }
  openPOM(p.supplier_id, [pid]);
};

/* --- Movements --- */
const renderMovements = () => {
  const movs = G('stock_movements') || [];
  const prods = G('products') || [];
  const users = G('users') || [];

  const prodSel = document.getElementById('movFilterProduct');
  if (prodSel) {
    const curP = prodSel.value;
    prodSel.innerHTML = `<option value="">كل المنتجات</option>` + prods.map(p => `<option value="${p.id}" ${String(p.id) === curP ? 'selected' : ''}>${p.name}</option>`).join('');
  }

  const ftype = document.getElementById('movFilterType').value;
  const fprod = document.getElementById('movFilterProduct').value;
  const dfrom = document.getElementById('movDateFrom').value;
  const dto = document.getElementById('movDateTo').value;

  let filtered = movs.filter(m => {
    if (ftype && m.type !== ftype) return false;
    if (fprod && m.product_id !== parseInt(fprod)) return false;
    if (dfrom && m.created_at < dfrom) return false;
    if (dto && m.created_at > dto + 'T23:59:59') return false;
    return true;
  });
  filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const typeLbl = { purchase: 'شراء', sale: 'بيع', adjustment: 'تعديل', damage: 'تلف', return: 'إرجاع', stocktake: 'جرد' };
  const typeBdg = { purchase: 'b-t', sale: 'b-s', adjustment: 'b-p', damage: 'b-r', return: 'b-a', stocktake: 'b-m' };

  const body = document.getElementById('movBd');
  if (!filtered.length) { body.innerHTML = '<tr><td colspan="9" style="text-align:center;color:var(--muted);padding:40px">لا توجد حركات</td></tr>'; return; }

  body.innerHTML = filtered.slice(0, 200).map(m => {
    const prod = prods.find(p => p.id === m.product_id);
    const user = users.find(u => u.id === m.created_by);
    const qtyClass = m.quantity > 0 ? 'color:var(--teal)' : 'color:var(--rose)';
    return `<tr>
      <td style="font-size:.73rem;color:var(--muted);white-space:nowrap">${fDT(m.created_at)}</td>
      <td><span class="bdg ${typeBdg[m.type] || 'b-m'}">${typeLbl[m.type] || m.type}</span></td>
      <td style="color:var(--fog);font-weight:500">${prod ? prod.emoji + ' ' + prod.name : '— محذوف —'}</td>
      <td style="${qtyClass};font-weight:700">${m.quantity > 0 ? '+' : ''}${m.quantity}</td>
      <td style="color:var(--muted)">${m.before_stock}</td>
      <td style="color:#fff;font-weight:600">${m.after_stock}</td>
      <td style="color:var(--dim);font-size:.73rem">${m.reference_id ? '#' + m.reference_id : '—'}</td>
      <td style="color:var(--dim);font-size:.73rem">${m.notes || '—'}</td>
      <td style="color:var(--muted);font-size:.73rem">${user?.name || '—'}</td>
    </tr>`;
  }).join('');
};

const openMovementM = () => {
  const prods = G('products') || [];
  if (!prods.length) { toast('لا توجد منتجات', 'err'); return; }
  modal(`<div class="modal-t">حركة يدوية</div>
    <div class="fg"><label>المنتج</label><select id="mvProd">${prods.map(p => `<option value="${p.id}">${p.emoji} ${p.name} (المخزون: ${p.stock})</option>`).join('')}</select></div>
    <div class="fgr">
      <div class="fg"><label>نوع الحركة</label><select id="mvType">
        <option value="adjustment">تعديل</option>
        <option value="damage">تلف</option>
        <option value="return">إرجاع</option>
      </select></div>
      <div class="fg"><label>الكمية (+/-)</label><input type="number" id="mvQty" placeholder="مثال: -5 للخصم"></div>
    </div>
    <div class="fg"><label>ملاحظات</label><input id="mvNotes" placeholder="سبب الحركة..."></div>
    <div class="modal-ft">
      <button class="btn b-ghost" onclick="closeM()">إلغاء</button>
      <button class="btn b-amber" onclick="saveMovement()">حفظ الحركة</button>
    </div>`);
};

const saveMovement = () => {
  const pid = parseInt(document.getElementById('mvProd').value);
  const type = document.getElementById('mvType').value;
  const qty = parseInt(document.getElementById('mvQty').value);
  const notes = document.getElementById('mvNotes').value.trim();
  if (!qty) { toast('أدخل الكمية', 'err'); return; }
  const pr = G('products') || [];
  const pIdx = pr.findIndex(p => p.id === pid);
  if (pIdx === -1) return;
  const before = pr[pIdx].stock;
  const after = Math.max(0, before + qty);
  pr[pIdx].stock = after;
  S('products', pr);
  logMovement(pid, type, qty, before, after, null, notes);
  addA(`حركة ${type}: ${pr[pIdx].name} (${qty > 0 ? '+' : ''}${qty})`, '#a855f7');
  toast('✓ تم تسجيل الحركة');
  closeM();
  renderMovements();
};

/* --- Suppliers --- */
const renderSuppliers = () => {
  const sups = G('suppliers') || [];
  const prods = G('products') || [];
  const pos = G('purchase_orders') || [];
  const search = (document.getElementById('supSearch')?.value || '').toLowerCase();
  const filtered = sups.filter(s => !search || s.name.toLowerCase().includes(search) || (s.phone || '').includes(search));

  const grid = document.getElementById('supGrid');
  if (!filtered.length) { grid.innerHTML = '<div class="empty-state"><div class="empty-state-ic">🚚</div><div>لا يوجد موردين</div></div>'; return; }

  grid.innerHTML = filtered.map(s => {
    const prodCount = prods.filter(p => p.supplier_id === s.id).length;
    const posCount = pos.filter(po => po.supplier_id === s.id).length;
    const initials = s.name.trim()[0] || '؟';
    return `<div class="sup-c">
      <div class="sup-head">
        <div class="sup-av">${initials}</div>
        <div style="flex:1;min-width:0;">
          <div class="sup-nm" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${s.name}</div>
          <div class="sup-phone">📞 ${s.phone || '—'}</div>
        </div>
      </div>
      <div class="sup-stats">
        <div><div class="sup-stat-v">${prodCount}</div><div class="sup-stat-l">منتج</div></div>
        <div><div class="sup-stat-v">${posCount}</div><div class="sup-stat-l">أمر شراء</div></div>
      </div>
      <div class="sup-acts">
        <button class="btn b-amber b-sm" onclick="openPOM(${s.id})" style="flex:1">+ أمر شراء</button>
        <button class="btn b-ghost b-sm" onclick="openSupplierM(${s.id})">✏</button>
        <button class="btn b-rose b-sm" onclick="confDel('suppliers',${s.id},'${s.name.replace(/'/g, "\\'")}')">🗑</button>
      </div>
    </div>`;
  }).join('');
};

const openSupplierM = (id = null) => {
  const sups = G('suppliers') || [];
  const s = id ? sups.find(x => x.id === id) : null;
  modal(`<div class="modal-t">${s ? 'تعديل مورد' : 'مورد جديد'}</div>
    <div class="fg"><label>اسم المورد</label><input id="supN" value="${s?.name || ''}"></div>
    <div class="fgr">
      <div class="fg"><label>الهاتف</label><input id="supP" value="${s?.phone || ''}"></div>
      <div class="fg"><label>البريد</label><input id="supE" value="${s?.email || ''}"></div>
    </div>
    <div class="fg"><label>العنوان</label><input id="supA" value="${s?.address || ''}"></div>
    <div class="fg"><label>الرصيد</label><input type="number" id="supB" value="${s?.balance || 0}"></div>
    <div class="fg" style="margin-bottom:0"><label>ملاحظات</label><input id="supNt" value="${s?.notes || ''}"></div>
    <div class="modal-ft">
      <button class="btn b-ghost" onclick="closeM()">إلغاء</button>
      <button class="btn b-amber" onclick="saveSupplier(${id || 'null'})">حفظ</button>
    </div>`);
};

const saveSupplier = id => {
  const name = document.getElementById('supN').value.trim();
  if (!name) { toast('أدخل اسم المورد', 'err'); return; }
  const d = {
    name,
    phone: document.getElementById('supP').value.trim(),
    email: document.getElementById('supE').value.trim(),
    address: document.getElementById('supA').value.trim(),
    balance: parseFloat(document.getElementById('supB').value) || 0,
    notes: document.getElementById('supNt').value.trim(),
  };
  if (id) { UP('suppliers', id, d); toast('✓ تم التعديل'); }
  else { const a = G('suppliers') || []; a.push({ id: NI('suppliers'), ...d }); S('suppliers', a); toast('✓ تمت الإضافة'); }
  addA(`${id ? 'تعديل' : 'إضافة'} مورد: ${name}`, '#a855f7');
  closeM();
  renderSuppliers();
};

/* --- Purchase Orders --- */
let poItems = [];

const renderPOs = () => {
  const pos = G('purchase_orders') || [];
  const sups = G('suppliers') || [];

  const supSel = document.getElementById('poFilterSupplier');
  if (supSel) {
    const cur = supSel.value;
    supSel.innerHTML = `<option value="">كل الموردين</option>` + sups.map(s => `<option value="${s.id}" ${String(s.id) === cur ? 'selected' : ''}>${s.name}</option>`).join('');
  }

  const fstatus = document.getElementById('poFilterStatus').value;
  const fsup = document.getElementById('poFilterSupplier').value;

  let filtered = pos.filter(po => {
    if (fstatus && po.status !== fstatus) return false;
    if (fsup && po.supplier_id !== parseInt(fsup)) return false;
    return true;
  });
  filtered.sort((a, b) => new Date(b.order_date) - new Date(a.order_date));

  const list = document.getElementById('poList');
  if (!filtered.length) { list.innerHTML = '<div class="empty-state"><div class="empty-state-ic">📋</div><div>لا توجد أوامر شراء</div></div>'; return; }

  const statLbl = { pending: 'معلق', received: 'مستلم', cancelled: 'ملغي' };
  const statBdg = { pending: 'b-a', received: 'b-t', cancelled: 'b-r' };

  list.innerHTML = filtered.map(po => {
    const sup = sups.find(s => s.id === po.supplier_id);
    const itemsCount = (po.items || []).length;
    return `<div class="po-card">
      <div class="po-head">
        <div>
          <div class="po-id">أمر #${po.id}</div>
          <div class="po-meta"><span class="po-sup">${sup?.name || '—'}</span> · تاريخ الأمر: ${fD(po.order_date)}${po.expected_date ? ` · متوقع: ${fD(po.expected_date)}` : ''}</div>
        </div>
        <span class="bdg ${statBdg[po.status] || 'b-m'}">${statLbl[po.status] || po.status}</span>
      </div>
      <div class="po-items-summary">📦 ${itemsCount} منتج${po.notes ? ` · 📝 ${po.notes}` : ''}</div>
      <div class="po-foot">
        <div class="po-total">${fC(po.total_amount || 0)}</div>
        <div class="po-acts">
          <button class="btn b-ghost b-sm" onclick="viewPO(${po.id})">عرض التفاصيل</button>
          ${po.status === 'pending' ? `<button class="btn b-teal b-sm" onclick="receivePO(${po.id})">✓ استلام</button>` : ''}
          ${po.status === 'pending' ? `<button class="btn b-rose b-sm" onclick="cancelPO(${po.id})">إلغاء</button>` : ''}
        </div>
      </div>
    </div>`;
  }).join('');
};

const openPOM = (presetSupplierId = null, presetProductIds = []) => {
  const sups = G('suppliers') || [];
  const prods = G('products') || [];
  if (!sups.length) { toast('أضف موردين أولاً', 'err'); return; }

  poItems = presetProductIds.map(pid => {
    const p = prods.find(x => x.id === pid);
    return p ? { productId: pid, name: p.name, quantity: Math.max(1, (p.minStock || 10) * 2 - p.stock), cost: p.cost || 0 } : null;
  }).filter(Boolean);

  modalWide(`<div class="modal-t">أمر شراء جديد</div>
    <div class="fgr">
      <div class="fg"><label>المورد</label><select id="poSup">${sups.map(s => `<option value="${s.id}" ${presetSupplierId === s.id ? 'selected' : ''}>${s.name}</option>`).join('')}</select></div>
      <div class="fg"><label>تاريخ الاستلام المتوقع</label><input type="date" id="poExpDate"></div>
    </div>
    <div class="fg"><label>ملاحظات</label><input id="poNotes" placeholder="—"></div>
    <div class="card-hd" style="margin-top:14px">المنتجات</div>
    <div class="po-items-list">
      <div id="poItemsTableWrap"></div>
      <div class="po-add-item-row">
        <select id="poNewProd"><option value="">— اختر منتج —</option>${prods.map(p => `<option value="${p.id}" data-cost="${p.cost}" data-name="${p.name}">${p.emoji} ${p.name}</option>`).join('')}</select>
        <input type="number" id="poNewQty" placeholder="الكمية" value="10">
        <input type="number" id="poNewCost" placeholder="التكلفة">
        <button class="btn b-amber b-sm" onclick="poAddItem()">+</button>
      </div>
    </div>
    <div style="text-align:left;margin-top:16px;padding-top:12px;border-top:1px solid var(--line);font-family:var(--f-d);font-size:1.15rem;color:#fff">
      الإجمالي: <span id="poTotal">${fC(0)}</span>
    </div>
    <div class="modal-ft">
      <button class="btn b-ghost" onclick="closeM()">إلغاء</button>
      <button class="btn b-amber" onclick="savePO()">حفظ الأمر</button>
    </div>`);

  document.getElementById('poNewProd').addEventListener('change', e => {
    const opt = e.target.selectedOptions[0];
    if (opt && opt.dataset.cost) document.getElementById('poNewCost').value = opt.dataset.cost;
  });
  renderPOItems();
};

const poAddItem = () => {
  const pid = parseInt(document.getElementById('poNewProd').value);
  const qty = parseInt(document.getElementById('poNewQty').value);
  const cost = parseFloat(document.getElementById('poNewCost').value);
  if (!pid || !qty || qty <= 0 || !cost || cost < 0) { toast('أكمل بيانات المنتج', 'err'); return; }
  if (poItems.find(it => it.productId === pid)) { toast('المنتج موجود بالفعل', 'err'); return; }
  const p = (G('products') || []).find(x => x.id === pid);
  poItems.push({ productId: pid, name: p?.name || '', quantity: qty, cost });
  document.getElementById('poNewProd').value = '';
  document.getElementById('poNewQty').value = '10';
  document.getElementById('poNewCost').value = '';
  renderPOItems();
};

const poRemoveItem = idx => { poItems.splice(idx, 1); renderPOItems(); };
const poChangeItem = (idx, field, value) => {
  const v = field === 'quantity' ? parseInt(value) || 0 : parseFloat(value) || 0;
  poItems[idx][field] = v;
  renderPOItems();
};

const renderPOItems = () => {
  const wrap = document.getElementById('poItemsTableWrap');
  if (!wrap) return;
  if (!poItems.length) {
    wrap.innerHTML = '<div style="text-align:center;padding:16px;color:var(--muted);font-size:.8rem">لم تُضف منتجات بعد</div>';
    document.getElementById('poTotal').textContent = fC(0);
    return;
  }
  wrap.innerHTML = `<table>
    <thead><tr><th>المنتج</th><th>الكمية</th><th>التكلفة</th><th>المجموع</th><th></th></tr></thead>
    <tbody>${poItems.map((it, i) => `<tr>
      <td>${it.name}</td>
      <td><input type="number" value="${it.quantity}" onchange="poChangeItem(${i},'quantity',this.value)" style="width:70px;background:var(--ink3);border:1px solid var(--line);border-radius:6px;padding:4px 8px;color:#fff;text-align:center;"></td>
      <td><input type="number" value="${it.cost}" onchange="poChangeItem(${i},'cost',this.value)" style="width:90px;background:var(--ink3);border:1px solid var(--line);border-radius:6px;padding:4px 8px;color:#fff;text-align:center;"></td>
      <td style="color:var(--amber);font-weight:600">${fC(it.quantity * it.cost)}</td>
      <td><button class="remove-item-btn" onclick="poRemoveItem(${i})">✕</button></td>
    </tr>`).join('')}</tbody>
  </table>`;
  const total = poItems.reduce((s, it) => s + it.quantity * it.cost, 0);
  document.getElementById('poTotal').textContent = fC(total);
};

const savePO = () => {
  if (!poItems.length) { toast('أضف منتج واحد على الأقل', 'err'); return; }
  const supplier_id = parseInt(document.getElementById('poSup').value);
  const expected_date = document.getElementById('poExpDate').value;
  const notes = document.getElementById('poNotes').value.trim();
  const total = poItems.reduce((s, it) => s + it.quantity * it.cost, 0);
  const pos = G('purchase_orders') || [];
  pos.push({
    id: NI('purchase_orders'),
    supplier_id,
    order_date: new Date().toISOString(),
    expected_date: expected_date || null,
    items: [...poItems],
    total_amount: total,
    status: 'pending',
    received_date: null,
    notes,
    created_by: CU?.id,
  });
  S('purchase_orders', pos);
  addA(`أمر شراء جديد بقيمة ${fC(total)}`, '#00bfa5');
  toast('✓ تم إنشاء أمر الشراء');
  poItems = [];
  closeM();
  renderPOs();
};

const viewPO = id => {
  const po = (G('purchase_orders') || []).find(x => x.id === id);
  if (!po) return;
  const sup = (G('suppliers') || []).find(s => s.id === po.supplier_id);
  const statLbl = { pending: 'معلق', received: 'مستلم', cancelled: 'ملغي' };
  modalWide(`<div class="modal-t">أمر الشراء #${po.id}</div>
    <div class="fgr">
      <div class="fg"><label>المورد</label><input value="${sup?.name || '—'}" readonly></div>
      <div class="fg"><label>الحالة</label><input value="${statLbl[po.status] || po.status}" readonly></div>
    </div>
    <div class="fgr">
      <div class="fg"><label>تاريخ الأمر</label><input value="${fD(po.order_date)}" readonly></div>
      <div class="fg"><label>تاريخ الاستلام</label><input value="${po.received_date ? fD(po.received_date) : '—'}" readonly></div>
    </div>
    ${po.notes ? `<div class="fg"><label>ملاحظات</label><input value="${po.notes}" readonly></div>` : ''}
    <div class="card-hd" style="margin-top:14px">المنتجات</div>
    <div class="po-items-list">
      <table>
        <thead><tr><th>المنتج</th><th>الكمية</th><th>التكلفة</th><th>المجموع</th></tr></thead>
        <tbody>${(po.items || []).map(it => `<tr><td>${it.name}</td><td>${it.quantity}</td><td>${fC(it.cost)}</td><td style="color:var(--amber);font-weight:600">${fC(it.quantity * it.cost)}</td></tr>`).join('')}</tbody>
      </table>
    </div>
    <div style="text-align:left;margin-top:16px;padding-top:12px;border-top:1px solid var(--line);font-family:var(--f-d);font-size:1.15rem;color:#fff">الإجمالي: ${fC(po.total_amount)}</div>
    <div class="modal-ft">
      <button class="btn b-ghost" onclick="closeM()">إغلاق</button>
      ${po.status === 'pending' ? `<button class="btn b-teal" onclick="receivePO(${po.id})">✓ استلام الأمر</button>` : ''}
    </div>`);
};

const receivePO = id => {
  modal(`<div class="modal-t">استلام أمر الشراء #${id}</div>
    <p style="color:var(--muted);font-size:.82rem;margin-bottom:18px">سيتم زيادة المخزون لجميع المنتجات وتسجيل حركات شراء.</p>
    <div class="modal-ft">
      <button class="btn b-ghost" onclick="closeM()">إلغاء</button>
      <button class="btn b-teal" onclick="doReceivePO(${id})">تأكيد الاستلام</button>
    </div>`);
};

const doReceivePO = id => {
  const pos = G('purchase_orders') || [];
  const po = pos.find(x => x.id === id);
  if (!po) return;

  const prods = G('products') || [];
  (po.items || []).forEach(it => {
    const pIdx = prods.findIndex(p => p.id === it.productId);
    if (pIdx !== -1) {
      const before = prods[pIdx].stock;
      prods[pIdx].stock = before + it.quantity;
      const oldValue = before * (prods[pIdx].cost || 0);
      const newValue = it.quantity * it.cost;
      if (prods[pIdx].stock > 0) {
        prods[pIdx].cost = Math.round((oldValue + newValue) / prods[pIdx].stock);
      }
      logMovement(it.productId, 'purchase', it.quantity, before, prods[pIdx].stock, id, `أمر شراء #${id}`);
    }
  });
  S('products', prods);

  UP('purchase_orders', id, { status: 'received', received_date: new Date().toISOString() });
  addA(`استلام أمر شراء #${id}`, '#00bfa5');
  toast('✓ تم استلام الأمر وتحديث المخزون');
  closeM();
  renderPOs();
};

const cancelPO = id => {
  modal(`<div class="modal-t">إلغاء أمر الشراء #${id}</div>
    <p style="color:var(--muted);font-size:.82rem;margin-bottom:18px">هل أنت متأكد؟</p>
    <div class="modal-ft">
      <button class="btn b-ghost" onclick="closeM()">تراجع</button>
      <button class="btn b-rose" onclick="doCancelPO(${id})">إلغاء الأمر</button>
    </div>`);
};

const doCancelPO = id => {
  UP('purchase_orders', id, { status: 'cancelled' });
  addA(`إلغاء أمر شراء #${id}`, '#e84060');
  toast('✓ تم إلغاء الأمر');
  closeM();
  renderPOs();
};

/* --- Stock Take --- */
let currentStockTakeId = null;

const renderStockTakes = () => {
  const sts = G('stock_takes') || [];
  const list = document.getElementById('stList');
  if (!sts.length) { list.innerHTML = '<div class="empty-state"><div class="empty-state-ic">🔍</div><div>لا توجد جرود سابقة</div></div>'; return; }
  const sorted = [...sts].sort((a, b) => new Date(b.date) - new Date(a.date));
  list.innerHTML = sorted.map(st => {
    const totalItems = (st.items || []).length;
    const diffs = (st.items || []).filter(i => i.difference !== 0).length;
    const statLbl = st.status === 'completed' ? '✓ مكتمل' : '✏ مسودة';
    const statBdg = st.status === 'completed' ? 'b-t' : 'b-a';
    const d = new Date(st.date);
    return `<div class="st-card">
      <div class="st-date-box"><div class="st-date">${d.getDate()}/${d.getMonth() + 1}</div><div class="st-time">${fT(st.date)}</div></div>
      <div class="st-info">
        <div class="st-title">جرد #${st.id} <span class="bdg ${statBdg}">${statLbl}</span></div>
        <div class="st-stats">${totalItems} منتج · ${diffs} اختلاف${st.notes ? ` · ${st.notes}` : ''}</div>
      </div>
      <div class="st-acts">
        <button class="btn b-ghost b-sm" onclick="openStockTakeView(${st.id})">${st.status === 'completed' ? 'عرض' : 'متابعة'}</button>
        ${st.status !== 'completed' ? `<button class="btn b-rose b-sm" onclick="confDel('stock_takes',${st.id},'جرد #${st.id}')">🗑</button>` : ''}
      </div>
    </div>`;
  }).join('');
};

const openStockTakeM = () => {
  const prods = G('products') || [];
  if (!prods.length) { toast('لا توجد منتجات', 'err'); return; }
  const sts = G('stock_takes') || [];
  const newST = {
    id: NI('stock_takes'),
    date: new Date().toISOString(),
    status: 'draft',
    items: prods.map(p => ({ product_id: p.id, expected_quantity: p.stock, actual_quantity: p.stock, difference: 0 })),
    notes: '',
    created_by: CU?.id,
  };
  sts.push(newST);
  S('stock_takes', sts);
  currentStockTakeId = newST.id;
  openStockTakeView(newST.id);
};

const openStockTakeView = id => {
  const st = (G('stock_takes') || []).find(x => x.id === id);
  if (!st) return;
  currentStockTakeId = id;
  const prods = G('products') || [];
  const readonly = st.status === 'completed';

  modalWide(`<div class="modal-t">جرد المخزون #${st.id} ${readonly ? '(مكتمل)' : '(مسودة)'}</div>
    <div class="fg"><label>ملاحظات</label><input id="stNotes" value="${st.notes || ''}" ${readonly ? 'readonly' : ''}></div>
    <div class="st-take-grid header">
      <div>المنتج</div><div>المتوقع</div><div>الفعلي</div><div>الفرق</div><div>نسبة</div>
    </div>
    <div id="stItemsList" style="max-height:420px;overflow-y:auto;">
      ${(st.items || []).map(it => {
        const p = prods.find(x => x.id === it.product_id);
        if (!p) return '';
        const diff = it.actual_quantity - it.expected_quantity;
        const diffClass = diff > 0 ? 'plus' : (diff < 0 ? 'minus' : 'zero');
        const pct = it.expected_quantity ? Math.round((diff / it.expected_quantity) * 100) : 0;
        return `<div class="st-take-grid">
          <div style="color:var(--fog)">${p.emoji || ''} ${p.name}</div>
          <div style="text-align:center;color:var(--muted)">${it.expected_quantity}</div>
          <div>${readonly ? `<div style="text-align:center;color:#fff;font-weight:700">${it.actual_quantity}</div>` : `<input type="number" value="${it.actual_quantity}" onchange="stUpdateItem(${it.product_id},this.value)">`}</div>
          <div class="st-diff ${diffClass}" id="stDiff_${it.product_id}">${diff > 0 ? '+' : ''}${diff}</div>
          <div style="text-align:center;color:var(--muted);font-size:.7rem">${pct}%</div>
        </div>`;
      }).join('')}
    </div>
    <div class="modal-ft">
      <button class="btn b-ghost" onclick="closeM()">إغلاق</button>
      ${readonly ? '' : `
        <button class="btn b-ghost" onclick="saveStockTakeDraft(${id})">حفظ كمسودة</button>
        <button class="btn b-amber" onclick="completeStockTake(${id})">إكمال الجرد</button>
      `}
    </div>`);
};

const stUpdateItem = (productId, value) => {
  const st = (G('stock_takes') || []).find(x => x.id === currentStockTakeId);
  if (!st) return;
  const item = st.items.find(i => i.product_id === productId);
  if (!item) return;
  item.actual_quantity = parseInt(value) || 0;
  item.difference = item.actual_quantity - item.expected_quantity;
  UP('stock_takes', currentStockTakeId, { items: st.items });
  const diff = item.difference;
  const diffEl = document.getElementById(`stDiff_${productId}`);
  if (diffEl) {
    diffEl.className = `st-diff ${diff > 0 ? 'plus' : (diff < 0 ? 'minus' : 'zero')}`;
    diffEl.textContent = `${diff > 0 ? '+' : ''}${diff}`;
  }
};

const saveStockTakeDraft = id => {
  UP('stock_takes', id, { notes: document.getElementById('stNotes').value.trim() });
  toast('✓ تم حفظ المسودة');
  closeM();
  renderStockTakes();
};

const completeStockTake = id => {
  const st = (G('stock_takes') || []).find(x => x.id === id);
  if (!st) return;
  const diffCount = st.items.filter(i => i.difference !== 0).length;
  modal(`<div class="modal-t">إكمال الجرد</div>
    <p style="color:var(--muted);font-size:.82rem;margin-bottom:12px">سيتم:</p>
    <ul style="color:var(--dim);font-size:.82rem;margin:0 22px 18px;line-height:1.8;">
      <li>تعديل مخزون ${diffCount} منتج</li>
      <li>تسجيل حركات جرد للمنتجات المختلفة</li>
      <li>جعل الجرد غير قابل للتعديل</li>
    </ul>
    <div class="modal-ft">
      <button class="btn b-ghost" onclick="closeM()">تراجع</button>
      <button class="btn b-amber" onclick="doCompleteStockTake(${id})">تأكيد الإكمال</button>
    </div>`);
};

const doCompleteStockTake = id => {
  const st = (G('stock_takes') || []).find(x => x.id === id);
  if (!st) return;
  const prods = G('products') || [];
  (st.items || []).forEach(it => {
    if (it.difference === 0) return;
    const pIdx = prods.findIndex(p => p.id === it.product_id);
    if (pIdx !== -1) {
      const before = prods[pIdx].stock;
      prods[pIdx].stock = it.actual_quantity;
      logMovement(it.product_id, 'stocktake', it.difference, before, it.actual_quantity, id, `جرد #${id}`);
    }
  });
  S('products', prods);
  UP('stock_takes', id, {
    status: 'completed',
    notes: document.getElementById('stNotes').value.trim(),
    completed_at: new Date().toISOString()
  });
  addA(`إكمال جرد #${id}`, '#a855f7');
  toast('✓ تم إكمال الجرد بنجاح');
  closeM();
  renderStockTakes();
};

/* --- Inventory Reports --- */
let cTrend = null, cInvValue = null;

const runInvReports = () => {
  const dfrom = document.getElementById('repDateFrom').value || null;
  const dto = document.getElementById('repDateTo').value || null;

  const prods = G('products') || [];
  const movs = G('stock_movements') || [];
  const filtered = movs.filter(m => {
    if (dfrom && m.created_at < dfrom) return false;
    if (dto && m.created_at > dto + 'T23:59:59') return false;
    return true;
  });

  const totalValue = prods.reduce((s, p) => s + (p.stock || 0) * (p.cost || 0), 0);
  const totalRetailValue = prods.reduce((s, p) => s + (p.stock || 0) * (p.price || 0), 0);
  const totalItems = prods.reduce((s, p) => s + (p.stock || 0), 0);
  const lowCount = prods.filter(p => p.stock <= p.minStock).length;

  document.getElementById('invRepStats').innerHTML = `
    <div class="stat s-teal"><div class="st-v">${fC(totalValue)}</div><div class="st-l">قيمة المخزون (تكلفة)</div></div>
    <div class="stat s-amber"><div class="st-v">${fC(totalRetailValue)}</div><div class="st-l">قيمة المخزون (بيع)</div></div>
    <div class="stat s-sky"><div class="st-v">${totalItems.toLocaleString('ar-IQ')}</div><div class="st-l">إجمالي الوحدات</div></div>
    <div class="stat s-rose"><div class="st-v">${lowCount}</div><div class="st-l">منتجات منخفضة</div></div>`;

  const salesMap = {};
  filtered.filter(m => m.type === 'sale').forEach(m => {
    salesMap[m.product_id] = (salesMap[m.product_id] || 0) + Math.abs(m.quantity);
  });
  const topSellers = Object.entries(salesMap).sort((a, b) => b[1] - a[1]).slice(0, 5);
  document.getElementById('topSellers').innerHTML = topSellers.length ? topSellers.map(([pid, qty], i) => {
    const p = prods.find(x => x.id === parseInt(pid));
    return `<div class="ir-rank-item"><div class="ir-rank-num">${i + 1}</div><div class="ir-rank-nm">${p ? p.emoji + ' ' + p.name : '—'}</div><div class="ir-rank-val">${qty}</div></div>`;
  }).join('') : '<div style="color:var(--muted);text-align:center;padding:20px;font-size:.8rem">لا توجد بيانات</div>';

  const dmgMap = {};
  filtered.filter(m => m.type === 'damage').forEach(m => {
    dmgMap[m.product_id] = (dmgMap[m.product_id] || 0) + Math.abs(m.quantity);
  });
  const topDmg = Object.entries(dmgMap).sort((a, b) => b[1] - a[1]).slice(0, 5);
  document.getElementById('topDamaged').innerHTML = topDmg.length ? topDmg.map(([pid, qty], i) => {
    const p = prods.find(x => x.id === parseInt(pid));
    return `<div class="ir-rank-item"><div class="ir-rank-num">${i + 1}</div><div class="ir-rank-nm">${p ? p.emoji + ' ' + p.name : '—'}</div><div class="ir-rank-val" style="color:var(--rose)">${qty}</div></div>`;
  }).join('') : '<div style="color:var(--muted);text-align:center;padding:20px;font-size:.8rem">لا توجد بيانات تلف</div>';

  const top5Ids = topSellers.slice(0, 5).map(([pid]) => parseInt(pid));
  const days = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  const dayLabels = days.map(d => new Date(d).toLocaleDateString('ar-IQ', { day: 'numeric', month: 'short' }));
  const datasets = top5Ids.map((pid, idx) => {
    const colors = ['#f0a500', '#00bfa5', '#e05c2a', '#3d9cf0', '#a855f7'];
    const p = prods.find(x => x.id === pid);
    const data = days.map(day =>
      filtered.filter(m => m.product_id === pid && m.type === 'sale' && m.created_at.startsWith(day))
        .reduce((s, m) => s + Math.abs(m.quantity), 0)
    );
    return { label: p ? p.name : '—', data, borderColor: colors[idx], backgroundColor: 'transparent', borderWidth: 2, tension: 0.4, pointRadius: 2 };
  });

  const ctx = document.getElementById('cTrend').getContext('2d');
  if (cTrend) cTrend.destroy();
  if (datasets.length) {
    cTrend = new Chart(ctx, {
      type: 'line',
      data: { labels: dayLabels, datasets },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { color: '#8892a4', font: { family: 'IBM Plex Sans Arabic' }, padding: 8, boxWidth: 12 } } },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#4a5168', font: { family: 'IBM Plex Sans Arabic', size: 10 } } },
          y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#4a5168', font: { family: 'IBM Plex Sans Arabic' } } }
        }
      }
    });
  }

  const catValue = {};
  prods.forEach(p => {
    const c = p.category || 'أخرى';
    catValue[c] = (catValue[c] || 0) + (p.stock || 0) * (p.cost || 0);
  });
  const ctx2 = document.getElementById('cInvValue').getContext('2d');
  if (cInvValue) cInvValue.destroy();
  cInvValue = new Chart(ctx2, {
    type: 'doughnut',
    data: { labels: Object.keys(catValue), datasets: [{ data: Object.values(catValue), backgroundColor: ['#f0a500', '#00bfa5', '#e05c2a', '#3d9cf0', '#a855f7'], borderColor: '#1e2330', borderWidth: 3 }] },
    options: { responsive: true, maintainAspectRatio: false, cutout: '65%', plugins: { legend: { position: 'bottom', labels: { color: '#8892a4', font: { family: 'IBM Plex Sans Arabic' }, padding: 10 } } } }
  });
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
   11. FINANCIAL REPORTS
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

const renderReportsOverview = () => {
  const inv = (G('invoices') || []).filter(i => i.status !== 'cancelled'), ords = G('orders') || [];
  const tR = inv.reduce((s, i) => s + (i.grandTotal || 0), 0);
  const tD = inv.filter(i => i.date && i.date.startsWith(td())).reduce((s, i) => s + (i.grandTotal || 0), 0);
  const avg = inv.length ? Math.round(tR / inv.length) : 0;

  let statsHtml = `
    <div class="stat s-teal"><div class="st-v">${fC(tR)}</div><div class="st-l">إجمالي الإيرادات</div></div>
    <div class="stat s-amber"><div class="st-v">${inv.length}</div><div class="st-l">إجمالي الفواتير</div></div>
    <div class="stat s-ember"><div class="st-v">${fC(avg)}</div><div class="st-l">متوسط الفاتورة</div></div>
    <div class="stat s-sky"><div class="st-v">${fC(tD)}</div><div class="st-l">مبيعات اليوم</div></div>`;

  if (can('manageExpenses')) {
    const exp = G('expenses') || [];
    const tExp = exp.reduce((s, e) => s + (e.amount || 0), 0);
    const profit = tR - tExp;
    statsHtml = `
      <div class="stat s-teal"><div class="st-v">${fC(tR)}</div><div class="st-l">إجمالي الإيرادات</div></div>
      <div class="stat s-rose"><div class="st-v">${fC(tExp)}</div><div class="st-l">إجمالي المصروفات</div></div>
      <div class="stat s-amber"><div class="st-v">${fC(profit)}</div><div class="st-l">صافي الربح</div></div>
      <div class="stat s-sky"><div class="st-v">${fC(tD)}</div><div class="st-l">مبيعات اليوم</div></div>`;
  }
  document.getElementById('repSt').innerHTML = statsHtml;

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

  const srt = [...inv].sort((a, b) => new Date(b.date) - new Date(a.date));
  const pm = { cash: 'نقداً', card: 'بطاقة', online: 'أونلاين' };
  document.getElementById('invLst').innerHTML = srt.length ? srt.slice(0, 15).map(i => `<div class="inv-row"><div><div class="inv-id">فاتورة #${i.id} — طاولة ${i.tableNumber || '—'}</div><div class="inv-m">${fT(i.date)} · ${fD(i.date)}</div></div><div style="text-align:left"><div class="inv-amt">${fC(i.grandTotal)}</div><span class="bdg b-m" style="font-size:.62rem">${pm[i.paymentMethod] || '—'}</span></div></div>`).join('')
    : '<div style="color:var(--muted);font-size:.77rem;text-align:center;padding:18px">لا توجد فواتير</div>';
};

const renderAllInvoices = () => {
  const inv = G('invoices') || [];
  const srt = [...inv].sort((a, b) => new Date(b.date) - new Date(a.date));
  const pm = { cash: 'نقداً', card: 'بطاقة', online: 'أونلاين' };
  document.getElementById('allInvLst').innerHTML = srt.length ? srt.map(i => {
    const cancelled = i.status === 'cancelled';
    return `<div class="inv-row">
      <div>
        <div class="inv-id">فاتورة #${i.id} — طاولة ${i.tableNumber || '—'} ${cancelled ? '<span class="bdg b-r">ملغاة</span>' : ''}</div>
        <div class="inv-m">${fT(i.date)} · ${fD(i.date)} · ${pm[i.paymentMethod] || '—'}</div>
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
  toast('تم حفظ الإعدادات');
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
  const sups = G('suppliers') || [];
  const data = prods.map(p => {
    const sup = sups.find(s => s.id === p.supplier_id);
    return {
      'الاسم': p.name,
      'SKU': p.sku || '',
      'الفئة': p.category || '',
      'المورد': sup?.name || '',
      'سعر البيع': p.price || 0,
      'التكلفة': p.cost || 0,
      'المخزون': p.stock || 0,
      'الحد الأدنى': p.minStock || 0,
      'قيمة المخزون': (p.stock || 0) * (p.cost || 0),
      'تاريخ الصلاحية': p.expiry_date || '',
    };
  });
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
    const sups = G('suppliers') || [];
    const rows = prods.map(p => {
      const sup = sups.find(s => s.id === p.supplier_id);
      return [
        p.name,
        p.sku || '-',
        p.category || '-',
        sup?.name || '-',
        (p.price || 0).toLocaleString(),
        (p.cost || 0).toLocaleString(),
        p.stock || 0,
        p.minStock || 0,
        ((p.stock || 0) * (p.cost || 0)).toLocaleString(),
      ];
    });

    doc.autoTable({
      head: [['Name', 'SKU', 'Category', 'Supplier', 'Price', 'Cost', 'Stock', 'Min', 'Value']],
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
