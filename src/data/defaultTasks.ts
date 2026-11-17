export interface TaskItem {
  id: string;
  phase: string;
  time?: string;
  title: string;
  category: string;
  owner: 'داماد' | 'عروس' | 'مشترک';
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  notes?: string;
  venue?: string;
  contact?: string;
}

export const DEFAULT_TASKS: TaskItem[] = [
            // --- فاز ۱: هفته آخر ---
            {
                id: 't-101',
                phase: 'phase-week',
                time: 'هماهنگی روزانه',
                title: 'تایید نهایی تعداد مهمانان و چیدمان میزها با مدیر تالار',
                category: 'تالار و پذیرایی',
                owner: 'مشترک',
                priority: 'high',
                completed: false,
                notes: 'اعلام آمار قطعی مهمانان، تایید منوی شام، چیدمان جایگاه عروس و داماد و تست سیستم صوتی و نورپردازی.'
            },
            {
                id: 't-102',
                phase: 'phase-week',
                time: 'عصر',
                title: 'پرو نهایی لباس عروس و کت‌وشلوار داماد + تست کفش‌ها',
                category: 'آرایشگاه و لباس',
                owner: 'مشترک',
                priority: 'high',
                completed: false,
                notes: 'حتماً کفش عروسی را در خانه کمی بپوشید تا پا را نزند. یک جفت کفش تخت/کتانی سفید هم برای آخر شب و رقص آماده کنید.'
            },
            {
                id: 't-103',
                phase: 'phase-week',
                time: 'هماهنگی تلفنی',
                title: 'جلسه نهایی با تیم آتلیه و عکاسی برای سناریوی ۴ آذر',
                category: 'آتلیه و رسانه',
                owner: 'مشترک',
                priority: 'high',
                completed: false,
                notes: 'هماهنگی ساعت حضور عکاس در آرایشگاه (صبح)، لوکیشن عمارت (۱۰:۳۰) و استقرار در تالار قبل از ساعت ۱۹:۴۵.'
            },
            {
                id: 't-104',
                phase: 'phase-week',
                time: 'روزانه',
                title: 'سفارش نهایی کیک عروسی، شیرینی تالار و گل‌آرایی',
                category: 'گل‌آرایی و ماشین',
                owner: 'داماد',
                priority: 'medium',
                completed: false,
                notes: 'تایید مدل دسته گل عروس (تحویل ساعت ۹:۳۰ صبح ۴ آذر) و رزرو نوبت گل‌آرایی ماشین عروس.'
            },
            {
                id: 't-105',
                phase: 'phase-week',
                time: 'عصر',
                title: 'انتخاب لیست آهنگ‌های کلیدی با دی‌جی / گروه موزیک',
                category: 'اجرای مراسم',
                owner: 'مشترک',
                priority: 'medium',
                completed: false,
                notes: 'آهنگ ورود ساعت ۲۰:۰۰، آهنگ رقص تانگو (رقص اول)، آهنگ برش کیک و لیست آهنگ‌های ممنوعه.'
            },

            // --- فاز ۲: سه تا دو روز مانده ---
            {
                id: 't-201',
                phase: 'phase-3days',
                time: 'صبح تا عصر',
                title: 'تحویل گرفتن لباس عروس، تور، تاج و کت‌وشلوار اتوشده',
                category: 'آرایشگاه و لباس',
                owner: 'مشترک',
                priority: 'high',
                completed: false,
                notes: 'بررسی سلامت زیپ، دکمه‌ها و کاور لباس‌ها. آویزان کردن لباس عروس در جای بلند تا چروک نشود.'
            },
            {
                id: 't-202',
                phase: 'phase-3days',
                time: 'عصر',
                title: 'انجام خدمات زیبایی پیش از مراسم (ناخن، اصلاح، پاکسازی ملایم)',
                category: 'آرایشگاه و لباس',
                owner: 'عروس',
                priority: 'medium',
                completed: false,
                notes: 'فیکس کردن نهایی ساعت ۴:۰۰ صبح روز ۴ آذر با میکاپ‌آرتیست و شینیون‌کار.'
            },
            {
                id: 't-203',
                phase: 'phase-3days',
                time: 'عصر',
                title: 'آماده کردن پاکت‌های تسویه حساب و پول نقد شاباش',
                category: 'مالی و مدارک',
                owner: 'داماد',
                priority: 'high',
                completed: false,
                notes: 'جداسازی دقیق مبالغ در پاکت‌های نام‌گذاری شده (تالار، موزیک، آتلیه، گل‌فروش، انعام پرسنل) + تراول و اسکناس نو برای شاباش.'
            },

            // --- فاز ۳: یک روز قبل از عروسی (۳ آذر) ---
            {
                id: 't-301',
                phase: 'phase-1day',
                time: 'صبح',
                title: 'کارواش کامل ماشین عروس و تحویل به گل‌فروشی',
                category: 'گل‌آرایی و ماشین',
                owner: 'داماد',
                priority: 'high',
                completed: false,
                notes: 'هماهنگی تحویل ماشین گل‌زده یا نصب گل‌های تازه صبح روز ۴ آذر تا گل‌ها شاداب بمانند.'
            },
            {
                id: 't-302',
                phase: 'phase-1day',
                time: 'عصر',
                title: 'بستن کیف اضطراری روز عروسی و چک کردن مدارک',
                category: 'کیف اضطراری',
                owner: 'عروس',
                priority: 'high',
                completed: false,
                notes: 'محتویات: شناسنامه‌ها و عقدنامه، نخ و سوزن سفید/مشکی، سنجاق قفلی، چسب زخم، قرص مسکن، دستمال مرطوب، پاوربانک و شارژر، عطر، آینه کوچک، رژلب همرنگ.'
            },
            {
                id: 't-303',
                phase: 'phase-1day',
                time: '۱۸:۰۰',
                title: 'تحویل شیرینی، میوه یا اقلام سفارشی به انبار تالار',
                category: 'تالار و پذیرایی',
                owner: 'خانواده/ساقدوش',
                priority: 'medium',
                completed: false,
                notes: 'گرفتن رسید تحویل از انباردار یا مدیر داخلی تالار.'
            },
            {
                id: 't-304',
                phase: 'phase-1day',
                time: '۲۱:۰۰',
                title: 'تنظیم زنگ هشدار روی ۳:۳۰ صبح و خواب آرام',
                category: 'آرایشگاه و لباس',
                owner: 'مشترک',
                priority: 'high',
                completed: false,
                notes: 'نوشیدن آب کافی، پرهیز از غذای سنگین و شارژ کامل گوشی‌ها و پاوربانک.'
            },

            // --- فاز ۴: تایم‌لاین ساعت‌به‌ساعت روز عروسی (۴ آذر) ---
            {
                id: 'w-0330',
                phase: 'phase-wedding-day',
                time: '03:30',
                title: 'بیدارباش صبح عروسی، دوش سریع و صبحانه مقوی',
                category: 'آرایشگاه و لباس',
                owner: 'عروس',
                priority: 'high',
                completed: false,
                notes: 'حتماً صبحانه سبک ولی مقوی (مثل عسل، تخم‌مرغ یا نان و پنیر و گردو) میل کنید چون تا ظهر زمان محدود است. لباس دکمه‌دار یا زیپ‌دار بپوشید که موقع تعویض مو و میکاپ خراب نشود.'
            },
            {
                id: 'w-0400',
                phase: 'phase-wedding-day',
                time: '04:00',
                title: 'شروع نوبت آرایشگاه عروس (میکاپ و شینیون)',
                category: 'آرایشگاه و لباس',
                owner: 'عروس',
                priority: 'high',
                completed: false,
                notes: 'حضور به‌موقع در سالن زیبایی. همزمان هماهنگی برای صبحانه/میان‌وعده عروس در سالن.'
            },
            {
                id: 'w-0830',
                phase: 'phase-wedding-day',
                time: '08:30',
                title: 'نوبت پیرایشگاه داماد و تحویل دسته گل طبیعی عروس',
                category: 'گل‌آرایی و ماشین',
                owner: 'داماد',
                priority: 'high',
                completed: false,
                notes: 'داماد بعد از پیرایش، دسته گل عروس و گل کت داماد را از گل‌فروشی تحویل گرفته و به سمت سالن زیبایی حرکت می‌کند.'
            },
            {
                id: 'w-0930',
                phase: 'phase-wedding-day',
                time: '09:30',
                title: 'پوشیدن لباس عروس و ورود داماد به آرایشگاه (First Look)',
                category: 'آرایشگاه و لباس',
                owner: 'مشترک',
                priority: 'high',
                completed: false,
                notes: 'عکاسی و فیلم‌برداری لحظه دیدار اول، تحویل دسته گل و چک نهایی استایل عروس و داماد.'
            },
            {
                id: 'w-1030',
                phase: 'phase-wedding-day',
                time: '10:30',
                title: 'حرکت به سمت عمارت / لوکیشن عکاسی و فرمالیته روز عروسی',
                category: 'آتلیه و رسانه',
                owner: 'مشترک',
                priority: 'high',
                completed: false,
                notes: 'عکاسی و فیلم‌برداری فضای باز و عمارت. همراه داشتن آب معدنی، نی (برای خراب نشدن رژلب) و میان‌وعده سبک.'
            },
            {
                id: 'w-1430',
                phase: 'phase-wedding-day',
                time: '14:30',
                title: 'ناهار سبک، استراحت کوتاه و ترمیم میکاپ و مو',
                category: 'آرایشگاه و لباس',
                owner: 'مشترک',
                priority: 'medium',
                completed: false,
                notes: 'تجدید آرایش، فیکس کردن موها و بررسی اتوی لباس قبل از ورود به مراسم اصلی.'
            },
            {
                id: 'w-1630',
                phase: 'phase-wedding-day',
                time: '16:30',
                title: 'حرکت به سمت تالار و هماهنگی نهایی پشت صحنه',
                category: 'اجرای مراسم',
                owner: 'مشترک',
                priority: 'high',
                completed: false,
                notes: 'استقرار در اتاق عقد/استراحت تالار. هماهنگی نهایی با مدیر تالار، دی‌جی و گروه فیلم‌برداری.'
            },
            {
                id: 'w-1800',
                phase: 'phase-wedding-day',
                time: '18:00',
                title: 'شروع رسمی مراسم و ورود مهمانان به تالار',
                category: 'تالار و پذیرایی',
                owner: 'خانواده/ساقدوش',
                priority: 'high',
                completed: false,
                notes: 'استقبال خانواده‌ها از مهمانان، پذیرایی اولیه (چای، شیرینی، شربت) و پخش موسیقی لایت.'
            },
            {
                id: 'w-1945',
                phase: 'phase-wedding-day',
                time: '19:45',
                title: 'آماده‌باش تیم فیلم‌برداری و موزیک در ورودی تالار',
                category: 'اجرای مراسم',
                owner: 'خانواده/ساقدوش',
                priority: 'high',
                completed: false,
                notes: 'تست نورپردازی مسیر ورود، آماده‌سازی دستگاه‌های آتش‌بازی/مه سرد و جمع کردن مهمانان در سالن.'
            },
            {
                id: 'w-2000',
                phase: 'phase-wedding-day',
                time: '20:00',
                title: 'ورود باشکوه عروس و داماد به تالار + رقص تانگو (رقص اول)',
                category: 'اجرای مراسم',
                owner: 'مشترک',
                priority: 'high',
                completed: false,
                notes: 'ورود با آهنگ منتخب ساعت ۲۰:۰۰، نورپردازی ویژه و اجرای رقص دونفره اول.'
            },
            {
                id: 'w-2130',
                phase: 'phase-wedding-day',
                time: '21:30',
                title: 'سرو شام عروسی و سر زدن عروس و داماد به میز مهمانان',
                category: 'تالار و پذیرایی',
                owner: 'مشترک',
                priority: 'medium',
                completed: false,
                notes: 'حتماً خود عروس و داماد هم شام میل کنند! سپس خوش‌آمدگویی صمیمی به میز مهمانان.'
            },
            {
                id: 'w-2245',
                phase: 'phase-wedding-day',
                time: '22:45',
                title: 'مراسم برش کیک، شاباش و عکس‌های یادگاری خانوادگی',
                category: 'اجرای مراسم',
                owner: 'مشترک',
                priority: 'high',
                completed: false,
                notes: 'هماهنگی ساقدوش‌ها برای جمع‌آوری هدایا و پاکت‌های شاباش در کیف مخصوص.'
            },
            {
                id: 'w-2345',
                phase: 'phase-wedding-day',
                time: '23:45',
                title: 'خداحافظی با مهمانان، تحویل هدایا به فرد امین و بدرقه',
                category: 'اجرای مراسم',
                owner: 'مشترک',
                priority: 'high',
                completed: false,
                notes: 'تحویل جعبه هدایا و وسایل باارزش به فرد معتمد خانواده، تسویه نهایی با عوامل تالار و حرکت به سمت خانه بخت.'
            },

            // --- فاز ۵: بعد از مراسم ---
            {
                id: 't-501',
                phase: 'phase-after',
                time: 'روز بعد',
                title: 'عودت لباس عروس/داماد اجاره‌ای و تسویه نهایی آتلیه',
                category: 'آرایشگاه و لباس',
                owner: 'مشترک',
                priority: 'medium',
                completed: false,
                notes: 'بررسی سلامت لباس‌ها قبل از تحویل به مزون و پیگیری زمان تحویل فایل‌های خام و آلبوم عروسی.'
            }
        ];
