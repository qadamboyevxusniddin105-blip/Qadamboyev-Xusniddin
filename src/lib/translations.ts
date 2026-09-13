import { Language } from '../types.js';

export const translations = {
  uz: {
    // Masthead & Brand
    brandTitle: 'Xusniddin coder',
    brandTagline: 'Webcraft • Zamonaviy axborot portali',
    todayEdition: 'Xalqaro Nashr',
    marketTicker: 'Bozorlar: S&P 500 +0.64% • NASDAQ +0.88% • Brent Nefti $74.80',
    
    // Bottom Dock & Navigation
    navHome: 'Asosiy',
    navCategories: 'Bo‘limlar',
    navSearch: 'Qidiruv',
    navTheme: 'Rejim',
    navThemeDark: 'Kechki rejim',
    navThemeLight: 'Tongi rejim',
    navLanguage: 'Til',
    navProfile: 'Profil',
    navAdmin: 'Admin',
    navLogin: 'Kirish',
    navLogout: 'Chiqish',
    allStories: 'Barcha xabarlar',
    
    // Search
    searchPlaceholder: 'Maqolalar, tahlillar va xabarlarni qidirish...',
    searchStories: 'Yangiliklarni qidirish',
    searchResultsFor: 'Qidiruv natijalari:',
    clear: 'Tozalash',
    noArticlesFound: 'Hech qanday maqola topilmadi',
    noArticlesDesc: 'Qidiruv so‘zini o‘zgartirib ko‘ring yoki boshqa bo‘limni tanlang.',
    
    // Article cards & details
    minRead: 'daq. o‘qish',
    views: 'ko‘rishlar',
    breakingLead: 'Tezkor xabar',
    featuredStory: 'Asosiy tahlil',
    editorInChief: 'Bosh muharrir',
    by: 'Muallif:',
    publishedOn: 'Chop etilgan sana:',
    updatedOn: 'Yangilangan:',
    shareStory: 'Ulashish',
    linkCopied: 'Havola nusxalandi!',
    backToStories: 'Barcha yangiliklarga qaytish',
    relatedStories: 'Mavzuga oid boshqa maqolalar',
    trendingSection: 'Eng ko‘p o‘qilganlar',
    latestDispatches: 'So‘nggi xabarlar',
    
    // Profile Modal (Admin only)
    profileTitle: 'Admin Profili',
    profileSubtitle: 'Shaxsiy ma’lumotlar, avatar va xavfsizlik sozlamalari',
    profileOnlyAdmin: 'Ushbu bo‘lim faqat tizim ma’muri (Admin) uchun ochiq.',
    usernameLabel: 'Nik / Ism',
    usernamePlaceholder: 'Masalan: Chief Editor',
    avatarLabel: 'Profil rasmi (Avatar)',
    avatarUrlPlaceholder: 'Rasm havolasini kiriting yoki yuklang...',
    uploadPhoto: 'Rasm yuklash',
    choosePresetAvatar: 'Tayyor avatarlar',
    titleLabel: 'Lavozim / Unvon',
    titlePlaceholder: 'Masalan: Bosh muharrir & Tahririyat rahbari',
    emailLabel: 'Elektron pochta',
    newPasswordLabel: 'Yangi parol (o‘zgartirish shart bo‘lmasa bo‘sh qoldiring)',
    newPasswordPlaceholder: 'Kamida 8 ta belgi',
    saveProfile: 'O‘zgarishlarni saqlash',
    saving: 'Saqlanmoqda...',
    profileSavedSuccess: 'Profil muvaffaqiyatli saqlangandi!',
    profileSavedError: 'Profilni saqlashda xatolik yuz berdi',
    adminStatusActive: 'Bosh muharrir sessiyasi faol',
    lastLoginText: 'Oxirgi kirish:',
    
    // Admin Panel
    adminPortal: 'Tahririyat va Admin Paneli',
    editorialConsole: 'Muharrir boshqaruv konsoli',
    adminLoginTitle: 'Muharrir Kirishi',
    adminLoginSubtitle: 'Yagona administrator siyosati bilan himoyalangan konsol',
    loginEmailLabel: 'Admin elektron pochtasi',
    loginPasswordLabel: 'Parol',
    loginButton: 'Konsolga kirish',
    loggingIn: 'Tekshirilmoqda...',
    backToSite: 'Saytga qaytish',
    architectureGuide: 'Arxitektura & OWASP',
    tabsArticles: 'Maqolalar',
    tabsEditor: 'Muharrir',
    tabsCategories: 'Bo‘limlar',
    tabsSecurity: 'Xavfsizlik & OWASP',
    tabsProfile: 'Mening profilim',
    newArticleBtn: 'Yangi maqola',
    totalArticles: 'Jami maqolalar',
    totalViews: 'Jami ko‘rishlar',
    activeCategories: 'Faol bo‘limlar',
    statusPublished: 'Chop etilgan',
    statusDraft: 'Qoralama',
    editAction: 'Tahrirlash',
    deleteAction: 'O‘chirish',
    
    // Quick helpers
    close: 'Yopish',
    cancel: 'Bekor qilish',
    confirm: 'Tasdiqlash',
    copied: 'Nusxalandi',
  },
  ru: {
    // Masthead & Brand
    brandTitle: 'Xusniddin coder',
    brandTagline: 'Webcraft • Информационный портал',
    todayEdition: 'Международный выпуск',
    marketTicker: 'Рынки: S&P 500 +0.64% • NASDAQ +0.88% • Нефть Brent $74.80',
    
    // Bottom Dock & Navigation
    navHome: 'Главная',
    navCategories: 'Рубрики',
    navSearch: 'Поиск',
    navTheme: 'Тема',
    navThemeDark: 'Темная тема',
    navThemeLight: 'Светлая тема',
    navLanguage: 'Язык',
    navProfile: 'Профиль',
    navAdmin: 'Админ',
    navLogin: 'Войти',
    navLogout: 'Выйти',
    allStories: 'Все материалы',
    
    // Search
    searchPlaceholder: 'Поиск статей, расследований и аналитики...',
    searchStories: 'Поиск новостей',
    searchResultsFor: 'Результаты поиска:',
    clear: 'Очистить',
    noArticlesFound: 'Статьи не найдены',
    noArticlesDesc: 'Попробуйте изменить поисковый запрос или выберите другую категорию.',
    
    // Article cards & details
    minRead: 'мин чтения',
    views: 'просмотров',
    breakingLead: 'Срочная новость',
    featuredStory: 'Главная тема',
    editorInChief: 'Главный редактор',
    by: 'Автор:',
    publishedOn: 'Опубликовано:',
    updatedOn: 'Обновлено:',
    shareStory: 'Поделиться',
    linkCopied: 'Ссылка скопирована!',
    backToStories: 'Назад ко всем материалам',
    relatedStories: 'Материалы по теме',
    trendingSection: 'Популярное сейчас',
    latestDispatches: 'Свежие публикации',
    
    // Profile Modal (Admin only)
    profileTitle: 'Профиль Администратора',
    profileSubtitle: 'Управление личными данными, аватаром и безопасностью',
    profileOnlyAdmin: 'Этот раздел доступен исключительно администратору издания.',
    usernameLabel: 'Имя / Никнейм',
    usernamePlaceholder: 'Например: Главный Редактор',
    avatarLabel: 'Фотография профиля (Аватар)',
    avatarUrlPlaceholder: 'Введите URL изображения или загрузите файл...',
    uploadPhoto: 'Загрузить фото',
    choosePresetAvatar: 'Выбрать аватар',
    titleLabel: 'Должность / Титул',
    titlePlaceholder: 'Например: Главный редактор и издатель',
    emailLabel: 'Электронная почта',
    newPasswordLabel: 'Новый пароль (оставьте пустым, если не меняете)',
    newPasswordPlaceholder: 'Минимум 8 символов',
    saveProfile: 'Сохранить изменения',
    saving: 'Сохранение...',
    profileSavedSuccess: 'Профиль успешно обновлен!',
    profileSavedError: 'Ошибка при сохранении профиля',
    adminStatusActive: 'Сессия редактора активна',
    lastLoginText: 'Последний вход:',
    
    // Admin Panel
    adminPortal: 'Редакционный портал и Админка',
    editorialConsole: 'Консоль главного редактора',
    adminLoginTitle: 'Вход для Редактора',
    adminLoginSubtitle: 'Защищенная консоль с политикой единого администратора',
    loginEmailLabel: 'Email администратора',
    loginPasswordLabel: 'Пароль',
    loginButton: 'Войти в консоль',
    loggingIn: 'Проверка данных...',
    backToSite: 'Вернуться на сайт',
    architectureGuide: 'Архитектура & OWASP',
    tabsArticles: 'Статьи',
    tabsEditor: 'Редактор',
    tabsCategories: 'Категории',
    tabsSecurity: 'Безопасность & OWASP',
    tabsProfile: 'Мой профиль',
    newArticleBtn: 'Создать статью',
    totalArticles: 'Всего статей',
    totalViews: 'Всего просмотров',
    activeCategories: 'Активных рубрик',
    statusPublished: 'Опубликовано',
    statusDraft: 'Черновик',
    editAction: 'Редактировать',
    deleteAction: 'Удалить',
    
    // Quick helpers
    close: 'Закрыть',
    cancel: 'Отмена',
    confirm: 'Подтвердить',
    copied: 'Скопировано',
  },
  en: {
    // Masthead & Brand
    brandTitle: 'Xusniddin coder',
    brandTagline: 'Webcraft • News & Intelligence Portal',
    todayEdition: 'International Edition',
    marketTicker: 'Markets: S&P 500 +0.64% • NASDAQ +0.88% • Brent Crude $74.80',
    
    // Bottom Dock & Navigation
    navHome: 'Home',
    navCategories: 'Categories',
    navSearch: 'Search',
    navTheme: 'Theme',
    navThemeDark: 'Night Mode',
    navThemeLight: 'Day Mode',
    navLanguage: 'Language',
    navProfile: 'Profile',
    navAdmin: 'Admin',
    navLogin: 'Sign In',
    navLogout: 'Sign Out',
    allStories: 'All Stories',
    
    // Search
    searchPlaceholder: 'Search across reports, investigations, and analysis...',
    searchStories: 'Search stories',
    searchResultsFor: 'Search results for:',
    clear: 'Clear',
    noArticlesFound: 'No articles found',
    noArticlesDesc: 'Try adjusting your search criteria or selecting another section.',
    
    // Article cards & details
    minRead: 'min read',
    views: 'views',
    breakingLead: 'Breaking Lead',
    featuredStory: 'Featured Story',
    editorInChief: 'Editor-in-Chief',
    by: 'By',
    publishedOn: 'Published on',
    updatedOn: 'Updated:',
    shareStory: 'Share Story',
    linkCopied: 'Link copied to clipboard!',
    backToStories: 'Back to all stories',
    relatedStories: 'Related Coverage',
    trendingSection: 'Most Read Stories',
    latestDispatches: 'Latest Dispatches',
    
    // Profile Modal (Admin only)
    profileTitle: 'Admin Profile',
    profileSubtitle: 'Manage personal identity, avatar, and security parameters',
    profileOnlyAdmin: 'This console is exclusively accessible to the chief administrator.',
    usernameLabel: 'Nickname / Username',
    usernamePlaceholder: 'e.g. Chief Editor',
    avatarLabel: 'Profile Picture (Avatar)',
    avatarUrlPlaceholder: 'Enter image URL or upload...',
    uploadPhoto: 'Upload Photo',
    choosePresetAvatar: 'Preset Avatars',
    titleLabel: 'Title & Editorial Role',
    titlePlaceholder: 'e.g. Editor-in-Chief & Publisher',
    emailLabel: 'Email Address',
    newPasswordLabel: 'New Password (leave empty to keep existing)',
    newPasswordPlaceholder: 'Minimum 8 characters',
    saveProfile: 'Save Changes',
    saving: 'Saving...',
    profileSavedSuccess: 'Profile successfully updated!',
    profileSavedError: 'Failed to update profile',
    adminStatusActive: 'Editorial Session Active',
    lastLoginText: 'Last Login:',
    
    // Admin Panel
    adminPortal: 'Editorial & Admin Portal',
    editorialConsole: 'Editorial Management Console',
    adminLoginTitle: 'Editor Sign In',
    adminLoginSubtitle: 'Protected console enforcing single-administrator policy',
    loginEmailLabel: 'Admin Email',
    loginPasswordLabel: 'Password',
    loginButton: 'Enter Console',
    loggingIn: 'Authenticating...',
    backToSite: 'Return to Site',
    architectureGuide: 'Architecture & OWASP',
    tabsArticles: 'Articles',
    tabsEditor: 'Editor',
    tabsCategories: 'Categories',
    tabsSecurity: 'Security & OWASP',
    tabsProfile: 'My Profile',
    newArticleBtn: 'New Article',
    totalArticles: 'Total Articles',
    totalViews: 'Total Reads',
    activeCategories: 'Active Categories',
    statusPublished: 'Published',
    statusDraft: 'Draft',
    editAction: 'Edit',
    deleteAction: 'Delete',
    
    // Quick helpers
    close: 'Close',
    cancel: 'Cancel',
    confirm: 'Confirm',
    copied: 'Copied',
  }
};

export type TranslationKeys = keyof typeof translations.en;

export function getTranslation(lang: Language | string = 'uz', key: TranslationKeys | string): string {
  const safeLang = (lang === 'ru' || lang === 'en' ? lang : 'uz') as Language;
  return (translations[safeLang] as any)?.[key] || (translations.en as any)?.[key] || (translations.uz as any)?.[key] || String(key);
}

export function getTimeAgo(date: Date, lang: Language | string = 'uz'): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (lang === 'en') {
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  }

  if (lang === 'ru') {
    if (diffInSeconds < 60) return 'Только что';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} мин. назад`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ч. назад`;
    return `${Math.floor(diffInSeconds / 86400)} дн. назад`;
  }

  // Default: uz
  if (diffInSeconds < 60) return 'Hozirgina';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} daq. oldin`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} soat oldin`;
  return `${Math.floor(diffInSeconds / 86400)} kun oldin`;
}
