/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppSettings, SheetsSyncInfo } from '../types';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  HelpCircle,
  Minus,
  Plus,
  RefreshCw,
  LogOut,
  Trash2,
  Sliders,
  Bell,
  Sparkles,
  CheckCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { User } from 'firebase/auth';

interface SettingsViewProps {
  settings: AppSettings;
  syncInfo: SheetsSyncInfo;
  user: User | null;
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
  onResetData: () => void;
  onGoogleLogin: () => void;
  onGoogleLogout: () => void;
  onForceSync: () => void;
  onNavigateBack: () => void;
}

export default function SettingsView({
  settings,
  syncInfo,
  user,
  onUpdateSettings,
  onResetData,
  onGoogleLogin,
  onGoogleLogout,
  onForceSync,
  onNavigateBack,
}: SettingsViewProps) {
  const handleIncrementColumns = () => {
    if (settings.gridColumns < 8) {
      onUpdateSettings({ gridColumns: settings.gridColumns + 1 });
    }
  };

  const handleDecrementColumns = () => {
    if (settings.gridColumns > 1) {
      onUpdateSettings({ gridColumns: settings.gridColumns - 1 });
    }
  };

  const handleToggleLabels = () => {
    onUpdateSettings({ universalLabels: !settings.universalLabels });
  };

  const handleToggleReminders = () => {
    onUpdateSettings({ reminders: !settings.reminders });
  };

  const handleCycleTheme = () => {
    const nextTheme: AppSettings['theme'] =
      settings.theme === 'light'
        ? 'high-contrast-light'
        : settings.theme === 'high-contrast-light'
        ? 'dark'
        : 'light';
    onUpdateSettings({ theme: nextTheme });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-24">
      {/* Top App Bar */}
      <header className="bg-white border-b border-gray-200 z-40 sticky top-0">
        <div className="flex items-center justify-between px-6 h-16 w-full max-w-md mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={onNavigateBack}
              aria-label="Back"
              className="p-2 -ml-2 transition-colors duration-200 hover:bg-gray-100 rounded-lg text-emerald-800"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="font-bold text-xl text-gray-900">Settings</h1>
          </div>
          <div className="flex items-center">
            <button className="p-2 transition-colors duration-200 hover:bg-gray-100 rounded-full text-gray-500">
              <HelpCircle className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-md mx-auto px-6 py-6 w-full space-y-8">
        {/* Google Sheets Integration Section */}
        <section>
          <h2 className="text-[10px] font-bold text-gray-400 mb-3 uppercase tracking-wider px-2">
            Cloud Sync (Google Sheets)
          </h2>
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
            {user ? (
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                      Sheets Connected
                      <CheckCircle className="w-4 h-4 text-emerald-500 fill-current" />
                    </p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    {syncInfo.lastSyncedAt && (
                      <p className="text-[10px] text-gray-400 mt-1">
                        Last Synced: {new Date(syncInfo.lastSyncedAt).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={onForceSync}
                    disabled={syncInfo.syncing}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-100"
                  >
                    <RefreshCw className={`w-4 h-4 ${syncInfo.syncing ? 'animate-spin' : ''}`} />
                    {syncInfo.syncing ? 'Syncing...' : 'Sync Now'}
                  </button>
                  <button
                    onClick={onGoogleLogout}
                    className="border border-gray-300 hover:bg-gray-50 text-gray-700 py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    Disconnect
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-2 space-y-4">
                <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
                  Connect your Google Account to back up your routine configurations and stats directly in your personal Google Sheets!
                </p>
                
                {/* Official Sign in with Google Button Style */}
                <button
                  onClick={onGoogleLogin}
                  className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-bold text-sm py-3 px-4 rounded-xl shadow-sm transition-all active:scale-[0.99]"
                >
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                    <path fill="none" d="M0 0h48v48H0z"></path>
                  </svg>
                  <span>Sign in with Google</span>
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Layout Management Section */}
        <section>
          <h2 className="text-[10px] font-bold text-gray-400 mb-3 uppercase tracking-wider px-2">
            Layout Management
          </h2>
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            {/* Grid Columns */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
              <div className="flex flex-col pr-4">
                <span className="font-bold text-sm text-gray-900">Grid Columns</span>
                <span className="text-xs text-gray-500 leading-normal mt-1 max-w-[200px]">
                  Manage the number of vertical task slots in your table view.
                </span>
              </div>
              <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl">
                <button
                  onClick={handleDecrementColumns}
                  className="w-10 h-10 rounded-lg bg-white border border-gray-200 text-gray-700 flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all shadow-sm"
                  title="Delete Column"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-lg font-black w-8 text-center text-emerald-700">
                  {settings.gridColumns}
                </span>
                <button
                  onClick={handleIncrementColumns}
                  className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 active:scale-95 transition-all shadow-sm"
                  title="Add Column"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Universal Column Labels */}
            <div className="flex items-center justify-between p-5 hover:bg-gray-50/50 transition-colors">
              <div className="flex flex-col pr-4">
                <span className="font-bold text-sm text-gray-900">Universal Column Labels</span>
                <span className="text-xs text-gray-500 leading-normal mt-1 max-w-[200px]">
                  Sync column headers across all routine templates.
                </span>
              </div>
              <div className="relative inline-block w-14 h-7 align-middle select-none transition duration-200 ease-in">
                <input
                  type="checkbox"
                  checked={settings.universalLabels}
                  onChange={handleToggleLabels}
                  className="absolute block w-7 h-7 rounded-full bg-white border-2 border-gray-300 appearance-none cursor-pointer checked:translate-x-full checked:border-emerald-500 transition-transform duration-200 ease-in-out"
                  id="toggle-headers"
                />
                <label
                  htmlFor="toggle-headers"
                  className={`block overflow-hidden h-7 rounded-full cursor-pointer transition-colors duration-200 ${
                    settings.universalLabels ? 'bg-emerald-500' : 'bg-gray-200'
                  }`}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Global Preferences */}
        <section>
          <h2 className="text-[10px] font-bold text-gray-400 mb-3 uppercase tracking-wider px-2">
            Preferences
          </h2>
          <div className="space-y-3">
            {/* Theme option */}
            <div
              onClick={handleCycleTheme}
              className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center justify-between hover:border-purple-300 transition-all cursor-pointer shadow-sm group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 group-hover:bg-purple-50 group-hover:text-purple-600 transition-colors">
                  <Sliders className="w-5 h-5" />
                </div>
                <span className="font-bold text-sm text-gray-900">Appearance</span>
              </div>
              <span className="text-xs font-bold text-gray-500 italic uppercase">
                {settings.theme === 'light'
                  ? 'Light'
                  : settings.theme === 'high-contrast-light'
                  ? 'High Contrast Light'
                  : 'Dark'}
              </span>
            </div>

            {/* Notifications */}
            <div
              onClick={handleToggleReminders}
              className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center justify-between hover:border-purple-300 transition-all cursor-pointer shadow-sm group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 group-hover:bg-purple-50 group-hover:text-purple-600 transition-colors">
                  <Bell className="w-5 h-5" />
                </div>
                <span className="font-bold text-sm text-gray-900">Task Reminders</span>
              </div>
              <div className="relative inline-block w-14 h-7 align-middle select-none transition duration-200 ease-in">
                <input
                  type="checkbox"
                  checked={settings.reminders}
                  onChange={handleToggleReminders}
                  className="absolute block w-7 h-7 rounded-full bg-white border-2 border-gray-300 appearance-none cursor-pointer checked:translate-x-full checked:border-purple-500 transition-transform duration-200 ease-in-out"
                  id="toggle-reminders"
                />
                <label
                  htmlFor="toggle-reminders"
                  className={`block overflow-hidden h-7 rounded-full cursor-pointer transition-colors duration-200 ${
                    settings.reminders ? 'bg-purple-500' : 'bg-gray-200'
                  }`}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section>
          <h2 className="text-[10px] font-bold text-red-600 mb-3 uppercase tracking-wider px-2">
            Danger Zone
          </h2>
          <div
            onClick={onResetData}
            className="bg-white border-2 border-red-100 rounded-2xl p-5 flex items-center justify-between group cursor-pointer hover:bg-red-50 hover:border-red-300 transition-all duration-200 shadow-sm"
          >
            <div className="flex flex-col">
              <span className="font-bold text-red-600 text-sm">Reset Layout Data</span>
              <span className="text-xs text-gray-400 mt-1 max-w-[200px]">
                Wipes all custom column configurations and resets to 4.
              </span>
            </div>
            <div className="w-10 h-10 rounded-full border border-red-200 text-red-500 flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-all">
              <Trash2 className="w-5 h-5" />
            </div>
          </div>
        </section>

        {/* Aesthetic Decoration Area */}
        <div className="relative w-full h-56 rounded-2xl overflow-hidden border border-emerald-200 shadow-lg group">
          {/* Backdrop Image - clock/gears from public/mockup */}
          <div
            className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
            style={{
              backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDgerfxbyIOw9RhTO97m5AOyYuAWBdAY8X_Ia7JFLnFNUljdYYPDtra0zJ4M7_BvVy1NlH88jklIWoHatdjmbgiYtiWWeYWsDTSZp2FbhZMIl-0GkJwan2_3ywUByRpj25Ee0Dnagn4LUc6KbzZ-Lqd4HRmtWIKQr7I9CMCUZwx6eCwrL8_NEXflALnGOCsXEtfI4TXiBDjOL5_svTB9xK5i-WEHh9LlmTn0AxmEDVBsAvEpZ9G9aLllPDMyHOzCn508J26spAAyQ')`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-emerald-900/40 to-transparent z-10" />
          <div className="absolute bottom-6 left-6 z-20">
            <p className="text-[10px] text-emerald-200 tracking-widest font-bold mb-1">
              WORKSPACE OPTIMIZATION
            </p>
            <p className="text-xl font-bold text-white leading-tight max-w-[240px]">
              Efficiency is born from well-defined structures.
            </p>
          </div>
          <div className="absolute top-6 right-6 z-20">
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
              <Sparkles className="w-5 h-5 fill-current" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
