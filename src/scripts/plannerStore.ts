import { PHASES, type Phase } from '../data/phases';
import { DEFAULT_TASKS, type TaskItem } from '../data/defaultTasks';
import { getCookie, setCookie } from '../utils/cookie';

const WEDDING_DATE_ISO = '2026-11-25T18:00:00';
const WEDDING_DAY_START_ISO = '2026-11-25T00:00:00';
const COOKIE_STORAGE_KEY = 'persian_wedding_planner_cookie_v1';
const LOCAL_STORAGE_KEY = 'persian_wedding_planner_4azar_v1';

let tasks: TaskItem[] = [];
let simulatedNow: string | null = null;
let currentFilterStatus: 'all' | 'focus' | 'pending' | 'completed' = 'all';
let currentOwnerFilter: string = 'all';
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
    // ذخیره در کوکی برای ۳۶۵ روز
    setCookie(COOKIE_STORAGE_KEY, jsonStr, 365);
    // بک‌آپ لوکال استوریج برای اطمینان مضاعف
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
    // اولویت اول: کوکی مرورگر
    const cookieData = getCookie(COOKIE_STORAGE_KEY);
    if (cookieData) {
      const parsed = JSON.parse(cookieData);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }

    // اولویت دوم: فال‌بک به LocalStorage اگر قبلاً چیزی ذخیره شده بود
    const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (localData) {
      const parsed = JSON.parse(localData);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // انتقال به کوکی
        setCookie(COOKIE_STORAGE_KEY, localData, 365);
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Error reading from cookie/storage:', err);
  }

  // مقدار پیش‌فرض اولیه
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

  if (diffMs > 0) {
    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const d = Math.floor(totalMinutes / (60 * 24));
    const h = Math.floor((totalMinutes % (60 * 24)) / 60);
    const m = totalMinutes % 60;

    if (daysEl) daysEl.textContent = toPersianDigits(d);
    if (hoursEl) hoursEl.textContent = toPersianDigits(h);
    if (minsEl) minsEl.textContent = toPersianDigits(m);

    if (badgeEl) {
      if (daysRemaining > 3) {
        badgeEl.textContent = `${toPersianDigits(daysRemaining)} روز تا پیوند`;
        badgeEl.className = 'inline-block text-xs font-bold px-2.5 py-1 rounded-xl bg-amber-100 text-amber-800';
      } else if (daysRemaining >= 1) {
        badgeEl.textContent = `فقط ${toPersianDigits(daysRemaining)} روز باقی‌مانده!`;
        badgeEl.className = 'inline-block text-xs font-bold px-2.5 py-1 rounded-xl bg-rose-100 text-rose-800 animate-pulse';
      } else {
        badgeEl.textContent = `امروز روز موعود است! 💍`;
        badgeEl.className = 'inline-block text-xs font-bold px-2.5 py-1 rounded-xl bg-rose-600 text-white animate-bounce';
      }
    }
  } else {
    if (daysEl) daysEl.textContent = '۰';
    if (hoursEl) hoursEl.textContent = '۰';
    if (minsEl) minsEl.textContent = '۰';
    if (badgeEl) {
      badgeEl.textContent = 'مراسم باشکوه برگزار شد 💐';
      badgeEl.className = 'inline-block text-xs font-bold px-2.5 py-1 rounded-xl bg-sage-100 text-sage-800';
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
    smartTitle = `${toPersianDigits(daysRemaining)} روز مانده به عروسی: زمان تحویل لباس‌ها و آماده‌سازی مالی!`;
    smartDesc = 'لباس عروس و کت‌وشلوار را تحویل بگیرید، پاکت‌های تسویه عوامل و پول شاباش را آماده کنید و کارهای زیبایی را نهایی کنید.';
  } else if (daysRemaining === 1) {
    activePhaseId = 'phase-1day';
    smartTitle = 'فردا عروسیه! (۳ آذر): روز آماده‌سازی نهایی و بستن کیف اضطراری';
    smartDesc = 'ماشین عروس را به گل‌فروشی بسپارید، کیف اضطراری و شناسنامه‌ها را چک کنید و امشب زود بخوابید تا برای ساعت ۳:۳۰ صبح سرحال باشید.';
  } else if (daysRemaining === 0) {
    activePhaseId = 'phase-wedding-day';
    smartTitle = 'مبارک باشه! امروز ۴ آذر روز عروسی شماست 💍✨';
    smartDesc = 'طبق تایم‌لاین ساعتی پیش بروید: ۴:۰۰ صبح آرایشگاه، ۱۰:۳۰ عمارت عکاسی، ۱۸:۰۰ شروع مراسم در تالار و ۲۰:۰۰ ورود باشکوه شما.';
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
        <div class="col-span-1 md:col-span-3 p-3 rounded-2xl bg-sage-50 border border-sage-200 text-sage-800 text-xs sm:text-sm font-semibold flex items-center gap-2">
          <span>🎉 عالیه! تمام کارهای پیشنهادی این بازه زمانی تیک خورده‌اند.</span>
        </div>
      `;
    } else {
      quickContainer.innerHTML = phaseTasks.map(t => `
        <div onclick="window.planner.toggleTaskComplete('${t.id}')" class="cursor-pointer group p-3 rounded-2xl bg-[#FDFBF7] hover:bg-amber-50/70 border border-amber-200/60 transition flex items-start gap-2.5">
          <div class="mt-0.5 w-5 h-5 rounded-lg border-2 border-amber-500 flex items-center justify-center shrink-0 group-hover:bg-amber-500 group-hover:text-white transition">
            <svg class="w-3.5 h-3.5 opacity-0 group-hover:opacity-100" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
          </div>
          <div class="min-w-0">
            <div class="flex items-center gap-1.5 mb-0.5">
              ${t.time ? `<span class="text-[11px] font-bold px-1.5 py-0.5 rounded bg-white text-amber-800 border border-amber-200">${toPersianDigits(t.time)}</span>` : ''}
              <span class="text-[11px] text-gray-500">${t.owner}</span>
            </div>
            <p class="text-xs sm:text-sm font-bold text-gray-800 line-clamp-2">${escapeHtml(t.title)}</p>
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
      <div class="p-6 text-center text-gray-400 text-sm">
        موردی مطابق با فیلتر شما در این بخش یافت نشد.
      </div>
    `;
  }

  return `
    <div class="divide-y divide-gray-100">
      ${phaseTasks.map(task => `
        <div class="p-4 sm:p-5 flex items-start justify-between gap-3 sm:gap-4 hover:bg-gray-50/60 transition ${task.completed ? 'bg-gray-50/40 opacity-75' : ''}">
          <div class="flex items-start gap-3 sm:gap-3.5 flex-1 min-w-0">
            <!-- چک‌باکس بزرگ و لمسی -->
            <button onclick="window.planner.toggleTaskComplete('${task.id}')" class="mt-0.5 w-6 h-6 rounded-xl border-2 flex items-center justify-center shrink-0 transition ${task.completed ? 'bg-sage-600 border-sage-600 text-white' : 'border-gray-300 hover:border-amber-500 bg-white'}">
              ${task.completed ? '<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>' : ''}
            </button>

            <div class="space-y-1.5 flex-1 min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <span class="text-xs font-semibold px-2 py-0.5 rounded-lg ${getOwnerBadgeClass(task.owner)}">
                  ${task.owner}
                </span>
                <span class="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded-lg">
                  ${escapeHtml(task.category)}
                </span>
                ${task.time ? `<span class="text-xs text-amber-800 font-bold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg">${toPersianDigits(task.time)}</span>` : ''}
                ${task.priority === 'high' ? '<span class="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200">فوری و مهم</span>' : ''}
              </div>

              <h4 class="text-sm sm:text-base font-bold text-gray-900 ${task.completed ? 'line-through text-gray-400' : ''}">
                ${escapeHtml(task.title)}
              </h4>

              ${task.notes ? `<p class="text-xs sm:text-sm text-gray-600 leading-relaxed">${escapeHtml(task.notes)}</p>` : ''}
            </div>
          </div>

          <!-- دکمه‌های عملیات ویرایش و حذف -->
          <div class="no-print flex items-center gap-1 shrink-0">
            <button onclick="window.planner.openEditModal('${task.id}')" title="ویرایش" class="p-1.5 rounded-lg text-gray-400 hover:text-amber-700 hover:bg-amber-50 transition">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            </button>
            <button onclick="window.planner.deleteTask('${task.id}')" title="حذف" class="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition">
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
      <div class="p-6 text-center text-gray-400 text-sm">
        رویدادی در این ساعت یا فیلتر یافت نشد.
      </div>
    `;
  }

  return `
    <div class="relative p-4 sm:p-6 space-y-6 before:content-[''] before:absolute before:right-8 sm:before:right-10 before:top-6 before:bottom-6 before:w-0.5 before:bg-rose-200">
      ${phaseTasks.map(task => {
        const isHighlight = task.time === '18:00' || task.time === '20:00';
        return `
          <div class="relative flex items-start gap-4 sm:gap-6 group">
            <div class="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl ${task.completed ? 'bg-sage-600 text-white' : (isHighlight ? 'bg-rose-600 text-white animate-pulse' : 'bg-white border-2 border-rose-300 text-rose-700')} flex items-center justify-center font-black text-xs sm:text-sm shrink-0 shadow-sm z-10 transition">
              ${task.time ? toPersianDigits(task.time) : '••'}
            </div>

            <div class="flex-1 bg-white rounded-2xl border ${isHighlight ? 'border-rose-300 ring-2 ring-rose-100 bg-rose-50/20' : 'border-gray-200'} p-4 shadow-sm hover:shadow-md transition">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div class="flex flex-wrap items-center gap-2">
                  <span class="text-xs font-bold px-2.5 py-0.5 rounded-lg ${getOwnerBadgeClass(task.owner)}">${task.owner}</span>
                  <span class="text-xs font-medium text-gray-500 bg-white px-2 py-0.5 rounded-lg border border-gray-100">${escapeHtml(task.category)}</span>
                </div>

                <div class="no-print flex items-center gap-1 self-end sm:self-center">
                  <button onclick="window.planner.openEditModal('${task.id}')" title="ویرایش ساعت یا متن" class="p-1.5 rounded-lg text-gray-400 hover:text-amber-700 hover:bg-amber-50">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                  </button>
                  <button onclick="window.planner.deleteTask('${task.id}')" title="حذف" class="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <button onclick="window.planner.toggleTaskComplete('${task.id}')" class="mt-0.5 w-6 h-6 rounded-xl border-2 flex items-center justify-center shrink-0 transition ${task.completed ? 'bg-sage-600 border-sage-600 text-white' : 'border-gray-300 hover:border-rose-500 bg-white'}">
                  ${task.completed ? '<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>' : ''}
                </button>

                <div class="flex-1">
                  <h4 class="text-sm sm:text-base font-extrabold ${task.completed ? 'line-through text-gray-400' : 'text-gray-900'}">
                    ${escapeHtml(task.title)}
                  </h4>
                  ${task.notes ? `<p class="text-xs sm:text-sm text-gray-600 mt-1.5 leading-relaxed">${escapeHtml(task.notes)}</p>` : ''}
                </div>
              </div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

export function renderPlanner(): void {
  updateProgressBar();
  updateCountdownAndSmartBanner();

  const container = document.getElementById('planner-container');
  if (!container) return;

  const searchInput = document.getElementById('search-input') as HTMLInputElement | null;
  const searchQuery = searchInput ? searchInput.value.trim().toLowerCase() : '';
  const activePhaseId = getActivePhaseId();

  let html = '';

  PHASES.forEach(phase => {
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
      : (isCurrentFocus ? 'bg-gradient-to-l from-amber-50 to-white border-amber-300' : 'bg-white border-gray-200/80');

    html += `
      <section id="section-${phase.id}" class="rounded-3xl border ${headerBg} shadow-sm overflow-hidden fade-in">
        <div class="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div class="flex flex-wrap items-center gap-2 mb-1">
              <span class="text-xs font-extrabold px-3 py-1 rounded-full ${isTimeline ? 'bg-rose-600 text-white' : 'bg-amber-100 text-amber-900'}">
                ${phase.badge}
              </span>
              ${isCurrentFocus ? '<span class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-sage-600 text-white">فاز فعال امروز</span>' : ''}
              <span class="text-xs font-semibold text-gray-500">
                (${toPersianDigits(doneInPhase)} از ${toPersianDigits(totalInPhase)} تکمیل شده)
              </span>
            </div>
            <h3 class="text-base sm:text-lg font-extrabold text-gray-900">${phase.title}</h3>
            <p class="text-xs sm:text-sm text-gray-500 mt-0.5">${phase.subtitle}</p>
          </div>

          <button onclick="window.planner.openAddModal('${phase.id}')" class="no-print self-start sm:self-center inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-xs font-bold shadow-2xs transition">
            <svg class="w-4 h-4 text-sage-600" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
            <span>+ افزودن به این بخش</span>
          </button>
        </div>

        <div class="bg-white">
          ${isTimeline ? renderTimelineItems(phaseTasks) : renderChecklistItems(phaseTasks)}
        </div>
      </section>
    `;
  });

  if (!html) {
    container.innerHTML = `
      <div class="bg-white rounded-3xl p-12 text-center border border-gray-200 space-y-3">
        <p class="text-gray-500 text-sm">هیچ موردی مطابق فیلتر یا جستجوی شما یافت نشد.</p>
        <button onclick="window.planner.resetFilters()" class="px-4 py-2 rounded-xl bg-amber-50 text-amber-900 text-xs font-bold hover:bg-amber-100 transition">
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
    showToast(tasks[idx].completed ? 'عالی! انجام شد و در کوکی ذخیره شد ✅' : 'به لیست در حال انجام برگشت');
  }
}

export function deleteTask(id: string): void {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderPlanner();
  showToast('مورد حذف شد و در کوکی به‌روزرسانی شد');
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
  if (taskPhase) taskPhase.value = defaultPhase || getActivePhaseId();
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
  if (taskTitle) taskTitle.focus();
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
    showToast('تغییرات در کوکی مرورگر ذخیره شد');
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
    showToast('مورد جدید به کوکی اضافه شد');
  }

  saveTasks();
  closeTaskModal();
  renderPlanner();
}

export function setFilterStatus(status: 'all' | 'focus' | 'pending' | 'completed'): void {
  currentFilterStatus = status;
  document.querySelectorAll('.filter-btn').forEach(btn => {
    const b = btn as HTMLElement;
    if (b.dataset.filter === status) {
      b.className = 'filter-btn px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition bg-gray-900 text-white';
    } else {
      b.className = 'filter-btn px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition bg-gray-100 text-gray-700 hover:bg-gray-200';
    }
  });
  renderPlanner();
}

export function setOwnerFilter(owner: string): void {
  currentOwnerFilter = owner;
  document.querySelectorAll('.owner-btn').forEach(btn => {
    const b = btn as HTMLElement;
    if (b.dataset.owner === owner) {
      b.className = 'owner-btn px-2.5 py-1 rounded-lg font-semibold bg-amber-100 text-amber-900';
    } else {
      b.className = 'owner-btn px-2.5 py-1 rounded-lg font-medium bg-gray-50 text-gray-600 hover:bg-gray-100';
    }
  });
  renderPlanner();
}

export function filterBySmartFocus(): void {
  setFilterStatus('focus');
  const activeId = getActivePhaseId();
  const el = document.getElementById('section-' + activeId);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function jumpToWeddingDay(): void {
  setFilterStatus('all');
  setTimeout(() => {
    const el = document.getElementById('section-phase-wedding-day');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 50);
}

export function resetFilters(): void {
  const searchInput = document.getElementById('search-input') as HTMLInputElement | null;
  if (searchInput) searchInput.value = '';
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
  showToast(isoString ? 'تاریخ شبیه‌سازی شد' : 'بازگشت به تاریخ سیستم');
}

export function toggleResetConfirm(show: boolean): void {
  const box = document.getElementById('reset-confirm-box');
  const btn = document.getElementById('reset-trigger-btn');
  if (box) box.classList.toggle('hidden', !show);
  if (btn) btn.classList.toggle('hidden', show);
}

export function confirmResetData(): void {
  tasks = JSON.parse(JSON.stringify(DEFAULT_TASKS));
  saveTasks();
  closeSettingsModal();
  renderPlanner();
  showToast('داده‌های اولیه در کوکی مرورگر بازنشانی شد');
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
  }, 2600);
}

export function initApp(): void {
  tasks = loadTasks();
  renderPlanner();
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
    resetFilters,
    openSettingsModal,
    closeSettingsModal,
    setSimulatedDate,
    toggleResetConfirm,
    confirmResetData,
    showToast
  };
}
