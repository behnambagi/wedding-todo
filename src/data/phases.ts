export interface Phase {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  minDays: number;
  maxDays: number;
  accentColor: string;
}

export const PHASES: Phase[] = [
            {
                id: 'phase-week',
                title: 'فاز ۱: هفته آخر و هماهنگی‌های نهایی (۷ تا ۴ روز مانده)',
                subtitle: 'تثبیت نهایی با تالار، آتلیه، لباس‌ها و لیست مهمانان',
                badge: '۱۷ تا ۳۰ آبان',
                minDays: 4,
                maxDays: 999,
                accentColor: 'amber'
            },
            {
                id: 'phase-3days',
                title: 'فاز ۲: سه تا دو روز مانده به عروسی (۱ و ۲ آذر)',
                subtitle: 'کارهای زیبایی، تحویل گرفتن لباس‌ها و چک کردن جزئیات',
                badge: '۱ و ۲ آذر',
                minDays: 2,
                maxDays: 3,
                accentColor: 'sage'
            },
            {
                id: 'phase-1day',
                title: 'فاز ۳: یک روز قبل از عروسی (چهارشنبه ۳ آذر)',
                subtitle: 'آماده‌سازی کیف اضطراری، گل ماشین، پاکت‌های تسویه و خواب زودهنگام',
                badge: '۳ آذر (روز قبل)',
                minDays: 1,
                maxDays: 1,
                accentColor: 'amber'
            },
            {
                id: 'phase-wedding-day',
                title: 'فاز ۴: تایم‌لاین ساعت‌به‌ساعت روز عروسی (پنج‌شنبه ۴ آذر)',
                subtitle: 'از بیدارباش ۳:۳۰ و آرایشگاه ۴:۰۰ صبح تا شروع مراسم ۱۸:۰۰ و ورود باشکوه ۲۰:۰۰',
                badge: 'روز موعود • ۴ آذر',
                minDays: 0,
                maxDays: 0,
                isTimeline: true,
                accentColor: 'rose'
            },
            {
                id: 'phase-after',
                title: 'فاز ۵: بعد از مراسم (۵ آذر به بعد)',
                subtitle: 'تحویل لباس‌ها، تسویه نهایی آتلیه و انتخاب عکس‌های آلبوم',
                badge: '۵ آذر به بعد',
                minDays: -999,
                maxDays: -1,
                accentColor: 'sage'
            }
        ];
