import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { supabase } from '../lib/supabase';

type ThemeOption = 'light' | 'dark' | 'system';

export default function Settings() {
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const { notify } = useNotifications();

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [realtimeAlerts, setRealtimeAlerts] = useState(true);
  const [theme, setTheme] = useState<ThemeOption>('light');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.user_metadata?.avatar_url ?? null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [deletingAccount, setDeletingAccount] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('insightengine_settings');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed.emailNotifications === 'boolean') {
          setEmailNotifications(parsed.emailNotifications);
        }
        if (typeof parsed.realtimeAlerts === 'boolean') {
          setRealtimeAlerts(parsed.realtimeAlerts);
        }
        if (parsed.theme === 'light' || parsed.theme === 'dark' || parsed.theme === 'system') {
          setTheme(parsed.theme);
        }
      }
    } catch {
      // Ignore invalid localStorage
    }
  }, []);

  useEffect(() => {
    const payload = { emailNotifications, realtimeAlerts, theme };
    try {
      localStorage.setItem('insightengine_settings', JSON.stringify(payload));
    } catch {
      // Ignore storage errors
    }
  }, [emailNotifications, realtimeAlerts, theme]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) root.classList.add('dark');
      else root.classList.remove('dark');
    } else {
      root.classList.remove('dark');
    }

    // Also adjust body background so the difference is obvious
    if (theme === 'dark') {
      document.body.style.backgroundColor = '#0a0a0a';
    } else {
      document.body.style.backgroundColor = '#f7f8f6';
    }
  }, [theme]);

  const triggerAvatarPicker = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user || !session) return;

    setAvatarUploading(true);
    setStatusMessage(null);

    try {
      const reader = new FileReader();
      const filePromise = new Promise<string>((resolve, reject) => {
        reader.onerror = () => reject(new Error('Failed to read file.'));
        reader.onload = () => resolve(reader.result as string);
      });
      reader.readAsDataURL(file);
      const dataUrl = await filePromise;

      const res = await fetch('/api/profile/avatar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          fileData: dataUrl,
          fileName: file.name,
          mimeType: file.type
        })
      });

      // If the backend route is missing in this environment, gracefully
      // fall back to a local-only preview so the UI still works.
      if (res.status === 404) {
        setAvatarPreview(dataUrl);
        setStatusMessage('Using local-only avatar preview (storage endpoint not available).');
        notify('Avatar preview updated (not stored remotely in this environment).', 'info');
        return;
      }

      const contentType = res.headers.get('content-type') || '';
      let body: any = null;
      if (contentType.includes('application/json')) {
        body = await res.json();
      }

      if (!res.ok || body?.error) {
        const message =
          body?.error ||
          `Upload failed with status ${res.status}. Please try a smaller JPG/PNG/WebP image.`;
        throw new Error(message);
      }

      const url = body?.data?.avatar_url as string | undefined;
      if (url) {
        setAvatarPreview(url);
        // Refresh auth metadata for current client
        try {
          await supabase.auth.updateUser({ data: { avatar_url: url } });
        } catch {
          // non-fatal
        }
        setStatusMessage('Profile photo updated.');
        notify('Profile photo updated.', 'success');
      } else {
        throw new Error('Avatar URL missing from response.');
      }
    } catch (error: any) {
      setStatusMessage(error?.message || 'Failed to upload profile photo.');
      notify('Failed to upload profile photo.', 'error');
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteAccount = async () => {
    if (!session) return;
    const confirmed = window.confirm('This will permanently delete your account and related surveys. Continue?');
    if (!confirmed) return;

    setDeletingAccount(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/account', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (!res.ok) {
        let message = 'Failed to delete account.';
        try {
          const body = await res.json();
          if (body?.error) message = body.error;
        } catch {
          // ignore
        }
        throw new Error(message);
      }

      await supabase.auth.signOut();
      navigate('/');
    } catch (error: any) {
      setStatusMessage(error?.message || 'Failed to delete account.');
      notify('Failed to delete account.', 'error');
    } finally {
      setDeletingAccount(false);
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-[#192210] font-sans min-h-screen flex flex-col antialiased">
      <Header />
      <main className="flex-grow p-6 lg:p-12 max-w-4xl mx-auto w-full">
        <div className="bg-white dark:bg-[#232e1a] rounded-2xl shadow-sm p-8 md:p-12 border border-white dark:border-gray-200 dark:border-gray-700 animate-fade-in">
          <div className="mb-12">
            <h1 className="text-3xl font-bold text-[#141b0d] dark:text-white mb-2">Settings</h1>
            <p className="text-[#5c6b4f] dark:text-gray-400">
              Customize your experience and manage application preferences.
            </p>
            {statusMessage && (
              <p className="mt-4 text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                {statusMessage}
              </p>
            )}
          </div>

          <div className="space-y-12">
            <section className="space-y-6">
              <h2 className="text-xl font-bold text-[#141b0d] dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-[#73d411]">account_circle</span>
                Profile
              </h2>
              <div className="flex flex-wrap items-center gap-6">
                <div className="relative">
                  <div className="size-20 rounded-full overflow-hidden border-2 border-[#73d411]/70 bg-gray-50 dark:bg-[#192210] flex items-center justify-center text-[#141b0d] dark:text-white font-bold text-xl">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar" className="size-full object-cover" />
                    ) : (
                      (user?.email?.[0] || 'U').toUpperCase()
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-[#141b0d] dark:text-white font-semibold">
                    {user?.email ?? 'Not signed in'}
                  </p>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={triggerAvatarPicker}
                      disabled={!user || avatarUploading}
                      className="bg-[#141b0d] dark:bg-[#73d411] text-white dark:text-black font-semibold py-2.5 px-5 rounded-lg text-sm disabled:opacity-60"
                    >
                      {avatarUploading ? 'Uploading…' : 'Upload Photo'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAvatarPreview(null);
                        setStatusMessage('Avatar will reset after next refresh.');
                      }}
                      className="bg-transparent border border-[#5c6b4f]/40 text-[#5c6b4f] dark:text-gray-400 font-semibold py-2.5 px-5 rounded-lg text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  <p className="text-xs text-[#5c6b4f] dark:text-gray-500">
                    Images are stored securely in Supabase Storage.
                  </p>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </section>

            <section className="space-y-6">
              <h2 className="text-xl font-bold text-[#141b0d] dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-[#73d411]">notifications</span>
                Notifications
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-[#192210]/50">
                  <div>
                    <p className="font-semibold text-[#141b0d] dark:text-white">Email Notifications</p>
                    <p className="text-sm text-[#5c6b4f] dark:text-gray-400">
                      Receive updates about your decisions via email.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEmailNotifications((v) => !v)}
                    className={`relative inline-flex w-12 h-6 rounded-full transition-colors duration-200 ${
                      emailNotifications
                        ? 'bg-[#73d411]'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                    aria-pressed={emailNotifications}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                        emailNotifications ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-[#192210]/50">
                  <div>
                    <p className="font-semibold text-[#141b0d] dark:text-white">Real-time Alerts</p>
                    <p className="text-sm text-[#5c6b4f] dark:text-gray-400">
                      Get notified immediately when someone responds.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRealtimeAlerts((v) => !v)}
                    className={`relative inline-flex w-12 h-6 rounded-full transition-colors duration-200 ${
                      realtimeAlerts
                        ? 'bg-[#73d411]'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                    aria-pressed={realtimeAlerts}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                        realtimeAlerts ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <h2 className="text-xl font-bold text-[#141b0d] dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-[#73d411]">dark_mode</span>
                Appearance
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`p-4 rounded-xl border-2 text-center ${
                    theme === 'light'
                      ? 'border-[#73d411] bg-white dark:bg-[#232e1a]'
                      : 'border-transparent bg-gray-50 dark:bg-[#192210]/50 hover:border-[#73d411]/30'
                  }`}
                >
                  <span className="material-symbols-outlined block mb-2">light_mode</span>
                  <span className="text-sm font-bold">Light</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`p-4 rounded-xl border-2 text-center ${
                    theme === 'dark'
                      ? 'border-[#73d411] bg-white dark:bg-[#232e1a]'
                      : 'border-transparent bg-gray-50 dark:bg-[#192210]/50 hover:border-[#73d411]/30'
                  }`}
                >
                  <span className="material-symbols-outlined block mb-2">dark_mode</span>
                  <span className="text-sm font-bold">Dark</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('system')}
                  className={`p-4 rounded-xl border-2 text-center ${
                    theme === 'system'
                      ? 'border-[#73d411] bg-white dark:bg-[#232e1a]'
                      : 'border-transparent bg-gray-50 dark:bg-[#192210]/50 hover:border-[#73d411]/30'
                  }`}
                >
                  <span className="material-symbols-outlined block mb-2">settings_brightness</span>
                  <span className="text-sm font-bold">System</span>
                </button>
              </div>
            </section>

            <section className="space-y-6">
              <h2 className="text-xl font-bold text-red-500 flex items-center gap-2">
                <span className="material-symbols-outlined">danger</span>
                Danger Zone
              </h2>
              <div className="p-6 rounded-xl border border-red-500/20 bg-red-500/5 space-y-4">
                <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={deletingAccount}
                  className="bg-red-500 hover:bg-red-600 disabled:bg-red-400 text-white font-bold py-2.5 px-6 rounded-lg text-sm transition-colors"
                >
                  {deletingAccount ? 'Deleting…' : 'Delete Account'}
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
