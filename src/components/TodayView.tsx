/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Task, AppSettings } from '../types';
import { motion } from 'motion/react';
import {
  Menu,
  Settings,
  Zap,
  Heart,
  ChevronRight,
  Check,
  Sun,
  Moon,
  Plus,
} from 'lucide-react';

interface TodayViewProps {
  tasks: Task[];
  settings: AppSettings;
  onToggleTask: (id: string) => void;
  onAddTask: (day: string, timeOfDay?: 'morning' | 'evening' | 'general') => void;
  onNavigate: (view: 'today' | 'calendar' | 'stats' | 'settings') => void;
}

export default function TodayView({
  tasks,
  settings,
  onToggleTask,
  onAddTask,
  onNavigate,
}: TodayViewProps) {
  // Get current day name (e.g. "Thursday")
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayName = weekdays[new Date().getDay()];

  // Filter tasks for today
  const todayTasks = tasks.filter(t => t.day.toLowerCase() === todayName.toLowerCase());

  const completedToday = todayTasks.filter(t => t.status === 'completed').length;
  const totalToday = todayTasks.length;
  const progressPercent = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;

  // Group today's tasks
  const morningTasks = todayTasks.filter(t => t.timeOfDay === 'morning');
  const eveningTasks = todayTasks.filter(t => t.timeOfDay === 'evening');
  const generalTasks = todayTasks.filter(t => t.timeOfDay === 'general');

  // Format today's date
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };
  const formattedDate = new Date().toLocaleDateString('en-US', options).toUpperCase();

  return (
    <div className="flex flex-col min-h-screen bg-[#faf8ff] pb-24">
      {/* Top App Bar */}
      <header className="flex items-center justify-between px-6 h-16 w-full border-b border-gray-200 bg-white sticky top-0 z-40">
        <div className="flex items-center">
          <button className="p-2 -ml-2 text-emerald-700 hover:bg-gray-100 transition-colors duration-200 rounded-full">
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-bold text-xl text-gray-900 ml-2">Routines</span>
        </div>
        <div className="flex items-center">
          <button
            onClick={() => onNavigate('settings')}
            className="p-2 text-gray-600 hover:bg-gray-100 transition-colors duration-200 rounded-full"
          >
            <Settings className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="px-6 pt-8 max-w-md mx-auto w-full">
        {/* Date Header */}
        <div className="mb-8">
          <p className="font-semibold text-xs text-emerald-700 mb-1 tracking-wider">
            {formattedDate}
          </p>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Today's Focus</h2>
        </div>

        {/* Progress Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {/* Daily Progress Card */}
          <div className="col-span-2 p-4 border border-gray-200 rounded-2xl bg-white flex flex-col justify-between h-44 shadow-sm">
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Daily Progress
              </span>
              <div className="mt-2 text-5xl font-black text-gray-900 leading-none">
                {progressPercent}%
              </div>
            </div>
            <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden p-0.5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="bg-emerald-400 h-full rounded-full shadow-[0_0_10px_rgba(52,211,153,0.3)]"
              />
            </div>
          </div>

          {/* Streak Days Card */}
          <div className="p-4 border border-gray-200 rounded-2xl bg-white flex flex-col items-center justify-center text-center shadow-sm">
            <Zap className="w-8 h-8 text-emerald-600 fill-current mb-2" />
            <div className="text-2xl font-black text-gray-900">{settings.streakDays}</div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Streak Days
            </p>
          </div>

          {/* Wellness Score Card */}
          <div className="p-4 border border-gray-200 rounded-2xl bg-white flex flex-col items-center justify-center text-center shadow-sm">
            <Heart className="w-8 h-8 text-purple-600 fill-current mb-2" />
            <div className="text-2xl font-black text-gray-900">{settings.wellnessScore}</div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Wellness
            </p>
          </div>
        </div>

        {/* Task Sections */}
        <div className="space-y-8">
          {/* Morning Block */}
          {morningTasks.length > 0 && (
            <section>
              <h3 className="text-xs font-bold text-gray-500 mb-4 flex items-center uppercase tracking-widest">
                <Sun className="w-4 h-4 text-emerald-600 mr-2" />
                Morning Routine
              </h3>
              <div className="space-y-3">
                {morningTasks.map(task => (
                  <motion.div
                    key={task.id}
                    onClick={() => onToggleTask(task.id)}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-2xl hover:border-emerald-400 transition-all duration-200 shadow-sm cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <button
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                          task.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-700 border-none'
                            : 'border-2 border-gray-300'
                        }`}
                      >
                        {task.status === 'completed' && <Check className="w-4 h-4 stroke-[3px]" />}
                      </button>
                      <div>
                        <p className={`font-bold text-sm ${task.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                          {task.name}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {task.duration} mins • Morning
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Evening Block */}
          {eveningTasks.length > 0 && (
            <section>
              <h3 className="text-xs font-bold text-gray-500 mb-4 flex items-center uppercase tracking-widest">
                <Moon className="w-4 h-4 text-purple-600 mr-2" />
                Evening Focus
              </h3>
              <div className="space-y-3">
                {eveningTasks.map(task => (
                  <motion.div
                    key={task.id}
                    onClick={() => onToggleTask(task.id)}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-2xl hover:border-emerald-400 transition-all duration-200 shadow-sm cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <button
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                          task.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-700 border-none'
                            : 'border-2 border-gray-300'
                        }`}
                      >
                        {task.status === 'completed' && <Check className="w-4 h-4 stroke-[3px]" />}
                      </button>
                      <div>
                        <p className={`font-bold text-sm ${task.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                          {task.name}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {task.duration} mins • Evening
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* General Block */}
          {generalTasks.length > 0 && (
            <section>
              <h3 className="text-xs font-bold text-gray-500 mb-4 flex items-center uppercase tracking-widest">
                <Check className="w-4 h-4 text-indigo-600 mr-2" />
                General Goals
              </h3>
              <div className="space-y-3">
                {generalTasks.map(task => (
                  <motion.div
                    key={task.id}
                    onClick={() => onToggleTask(task.id)}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-2xl hover:border-emerald-400 transition-all duration-200 shadow-sm cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <button
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                          task.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-700 border-none'
                            : 'border-2 border-gray-300'
                        }`}
                      >
                        {task.status === 'completed' && <Check className="w-4 h-4 stroke-[3px]" />}
                      </button>
                      <div>
                        <p className={`font-bold text-sm ${task.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                          {task.name}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {task.duration} mins • General
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Empty State */}
          {todayTasks.length === 0 && (
            <div className="text-center py-12 px-4 border-2 border-dashed border-gray-200 rounded-2xl bg-white">
              <Sun className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-bold text-sm mb-1">No tasks scheduled for today</p>
              <p className="text-gray-400 text-xs mb-4">Add routines in the Calendar view to see them here.</p>
              <button
                onClick={() => onNavigate('calendar')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-200 transition-colors"
              >
                Go to Calendar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* FAB */}
      {todayTasks.length > 0 && (
        <motion.button
          onClick={() => onAddTask(todayName)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-24 right-6 md:right-[calc(50%-200px)] w-14 h-14 bg-purple-600 text-white rounded-2xl flex items-center justify-center shadow-xl z-50 hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-8 h-8" />
        </motion.button>
      )}
    </div>
  );
}
