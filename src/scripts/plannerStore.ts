import { PHASES, type Phase } from '../data/phases';
import { DEFAULT_TASKS, type TaskItem } from '../data/defaultTasks';
import { getCookie, setCookie } from '../utils/cookie';

const WEDDING_DATE_ISO = '2026-11-25T18:00:00';
const WEDDING_DAY_START_ISO = '2026-11-25T00:00:00';
const COOKIE_STORAGE_KEY = 'persian_wedding_planner_cookie_v2';
const LOCAL_STORAGE_KEY = 'persian_wedding_planner_4azar_v2';
const ACTIVE_TAB_KEY = 'persian_wedding_active_tab_v2';

let tasks: TaskItem[] = [];
let simulatedNow: string | null = null;
let currentFilterStatus: 'all' | 'focus' | 'pending' | 'completed' = 'all';
let currentOwnerFilter: string = 'all';
let activePhaseTab: string = 'phase-wedding-day'; // در حالت تب‌بندی، پیش‌فرض روی روز عروسی یا فاز فعال باز شود
let toastTimer: any = null;

export function toPersianDigits(n: number | string | undefined | null): string {
  if (n === undefined || n === null) return '';
  const persian = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(n).replace(/[0-9]/g, w => persian[parseInt(w, 10)]);
}

export function escapeHtml(str: string | undefined | null): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function getNow(): Date {
  return simulatedNow ? new Date(simulatedNow) : new Date();
}

/**
 * ذخیره داده‌ها در کوکی مرورگر (Cookie) و به عنوان بک‌آپ در LocalStorage
 */
export function saveTasks(): void {
  try {
    const jsonStr = JSON.stringify(tasks);
    setCookie(COOKIE_STORAGE_KEY, jsonStr, 365);
    localStorage.setItem(LOCAL_STORAGE_KEY, jsonStr);
  } catch (err) {
    console.warn('Failed to save to cookie/storage:', err);
  }
}

/**
 * بازیابی داده‌ها در درجه اول از کوکی مرورگر
 */
export function loadTasks(): TaskItem[] {
  try {
    const cookieData = getCookie(COOKIE_STORAGE_KEY);
    if (cookieData) {
      const parsed = JSON.parse(cookieData);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }

    const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (localData) {
      const parsed = JSON.parse(localData);
      if (Array.isArray(parsed) && parsed.length > 0) {
        setCookie(COOKIE_STORAGE_KEY, localData, 365);
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Error reading from cookie/storage:', err);
  }

  const initial = JSON.parse(JSON.stringify(DEFAULT_TASKS));
  try {
    setCookie(COOKIE_STORAGE_KEY, JSON.stringify(initial), 365);
  } catch (e) {}
  return initial;
}

export function getDaysRemaining(): number {
  const now = getNow();
  const weddingStartOfDay = new Date(WEDDING_DAY_START_ISO);
  const nowStartOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffTime = weddingStartOfDay.getTime() - nowStartOfDay.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

export function getActivePhaseId(): string {
  const d = getDaysRemaining();
  if (d > 3) return 'phase-week';
  if (d >= 2) return 'phase-3days';
  if (d === 1) return 'phase-1day';
  if (d === 0) return 'phase-wedding-day';
  return 'phase-after';
}

export function updateCountdownAndSmartBanner(): void {
  const now = getNow();
  const target = new Date(WEDDING_DATE_ISO);
  const diffMs = target.getTime() - now.getTime();
  const daysRemaining = getDaysRemaining();

  const daysEl = document.getElementById('cd-days');
  const hoursEl = document.getElementById('cd-hours');
  const minsEl = document.getElementById('cd-minutes');
  const badgeEl = document.getElementById('countdown-badge');

  const daysMobileEl = document.getElementById('cd-days-mobile');
  const hoursMobileEl = document.getElementById('cd-hours-mobile');
  const minsMobileEl = document.getElementById('cd-minutes-mobile');
  const badgeMobileEl = document.getElementById('countdown-badge-mobile');

  if (diffMs > 0) {
    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const d = Math.floor(totalMinutes / (60 * 24));
    const h = Math.floor((totalMinutes % (60 * 24)) / 60);
    const m = totalMinutes % 60;

    const dStr = toPersianDigits(d);
    const hStr = toPersianDigits(h);
    const mStr = toPersianDigits(m);

    if (daysEl) daysEl.textContent = dStr;
    if (hoursEl) hoursEl.textContent = hStr;
    if (minsEl) minsEl.textContent = mStr;

    if (daysMobileEl) daysMobileEl.textContent = dStr;
    if (hoursMobileEl) hoursMobileEl.textContent = hStr;
    if (minsMobileEl) minsMobileEl.textContent = mStr;

    let badgeText = '';
    let badgeClass = '';
    let badgeMobileClass = '';
    if (daysRemaining > 3) {
      badgeText = `${toPersianDigits(daysRemaining)} روز مانده`;
      badgeClass = 'inline-block text-xs font-bold px-2.5 py-1 rounded-xl bg-amber-100 text-amber-800';
      badgeMobileClass = 'inline-block text-[10px] font-bold px-2 py-0.5 rounded-lg bg-amber-100 text-amber-900 border border-amber-200';
    } else if (daysRemaining >= 1) {
      badgeText = `فقط ${toPersianDigits(daysRemaining)} روز!`;
      badgeClass = 'inline-block text-xs font-bold px-2.5 py-1 rounded-xl bg-rose-100 text-rose-800 animate-pulse';
      badgeMobileClass = 'inline-block text-[10px] font-bold px-2 py-0.5 rounded-lg bg-rose-100 text-rose-900 border border-rose-300 animate-pulse';
    } else {
      badgeText = `امروز عروسیه! 💍`;
      badgeClass = 'inline-block text-xs font-bold px-2.5 py-1 rounded-xl bg-rose-600 text-white animate-bounce';
      badgeMobileClass = 'inline-block text-[10px] font-bold px-2 py-0.5 rounded-lg bg-rose-600 text-white animate-bounce';
    }

    if (badgeEl) {
      badgeEl.textContent = badgeText;
      badgeEl.className = badgeClass;
    }
    if (badgeMobileEl) {
      badgeMobileEl.textContent = badgeText;
      badgeMobileEl.className = badgeMobileClass;
    }
  } else {
    if (daysEl) daysEl.textContent = '۰';
    if (hoursEl) hoursEl.textContent = '۰';
    if (minsEl) minsEl.textContent = '۰';

    if (daysMobileEl) daysMobileEl.textContent = '۰';
    if (hoursMobileEl) hoursMobileEl.textContent = '۰';
    if (minsMobileEl) minsMobileEl.textContent = '۰';

    const doneText = 'مراسم برگزار شد 💐';
    const doneClass = 'inline-block text-xs font-bold px-2.5 py-1 rounded-xl bg-sage-100 text-sage-800';
    const doneMobileClass = 'inline-block text-[10px] font-bold px-2 py-0.5 rounded-lg bg-sage-100 text-sage-800 border border-sage-200';
    if (badgeEl) {
      badgeEl.textContent = doneText;
      badgeEl.className = doneClass;
    }
    if (badgeMobileEl) {
      badgeMobileEl.textContent = doneText;
      badgeMobileEl.className = doneMobileClass;
    }
  }

  // به‌روزرسانی بنر هوشمند
  let activePhaseId = 'phase-week';
  let smartTitle = '';
  let smartDesc = '';

  if (daysRemaining > 3) {
    activePhaseId = 'phase-week';
    smartTitle = `هفته آخر هماهنگی‌ها (${toPersianDigits(daysRemaining)} روز تا عروسی ۴ آذر)`;
    smartDesc = 'اکنون بهترین زمان برای نهایی کردن تعداد مهمانان با تالار، پرو نهایی لباس‌ها و هماهنگی ساعت‌های روز عروسی با آتلیه و گل‌فروش است.';
  } else if (daysRemaining >= 2 && daysRemaining <= 3) {
    activePhaseId = 'phase-3days';
    smartTitle = `${toPersianDigits(daysRemaining)} روز مانده به عروسی: تحویل لباس‌ها و آماده‌سازی مالی!`;
    smartDesc = 'لباس عروس و کت‌وشلوار را تحویل بگیرید، پاکت‌های تسویه عوامل و پول شاباش را آماده کنید و کارهای زیبایی را نهایی کنید.';
  } else if (daysRemaining === 1) {
    activePhaseId = 'phase-1day';
    smartTitle = 'فردا عروسیه! (۳ آذر): کارواش شب قبل، آماده‌سازی غذا و بستن وسایل';
    smartDesc = 'شب ماشین را کارواش ببرید، غذای فردا در باغ را آماده و بسته‌بندی کنید، وسایل عکاسی (عینک، کارت، چوب‌لباسی، طلاها) را در چمدان بگذارید و زود بخوابید.';
  } else if (daysRemaining === 0) {
    activePhaseId = 'phase-wedding-day';
    smartTitle = 'مبارک باشه! امروز ۴ آذر روز عروسی شماست 💍✨';
    smartDesc = 'تایم‌لاین روز: عروس ۴:۰۰ سالن، داماد ۶:۰۰ پیرایش، گل ماشین قبل ۸، حرکت به باغ ساعت ۸:۰۰، صرف ناهار خانگی در باغ و حضور در تالار ۱۸:۰۰.';
  } else {
    activePhaseId = 'phase-after';
    smartTitle = 'پیوندتان مبارک! کارهای پس از مراسم (۵ آذر به بعد)';
    smartDesc = 'عودت لباس‌های اجاره‌ای، تحویل هدایا و پیگیری فایل‌های عکس و فیلم آتلیه در این بخش قرار دارند.';
  }

  const titleEl = document.getElementById('smart-focus-title');
  const descEl = document.getElementById('smart-focus-desc');
  if (titleEl) titleEl.textContent = smartTitle;
  if (descEl) descEl.textContent = smartDesc;

  // ۳ کار فوری همین فاز در بنر
  const quickContainer = document.getElementById('smart-quick-tasks');
  if (quickContainer) {
    const phaseTasks = tasks.filter(t => t.phase === activePhaseId && !t.completed).slice(0, 3);
    if (phaseTasks.length === 0) {
      quickContainer.innerHTML = `
        <div class="col-span-1 md:col-span-3 p-3 rounded-xl bg-sage-50 border border-sage-200 text-sage-800 text-xs sm:text-sm font-semibold flex items-center gap-2">
          <span>🎉 عالیه! تمام کارهای پیشنهادی این بازه زمانی تیک خورده‌اند.</span>
        </div>
      `;
    } else {
      quickContainer.innerHTML = phaseTasks.map(t => `
        <div onclick="window.planner.toggleTaskComplete('${t.id}')" class="cursor-pointer group p-2.5 sm:p-3 rounded-xl bg-[#FDFBF7] hover:bg-amber-50/70 border border-amber-200/60 active:scale-98 transition flex items-start gap-2.5">
          <div class="mt-0.5 w-6 h-6 rounded-lg border-2 border-amber-500 flex items-center justify-center shrink-0 group-hover:bg-amber-500 group-hover:text-white transition">
            <svg class="w-3.5 h-3.5 opacity-0 group-hover:opacity-100" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-1.5 mb-0.5">
              ${t.time ? `<span class="text-[10px] font-bold px-1.5 py-0.2 rounded bg-white text-amber-800 border border-amber-200">${toPersianDigits(t.time)}</span>` : ''}
              <span class="text-[10px] text-gray-500">${t.owner}</span>
            </div>
            <p class="text-xs sm:text-sm font-bold text-gray-800 line-clamp-1">${escapeHtml(t.title)}</p>
          </div>
        </div>
      `).join('');
    }
  }
}

export function getOwnerBadgeClass(owner: string): string {
  if (owner === 'عروس') return 'bg-rose-50 text-rose-700 border border-rose-200/70';
  if (owner === 'داماد') return 'bg-sky-50 text-sky-700 border border-sky-200/70';
  if (owner === 'خانواده/ساقدوش') return 'bg-purple-50 text-purple-700 border border-purple-200/70';
  return 'bg-sage-50 text-sage-700 border border-sage-200/70';
}

export function updateProgressBar(): void {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  const bar = document.getElementById('overall-progress-bar');
  const text = document.getElementById('overall-progress-text');
  if (bar) bar.style.width = `${percent}%`;
  if (text) text.textContent = `${toPersianDigits(percent)}٪ (${toPersianDigits(completed)} از ${toPersianDigits(total)})`;
}

export function renderChecklistItems(phaseTasks: TaskItem[]): string {
  if (phaseTasks.length === 0) {
    return `
      <div class="p-6 text-center text-gray-400 text-xs sm:text-sm">
        موردی مطابق با فیلتر شما در این فاز یافت نشد.
      </div>
    `;
  }

  return `
    <div class="divide-y divide-gray-100">
      ${phaseTasks.map(task => `
        <div class="p-3 sm:p-4 flex items-start justify-between gap-2.5 hover:bg-gray-50/60 active:bg-gray-100/60 transition select-none ${task.completed ? 'bg-gray-50/60 opacity-75' : ''}">
          <!-- بخش کلیک‌پذیر برای تیک زدن سریع در موبایل -->
          <div class="flex items-start gap-3 flex-1 min-w-0 cursor-pointer" onclick="window.planner.toggleTaskComplete('${task.id}')">
            <!-- چک‌باکس با تاچ تارگت بزرگ برای لمس بسیار راحت با انگشت شست -->
            <button type="button" aria-label="تغییر وضعیت" class="mt-0.5 w-7 h-7 rounded-xl border-2 flex items-center justify-center shrink-0 transition ${task.completed ? 'bg-sage-600 border-sage-600 text-white shadow-xs' : 'border-gray-300 hover:border-amber-500 bg-white shadow-2xs'}">
              ${task.completed ? '<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>' : ''}
            </button>

            <div class="space-y-1 flex-1 min-w-0">
              <div class="flex flex-wrap items-center gap-1.5">
                <span class="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-md ${getOwnerBadgeClass(task.owner)}">
                  ${task.owner}
                </span>
                <span class="text-[10px] sm:text-xs text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded-md">
                  ${escapeHtml(task.category)}
                </span>
                ${task.time ? `<span class="text-[10px] sm:text-xs text-amber-800 font-bold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">${toPersianDigits(task.time)}</span>` : ''}
                ${task.priority === 'high' ? '<span class="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-md border border-rose-200">فوری</span>' : ''}
              </div>

              <h4 class="text-xs sm:text-base font-bold text-gray-900 leading-snug ${task.completed ? 'line-through text-gray-400' : ''}">
                ${escapeHtml(task.title)}
              </h4>

              ${task.notes ? `<p class="text-[11px] sm:text-sm text-gray-600 leading-relaxed">${escapeHtml(task.notes)}</p>` : ''}
            </div>
          </div>

          <!-- دکمه‌های عملیات ویرایش و حذف با تاچ تارگت استاندارد -->
          <div class="no-print flex items-center gap-0.5 shrink-0">
            <button onclick="event.stopPropagation(); window.planner.openEditModal('${task.id}')" title="ویرایش" aria-label="ویرایش" class="w-8 h-8 rounded-lg text-gray-400 hover:text-amber-700 hover:bg-amber-50 active:bg-amber-100 flex items-center justify-center transition active:scale-90">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            </button>
            <button onclick="event.stopPropagation(); window.planner.deleteTask('${task.id}')" title="حذف" aria-label="حذف" class="w-8 h-8 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 active:bg-rose-100 flex items-center justify-center transition active:scale-90">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

export function renderTimelineItems(phaseTasks: TaskItem[]): string {
  if (phaseTasks.length === 0) {
    return `
      <div class="p-6 text-center text-gray-400 text-xs sm:text-sm">
        رویدادی در این ساعت یا فیلتر یافت نشد.
      </div>
    `;
  }

  return `
    <div class="relative p-3 sm:p-5 space-y-3 sm:space-y-5 before:content-[''] before:absolute before:right-6 sm:before:right-8 before:top-4 before:bottom-4 before:w-0.5 before:bg-rose-200">
      ${phaseTasks.map(task => {
        const isHighlight = task.time === '08:00' || task.time === '18:00' || task.time === '20:00';
        return `
          <div class="relative flex items-start gap-2.5 sm:gap-4 group">
            <!-- نشانگر ساعت تایم‌لاین -->
            <div class="w-8 h-8 sm:w-11 sm:h-11 rounded-xl ${task.completed ? 'bg-sage-600 text-white' : (isHighlight ? 'bg-rose-600 text-white ring-2 ring-rose-200 animate-pulse' : 'bg-white border-2 border-rose-300 text-rose-700')} flex items-center justify-center font-black text-[10px] sm:text-xs shrink-0 shadow-xs z-10 transition">
              ${task.time ? toPersianDigits(task.time) : '••'}
            </div>

            <!-- بدنه کارت تایم‌لاین -->
            <div class="flex-1 bg-white rounded-2xl border ${isHighlight ? 'border-rose-300 ring-2 ring-rose-100 bg-rose-50/20' : 'border-gray-200'} p-3 sm:p-4 shadow-2xs hover:shadow-xs transition">
              <div class="flex items-center justify-between gap-1 mb-1.5">
                <div class="flex flex-wrap items-center gap-1.5">
                  <span class="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-md ${getOwnerBadgeClass(task.owner)}">${task.owner}</span>
                  <span class="text-[10px] sm:text-xs font-medium text-gray-500 bg-white px-2 py-0.5 rounded-md border border-gray-100">${escapeHtml(task.category)}</span>
                </div>

                <div class="no-print flex items-center gap-0.5">
                  <button onclick="window.planner.openEditModal('${task.id}')" title="ویرایش" aria-label="ویرایش" class="w-7 h-7 rounded-lg text-gray-400 hover:text-amber-700 hover:bg-amber-50 active:bg-amber-100 flex items-center justify-center transition active:scale-90">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                  </button>
                  <button onclick="window.planner.deleteTask('${task.id}')" title="حذف" aria-label="حذف" class="w-7 h-7 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 active:bg-rose-100 flex items-center justify-center transition active:scale-90">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                </div>
              </div>

              <!-- کلیک روی عنوان یا تیک برای انجام کار -->
              <div class="flex items-start gap-2.5 cursor-pointer" onclick="window.planner.toggleTaskComplete('${task.id}')">
                <button type="button" aria-label="تغییر وضعیت" class="mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition ${task.completed ? 'bg-sage-600 border-sage-600 text-white' : 'border-gray-300 hover:border-rose-500 bg-white'}">
                  ${task.completed ? '<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>' : ''}
                </button>

                <div class="flex-1 min-w-0">
                  <h4 class="text-xs sm:text-base font-extrabold leading-snug ${task.completed ? 'line-through text-gray-400' : 'text-gray-900'}">
                    ${escapeHtml(task.title)}
                  </h4>
                  ${task.notes ? `<p class="text-[11px] sm:text-sm text-gray-600 mt-1 leading-relaxed">${escapeHtml(task.notes)}</p>` : ''}
                </div>
              </div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

export function renderPhaseTabs(): void {
  const container = document.getElementById('phase-tabs-container');
  if (!container) return;

  const totalAll = tasks.length;
  const doneAll = tasks.filter(t => t.completed).length;

  let html = `
    <button onclick="window.planner.setActivePhaseTab('all')" class="phase-tab-btn flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition shrink-0 active:scale-95 ${activePhaseTab === 'all' ? 'bg-gray-900 text-white shadow-xs' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}">
      <span>نمایش همه فازها</span>
      <span class="text-[10px] opacity-80">(${toPersianDigits(doneAll)}/${toPersianDigits(totalAll)})</span>
    </button>
  `;

  PHASES.forEach(phase => {
    const total = tasks.filter(t => t.phase === phase.id).length;
    const done = tasks.filter(t => t.phase === phase.id && t.completed).length;
    const isActive = activePhaseTab === phase.id;

    let activeStyle = '';
    if (isActive) {
      if (phase.id === 'phase-wedding-day' || phase.id === 'phase-packing') {
        activeStyle = 'bg-rose-600 text-white shadow-md ring-2 ring-rose-200';
      } else {
        activeStyle = 'bg-amber-700 text-white shadow-md ring-2 ring-amber-200';
      }
    } else {
      activeStyle = 'bg-amber-50/90 text-gray-700 hover:bg-amber-100 border border-amber-200/50';
    }

    html += `
      <button onclick="window.planner.setActivePhaseTab('${phase.id}')" class="phase-tab-btn flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition shrink-0 active:scale-95 ${activeStyle}">
        <span>${(phase as any).icon || '📌'}</span>
        <span>${(phase as any).shortTitle || phase.title}</span>
        <span class="text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-white text-gray-600 border border-gray-200'}">
          ${toPersianDigits(done)}/${toPersianDigits(total)}
        </span>
      </button>
    `;
  });

  container.innerHTML = html;
}

export function setActivePhaseTab(phaseId: string): void {
  activePhaseTab = phaseId;
  try {
    localStorage.setItem(ACTIVE_TAB_KEY, phaseId);
  } catch (e) {}

  if (phaseId === 'phase-wedding-day') {
    updateNavActiveState('wedding');
  } else if (phaseId === 'phase-packing') {
    updateNavActiveState('packing');
  } else if (phaseId === 'all') {
    updateNavActiveState('all');
  }

  renderPhaseTabs();
  renderPlanner();

  // در موبایل آرام اسکرول شود روی محتوای فاز
  const plannerContainer = document.getElementById('planner-container');
  if (plannerContainer) {
    const offset = plannerContainer.getBoundingClientRect().top + window.scrollY - 110;
    window.scrollTo({ top: Math.max(0, offset), behavior: 'smooth' });
  }
}

export function renderPlanner(): void {
  updateProgressBar();
  updateCountdownAndSmartBanner();
  renderPhaseTabs();

  const container = document.getElementById('planner-container');
  if (!container) return;

  const searchInput = document.getElementById('search-input') as HTMLInputElement | null;
  const searchQuery = searchInput ? searchInput.value.trim().toLowerCase() : '';
  const activePhaseId = getActivePhaseId();

  // فیلتر کردن فازها: اگر کاربری فاز خاصی را انتخاب کرده، فقط همان فاز نمایش داده شود تا صفحه اسکرولی نشود!
  let phasesToRender = PHASES;
  if (activePhaseTab !== 'all') {
    phasesToRender = PHASES.filter(p => p.id === activePhaseTab);
  }

  let html = '';

  phasesToRender.forEach(phase => {
    let phaseTasks = tasks.filter(t => t.phase === phase.id);

    // مرتب‌سازی ساعتی در تایم‌لاین روز عروسی
    if ((phase as any).isTimeline) {
      phaseTasks.sort((a, b) => (a.time || '99:99').localeCompare(b.time || '99:99'));
    }

    // فیلتر وضعیت
    if (currentFilterStatus === 'focus' && phase.id !== activePhaseId) {
      return;
    }
    if (currentFilterStatus === 'pending') {
      phaseTasks = phaseTasks.filter(t => !t.completed);
    } else if (currentFilterStatus === 'completed') {
      phaseTasks = phaseTasks.filter(t => t.completed);
    }

    // فیلتر مسئول
    if (currentOwnerFilter !== 'all') {
      phaseTasks = phaseTasks.filter(t => t.owner === currentOwnerFilter);
    }

    // جستجو
    if (searchQuery) {
      phaseTasks = phaseTasks.filter(t =>
        t.title.toLowerCase().includes(searchQuery) ||
        (t.notes && t.notes.toLowerCase().includes(searchQuery)) ||
        (t.category && t.category.toLowerCase().includes(searchQuery)) ||
        (t.time && t.time.toLowerCase().includes(searchQuery))
      );
    }

    if (searchQuery && phaseTasks.length === 0) {
      return;
    }

    const totalInPhase = tasks.filter(t => t.phase === phase.id).length;
    const doneInPhase = tasks.filter(t => t.phase === phase.id && t.completed).length;
    const isCurrentFocus = phase.id === activePhaseId;
    const isTimeline = (phase as any).isTimeline;

    const headerBg = isTimeline
      ? 'bg-gradient-to-l from-rose-50 via-amber-50/70 to-white border-rose-200'
      : (isCurrentFocus ? 'bg-gradient-to-l from-amber-50 to-white border-amber-300 ring-2 ring-amber-200/50' : 'bg-white border-gray-200/80');

    html += `
      <section id="section-${phase.id}" class="rounded-2xl sm:rounded-3xl border ${headerBg} shadow-2xs sm:shadow-sm overflow-hidden fade-in mb-4">
        <!-- هدر کارتی فاز -->
        <div class="p-3.5 sm:p-5 border-b border-gray-100 flex items-center justify-between gap-2">
          <div class="flex-1 min-w-0 select-none">
            <div class="flex flex-wrap items-center gap-1.5 mb-1">
              <span class="text-[10px] sm:text-xs font-extrabold px-2 sm:px-2.5 py-0.5 rounded-full ${isTimeline ? 'bg-rose-600 text-white' : 'bg-amber-100 text-amber-900'}">
                ${phase.badge}
              </span>
              ${isCurrentFocus ? '<span class="text-[9px] sm:text-xs font-bold px-1.5 py-0.5 rounded-full bg-sage-600 text-white">امروز</span>' : ''}
              <span class="text-[10px] sm:text-xs font-semibold text-gray-500">
                (${toPersianDigits(doneInPhase)} از ${toPersianDigits(totalInPhase)} انجام شد)
              </span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-base sm:text-lg">${(phase as any).icon || '📌'}</span>
              <h3 class="text-sm sm:text-base font-extrabold text-gray-900 leading-snug truncate">${phase.title}</h3>
            </div>
            <p class="text-[11px] sm:text-xs text-gray-500 mt-0.5 leading-relaxed">${phase.subtitle}</p>
          </div>

          <!-- دکمه افزودن کار به این فاز -->
          <button onclick="event.stopPropagation(); window.planner.openAddModal('${phase.id}')" class="no-print shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-[11px] sm:text-xs font-bold shadow-2xs transition active:scale-95">
            <svg class="w-3.5 h-3.5 text-sage-600" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
            <span class="hidden sm:inline">افزودن</span>
          </button>
        </div>

        <!-- لیست آیتم‌های فاز -->
        <div class="bg-white">
          ${isTimeline ? renderTimelineItems(phaseTasks) : renderChecklistItems(phaseTasks)}
        </div>
      </section>
    `;
  });

  if (!html) {
    container.innerHTML = `
      <div class="bg-white rounded-3xl p-8 text-center border border-gray-200 space-y-3">
        <p class="text-gray-500 text-xs sm:text-sm">هیچ موردی مطابق فیلتر یا جستجوی شما در این فاز یافت نشد.</p>
        <button onclick="window.planner.resetFilters()" class="px-4 py-2.5 rounded-xl bg-amber-50 text-amber-900 text-xs font-bold hover:bg-amber-100 transition active:scale-95">
          پاک کردن فیلترها و نمایش همه
        </button>
      </div>
    `;
  } else {
    container.innerHTML = html;
  }
}

export function toggleTaskComplete(id: string): void {
  const idx = tasks.findIndex(t => t.id === id);
  if (idx !== -1) {
    tasks[idx].completed = !tasks[idx].completed;
    saveTasks();
    renderPlanner();
    showToast(tasks[idx].completed ? 'عالی! انجام شد ✅' : 'به لیست در حال انجام برگشت');
  }
}

export function deleteTask(id: string): void {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderPlanner();
  showToast('مورد حذف شد');
}

export function openAddModal(defaultPhase: string | null = null): void {
  const modalTitle = document.getElementById('modal-title');
  const editTaskId = document.getElementById('edit-task-id') as HTMLInputElement | null;
  const taskTitle = document.getElementById('task-title') as HTMLInputElement | null;
  const taskPhase = document.getElementById('task-phase') as HTMLSelectElement | null;
  const taskTime = document.getElementById('task-time') as HTMLInputElement | null;
  const taskCategory = document.getElementById('task-category') as HTMLSelectElement | null;
  const taskOwner = document.getElementById('task-owner') as HTMLSelectElement | null;
  const taskPriority = document.getElementById('task-priority') as HTMLSelectElement | null;
  const taskNotes = document.getElementById('task-notes') as HTMLTextAreaElement | null;

  if (modalTitle) modalTitle.textContent = 'افزودن کار یا رویداد جدید';
  if (editTaskId) editTaskId.value = '';
  if (taskTitle) taskTitle.value = '';
  if (taskPhase) taskPhase.value = defaultPhase || (activePhaseTab !== 'all' ? activePhaseTab : getActivePhaseId());
  if (taskTime) taskTime.value = '';
  if (taskCategory) taskCategory.value = 'تالار و پذیرایی';
  if (taskOwner) taskOwner.value = 'مشترک';
  if (taskPriority) taskPriority.value = 'medium';
  if (taskNotes) taskNotes.value = '';

  const modal = document.getElementById('task-modal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
  if (taskTitle) {
    setTimeout(() => taskTitle.focus(), 50);
  }
}

export function openEditModal(id: string): void {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  const modalTitle = document.getElementById('modal-title');
  const editTaskId = document.getElementById('edit-task-id') as HTMLInputElement | null;
  const taskTitle = document.getElementById('task-title') as HTMLInputElement | null;
  const taskPhase = document.getElementById('task-phase') as HTMLSelectElement | null;
  const taskTime = document.getElementById('task-time') as HTMLInputElement | null;
  const taskCategory = document.getElementById('task-category') as HTMLSelectElement | null;
  const taskOwner = document.getElementById('task-owner') as HTMLSelectElement | null;
  const taskPriority = document.getElementById('task-priority') as HTMLSelectElement | null;
  const taskNotes = document.getElementById('task-notes') as HTMLTextAreaElement | null;

  if (modalTitle) modalTitle.textContent = 'ویرایش برنامه یا ساعت';
  if (editTaskId) editTaskId.value = task.id;
  if (taskTitle) taskTitle.value = task.title;
  if (taskPhase) taskPhase.value = task.phase;
  if (taskTime) taskTime.value = task.time || '';
  if (taskCategory) taskCategory.value = task.category || 'تالار و پذیرایی';
  if (taskOwner) taskOwner.value = task.owner || 'مشترک';
  if (taskPriority) taskPriority.value = task.priority || 'medium';
  if (taskNotes) taskNotes.value = task.notes || '';

  const modal = document.getElementById('task-modal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

export function closeTaskModal(): void {
  const modal = document.getElementById('task-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

export function saveTaskForm(event: Event): void {
  event.preventDefault();
  const editTaskId = document.getElementById('edit-task-id') as HTMLInputElement | null;
  const taskTitle = document.getElementById('task-title') as HTMLInputElement | null;
  const taskPhase = document.getElementById('task-phase') as HTMLSelectElement | null;
  const taskTime = document.getElementById('task-time') as HTMLInputElement | null;
  const taskCategory = document.getElementById('task-category') as HTMLSelectElement | null;
  const taskOwner = document.getElementById('task-owner') as HTMLSelectElement | null;
  const taskPriority = document.getElementById('task-priority') as HTMLSelectElement | null;
  const taskNotes = document.getElementById('task-notes') as HTMLTextAreaElement | null;

  const title = taskTitle ? taskTitle.value.trim() : '';
  const editId = editTaskId ? editTaskId.value : '';
  const phase = taskPhase ? taskPhase.value : 'phase-week';
  const time = taskTime ? taskTime.value.trim() : '';
  const category = taskCategory ? taskCategory.value : 'تالار و پذیرایی';
  const owner = (taskOwner ? taskOwner.value : 'مشترک') as any;
  const priority = (taskPriority ? taskPriority.value : 'medium') as any;
  const notes = taskNotes ? taskNotes.value.trim() : '';

  if (!title) return;

  if (editId) {
    const idx = tasks.findIndex(t => t.id === editId);
    if (idx !== -1) {
      tasks[idx] = { ...tasks[idx], title, phase, time, category, owner, priority, notes };
    }
    showToast('تغییرات ذخیره شد');
  } else {
    const newTask: TaskItem = {
      id: 'custom-' + Date.now(),
      phase,
      time,
      title,
      category,
      owner,
      priority,
      completed: false,
      notes
    };
    tasks.push(newTask);
    showToast('مورد جدید ذخیره شد');
  }

  // سوئیچ تب به همان فاز تا تغییر بلافاصله دیده شود
  activePhaseTab = phase;
  saveTasks();
  closeTaskModal();
  renderPlanner();
}

function updateNavActiveState(target: 'all' | 'focus' | 'wedding' | 'packing'): void {
  const btnAll = document.getElementById('nav-btn-all');
  const btnFocus = document.getElementById('nav-btn-focus');
  const btnWedding = document.getElementById('nav-btn-wedding');
  const btnPacking = document.getElementById('nav-btn-packing');

  [btnAll, btnFocus, btnWedding, btnPacking].forEach(btn => {
    if (btn) {
      btn.classList.remove('text-amber-700', 'text-rose-600');
      btn.classList.add('text-gray-500');
    }
  });

  if (target === 'all' && btnAll) {
    btnAll.classList.remove('text-gray-500');
    btnAll.classList.add('text-amber-700');
  } else if (target === 'focus' && btnFocus) {
    btnFocus.classList.remove('text-gray-500');
    btnFocus.classList.add('text-amber-700');
  } else if (target === 'wedding' && btnWedding) {
    btnWedding.classList.remove('text-gray-500');
    btnWedding.classList.add('text-rose-600');
  } else if (target === 'packing' && btnPacking) {
    btnPacking.classList.remove('text-gray-500');
    btnPacking.classList.add('text-amber-700');
  }
}

export function setFilterStatus(status: 'all' | 'focus' | 'pending' | 'completed'): void {
  currentFilterStatus = status;
  document.querySelectorAll('.filter-btn').forEach(btn => {
    const b = btn as HTMLElement;
    if (b.dataset.filter === status) {
      b.className = 'filter-btn px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition bg-gray-900 text-white shrink-0 active:scale-95';
    } else {
      b.className = 'filter-btn px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition bg-gray-100 text-gray-700 hover:bg-gray-200 shrink-0 active:scale-95';
    }
  });

  if (status === 'focus') {
    updateNavActiveState('focus');
  } else if (status === 'all') {
    updateNavActiveState('all');
  }

  renderPlanner();
}

export function setOwnerFilter(owner: string): void {
  currentOwnerFilter = owner;
  document.querySelectorAll('.owner-btn').forEach(btn => {
    const b = btn as HTMLElement;
    if (b.dataset.owner === owner) {
      b.className = 'owner-btn px-2.5 py-1 rounded-lg font-semibold bg-amber-100 text-amber-900 whitespace-nowrap shrink-0 active:scale-95';
    } else {
      b.className = 'owner-btn px-2.5 py-1 rounded-lg font-medium bg-gray-50 text-gray-600 hover:bg-gray-100 whitespace-nowrap shrink-0 active:scale-95';
    }
  });
  renderPlanner();
}

export function filterBySmartFocus(): void {
  setFilterStatus('focus');
  updateNavActiveState('focus');
  const activeId = getActivePhaseId();
  setActivePhaseTab(activeId);
}

export function jumpToWeddingDay(): void {
  setFilterStatus('all');
  setActivePhaseTab('phase-wedding-day');
}

export function jumpToPackingList(): void {
  setFilterStatus('all');
  setActivePhaseTab('phase-packing');
}

export function resetFilters(): void {
  const searchInput = document.getElementById('search-input') as HTMLInputElement | null;
  if (searchInput) searchInput.value = '';
  activePhaseTab = 'phase-wedding-day';
  updateNavActiveState('wedding');
  setOwnerFilter('all');
  setFilterStatus('all');
}

export function openSettingsModal(): void {
  toggleResetConfirm(false);
  const modal = document.getElementById('settings-modal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

export function closeSettingsModal(): void {
  const modal = document.getElementById('settings-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

export function setSimulatedDate(isoString: string | null): void {
  simulatedNow = isoString;
  closeSettingsModal();
  renderPlanner();
  showToast(isoString ? 'تاریخ شبیه‌سازی شد' : 'بازگشت به تاریخ واقعی');
}

export function toggleResetConfirm(show: boolean): void {
  const box = document.getElementById('reset-confirm-box');
  const btn = document.getElementById('reset-trigger-btn');
  if (box) box.classList.toggle('hidden', !show);
  if (btn) btn.classList.toggle('hidden', show);
}

export function confirmResetData(): void {
  tasks = JSON.parse(JSON.stringify(DEFAULT_TASKS));
  activePhaseTab = 'phase-wedding-day';
  saveTasks();
  closeSettingsModal();
  renderPlanner();
  showToast('داده‌های اولیه بازنشانی شد');
}

export function showToast(msg: string): void {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-message');
  if (!toast || !toastMsg) return;

  toastMsg.textContent = msg;
  toast.classList.remove('hidden');
  toast.classList.add('flex');

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.add('hidden');
    toast.classList.remove('flex');
  }, 2200);
}

export function initScrollHeader(): void {
  const header = document.getElementById('main-header');
  if (!header) return;

  let lastScrollY = window.scrollY;
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;

        // فقط در اسکرول‌های سریع رو به پایین در موبایل هدر را مخفی کنیم
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
          header.classList.add('-translate-y-full');
        } else if (currentScrollY < lastScrollY) {
          header.classList.remove('-translate-y-full');
        }

        lastScrollY = Math.max(0, currentScrollY);
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

export function initApp(): void {
  try {
    const savedTab = localStorage.getItem(ACTIVE_TAB_KEY);
    if (savedTab) {
      activePhaseTab = savedTab;
    }
  } catch (e) {}

  tasks = loadTasks();
  renderPlanner();
  initScrollHeader();
  setInterval(() => {
    updateCountdownAndSmartBanner();
  }, 60000);
}

// ثبت در آبجکت عمومی window برای فراخوانی راحت از تمپلیت‌ها
if (typeof window !== 'undefined') {
  (window as any).planner = {
    initApp,
    renderPlanner,
    toggleTaskComplete,
    deleteTask,
    openAddModal,
    openEditModal,
    closeTaskModal,
    saveTaskForm,
    setFilterStatus,
    setOwnerFilter,
    filterBySmartFocus,
    jumpToWeddingDay,
    jumpToPackingList,
    setActivePhaseTab,
    resetFilters,
    openSettingsModal,
    closeSettingsModal,
    setSimulatedDate,
    toggleResetConfirm,
    confirmResetData,
    showToast
  };
}
