/* ═══════════════════════════════════════════════════════════════
   RESTROHUB — Premium Luxury Edition
═══════════════════════════════════════════════════════════════ */

/* ───── STORAGE HELPERS ───────────────────────────────────────── */
const G = k => { try { const d = localStorage.getItem(k); return d ? JSON.parse(d) : null; } catch { return null; } };
const S = (k, v) => {
  try { localStorage.setItem(k, JSON.stringify(v)); }
  catch (e) {
    if (e.name === 'QuotaExceededError') toast('مساحة التخزين ممتلئة', 'err');
    else console.error(e);
  }
};
const NI = c => { const a = G(c) || []; return a.length ? Math.max(...a.map(i => i.id || 0)) + 1 : 1; };
const UP = (c, id, d) => { const a = G(c) || []; const i = a.findIndex(x => x.id === id); if (i !== -1) { a[i] = { ...a[i], ...d }; S(c, a); return true; } return false; };
const DL = (c, id) => S(c, (G(c) || []).filter(x => x.id !== id));

const td = () => new Date().toISOString().split('T')[0];
const fT = iso => iso ? new Date(iso).toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' }) : '';
const fD = iso => iso ? new Date(iso).toLocaleDateString('ar-IQ') : '';
const fC = n => { const i = G('ri') || {}; return `${Number(n || 0).toLocaleString('ar-IQ')} ${i.currency || 'ل.ع'}`; };
const escapeHtml = s => String(s || '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

const ic = (name, size = 16) => `<i data-lucide="${name}" style="width:${size}px;height:${size}px;"></i>`;
const refreshIcons = () => { if (window.lucide) window.lucide.createIcons(); };

const addA = (txt, color = '#D4AF37') => {
  const a = G('act') || [];
  a.unshift({ txt, time: new Date().toISOString(), color, userId: CU?.id });
  if (a.length > 50) a.pop();
  S('act', a);
};

/* ───── SEED ──────────────────────────────────────────────────── */
const seed = () => {
  if (G('rh_v6')) return;
  S('ri', { name: 'مطعم الأصيل', currency: 'ل.ع', tax: 10, phone: '+964 770 000 0000', address: 'بغداد' });
  S('tables', [
    { id: 1, number: 1, capacity: 2, status: 'free', sessionId: null, x: 120, y: 100, shape: 'square' },
    { id: 2, number: 2, capacity: 4, status: 'free', sessionId: null, x: 300, y: 100, shape: 'square' },
    { id: 3, number: 3, capacity: 4, status: 'free', sessionId: null, x: 490, y: 100, shape: 'round' },
    { id: 4, number: 4, capacity: 6, status: 'free', sessionId: null, x: 120, y: 320, shape: 'rect' },
    { id: 5, number: 5, capacity: 4, status: 'free', sessionId: null, x: 370, y: 320, shape: 'round' },
    { id: 6, number: 6, capacity: 2, status: 'free', sessionId: null, x: 560, y: 320, shape: 'square' },
  ]);
  S('products', [
    { id: 1, code: '001', name: 'شاورما دجاج', cost: 12000, price: 25000, image: null, category: 'رئيسي' },
    { id: 2, code: '002', name: 'بطاطا مقلية', cost: 5000, price: 15000, image: null, category: 'جانبي' },
    { id: 3, code: '003', name: 'كوكاكولا', cost: 2000, price: 5000, image: null, category: 'مشروبات' },
    { id: 4, code: '004', name: 'كنافة', cost: 5000, price: 12000, image: null, category: 'حلويات' },
    { id: 5, code: '005', name: 'شيش طاووق', cost: 15000, price: 30000, image: null, category: 'رئيسي' },
    { id: 6, code: '006', name: 'عصير طازج', cost: 2500, price: 7000, image: null, category: 'مشروبات' },
  ]);
  S('users', [
    { id: 1, name: 'المدير العام', email: 'admin@example.com', password: '123456', role: 'manager' },
    { id: 2, name: 'أحمد الكاشير', email: 'cashier@example.com', password: '123456', role: 'cashier' },
    { id: 3, name: 'محمد النادل', email: 'waiter@example.com', password: '123456', role: 'waiter' },
    { id: 4, name: 'الشيف علي', email: 'kitchen@example.com', password: '123456', role: 'kitchen' },
  ]);
  S('sessions', []); S('orders', []); S('invoices', []); S('expenses', []);
  S('reservations', [
    { id: 1, customerName: 'أبو علي', phone: '07701234567', tableId: 3, date: td(), time: '13:00', guests: 4, status: 'confirmed', notes: '' },
    { id: 2, customerName: 'أم حسين', phone: '07709876543', tableId: 5, date: td(), time: '19:30', guests: 2, status: 'pending', notes: 'طاولة هادئة' },
  ]);
  S('act', [{ txt: 'تم تهيئة النظام', time: new Date().toISOString(), color: '#2DD4BF' }]);
  S('rh_v6', true);
};

/* ───── AUTH & PERMISSIONS ────────────────────────────────────── */
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

const quickLogin = em => {
  document.getElementById('lemail').value = em;
  document.getElementById('lpass').value = '123456';
  doLogin();
};

const doLogin = () => {
  const em = document.getElementById('lemail').value.trim(), pw = document.getElementById('lpass').value;
  const u = (G('users') || []).find(x => x.email === em && x.password === pw);
  if (u) {
    CU = u;
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('mainApp').classList.add('on');
    buildSidebar(); setupUI();
    go(PERMS[CU.role].screens[0]);
  } else {
    document.getElementById('lerr').textContent = 'البريد أو كلمة المرور غير صحيحة';
  }
};
const doLogout = () => {
  CU = null;
  document.getElementById('mainApp').classList.remove('on');
  document.getElementById('loginScreen').style.display = 'flex';
};

const setupUI = () => {
  if (!CU) return;
  const rA = { manager: 'مدير', cashier: 'كاشير', waiter: 'نادل', kitchen: 'مطبخ' };
  document.getElementById('uNm').textContent = CU.name;
  document.getElementById('uRl').textContent = rA[CU.role] || CU.role;
  document.getElementById('uAv').textContent = CU.name[0];
  const i = G('ri') || {};
  document.getElementById('sbRn').textContent = i.name || '—';
};

const buildSidebar = () => {
  const nav = document.getElementById('sbNav');
  const items = [
    { id: 'dashboard', lbl: 'لوحة التحكم', ic: 'layout-dashboard', sec: 'الرئيسية' },
    { id: 'tables', lbl: 'الطاولات', ic: 'grid-3x3', sec: 'التشغيل' },
    { id: 'kitchen', lbl: 'المطبخ', ic: 'utensils', sec: 'التشغيل' },
    { id: 'products', lbl: 'المنتجات', ic: 'package', sec: 'الإدارة' },
    { id: 'reservations', lbl: 'الحجوزات', ic: 'calendar-days', sec: 'الإدارة' },
    { id: 'reports', lbl: 'التقارير', ic: 'bar-chart-3', sec: 'الإدارة' },
    { id: 'settings', lbl: 'الإعدادات', ic: 'settings', sec: 'الإدارة' },
  ];
  let html = '', lastSec = null;
  items.forEach(it => {
    if (!canSee(it.id)) return;
    if (it.sec !== lastSec) { html += `<div class="nav-section">${it.sec}</div>`; lastSec = it.sec; }
    html += `<button class="nav-item" onclick="go('${it.id}')"><i data-lucide="${it.ic}"></i><span>${it.lbl}</span></button>`;
  });
  nav.innerHTML = html;
  refreshIcons();
};

/* ───── NAVIGATION ────────────────────────────────────────────── */
const go = id => {
  if (!canSee(id)) { toast('لا صلاحية للوصول', 'err'); return; }
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
  document.getElementById(id)?.classList.add('active');
  document.querySelector(`.nav-item[onclick="go('${id}')"]`)?.classList.add('active');
  if (window.innerWidth <= 640) {
    document.getElementById('sidebar').classList.remove('show');
    document.getElementById('mobileOverlay').classList.remove('show');
  }
  const renderers = {
    dashboard: renderDash, tables: renderFloorPlan, kitchen: renderKitchen,
    products: renderProds, reservations: renderRes, reports: renderReports, settings: renderSet
  };
  (renderers[id] || Function)();
};

const toggleMobileNav = () => {
  document.getElementById('sidebar').classList.toggle('show');
  document.getElementById('mobileOverlay').classList.toggle('show');
};

/* ───── TOAST & MODAL ─────────────────────────────────────────── */
const toastIconMap = { ok: 'check-circle', err: 'alert-circle', info: 'info' };
const toast = (msg, type = 'ok') => {
  const c = document.getElementById('toasts');
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.innerHTML = `${ic(toastIconMap[type] || 'info', 16)}<span>${escapeHtml(msg)}</span>`;
  c.appendChild(t);
  refreshIcons();
  setTimeout(() => t.remove(), 3100);
};

const modal = html => {
  document.getElementById('mBox').innerHTML = html;
  document.getElementById('mBox').classList.remove('wide');
  document.getElementById('mBg').style.display = 'flex';
  refreshIcons();
};
const modalWide = html => {
  document.getElementById('mBox').innerHTML = html;
  document.getElementById('mBox').classList.add('wide');
  document.getElementById('mBg').style.display = 'flex';
  refreshIcons();
};
const closeM = () => {
  document.getElementById('mBg').style.display = 'none';
  document.getElementById('mBox').classList.remove('wide');
};

const confDel = (col, id, nm) => modal(`
  <div class="modal-title">تأكيد الحذف</div>
  <div class="modal-subtitle">سيتم حذف <strong style="color:var(--text)">${escapeHtml(nm)}</strong> نهائياً ولا يمكن التراجع.</div>
  <div class="modal-footer">
    <button class="btn btn-ghost" onclick="closeM()">إلغاء</button>
    <button class="btn btn-danger" onclick="doDel('${col}',${id})">${ic('trash-2')}<span>حذف</span></button>
  </div>`);

const doDel = (col, id) => {
  DL(col, id); toast('تم الحذف'); closeM();
  const r = { products: renderProds, reservations: renderRes, users: renderUsrs, expenses: renderExpenses };
  (r[col] || Function)();
};

/* ───── INIT EVENT LISTENERS ──────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('mBg').addEventListener('click', e => {
    if (e.target === document.getElementById('mBg')) closeM();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeM(); closePOS(); }
  });
  document.getElementById('lpass').addEventListener('keydown', e => {
    if (e.key === 'Enter') doLogin();
  });
  document.addEventListener('click', e => {
    const btn = e.target.closest('.btn, .btn-primary-cta');
    if (btn) {
      const rect = btn.getBoundingClientRect();
      btn.style.setProperty('--ripple-x', ((e.clientX - rect.left) / rect.width * 100) + '%');
      btn.style.setProperty('--ripple-y', ((e.clientY - rect.top) / rect.height * 100) + '%');
    }
  });
  refreshIcons();
});

/* ───── DASHBOARD ─────────────────────────────────────────────── */
let cS = null;

const buildStat = (color, icon, value, label) => `
  <div class="stat-card c-${color}">
    <div class="stat-icon-wrap">${ic(icon, 20)}</div>
    <div class="stat-value">${value}</div>
    <div class="stat-label">${label}</div>
  </div>`;

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
    const prods = G('products') || [];
    let tProfit = 0;
    tOrd.forEach(o => (o.items || []).forEach(it => {
      const p = prods.find(x => x.id === it.productId);
      if (p) tProfit += ((p.price || 0) - (p.cost || 0)) * it.qty;
    }));
    tProfit -= tExp;
    statsHtml = buildStat('gold', 'trending-up', fC(tRev), 'مبيعات اليوم') +
                buildStat('red', 'receipt', fC(tExp), 'مصروفات اليوم') +
                buildStat('teal', 'wallet', fC(tProfit), 'صافي الربح') +
                buildStat('blue', 'clipboard-list', tOrd.length, 'طلبات اليوم');
  } else {
    statsHtml = buildStat('gold', 'trending-up', fC(tRev), 'مبيعات اليوم') +
                buildStat('teal', 'clipboard-list', tOrd.length, 'طلبات اليوم') +
                buildStat('blue', 'users', `${occ}/${tbls.length}`, 'طاولات مشغولة') +
                buildStat('purple', 'file-text', tInv.length, 'فواتير اليوم');
  }
  document.getElementById('dashStats').innerHTML = statsHtml;
  refreshIcons();

  document.getElementById('dDate').textContent = new Date().toLocaleDateString('ar-IQ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const days = [], sales = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const ds = d.toISOString().split('T')[0];
    days.push(d.toLocaleDateString('ar-IQ', { weekday: 'short', day: 'numeric' }));
    sales.push(inv.filter(v => v.date && v.date.startsWith(ds)).reduce((s, v) => s + (v.grandTotal || 0), 0));
  }
  const ctx = document.getElementById('cSales').getContext('2d');
  if (cS) cS.destroy();

  const gradient = ctx.createLinearGradient(0, 0, 0, 240);
  gradient.addColorStop(0, 'rgba(212, 175, 55, 0.22)');
  gradient.addColorStop(1, 'rgba(212, 175, 55, 0)');

  cS = new Chart(ctx, {
    type: 'line',
    data: { labels: days, datasets: [{
      data: sales,
      borderColor: '#D4AF37',
      backgroundColor: gradient,
      borderWidth: 2.5,
      tension: 0.42,
      fill: true,
      pointBackgroundColor: '#D4AF37',
      pointRadius: 5,
      pointHoverRadius: 7,
      pointBorderColor: '#0B0E14',
      pointBorderWidth: 2,
    }] },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { backgroundColor: '#131722', titleColor: '#FFD700', bodyColor: '#FFFFFF', borderColor: 'rgba(212,175,55,0.2)', borderWidth: 1, padding: 12, cornerRadius: 10, titleFont: { family: 'Cairo', size: 12 }, bodyFont: { family: 'Inter', size: 13 } } },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.03)', drawBorder: false }, ticks: { color: '#8E9AAF', font: { family: 'Cairo', size: 11 } } },
        y: { grid: { color: 'rgba(255,255,255,0.03)', drawBorder: false }, ticks: { color: '#8E9AAF', font: { family: 'Inter' } } }
      }
    }
  });

  const acts = G('act') || [];
  document.getElementById('actFd').innerHTML = acts.length
    ? acts.slice(0, 8).map(a => `
        <div class="activity-item">
          <div class="activity-dot" style="background:${a.color}"></div>
          <div style="flex:1;min-width:0;">
            <div class="activity-text">${escapeHtml(a.txt)}</div>
            <div class="activity-time">${fT(a.time)} · ${fD(a.time)}</div>
          </div>
        </div>`).join('')
    : '<div style="text-align:center;padding:32px 0;color:var(--text-3);font-size:13px;">لا توجد نشاطات</div>';
};

/* ───── FLOOR PLAN ────────────────────────────────────────────── */
let fpCanvas = null, fpSelectedId = null, fpTimer = null;

const renderFloorPlan = () => {
  const tools = document.getElementById('fpTools');
  let toolsHtml = '';
  if (can('addTable')) toolsHtml += `<button class="btn btn-gold btn-sm" onclick="openAddTableM()">${ic('plus')}<span>إضافة طاولة</span></button>`;
  toolsHtml += `<button class="btn btn-ghost btn-sm" onclick="renderFloorPlan()">${ic('refresh-cw')}<span>تحديث</span></button>`;
  tools.innerHTML = toolsHtml;

  const tbls = G('tables') || [];
  const fr = tbls.filter(t => t.status === 'free').length;
  const oc = tbls.filter(t => t.status === 'occupied').length;
  document.getElementById('tblSum').textContent = `متاحة: ${fr} · مشغولة: ${oc} · إجمالي: ${tbls.length}`;
  document.getElementById('fpInfo').innerHTML = can('editLayout')
    ? `<b>اسحب</b> لترتيب · اضغط للتحديد`
    : `اضغط على طاولة للخيارات`;

  const container = document.getElementById('fpBox');
  const cw = Math.max(container.clientWidth - 20, 700);
  const ch = 560;
  const canvasEl = document.getElementById('fpCanvas');
  canvasEl.width = cw; canvasEl.height = ch;

  if (fpCanvas) fpCanvas.dispose();
  fpCanvas = new fabric.Canvas('fpCanvas', { selection: false, backgroundColor: 'transparent', preserveObjectStacking: true });
  fpCanvas.setDimensions({ width: cw, height: ch });

  drawAllTables();

  fpCanvas.on('mouse:down', e => {
    if (!e.target) { fpClearSelection(); return; }
    if (e.target.tableId) fpSelectTable(e.target.tableId);
  });
  fpCanvas.on('object:modified', e => {
    if (!can('editLayout')) return;
    if (e.target.tableGroupId) UP('tables', e.target.tableGroupId, { x: e.target.left, y: e.target.top });
  });

  refreshIcons();

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
    fpCanvas.add(buildTableGroup(t, s, t.id === prevSel));
  });
  fpCanvas.renderAll();
};

const buildTableGroup = (t, session, isSelected) => {
  const statusColor = { free: '#2DD4BF', occupied: '#D4AF37', reserved: '#60A5FA' }[t.status] || '#8E9AAF';
  const objects = [];
  const capacity = t.capacity || 4;

  const chairFill = '#2A2416';
  const chairStroke = '#1A1610';
  const chairHighlight = '#3D3420';
  const chairSize = 20;

  const tableFill = '#5D3A1E';
  const tableEdge = '#3D2614';
  const tableShine = '#7A5232';

  if (t.shape === 'round') {
    const tableRadius = 44;
    const chairDistance = tableRadius + 24;

    for (let i = 0; i < capacity; i++) {
      const angle = (i / capacity) * Math.PI * 2 - Math.PI / 2;
      const cx = Math.cos(angle) * chairDistance;
      const cy = Math.sin(angle) * chairDistance;
      objects.push(new fabric.Rect({ left: cx + 1, top: cy + 2, width: chairSize, height: chairSize, rx: 6, ry: 6, fill: 'rgba(0,0,0,0.5)', originX: 'center', originY: 'center' }));
      objects.push(new fabric.Rect({ left: cx, top: cy, width: chairSize, height: chairSize, rx: 6, ry: 6, fill: chairFill, stroke: chairStroke, strokeWidth: 1.5, originX: 'center', originY: 'center' }));
      objects.push(new fabric.Rect({ left: cx, top: cy - chairSize/2 + 3, width: chairSize - 4, height: 2, fill: chairHighlight, originX: 'center', originY: 'center', opacity: 0.6 }));
      const backAngle = angle + Math.PI;
      const backDist = chairSize / 2 + 1;
      objects.push(new fabric.Rect({
        left: cx + Math.cos(backAngle) * backDist,
        top: cy + Math.sin(backAngle) * backDist,
        width: chairSize - 6, height: 3,
        fill: chairStroke, originX: 'center', originY: 'center',
        angle: (angle * 180 / Math.PI) + 90,
      }));
    }

    objects.push(new fabric.Circle({ left: 3, top: 5, radius: tableRadius, fill: 'rgba(0,0,0,0.55)', originX: 'center', originY: 'center' }));
    objects.push(new fabric.Circle({ left: 0, top: 0, radius: tableRadius + 2, fill: 'transparent', stroke: statusColor, strokeWidth: 1, opacity: 0.25, originX: 'center', originY: 'center' }));
    objects.push(new fabric.Circle({ left: 0, top: 0, radius: tableRadius, fill: tableFill, stroke: statusColor, strokeWidth: 2.5, originX: 'center', originY: 'center' }));
    objects.push(new fabric.Circle({ left: 0, top: 0, radius: tableRadius - 7, fill: 'transparent', stroke: tableEdge, strokeWidth: 1, opacity: 0.6, originX: 'center', originY: 'center' }));
    objects.push(new fabric.Circle({ left: 0, top: 0, radius: tableRadius - 14, fill: 'transparent', stroke: tableEdge, strokeWidth: 1, opacity: 0.4, originX: 'center', originY: 'center' }));
    objects.push(new fabric.Circle({ left: -10, top: -12, radius: tableRadius - 20, fill: tableShine, opacity: 0.2, originX: 'center', originY: 'center' }));

  } else if (t.shape === 'rect') {
    const tw = 150, th = 74;
    const chairsPerSide = Math.ceil(capacity / 2);
    const remaining = capacity - chairsPerSide;

    for (let i = 0; i < chairsPerSide; i++) {
      const cx = -tw / 2 + (tw / (chairsPerSide + 1)) * (i + 1);
      objects.push(new fabric.Rect({ left: cx + 1, top: -th/2 - 16 + 2, width: chairSize, height: chairSize, rx: 6, ry: 6, fill: 'rgba(0,0,0,0.5)', originX: 'center', originY: 'center' }));
      objects.push(new fabric.Rect({ left: cx, top: -th / 2 - 16, width: chairSize, height: chairSize, rx: 6, ry: 6, fill: chairFill, stroke: chairStroke, strokeWidth: 1.5, originX: 'center', originY: 'center' }));
      objects.push(new fabric.Rect({ left: cx, top: -th / 2 - 7, width: chairSize - 6, height: 3, fill: chairStroke, originX: 'center', originY: 'center' }));
    }
    for (let i = 0; i < remaining; i++) {
      const cx = -tw / 2 + (tw / (remaining + 1)) * (i + 1);
      objects.push(new fabric.Rect({ left: cx + 1, top: th/2 + 16 + 2, width: chairSize, height: chairSize, rx: 6, ry: 6, fill: 'rgba(0,0,0,0.5)', originX: 'center', originY: 'center' }));
      objects.push(new fabric.Rect({ left: cx, top: th / 2 + 16, width: chairSize, height: chairSize, rx: 6, ry: 6, fill: chairFill, stroke: chairStroke, strokeWidth: 1.5, originX: 'center', originY: 'center' }));
      objects.push(new fabric.Rect({ left: cx, top: th / 2 + 7, width: chairSize - 6, height: 3, fill: chairStroke, originX: 'center', originY: 'center' }));
    }

    objects.push(new fabric.Rect({ left: 3, top: 5, width: tw, height: th, rx: 10, ry: 10, fill: 'rgba(0,0,0,0.55)', originX: 'center', originY: 'center' }));
    objects.push(new fabric.Rect({ left: 0, top: 0, width: tw, height: th, rx: 10, ry: 10, fill: tableFill, stroke: statusColor, strokeWidth: 2.5, originX: 'center', originY: 'center' }));
    objects.push(new fabric.Line([-tw / 2 + 16, -8, tw / 2 - 16, -8], { stroke: tableEdge, strokeWidth: 1, opacity: 0.5 }));
    objects.push(new fabric.Line([-tw / 2 + 16, 8, tw / 2 - 16, 8], { stroke: tableEdge, strokeWidth: 1, opacity: 0.5 }));
    objects.push(new fabric.Rect({ left: 0, top: -th / 4, width: tw - 16, height: 8, rx: 4, ry: 4, fill: tableShine, opacity: 0.15, originX: 'center', originY: 'center' }));

  } else {
    const ts = 80;
    const chairCount = Math.min(capacity, 4);
    const positions = [
      { x: 0, y: -ts / 2 - 16 }, { x: 0, y: ts / 2 + 16 },
      { x: -ts / 2 - 16, y: 0 }, { x: ts / 2 + 16, y: 0 },
    ];
    for (let i = 0; i < chairCount; i++) {
      const pos = positions[i];
      objects.push(new fabric.Rect({ left: pos.x + 1, top: pos.y + 2, width: chairSize, height: chairSize, rx: 6, ry: 6, fill: 'rgba(0,0,0,0.5)', originX: 'center', originY: 'center' }));
      objects.push(new fabric.Rect({ left: pos.x, top: pos.y, width: chairSize, height: chairSize, rx: 6, ry: 6, fill: chairFill, stroke: chairStroke, strokeWidth: 1.5, originX: 'center', originY: 'center' }));
      const dirX = pos.x === 0 ? 0 : (pos.x > 0 ? -1 : 1);
      const dirY = pos.y === 0 ? 0 : (pos.y > 0 ? -1 : 1);
      objects.push(new fabric.Rect({
        left: pos.x + dirX * (chairSize / 2 + 1),
        top: pos.y + dirY * (chairSize / 2 + 1),
        width: dirX ? 3 : chairSize - 6,
        height: dirY ? 3 : chairSize - 6,
        fill: chairStroke, originX: 'center', originY: 'center',
      }));
    }

    objects.push(new fabric.Rect({ left: 3, top: 5, width: ts, height: ts, rx: 8, ry: 8, fill: 'rgba(0,0,0,0.55)', originX: 'center', originY: 'center' }));
    objects.push(new fabric.Rect({ left: 0, top: 0, width: ts, height: ts, rx: 8, ry: 8, fill: tableFill, stroke: statusColor, strokeWidth: 2.5, originX: 'center', originY: 'center' }));
    objects.push(new fabric.Line([-ts / 2 + 12, 0, ts / 2 - 12, 0], { stroke: tableEdge, strokeWidth: 1, opacity: 0.5 }));
    objects.push(new fabric.Rect({ left: -ts / 4, top: -ts / 4, width: ts / 3, height: 5, rx: 2, ry: 2, fill: tableShine, opacity: 0.2, originX: 'center', originY: 'center' }));
  }

  objects.push(new fabric.Text(String(t.number), {
    left: 0, top: -4,
    fontSize: 24, fontFamily: 'Playfair Display, serif', fontWeight: '800',
    fill: '#FFFFFF', originX: 'center', originY: 'center',
    shadow: 'rgba(0,0,0,0.7) 0 2px 3px',
  }));
  objects.push(new fabric.Text(`${t.capacity} · Seats`, {
    left: 0, top: 16,
    fontSize: 9, fontFamily: 'Inter, sans-serif', fontWeight: '500',
    fill: 'rgba(255,255,255,0.65)', originX: 'center', originY: 'center',
    charSpacing: 50,
  }));

  if (t.status === 'occupied' && session) {
    const diff = Math.floor((Date.now() - new Date(session.startTime)) / 1000);
    const h = Math.floor(diff / 3600), m = Math.floor((diff % 3600) / 60);
    const timeStr = `${h ? h + 'h ' : ''}${m}m`;
    const topOffset = t.shape === 'round' ? -80 : (t.shape === 'rect' ? -70 : -76);
    objects.push(new fabric.Rect({
      left: 0, top: topOffset, width: 72, height: 24, rx: 12, ry: 12,
      fill: '#D4AF37', stroke: '#FFD700', strokeWidth: 0.5,
      originX: 'center', originY: 'center',
      shadow: 'rgba(212,175,55,0.4) 0 4px 12px',
    }));
    objects.push(new fabric.Text(`● ${timeStr}`, {
      left: 0, top: topOffset,
      fontSize: 11, fontFamily: 'Inter, sans-serif', fontWeight: '700',
      fill: '#0B0E14', originX: 'center', originY: 'center',
    }));
  }

  if (isSelected) {
    const ringR = t.shape === 'round' ? 74 : (t.shape === 'rect' ? 100 : 64);
    objects.push(new fabric.Circle({
      left: 0, top: 0, radius: ringR,
      fill: 'transparent', stroke: '#D4AF37', strokeWidth: 2, strokeDashArray: [6, 5],
      originX: 'center', originY: 'center', opacity: 0.9,
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
  let info = `${stLbl} · ${t.capacity} أشخاص`;
  if (s) {
    const diff = Math.floor((Date.now() - new Date(s.startTime)) / 1000);
    const h = Math.floor(diff / 3600), m = Math.floor((diff % 3600) / 60);
    info += ` · منذ ${h ? h + 'س ' : ''}${m}د · ${fC(s.total || 0)}`;
  }
  document.getElementById('fpSpInfo').textContent = info;

  let actsHtml = '';
  if (t.status === 'free') {
    if (can('startSession')) actsHtml += `<button class="btn btn-teal btn-sm" onclick="startSess(${t.id})">${ic('play')}<span>بدء جلسة</span></button>`;
    if (can('addOrder')) actsHtml += `<button class="btn btn-ghost btn-sm" onclick="openPOS(${t.id},false)">${ic('plus')}<span>إضافة طلب</span></button>`;
  } else if (t.status === 'occupied') {
    if (can('addOrder')) actsHtml += `<button class="btn btn-teal btn-sm" onclick="openPOS(${t.id},false)">${ic('plus')}<span>طلب</span></button>`;
    if (can('pay')) actsHtml += `<button class="btn btn-gold btn-sm" onclick="openPOS(${t.id},true)">${ic('credit-card')}<span>تسديد</span></button>`;
    if (can('endSession') && !can('pay')) actsHtml += `<button class="btn btn-blue btn-sm" onclick="requestBill(${t.id})">${ic('receipt')}<span>طلب الفاتورة</span></button>`;
  }
  if (can('editLayout')) actsHtml += `<button class="btn btn-ghost btn-sm" onclick="openEditTableM(${t.id})">${ic('edit-3')}<span>تعديل</span></button>`;
  if (can('deleteTable') && t.status === 'free') actsHtml += `<button class="btn btn-danger btn-sm" onclick="confirmDelTable(${t.id})">${ic('trash-2')}<span>حذف</span></button>`;

  document.getElementById('fpSpActs').innerHTML = actsHtml;
  document.getElementById('fpSelPanel').classList.add('on');
  refreshIcons();
};

const fpClearSelection = () => {
  fpSelectedId = null;
  document.getElementById('fpSelPanel').classList.remove('on');
  drawAllTables();
};

const openAddTableM = () => {
  const tbls = G('tables') || [];
  const nextNum = tbls.length ? Math.max(...tbls.map(t => t.number)) + 1 : 1;
  modal(`
    <div class="modal-title">إضافة طاولة جديدة</div>
    <div class="modal-subtitle">حدد مواصفات الطاولة ثم اسحبها في الخريطة</div>
    <div class="form-row">
      <div class="input-group"><label>رقم الطاولة</label><div class="input-wrap"><input type="number" id="ntNum" value="${nextNum}"></div></div>
      <div class="input-group"><label>السعة</label><div class="input-wrap"><input type="number" id="ntCap" value="4" min="1"></div></div>
    </div>
    <div class="input-group"><label>الشكل</label><div class="input-wrap">
      <select id="ntShape">
        <option value="square">مربع</option>
        <option value="rect">مستطيل</option>
        <option value="round">دائري</option>
      </select>
    </div></div>
    <div class="modal-footer">
      <button class="btn btn-ghost" onclick="closeM()">إلغاء</button>
      <button class="btn btn-gold" onclick="addTable()">${ic('plus')}<span>إضافة</span></button>
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
  addA(`إضافة طاولة ${num}`, '#2DD4BF');
  toast('تمت الإضافة'); closeM(); renderFloorPlan();
};

const openEditTableM = id => {
  const t = (G('tables') || []).find(x => x.id === id);
  if (!t) return;
  modal(`
    <div class="modal-title">تعديل طاولة ${t.number}</div>
    <div class="form-row">
      <div class="input-group"><label>الرقم</label><div class="input-wrap"><input type="number" id="etNum" value="${t.number}"></div></div>
      <div class="input-group"><label>السعة</label><div class="input-wrap"><input type="number" id="etCap" value="${t.capacity}" min="1"></div></div>
    </div>
    <div class="input-group"><label>الشكل</label><div class="input-wrap">
      <select id="etShape">
        <option value="square" ${t.shape === 'square' ? 'selected' : ''}>مربع</option>
        <option value="rect" ${t.shape === 'rect' ? 'selected' : ''}>مستطيل</option>
        <option value="round" ${t.shape === 'round' ? 'selected' : ''}>دائري</option>
      </select>
    </div></div>
    <div class="modal-footer">
      <button class="btn btn-ghost" onclick="closeM()">إلغاء</button>
      <button class="btn btn-gold" onclick="saveEditTable(${id})">${ic('save')}<span>حفظ</span></button>
    </div>`);
};
const saveEditTable = id => {
  UP('tables', id, {
    number: parseInt(document.getElementById('etNum').value),
    capacity: parseInt(document.getElementById('etCap').value),
    shape: document.getElementById('etShape').value,
  });
  toast('تم التعديل'); closeM(); renderFloorPlan();
};

const confirmDelTable = id => {
  const t = (G('tables') || []).find(x => x.id === id);
  modal(`
    <div class="modal-title">حذف طاولة ${t?.number}</div>
    <div class="modal-subtitle">هل أنت متأكد؟ لا يمكن التراجع عن هذا الإجراء.</div>
    <div class="modal-footer">
      <button class="btn btn-ghost" onclick="closeM()">إلغاء</button>
      <button class="btn btn-danger" onclick="doDelTable(${id})">${ic('trash-2')}<span>حذف</span></button>
    </div>`);
};
const doDelTable = id => {
  const t = (G('tables') || []).find(x => x.id === id);
  DL('tables', id);
  addA(`حذف طاولة ${t?.number}`, '#F04F4F');
  toast('تم الحذف'); closeM(); fpClearSelection(); renderFloorPlan();
};

/* ───── SESSIONS ──────────────────────────────────────────────── */
const startSess = id => {
  if (!can('startSession')) { toast('لا صلاحية', 'err'); return; }
  const tbls = G('tables') || [], t = tbls.find(x => x.id === id);
  if (!t || t.status !== 'free') { toast('الطاولة غير متاحة', 'err'); return; }
  const sess = G('sessions') || [];
  const s = { id: NI('sessions'), tableId: id, startTime: new Date().toISOString(), lastOrderTime: null, total: 0, staffId: CU?.id };
  sess.push(s); S('sessions', sess);
  UP('tables', id, { status: 'occupied', sessionId: s.id });
  addA(`بدء جلسة طاولة ${t.number}`, '#2DD4BF');
  toast(`تم بدء جلسة الطاولة ${t.number}`);
  renderFloorPlan();
  setTimeout(() => fpSelectTable(id), 100);
};

const endSess = tableId => {
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
  addA(`تسديد طاولة ${t.number} — ${fC(grand)}`, '#D4AF37');
  toast(`تم التسديد: ${fC(grand)}`);
  closePOS(); fpClearSelection(); renderFloorPlan();
};

const requestBill = tableId => {
  const t = (G('tables') || []).find(x => x.id === tableId);
  addA(`طلب فاتورة طاولة ${t?.number}`, '#60A5FA');
  toast('تم إرسال طلب الفاتورة للكاشير');
};

/* ───── POS ───────────────────────────────────────────────────── */
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
  if (chk) mb.innerHTML = `${ic('credit-card')}<span>تسديد نقداً</span>`;
  else mb.innerHTML = `${ic('send')}<span>إرسال للمطبخ</span>`;
  document.getElementById('posSearch').value = '';
  renderPProds(''); renderPOrd();
  document.getElementById('posPanel').style.display = 'flex';
  refreshIcons();
};
const closePOS = () => {
  document.getElementById('posPanel').style.display = 'none';
  pTbl = null; pItm = {};
};

let currentPosCat = '';
const renderPProds = cat => {
  if (cat !== undefined) currentPosCat = cat;
  const pr = G('products') || [];
  const search = (document.getElementById('posSearch')?.value || '').toLowerCase();
  const cats = [...new Set(pr.map(p => p.category))];

  document.getElementById('pCats').innerHTML =
    `<button class="cat-pill${!currentPosCat ? ' on' : ''}" onclick="renderPProds('')">الكل</button>` +
    cats.map(c => `<button class="cat-pill${currentPosCat === c ? ' on' : ''}" onclick="renderPProds('${escapeHtml(c)}')">${escapeHtml(c)}</button>`).join('');

  let lst = currentPosCat ? pr.filter(p => p.category === currentPosCat) : pr;
  if (search) lst = lst.filter(p => p.name.toLowerCase().includes(search) || (p.code || '').includes(search));

  document.getElementById('pGrid').innerHTML = lst.length ? lst.map(p => {
    const img = p.image
      ? `<img src="${p.image}" alt="">`
      : `<i data-lucide="image-off" class="no-img"></i>`;
    return `<div class="pos-product" onclick="addOrd(${p.id})">
      <div class="pos-product-img">${img}</div>
      <div class="pos-product-body">
        <div class="pos-product-code">${escapeHtml(p.code || '—')}</div>
        <div class="pos-product-name">${escapeHtml(p.name)}</div>
        <div class="pos-product-price">${fC(p.price)}</div>
      </div>
    </div>`;
  }).join('') : `<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-3);font-size:13px;">${ic('search-x', 36)}<div style="margin-top:12px;">لا توجد منتجات</div></div>`;
  refreshIcons();
};

const addOrd = id => {
  const p = (G('products') || []).find(x => x.id === id);
  if (!p) return;
  pItm[id] ? pItm[id].qty++ : (pItm[id] = { ...p, qty: 1 });
  const cartHdr = document.querySelector('.cart-header');
  if (cartHdr) {
    cartHdr.classList.remove('bump');
    void cartHdr.offsetWidth;
    cartHdr.classList.add('bump');
  }
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
        html += `<div class="cart-item old"><div class="cart-item-name">${escapeHtml(it.name)}</div><div class="qty-num">×${it.qty}</div><div class="cart-item-sub">${fC(it.price * it.qty)}</div></div>`;
      }));
    }
  }
  if (newItems.length) {
    html += newItems.map(x => `
      <div class="cart-item">
        <div class="cart-item-name">${escapeHtml(x.name)}</div>
        <div class="qty-ctrl">
          <button class="qty-btn" onclick="chgQ(${x.id},-1)">${ic('minus', 12)}</button>
          <span class="qty-num">${x.qty}</span>
          <button class="qty-btn" onclick="chgQ(${x.id},1)">${ic('plus', 12)}</button>
        </div>
        <div class="cart-item-sub">${fC(x.price * x.qty)}</div>
      </div>`).join('');
  }
  if (!html) html = `<div class="cart-empty">${ic('shopping-bag', 36)}<div style="margin-top:10px;">اضغط على منتج لإضافته</div></div>`;
  el.innerHTML = html;
  refreshIcons();

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
    items: it.map(x => ({ productId: x.id, name: x.name, qty: x.qty, price: x.price, cost: x.cost, code: x.code })),
    total: tot, status: 'pending',
    orderTime: new Date().toISOString(), staffId: CU?.id
  });
  S('orders', ords);
  UP('sessions', s.id, { total: (s.total || 0) + tot, lastOrderTime: new Date().toISOString() });
  addA(`طلب — طاولة ${uT.number} (${it.length} أصناف)`, '#A78BFA');
  toast(`تم إرسال ${it.length} صنف للمطبخ`);
  closePOS(); renderFloorPlan();
};

const checkout = () => {
  if (!pTbl) return;
  const t = (G('tables') || []).find(x => x.id === pTbl);
  if (!t || t.status !== 'occupied') { toast('لا توجد جلسة نشطة', 'err'); return; }
  if (Object.keys(pItm).length > 0) { toast('أرسل الطلب الحالي للمطبخ أولاً', 'err'); return; }
  endSess(pTbl);
};

/* ───── KITCHEN ───────────────────────────────────────────────── */
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
      return `<div class="kitchen-ticket ${isLate ? 'late' : ''}">
        <div class="ticket-header">
          <div>
            <div class="ticket-table">طاولة ${o.tableNumber || '—'}</div>
            <div class="ticket-elapsed">${em}:${String(es).padStart(2,'0')}</div>
          </div>
          <div class="ticket-time">${fT(o.orderTime)}</div>
        </div>
        <div class="ticket-body">
          ${(o.items || []).map(it => `<div class="ticket-item"><span class="ticket-item-name">${escapeHtml(it.name)}</span><span class="ticket-qty">×${it.qty}</span></div>`).join('')}
        </div>
        <div class="ticket-footer">
          <span class="ticket-status">${ic(isLate ? 'alert-triangle' : 'clock')}${isLate ? 'متأخر' : 'قيد التحضير'}</span>
          ${can('markReady') ? `<button class="btn btn-teal btn-sm" onclick="mReady(${o.id})">${ic('check')}<span>جاهز</span></button>` : ''}
        </div>
      </div>`;
    }).join('') : `<div class="kitchen-empty">${ic('utensils-crossed', 56)}<div>لا توجد طلبات معلقة</div></div>`;
    refreshIcons();
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
  addA(`طلب #${id} — جاهز`, '#2DD4BF');
  toast('الطلب جاهز للتقديم');
  renderKitchen();
};

/* ───── PRODUCTS ──────────────────────────────────────────────── */
const compressImage = (file, maxW = 500, maxH = 500, quality = 0.82) =>
  new Promise((resolve, reject) => {
    if (!file) return reject('No file');
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        let w = img.width, h = img.height;
        if (w > maxW || h > maxH) {
          const r = Math.min(maxW / w, maxH / h);
          w = Math.round(w * r); h = Math.round(h * r);
        }
        const c = document.createElement('canvas');
        c.width = w; c.height = h;
        c.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(c.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => reject('Invalid image');
      img.src = e.target.result;
    };
    reader.onerror = () => reject('Read error');
    reader.readAsDataURL(file);
  });

const renderProds = () => {
  const pr = G('products') || [];
  const cats = [...new Set(pr.map(p => p.category))];
  const catSel = document.getElementById('prodFilterCat');
  if (catSel) {
    const cur = catSel.value;
    catSel.innerHTML = `<option value="">كل الفئات</option>` + cats.map(c => `<option value="${escapeHtml(c)}" ${c === cur ? 'selected' : ''}>${escapeHtml(c)}</option>`).join('');
  }
  const search = (document.getElementById('prodSearch')?.value || '').toLowerCase();
  const fcat = document.getElementById('prodFilterCat')?.value || '';
  let filtered = pr.filter(p => {
    if (search && !p.name.toLowerCase().includes(search) && !(p.code || '').toLowerCase().includes(search)) return false;
    if (fcat && p.category !== fcat) return false;
    return true;
  });

  const body = document.getElementById('prodBd');
  if (!filtered.length) {
    body.innerHTML = `<tr><td colspan="8"><div class="empty-state">${ic('package-x', 48)}<div class="empty-state-title">لا توجد منتجات</div></div></td></tr>`;
    refreshIcons();
    return;
  }
  body.innerHTML = filtered.map(p => {
    const profit = (p.price || 0) - (p.cost || 0);
    const margin = p.price ? Math.round((profit / p.price) * 100) : 0;
    const img = p.image ? `<img src="${p.image}" alt="">` : ic('image-off');
    return `<tr>
      <td><span class="prod-code">${escapeHtml(p.code || '—')}</span></td>
      <td><div class="prod-thumb">${img}</div></td>
      <td><div class="prod-name">${escapeHtml(p.name)}</div></td>
      <td><span class="badge badge-muted">${escapeHtml(p.category || '—')}</span></td>
      <td class="prod-num" style="color:var(--text-2)">${(p.cost || 0).toLocaleString()}</td>
      <td class="prod-num" style="color:var(--gold);font-weight:700;">${(p.price || 0).toLocaleString()}</td>
      <td class="prod-num"><strong style="color:var(--teal);">${profit.toLocaleString()}</strong><div style="font-size:11px;color:var(--text-3);margin-top:2px;">${margin}%</div></td>
      <td><div style="display:flex;gap:6px;justify-content:flex-end;">
        <button class="btn btn-ghost btn-sm" onclick="openProdM(${p.id})">${ic('edit-3')}</button>
        <button class="btn btn-danger btn-sm" onclick="confDel('products',${p.id},'${escapeHtml(p.name).replace(/'/g,"\\'")}')">${ic('trash-2')}</button>
      </div></td>
    </tr>`;
  }).join('');
  refreshIcons();
};

let tempImageData = null;

const openProdM = (id = null) => {
  const pr = G('products') || [];
  const p = id ? pr.find(x => x.id === id) : null;
  tempImageData = p?.image || null;
  const cats = ['رئيسي', 'جانبي', 'مشروبات', 'حلويات', 'مقبلات'];
  let nextCode = p?.code || '';
  if (!id) {
    const maxCode = pr.reduce((max, x) => { const n = parseInt(x.code || '0'); return n > max ? n : max; }, 0);
    nextCode = String(maxCode + 1).padStart(3, '0');
  }

  modalWide(`
    <div class="modal-title">${p ? 'تعديل منتج' : 'إضافة منتج جديد'}</div>
    <div class="modal-subtitle">املأ بيانات المنتج واختر صورة للعرض</div>

    <div style="display:grid;grid-template-columns:220px 1fr;gap:24px;">
      <div>
        <label style="display:block;font-size:12px;font-weight:600;color:var(--text-2);margin-bottom:8px;">صورة المنتج</label>
        <div class="img-upload ${tempImageData ? 'has-img' : ''}" id="imgBox" onclick="document.getElementById('imgFile').click()">
          ${tempImageData
            ? `<img src="${tempImageData}" alt=""><button class="img-remove" onclick="removeProdImage(event)">${ic('x')}</button>`
            : `<div class="img-placeholder">${ic('upload-cloud', 32)}<div class="img-placeholder-text">اختر صورة</div><div class="img-placeholder-hint">JPG / PNG · حتى 2MB</div></div>`}
        </div>
        <input type="file" id="imgFile" accept="image/*" style="display:none" onchange="handleProdImage(event)">
      </div>

      <div>
        <div class="form-row">
          <div class="input-group"><label>رقم المنتج</label><div class="input-wrap"><input id="pCode" value="${escapeHtml(nextCode)}" placeholder="001"></div></div>
          <div class="input-group"><label>الفئة</label><div class="input-wrap"><select id="pCat">${cats.map(c => `<option value="${c}" ${p?.category === c ? 'selected' : ''}>${c}</option>`).join('')}</select></div></div>
        </div>
        <div class="input-group"><label>اسم المنتج</label><div class="input-wrap"><input id="pN" value="${escapeHtml(p?.name || '')}" placeholder="مثال: شاورما دجاج"></div></div>
        <div class="form-row">
          <div class="input-group"><label>سعر التكلفة</label><div class="input-wrap"><input type="number" id="pC" value="${p?.cost || ''}" placeholder="0"></div></div>
          <div class="input-group"><label>سعر البيع</label><div class="input-wrap"><input type="number" id="pP" value="${p?.price || ''}" placeholder="0"></div></div>
        </div>
      </div>
    </div>

    <div class="modal-footer">
      <button class="btn btn-ghost" onclick="closeM()">إلغاء</button>
      <button class="btn btn-gold" onclick="saveProd(${id || 'null'})">${ic('save')}<span>حفظ</span></button>
    </div>`);
};

const handleProdImage = async e => {
  const file = e.target.files[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) { toast('حجم الصورة كبير (الحد 2MB)', 'err'); return; }
  try {
    tempImageData = await compressImage(file);
    const box = document.getElementById('imgBox');
    box.classList.add('has-img');
    box.innerHTML = `<img src="${tempImageData}" alt=""><button class="img-remove" onclick="removeProdImage(event)">${ic('x')}</button>`;
    refreshIcons();
    toast('تم تحميل الصورة');
  } catch {
    toast('فشل تحميل الصورة', 'err');
  }
};

const removeProdImage = e => {
  e.stopPropagation();
  tempImageData = null;
  const box = document.getElementById('imgBox');
  box.classList.remove('has-img');
  box.innerHTML = `<div class="img-placeholder">${ic('upload-cloud', 32)}<div class="img-placeholder-text">اختر صورة</div><div class="img-placeholder-hint">JPG / PNG · حتى 2MB</div></div>`;
  document.getElementById('imgFile').value = '';
  refreshIcons();
};

const saveProd = id => {
  const name = document.getElementById('pN').value.trim();
  const code = document.getElementById('pCode').value.trim();
  if (!name) { toast('أدخل اسم المنتج', 'err'); return; }
  if (!code) { toast('أدخل رقم المنتج', 'err'); return; }
  const existing = (G('products') || []).find(x => x.code === code && x.id !== id);
  if (existing) { toast(`الرقم ${code} مستخدم مسبقاً`, 'err'); return; }
  const d = {
    code, name,
    cost: parseFloat(document.getElementById('pC').value) || 0,
    price: parseFloat(document.getElementById('pP').value) || 0,
    category: document.getElementById('pCat').value,
    image: tempImageData,
  };
  if (id) { UP('products', id, d); toast('تم التعديل'); }
  else { const a = G('products') || []; a.push({ id: NI('products'), ...d }); S('products', a); toast('تمت الإضافة'); }
  addA(`${id ? 'تعديل' : 'إضافة'} منتج: ${name}`, '#A78BFA');
  tempImageData = null;
  closeM();
  renderProds();
};

/* ───── RESERVATIONS ──────────────────────────────────────────── */
const renderRes = () => {
  const res = G('reservations') || [], tbls = G('tables') || [];
  const el = document.getElementById('resLst');
  if (!res.length) {
    el.innerHTML = `<div class="empty-state">${ic('calendar-x', 48)}<div class="empty-state-title">لا توجد حجوزات</div></div>`;
    refreshIcons();
    return;
  }
  const srt = [...res].sort((a, b) => a.date > b.date ? 1 : a.date < b.date ? -1 : a.time > b.time ? 1 : -1);
  const scls = { confirmed: 'badge-teal', pending: 'badge-gold', cancelled: 'badge-red' };
  const slbl = { confirmed: 'مؤكد', pending: 'معلق', cancelled: 'ملغي' };
  el.innerHTML = srt.map(r => {
    const t = tbls.find(x => x.id === r.tableId);
    return `<div class="reservation-card">
      <div class="res-time-box">
        <div class="res-time">${r.time}</div>
        <div class="res-date">${r.date}</div>
      </div>
      <div class="res-info">
        <div class="res-name">${escapeHtml(r.customerName)}</div>
        <div class="res-meta">
          <span>${ic('phone', 12)} ${escapeHtml(r.phone)}</span>
          <span>${ic('armchair', 12)} ${t ? 'طاولة ' + t.number : '—'}</span>
          <span>${ic('users', 12)} ${r.guests}</span>
          ${r.notes ? `<span>${ic('file-text', 12)} ${escapeHtml(r.notes)}</span>` : ''}
        </div>
      </div>
      <div class="res-actions">
        <span class="badge ${scls[r.status] || 'badge-muted'}">${slbl[r.status] || r.status}</span>
        <div style="display:flex;gap:6px;">
          <button class="btn btn-ghost btn-sm" onclick="openResM(${r.id})">${ic('edit-3')}</button>
          <button class="btn btn-danger btn-sm" onclick="confDel('reservations',${r.id},'${escapeHtml(r.customerName).replace(/'/g,"\\'")}')">${ic('trash-2')}</button>
        </div>
      </div>
    </div>`;
  }).join('');
  refreshIcons();
};

const openResM = (id = null) => {
  const res = G('reservations') || [], tbls = G('tables') || [], r = id ? res.find(x => x.id === id) : null;
  modal(`
    <div class="modal-title">${r ? 'تعديل الحجز' : 'حجز جديد'}</div>
    <div class="modal-subtitle">املأ بيانات العميل ووقت الحجز</div>
    <div class="form-row">
      <div class="input-group"><label>اسم العميل</label><div class="input-wrap"><input id="rN" value="${escapeHtml(r?.customerName || '')}"></div></div>
      <div class="input-group"><label>الهاتف</label><div class="input-wrap"><input id="rPh" value="${escapeHtml(r?.phone || '')}"></div></div>
    </div>
    <div class="form-row">
      <div class="input-group"><label>التاريخ</label><div class="input-wrap"><input type="date" id="rD" value="${r?.date || td()}"></div></div>
      <div class="input-group"><label>الوقت</label><div class="input-wrap"><input type="time" id="rT" value="${r?.time || '12:00'}"></div></div>
    </div>
    <div class="form-row">
      <div class="input-group"><label>الطاولة</label><div class="input-wrap"><select id="rTb">${tbls.map(t => `<option value="${t.id}" ${r?.tableId === t.id ? 'selected' : ''}>طاولة ${t.number}</option>`).join('')}</select></div></div>
      <div class="input-group"><label>عدد الأشخاص</label><div class="input-wrap"><input type="number" id="rG" value="${r?.guests || 2}" min="1"></div></div>
    </div>
    <div class="form-row">
      <div class="input-group"><label>الحالة</label><div class="input-wrap"><select id="rSt"><option value="pending" ${r?.status === 'pending' ? 'selected' : ''}>معلق</option><option value="confirmed" ${r?.status === 'confirmed' ? 'selected' : ''}>مؤكد</option><option value="cancelled" ${r?.status === 'cancelled' ? 'selected' : ''}>ملغي</option></select></div></div>
      <div class="input-group"><label>ملاحظات</label><div class="input-wrap"><input id="rNt" value="${escapeHtml(r?.notes || '')}"></div></div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost" onclick="closeM()">إلغاء</button>
      <button class="btn btn-gold" onclick="saveRes(${id || 'null'})">${ic('save')}<span>حفظ</span></button>
    </div>`);
};

const saveRes = id => {
  const nm = document.getElementById('rN').value.trim();
  if (!nm) { toast('أدخل اسم العميل', 'err'); return; }
  const d = {
    customerName: nm,
    phone: document.getElementById('rPh').value.trim(),
    date: document.getElementById('rD').value,
    time: document.getElementById('rT').value,
    tableId: parseInt(document.getElementById('rTb').value),
    guests: parseInt(document.getElementById('rG').value) || 1,
    status: document.getElementById('rSt').value,
    notes: document.getElementById('rNt').value.trim()
  };
  if (id) { UP('reservations', id, d); toast('تم التعديل'); }
  else { const a = G('reservations') || []; a.push({ id: NI('reservations'), ...d }); S('reservations', a); toast('تمت الإضافة'); }
  closeM(); renderRes();
};

/* ───── REPORTS ───────────────────────────────────────────────── */
let cR = null, currentRepTab = 'overview';

const setReportTab = t => {
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

const calcProductProfits = () => {
  const ords = G('orders') || [], prods = G('products') || [];
  const stats = {};
  ords.forEach(o => (o.items || []).forEach(it => {
    const p = prods.find(x => x.id === it.productId);
    if (!p) return;
    if (!stats[it.productId]) stats[it.productId] = { id: p.id, name: p.name, code: p.code, qtySold: 0, revenue: 0, profit: 0 };
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
  const productStats = calcProductProfits();
  const totalGrossProfit = productStats.reduce((s, x) => s + x.profit, 0);

  let statsHtml;
  if (can('manageExpenses')) {
    const exp = G('expenses') || [];
    const tExp = exp.reduce((s, e) => s + (e.amount || 0), 0);
    const netProfit = totalGrossProfit - tExp;
    statsHtml = buildStat('teal', 'trending-up', fC(tR), 'إجمالي الإيرادات') +
                buildStat('purple', 'package', fC(totalGrossProfit), 'ربح المنتجات') +
                buildStat('red', 'receipt', fC(tExp), 'إجمالي المصروفات') +
                buildStat('gold', 'wallet', fC(netProfit), 'صافي الربح');
  } else {
    statsHtml = buildStat('teal', 'trending-up', fC(tR), 'إجمالي الإيرادات') +
                buildStat('gold', 'file-text', inv.length, 'إجمالي الفواتير') +
                buildStat('blue', 'bar-chart-3', fC(avg), 'متوسط الفاتورة') +
                buildStat('purple', 'calendar', fC(tD), 'مبيعات اليوم');
  }
  document.getElementById('repSt').innerHTML = statsHtml;

  const ords = G('orders') || [], cm = {};
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
      data: { labels: Object.keys(cm), datasets: [{
        data: Object.values(cm),
        backgroundColor: ['#D4AF37', '#2DD4BF', '#60A5FA', '#A78BFA', '#F04F4F', '#FBBF24'],
        borderColor: '#131722', borderWidth: 3
      }] },
      options: { responsive: true, maintainAspectRatio: false, cutout: '68%',
        plugins: { legend: { position: 'bottom', labels: { color: '#8E9AAF', font: { family: 'Cairo', size: 12 }, padding: 14, boxWidth: 12, boxHeight: 12, usePointStyle: true } } }
      }
    });
  }

  const srt = [...inv].sort((a, b) => new Date(b.date) - new Date(a.date));
  document.getElementById('invLst').innerHTML = srt.length
    ? srt.slice(0, 12).map(i => `<div class="invoice-row">
        <div>
          <div class="inv-title">فاتورة #${i.id} · طاولة ${i.tableNumber || '—'}</div>
          <div class="inv-meta">${fT(i.date)} · ${fD(i.date)}</div>
        </div>
        <div class="inv-amount">${fC(i.grandTotal)}</div>
      </div>`).join('')
    : '<div style="text-align:center;padding:24px;color:var(--text-3);font-size:13px;">لا توجد فواتير</div>';

  const byProfit = [...productStats].sort((a, b) => b.profit - a.profit).slice(0, 5);
  document.getElementById('topProfit').innerHTML = byProfit.length
    ? byProfit.map((p, i) => `<div class="rank-item"><div class="rank-num">${i + 1}</div><div class="rank-name">${escapeHtml(p.name)}</div><div class="rank-value">${fC(p.profit)}</div></div>`).join('')
    : '<div style="text-align:center;padding:24px;color:var(--text-3);font-size:13px;">لا توجد بيانات</div>';

  const bySales = [...productStats].sort((a, b) => b.qtySold - a.qtySold).slice(0, 5);
  document.getElementById('topSellers').innerHTML = bySales.length
    ? bySales.map((p, i) => `<div class="rank-item"><div class="rank-num">${i + 1}</div><div class="rank-name">${escapeHtml(p.name)}</div><div class="rank-value">×${p.qtySold}</div></div>`).join('')
    : '<div style="text-align:center;padding:24px;color:var(--text-3);font-size:13px;">لا توجد بيانات</div>';

  refreshIcons();
};

const renderAllInvoices = () => {
  const inv = G('invoices') || [];
  const srt = [...inv].sort((a, b) => new Date(b.date) - new Date(a.date));
  document.getElementById('allInvLst').innerHTML = srt.length ? srt.map(i => {
    const cancelled = i.status === 'cancelled';
    return `<div class="invoice-row">
      <div>
        <div class="inv-title">فاتورة #${i.id} · طاولة ${i.tableNumber || '—'} ${cancelled ? '<span class="badge badge-red">ملغاة</span>' : ''}</div>
        <div class="inv-meta">${fT(i.date)} · ${fD(i.date)} · نقداً</div>
      </div>
      <div style="display:flex;align-items:center;gap:12px;">
        <div class="inv-amount ${cancelled ? 'cancelled' : ''}">${fC(i.grandTotal)}</div>
        ${can('cancelInvoice') && !cancelled ? `<button class="btn btn-danger btn-sm" onclick="cancelInvoice(${i.id})">إلغاء</button>` : ''}
      </div>
    </div>`;
  }).join('') : `<div class="empty-state">${ic('file-x', 48)}<div class="empty-state-title">لا توجد فواتير</div></div>`;
  refreshIcons();
};

const cancelInvoice = id => {
  modal(`
    <div class="modal-title">إلغاء الفاتورة #${id}</div>
    <div class="modal-subtitle">سيتم وضع علامة "ملغاة" على هذه الفاتورة.</div>
    <div class="modal-footer">
      <button class="btn btn-ghost" onclick="closeM()">تراجع</button>
      <button class="btn btn-danger" onclick="doCancelInv(${id})">${ic('x-circle')}<span>إلغاء الفاتورة</span></button>
    </div>`);
};
const doCancelInv = id => {
  UP('invoices', id, { status: 'cancelled', cancelledAt: new Date().toISOString(), cancelledBy: CU?.id });
  addA(`إلغاء فاتورة #${id}`, '#F04F4F');
  toast('تم إلغاء الفاتورة');
  closeM();
  renderAllInvoices();
};

const renderExpenses = () => {
  const exp = G('expenses') || [];
  const srt = [...exp].sort((a, b) => new Date(b.date) - new Date(a.date));
  document.getElementById('expLst').innerHTML = srt.length
    ? srt.map(e => `<div class="expense-row">
        <div>
          <div class="exp-title">${escapeHtml(e.title)}</div>
          <div class="exp-meta">${escapeHtml(e.category || 'عام')} · ${fD(e.date)}${e.notes ? ` · ${escapeHtml(e.notes)}` : ''}</div>
        </div>
        <div style="display:flex;align-items:center;gap:12px;">
          <div class="exp-amount">− ${fC(e.amount)}</div>
          <button class="btn btn-danger btn-sm" onclick="confDel('expenses',${e.id},'${escapeHtml(e.title).replace(/'/g,"\\'")}')">${ic('trash-2')}</button>
        </div>
      </div>`).join('')
    : `<div class="empty-state">${ic('receipt', 48)}<div class="empty-state-title">لا توجد مصروفات مسجلة</div></div>`;
  refreshIcons();
};

const openExpM = () => modal(`
  <div class="modal-title">تسجيل مصروف جديد</div>
  <div class="modal-subtitle">سجّل تفاصيل المصروف لحساب دقيق للأرباح</div>
  <div class="input-group"><label>الوصف</label><div class="input-wrap"><input id="eTi" placeholder="مثال: فاتورة كهرباء"></div></div>
  <div class="form-row">
    <div class="input-group"><label>المبلغ</label><div class="input-wrap"><input type="number" id="eAmt" placeholder="0"></div></div>
    <div class="input-group"><label>الفئة</label><div class="input-wrap"><select id="eCat"><option>عام</option><option>إيجار</option><option>كهرباء/ماء</option><option>رواتب</option><option>مشتريات</option><option>صيانة</option><option>مواصلات</option></select></div></div>
  </div>
  <div class="form-row">
    <div class="input-group"><label>التاريخ</label><div class="input-wrap"><input type="date" id="eDt" value="${td()}"></div></div>
    <div class="input-group"><label>ملاحظات</label><div class="input-wrap"><input id="eNt" placeholder="اختياري"></div></div>
  </div>
  <div class="modal-footer">
    <button class="btn btn-ghost" onclick="closeM()">إلغاء</button>
    <button class="btn btn-gold" onclick="saveExp()">${ic('save')}<span>حفظ</span></button>
  </div>`);

const saveExp = () => {
  const ti = document.getElementById('eTi').value.trim();
  const amt = parseFloat(document.getElementById('eAmt').value);
  if (!ti) { toast('أدخل الوصف', 'err'); return; }
  if (!amt || amt <= 0) { toast('أدخل مبلغاً صحيحاً', 'err'); return; }
  const exp = G('expenses') || [];
  exp.push({ id: NI('expenses'), title: ti, amount: amt, category: document.getElementById('eCat').value, date: document.getElementById('eDt').value, notes: document.getElementById('eNt').value.trim(), createdBy: CU?.id, createdAt: new Date().toISOString() });
  S('expenses', exp);
  addA(`مصروف: ${ti} — ${fC(amt)}`, '#F04F4F');
  toast('تمت الإضافة');
  closeM();
  renderExpenses();
};

/* ───── SETTINGS ──────────────────────────────────────────────── */
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
  S('ri', {
    name: document.getElementById('sNm').value.trim(),
    currency: document.getElementById('sCr').value.trim(),
    tax: parseFloat(document.getElementById('sTx').value) || 0,
    phone: document.getElementById('sPh').value.trim(),
    address: document.getElementById('sAd').value.trim()
  });
  document.getElementById('sbRn').textContent = document.getElementById('sNm').value || '—';
  toast('تم حفظ الإعدادات');
};
const renderUsrs = () => {
  const us = G('users') || [];
  const rA = { manager: 'مدير', cashier: 'كاشير', waiter: 'نادل', kitchen: 'مطبخ' };
  document.getElementById('usrBd').innerHTML = us.map(u => `<tr>
    <td><strong style="color:var(--text)">${escapeHtml(u.name)}</strong></td>
    <td style="color:var(--text-2);font-size:12px;">${escapeHtml(u.email)}</td>
    <td><span class="badge badge-muted">${rA[u.role] || u.role}</span></td>
    <td><div style="display:flex;gap:6px;justify-content:flex-end;">
      ${u.id !== CU?.id
        ? `<button class="btn btn-ghost btn-sm" onclick="openUsrM(${u.id})">${ic('edit-3')}</button><button class="btn btn-danger btn-sm" onclick="confDel('users',${u.id},'${escapeHtml(u.name).replace(/'/g,"\\'")}')">${ic('trash-2')}</button>`
        : '<span style="font-size:11px;color:var(--text-3);">أنت</span>'}
    </div></td>
  </tr>`).join('');
  refreshIcons();
};

const openUsrM = (id = null) => {
  const us = G('users') || [];
  const u = id ? us.find(x => x.id === id) : null;
  modal(`
    <div class="modal-title">${u ? 'تعديل مستخدم' : 'مستخدم جديد'}</div>
    <div class="modal-subtitle">حدد الدور والصلاحيات المناسبة</div>
    <div class="input-group"><label>الاسم الكامل</label><div class="input-wrap"><input id="uNm" value="${escapeHtml(u?.name || '')}"></div></div>
    <div class="input-group"><label>البريد الإلكتروني</label><div class="input-wrap"><input type="email" id="uEm" value="${escapeHtml(u?.email || '')}"></div></div>
    <div class="input-group"><label>كلمة المرور</label><div class="input-wrap"><input type="password" id="uPw" value="${escapeHtml(u?.password || '')}" placeholder="••••••"></div></div>
    <div class="input-group"><label>الدور</label><div class="input-wrap"><select id="uRlSel">
      <option value="manager" ${u?.role === 'manager' ? 'selected' : ''}>مدير — صلاحية كاملة</option>
      <option value="cashier" ${u?.role === 'cashier' ? 'selected' : ''}>كاشير — دفع وتقارير</option>
      <option value="waiter" ${u?.role === 'waiter' ? 'selected' : ''}>نادل — طاولات ومطبخ</option>
      <option value="kitchen" ${u?.role === 'kitchen' ? 'selected' : ''}>مطبخ — فقط الطلبات</option>
    </select></div></div>
    <div class="modal-footer">
      <button class="btn btn-ghost" onclick="closeM()">إلغاء</button>
      <button class="btn btn-gold" onclick="saveUsr(${id || 'null'})">${ic('save')}<span>حفظ</span></button>
    </div>`);
};

const saveUsr = id => {
  const nm = document.getElementById('uNm').value.trim();
  const em = document.getElementById('uEm').value.trim();
  const pw = document.getElementById('uPw').value;
  if (!nm || !em || !pw) { toast('أكمل جميع الحقول', 'err'); return; }
  const us = G('users') || [];
  if (!id && us.find(u => u.email === em)) { toast('البريد مستخدم', 'err'); return; }
  const d = { name: nm, email: em, password: pw, role: document.getElementById('uRlSel').value };
  if (id) { UP('users', id, d); toast('تم التعديل'); }
  else { us.push({ id: NI('users'), ...d }); S('users', us); toast('تمت الإضافة'); }
  closeM(); renderUsrs();
};

const resetAll = () => {
  modal(`
    <div class="modal-title">إعادة الضبط الكامل</div>
    <div class="modal-subtitle">سيتم حذف جميع البيانات نهائياً ولا يمكن التراجع عن هذا الإجراء.</div>
    <div class="modal-footer">
      <button class="btn btn-ghost" onclick="closeM()">إلغاء</button>
      <button class="btn btn-danger" onclick="doResetAll()">${ic('trash-2')}<span>تأكيد الحذف</span></button>
    </div>`);
};
const doResetAll = () => {
  localStorage.clear();
  toast('جارٍ إعادة التحميل...', 'info');
  setTimeout(() => location.reload(), 1200);
};

/* ───── EXPORT UTILITIES ──────────────────────────────────────── */
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
  toast('تم تصدير Excel');
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
      headStyles: { fillColor: [212, 175, 55], textColor: 20 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    doc.save(`RestroHub_Products_${td()}.pdf`);
    toast('تم تصدير PDF');
  } catch (e) {
    console.error(e);
    toast('خطأ في التصدير', 'err');
  }
};

/* ───── BOOT ──────────────────────────────────────────────────── */
seed();
refreshIcons();
