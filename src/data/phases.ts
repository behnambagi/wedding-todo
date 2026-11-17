export interface Phase {
  id: string;
  title: string;
  subtitle: string;
  shortTitle: string;
  badge: string;
  icon: string;
  minDays: number;
  maxDays: number;
  accentColor: string;
  isTimeline?: boolean;
}

export const PHASES: Phase[] = [
  {
    id: 'phase-week',
    title: 'فاز ۱: هفته آخر و هماهنگی‌های نهایی (۷ تا ۴ روز مانده)',
    subtitle: 'تثبیت نهایی با تالار، آتلیه، لباس‌ها و لیست مهمانان',
    shortTitle: 'هفته آخر',
    badge: '۱۷ تا ۳۰ آبان',
    icon: '🗓️',
    minDays: 4,
    maxDays: 999,
    accentColor: 'amber'
  },
  {
    id: 'phase-3days',
    title: 'فاز ۲: سه تا دو روز مانده به عروسی (۱ و ۲ آذر)',
    subtitle: 'کارهای زیبایی، تحویل گرفتن لباس‌ها و چک کردن جزئیات',
    shortTitle: '۳-۲ روز مانده',
    badge: '۱ و ۲ آذر',
    icon: '✂️',
    minDays: 2,
    maxDays: 3,
    accentColor: 'sage'
  },
  {
    id: 'phase-1day',
    title: 'فاز ۳: یک روز قبل از عروسی (چهارشنبه ۳ آذر)',
    subtitle: 'کارواش شب قبل، آماده‌سازی غذا و ساندویچ برای باغ، بستن وسایل و خواب آرام',
    shortTitle: 'روز قبل (۳ آذر)',
    badge: '۳ آذر',
    icon: '🥪',
    minDays: 1,
    maxDays: 1,
    accentColor: 'amber'
  },
  {
    id: 'phase-packing',
    title: 'چک‌لیست وسایل و اکسسوری‌های همراه روز عروسی 🎒💍',
    subtitle: 'اقلام ضروری، ست‌های عکاسی باغ و عمارت، مدارک، غذا و کیف اضطراری',
    shortTitle: 'وسایل همراه',
    badge: 'همراه در ماشین',
    icon: '🎒',
    minDays: -999,
    maxDays: 999,
    accentColor: 'rose'
  },
  {
    id: 'phase-wedding-day',
    title: 'فاز ۴: تایم‌لاین دقیق روز عروسی (پنج‌شنبه ۴ آذر)',
    subtitle: 'عروس ۴:۰۰ سالن، داماد ۶:۰۰ پیرایش، گل ماشین قبل ۸، حرکت به باغ ۸:۰۰، تالار ۱۸:۰۰',
    shortTitle: 'روز موعود (۴ آذر)',
    badge: 'تایم‌لاین ساعتی',
    icon: '💍',
    minDays: 0,
    maxDays: 0,
    isTimeline: true,
    accentColor: 'rose'
  },
  {
    id: 'phase-after',
    title: 'فاز ۵: بعد از مراسم (۵ آذر به بعد)',
    subtitle: 'تحویل لباس‌ها، تسویه نهایی آتلیه و انتخاب عکس‌های آلبوم',
    shortTitle: 'بعد از مراسم',
    badge: '۵ آذر به بعد',
    icon: '💐',
    minDays: -999,
    maxDays: -1,
    accentColor: 'sage'
  }
];
