/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, startTransition } from 'react';
import { Task, AppSettings, SheetsSyncInfo } from './types';
import Splash from './components/Splash';
import TodayView from './components/TodayView';
import CalendarView from './components/CalendarView';
import StatsView from './components/StatsView';
import SettingsView from './components/SettingsView';
import {
  initAuth,
  googleSignIn,
  logout,
  getAccessToken,
} from './firebase';
import {
  findRoutinesSpreadsheet,
  createRoutinesSpreadsheet,
  syncToSpreadsheet,
  syncFromSpreadsheet,
} from './sheetsService';
import { User } from 'firebase/auth';
import { Calendar, Equalizer, Today } from './components/Icons';
import { AnimatePresence, motion } from 'motion/react';

// Default mock routines matching screens
const DEFAULT_TASKS: Task[] = [
  { id: 't1', name: 'Meditation', day: 'Sunday', timeOfDay: 'morning', status: 'completed', duration: 10 },
  { id: 't2', name: 'Hydrate & Journal', day: 'Sunday', timeOfDay: 'morning', status: 'pending', duration: 5 },
  { id: 't3', name: 'Meditation', day: 'Monday', timeOfDay: 'morning', status: 'completed', duration: 10 },
  { id: 't4', name: 'Hydrate & Journal', day: 'Monday', timeOfDay: 'morning', status: 'pending', duration: 5 },
  { id: 't5', name: 'Deep Work Session', day: 'Monday', timeOfDay: 'evening', status: 'pending', duration: 90 },
  { id: 't6', name: 'Meditation', day: 'Tuesday', timeOfDay: 'morning', status: 'completed', duration: 10 },
  { id: 't7', name: 'Hydrate & Journal', day: 'Tuesday', timeOfDay: 'morning', status: 'pending', duration: 5 },
  { id: 't8', name: 'Meditation', day: 'Wednesday', timeOfDay: 'morning', status: 'completed', duration: 10 },
  { id: 't9', name: 'Hydrate & Journal', day: 'Wednesday', timeOfDay: 'morning', status: 'pending', duration: 5 },
  { id: 't10', name: 'Meditation', day: 'Thursday', timeOfDay: 'morning', status: 'completed', duration: 10 },
  { id: 't11', name: 'Hydrate & Journal', day: 'Thursday', timeOfDay: 'morning', status: 'pending', duration: 5 },
  { id: 't12', name: 'Meditation', day: 'Friday', timeOfDay: 'morning', status: 'completed', duration: 10 },
  { id: 't13', name: 'Hydrate & Journal', day: 'Friday', timeOfDay: 'morning', status: 'pending', duration: 5 },
  { id: 't14', name: 'Meditation', day: 'Saturday', timeOfDay: 'morning', status: 'completed', duration: 10 },
  { id: 't15', name: 'Hydrate & Journal', day: 'Saturday', timeOfDay: 'morning', status: 'pending', duration: 5 },
];

const DEFAULT_SETTINGS: AppSettings = {
  gridColumns: 4,
  universalLabels: true,
  theme: 'light',
  reminders: true,
  streakDays: 12,
  wellnessScore: '4/5',
};

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeView, setActiveView] = useState<'today' | 'calendar' | 'stats' | 'settings'>('today');

  // Application state
  const [tasks, setTasks] = useState<Task[]>(() => {
    const local = localStorage.getItem('routines_tasks');
    return local ? JSON.parse(local) : DEFAULT_TASKS;
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const local = localStorage.getItem('routines_settings');
    return local ? JSON.parse(local) : DEFAULT_SETTINGS;
  });

  // User and Sync status state
  const [user, setUser] = useState<User | null>(null);
  const [syncInfo, setSyncInfo] = useState<SheetsSyncInfo>({
    spreadsheetId: null,
    spreadsheetUrl: null,
    lastSyncedAt: null,
    syncing: false,
    error: null,
  });

  // Persist to local storage whenever state changes
  useEffect(() => {
    localStorage.setItem('routines_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('routines_settings', JSON.stringify(settings));
  }, [settings]);

  // Auth and state listener on load
  useEffect(() => {
    const unsubscribe = initAuth(
      (authUser, token) => {
        setUser(authUser);
        checkForSpreadsheet(token);
      },
      () => {
        setUser(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Sync state to Google sheets if logged in
  const triggerAutoSync = async (updatedTasks = tasks, updatedSettings = settings) => {
    const token = getAccessToken();
    if (!user || !token || !syncInfo.spreadsheetId) return;

    try {
      setSyncInfo(prev => ({ ...prev, syncing: true }));
      await syncToSpreadsheet(token, syncInfo.spreadsheetId, updatedTasks, updatedSettings);
      setSyncInfo(prev => ({
        ...prev,
        syncing: false,
        lastSyncedAt: new Date().toISOString(),
        error: null,
      }));
    } catch (err: any) {
      console.error('Auto sync failed:', err);
      setSyncInfo(prev => ({ ...prev, syncing: false, error: err.message }));
    }
  };

  const checkForSpreadsheet = async (token: string) => {
    try {
      setSyncInfo(prev => ({ ...prev, syncing: true }));
      let sheet = await findRoutinesSpreadsheet(token);
      let sheetId = sheet?.id || null;
      let sheetUrl = sheetId ? `https://docs.google.com/spreadsheets/d/${sheetId}` : null;

      if (!sheetId) {
        const newSheet = await createRoutinesSpreadsheet(token);
        sheetId = newSheet.id;
        sheetUrl = newSheet.url;
      }

      setSyncInfo(prev => ({
        ...prev,
        spreadsheetId: sheetId,
        spreadsheetUrl: sheetUrl,
        syncing: false,
      }));

      // Initial Sync Pull
      if (sheetId) {
        const cloudData = await syncFromSpreadsheet(token, sheetId);
        if (cloudData.tasks.length > 0) {
          setTasks(cloudData.tasks);
          setSettings(cloudData.settings);
        } else {
          // If spreadsheet is brand new/empty, seed it with current local data
          await syncToSpreadsheet(token, sheetId, tasks, settings);
        }
        setSyncInfo(prev => ({
          ...prev,
          lastSyncedAt: new Date().toISOString(),
          error: null,
        }));
      }
    } catch (err: any) {
      console.error('Check spreadsheet failed:', err);
      setSyncInfo(prev => ({ ...prev, syncing: false, error: err.message }));
    }
  };

  // Auth triggers
  const handleGoogleLogin = async () => {
    try {
      setSyncInfo(prev => ({ ...prev, syncing: true }));
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        await checkForSpreadsheet(result.accessToken);
      }
    } catch (err: any) {
      setSyncInfo(prev => ({ ...prev, syncing: false, error: err.message }));
    }
  };

  const handleGoogleLogout = async () => {
    await logout();
    setUser(null);
    setSyncInfo({
      spreadsheetId: null,
      spreadsheetUrl: null,
      lastSyncedAt: null,
      syncing: false,
      error: null,
    });
  };

  const handleForceSync = async () => {
    const token = getAccessToken();
    if (!token || !syncInfo.spreadsheetId) return;

    try {
      setSyncInfo(prev => ({ ...prev, syncing: true }));
      await syncToSpreadsheet(token, syncInfo.spreadsheetId, tasks, settings);
      setSyncInfo(prev => ({
        ...prev,
        syncing: false,
        lastSyncedAt: new Date().toISOString(),
        error: null,
      }));
    } catch (err: any) {
      setSyncInfo(prev => ({ ...prev, syncing: false, error: err.message }));
    }
  };

  // Task Handlers
  const handleToggleTask = (id: string) => {
    const updated = tasks.map(t => {
      if (t.id === id) {
        const nextStatus = t.status === 'completed' ? 'pending' : 'completed';
        return { ...t, status: nextStatus };
      }
      return t;
    });
    setTasks(updated);
    triggerAutoSync(updated, settings);
  };

  const handleAddTask = (day: string, timeOfDay: 'morning' | 'evening' | 'general' = 'general') => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      name: '',
      day,
      timeOfDay,
      status: 'pending',
      duration: 10,
    };
    const updated = [...tasks, newTask];
    setTasks(updated);
    triggerAutoSync(updated, settings);
    setActiveView('calendar');
  };

  const handleUpdateTaskName = (id: string, name: string) => {
    const updated = tasks.map(t => (t.id === id ? { ...t, name } : t));
    setTasks(updated);
    triggerAutoSync(updated, settings);
  };

  const handleUpdateTaskStatus = (id: string, status: Task['status']) => {
    const updated = tasks.map(t => (t.id === id ? { ...t, status } : t));
    setTasks(updated);
    triggerAutoSync(updated, settings);
  };

  const handleDeleteTask = (id: string) => {
    const updated = tasks.filter(t => t.id !== id);
    setTasks(updated);
    triggerAutoSync(updated, settings);
  };

  // Settings Handlers
  const handleUpdateSettings = (updates: Partial<AppSettings>) => {
    const updated = { ...settings, ...updates };
    setSettings(updated);
    triggerAutoSync(tasks, updated);
  };

  const handleResetData = () => {
    const confirmed = window.confirm(
      'Are you sure you want to reset all configurations? This will restore standard sample tasks and clean your preferences.'
    );
    if (confirmed) {
      setTasks(DEFAULT_TASKS);
      setSettings(DEFAULT_SETTINGS);
      triggerAutoSync(DEFAULT_TASKS, DEFAULT_SETTINGS);
    }
  };

  const renderView = () => {
    switch (activeView) {
      case 'today':
        return (
          <TodayView
            tasks={tasks}
            settings={settings}
            onToggleTask={handleToggleTask}
            onAddTask={handleAddTask}
            onNavigate={setActiveView}
          />
        );
      case 'calendar':
        return (
          <CalendarView
            tasks={tasks}
            onAddTask={handleAddTask}
            onUpdateTaskName={handleUpdateTaskName}
            onUpdateTaskStatus={handleUpdateTaskStatus}
            onDeleteTask={handleDeleteTask}
          />
        );
      case 'stats':
        return <StatsView tasks={tasks} onNavigate={setActiveView} />;
      case 'settings':
        return (
          <SettingsView
            settings={settings}
            syncInfo={syncInfo}
            user={user}
            onUpdateSettings={handleUpdateSettings}
            onResetData={handleResetData}
            onGoogleLogin={handleGoogleLogin}
            onGoogleLogout={handleGoogleLogout}
            onForceSync={handleForceSync}
            onNavigateBack={() => setActiveView('today')}
          />
        );
      default:
        return null;
    }
  };

  if (showSplash) {
    return (
      <AnimatePresence mode="wait">
        <Splash onComplete={() => startTransition(() => setShowSplash(false))} />
      </AnimatePresence>
    );
  }

  return (
    <div className={`min-h-screen text-gray-800 ${settings.theme === 'dark' ? 'dark bg-slate-900 text-gray-100' : 'bg-gray-50'}`}>
      <div className="max-w-md mx-auto relative bg-white min-h-screen shadow-xl pb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>

        {/* Persistent Bottom Nav Bar (only visible on main dashboards: Today, Calendar, Stats) */}
        {activeView !== 'settings' && (
          <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/95 backdrop-blur-xl border-t border-gray-200 flex justify-around items-center py-3.5 z-50 shadow-2xl">
            <button
              onClick={() => setActiveView('today')}
              className={`flex flex-col items-center justify-center transition-all ${
                activeView === 'today' ? 'text-emerald-600 font-bold scale-105' : 'text-gray-400 hover:text-emerald-500'
              }`}
            >
              <Today active={activeView === 'today'} />
              <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">Today</span>
            </button>

            <button
              onClick={() => setActiveView('calendar')}
              className={`flex flex-col items-center justify-center transition-all ${
                activeView === 'calendar' ? 'text-emerald-600 font-bold scale-105' : 'text-gray-400 hover:text-emerald-500'
              }`}
            >
              <Calendar active={activeView === 'calendar'} />
              <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">Calendar</span>
            </button>

            <button
              onClick={() => setActiveView('stats')}
              className={`flex flex-col items-center justify-center transition-all ${
                activeView === 'stats' ? 'text-purple-600 font-bold scale-105' : 'text-gray-400 hover:text-purple-500'
              }`}
            >
              <Equalizer active={activeView === 'stats'} />
              <span className="text-[10px] font-bold mt-1 uppercase tracking-wider font-sans">Stats</span>
            </button>
          </nav>
        )}
      </div>
    </div>
  );
}
