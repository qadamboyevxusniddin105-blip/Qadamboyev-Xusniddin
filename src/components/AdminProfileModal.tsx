import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  Camera,
  Upload,
  Shield,
  ShieldCheck,
  Check,
  X,
  Lock,
  Mail,
  Briefcase,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { AdminUser, Language } from '../types.js';
import { api } from '../lib/api.js';
import { getTranslation } from '../lib/translations.js';

interface AdminProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminUser: AdminUser | null;
  onUpdateUser: (user: AdminUser) => void;
  onOpenLogin: () => void;
  lang: Language;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80'
];

export const AdminProfileModal: React.FC<AdminProfileModalProps> = ({
  isOpen,
  onClose,
  adminUser,
  onUpdateUser,
  onOpenLogin,
  lang
}) => {
  const [username, setUsername] = useState(adminUser?.username || '');
  const [avatar, setAvatar] = useState(adminUser?.avatar || PRESET_AVATARS[0]);
  const [title, setTitle] = useState(adminUser?.title || 'Editor-in-Chief & Publisher');
  const [email, setEmail] = useState(adminUser?.email || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Sync state whenever adminUser changes
  React.useEffect(() => {
    if (adminUser) {
      setUsername(adminUser.username || '');
      setAvatar(adminUser.avatar || PRESET_AVATARS[0]);
      setTitle(adminUser.title || 'Editor-in-Chief & Publisher');
      setEmail(adminUser.email || '');
    }
  }, [adminUser]);

  if (!isOpen) return null;

  const t = (key: any) => getTranslation(lang, key);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Iltimos, faqat rasm faylini tanlang (JPG, PNG, WebP)' });
      return;
    }

    setUploadingImage(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataUrl = event.target?.result as string;
        try {
          const uploadedUrl = await api.uploadImage(dataUrl, file.name);
          setAvatar(uploadedUrl);
          setMessage({ type: 'success', text: 'Rasm tayyorlandi! Saqlash tugmasini bosing.' });
        } catch {
          // If server upload fails, fallback to direct dataUrl
          setAvatar(dataUrl);
        } finally {
          setUploadingImage(false);
        }
      };
      reader.readAsDataURL(file);
    } catch {
      setUploadingImage(false);
      setMessage({ type: 'error', text: 'Rasmni yuklashda xatolik yuz berdi.' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminUser) return;

    if (!username.trim()) {
      setMessage({ type: 'error', text: 'Nik / Ism bo‘sh bo‘lishi mumkin emas' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const res = await api.updateProfile({
        username: username.trim(),
        avatar: avatar.trim(),
        title: title.trim(),
        email: email.trim(),
      });

      onUpdateUser(res.user);
      setMessage({ type: 'success', text: t('profileSavedSuccess') });
      setTimeout(() => {
        onClose();
        setMessage(null);
      }, 1200);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || t('profileSavedError') });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-2xl overflow-hidden my-8 z-10"
        >
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-red-950 p-6 text-white relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-stone-200 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-1 text-xs font-semibold uppercase tracking-wider text-red-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{t('adminStatusActive')}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold font-serif">{t('profileTitle')}</h3>
            <p className="text-xs text-stone-300 mt-1">{t('profileSubtitle')}</p>
          </div>

          {!adminUser ? (
            /* Non-logged in State */
            <div className="p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400 flex items-center justify-center mx-auto">
                <Lock className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-stone-900 dark:text-stone-100 font-serif">
                {t('profileOnlyAdmin')}
              </h4>
              <p className="text-sm text-stone-600 dark:text-stone-400 max-w-md mx-auto">
                Ushbu bo‘lim va profil sozlamalari faqat tizim ma’muri uchun mo‘ljallangan. Iltimos, admin sifatida tizimga kiring.
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={() => {
                    onClose();
                    onOpenLogin();
                  }}
                  className="px-5 py-2.5 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  {t('navLogin')} (Admin)
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 rounded-xl text-sm font-medium hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                >
                  {t('cancel')}
                </button>
              </div>
            </div>
          ) : (
            /* Logged in Admin Profile Editor */
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {message && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-3.5 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2 ${
                    message.type === 'success'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
                  }`}
                >
                  {message.type === 'success' ? (
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  )}
                  <span>{message.text}</span>
                </motion.div>
              )}

              {/* Avatar Section with Live Preview */}
              <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/80 dark:border-stone-700/60">
                <div className="relative group">
                  <img
                    src={avatar}
                    alt={username}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-stone-700 shadow-md transition-transform group-hover:scale-105"
                  />
                  <label
                    htmlFor="avatar-upload"
                    className="absolute bottom-0 right-0 p-2 bg-red-700 hover:bg-red-800 text-white rounded-full shadow-lg cursor-pointer transition-colors"
                    title={t('uploadPhoto')}
                  >
                    <Camera className="w-4 h-4" />
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="flex-1 text-center sm:text-left space-y-2">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <span className="text-sm font-bold text-stone-900 dark:text-stone-100">
                      {username || 'Administrator'}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300">
                      Admin
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    {title || 'Chief Editor'}
                  </p>
                  
                  {/* Preset Avatars Selection */}
                  <div className="pt-2">
                    <div className="text-[11px] font-medium text-stone-500 dark:text-stone-400 mb-1.5">
                      {t('choosePresetAvatar')}:
                    </div>
                    <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                      {PRESET_AVATARS.map((url, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setAvatar(url)}
                          className={`w-7 h-7 rounded-full overflow-hidden border-2 transition-all ${
                            avatar === url
                              ? 'border-red-600 scale-110 shadow-sm'
                              : 'border-transparent hover:border-stone-400 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img src={url} alt={`Preset ${idx}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                {/* Username / Nik */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                    {t('usernameLabel')} *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder={t('usernamePlaceholder')}
                      required
                      className="w-full pl-9 pr-3 py-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-700 text-stone-900 dark:text-stone-100"
                    />
                  </div>
                </div>

                {/* Avatar URL manual input */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                    {t('avatarLabel')} (URL)
                  </label>
                  <input
                    type="url"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder={t('avatarUrlPlaceholder')}
                    className="w-full px-3 py-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-700 text-stone-900 dark:text-stone-100 text-xs font-mono"
                  />
                </div>

                {/* Role / Title */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                    {t('titleLabel')}
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder={t('titlePlaceholder')}
                      className="w-full pl-9 pr-3 py-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-700 text-stone-900 dark:text-stone-100"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                    {t('emailLabel')}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-9 pr-3 py-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-700 text-stone-900 dark:text-stone-100"
                    />
                  </div>
                </div>

                {/* Security Password Notice */}
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block mb-0.5">
                      {lang === 'uz' ? 'Xavfsiz Kirish Himoyasi' : lang === 'ru' ? 'Защита учетной записи' : 'Account Security Lock'}
                    </span>
                    <p className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-300">
                      {lang === 'uz'
                        ? 'Admin paroli eng yuqori darajada shifrlangan. Boshqa shaxslar parolni o‘zgartirib admin bo‘la olmasligi uchun veb-interfeys orqali parolni yangilash o‘chirilgan.'
                        : lang === 'ru'
                        ? 'Смена пароля через веб-интерфейс заблокирована во избежание несанкционированного доступа.'
                        : 'Web password change is permanently disabled to enforce sole-owner administrative security.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Security info stamp */}
              <div className="text-[11px] text-stone-500 dark:text-stone-400 border-t border-stone-200 dark:border-stone-800 pt-3 flex flex-wrap justify-between items-center gap-2">
                <span>{t('lastLoginText')} {adminUser.lastLogin ? new Date(adminUser.lastLogin).toLocaleString() : 'Recent'}</span>
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" /> OWASP A01 & A07 Enforced
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={saving || uploadingImage}
                  className="px-6 py-2.5 bg-red-700 hover:bg-red-800 text-white font-semibold text-sm rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>{t('saving')}</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{t('saveProfile')}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
