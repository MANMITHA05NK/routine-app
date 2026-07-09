/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { Task } from '../types';
import { motion } from 'motion/react';
import { Menu, Settings, Sparkles, TrendingUp } from 'lucide-react';

interface StatsViewProps {
  tasks: Task[];
  onNavigate: (view: 'today' | 'calendar' | 'stats' | 'settings') => void;
}

export default function StatsView({ tasks, onNavigate }: StatsViewProps) {
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const dayAbbrs = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  // Animate chart bars on load
  const [triggerAnimate, setTriggerAnimate] = useState(false);
  useEffect(() => {
    setTriggerAnimate(true);
  }, []);

  // Calculate day-by-day tasks stats
  const dayStats = daysOfWeek.map((day, index) => {
    const dayTasks = tasks.filter(t => t.day.toLowerCase() === day.toLowerCase());
    const total = dayTasks.length;
    const completed = dayTasks.filter(t => t.status === 'completed').length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return {
      day,
      abbr: dayAbbrs[index],
      completed,
      total,
      percentage,
    };
  });

  // Calculate overall completion score
  const totalTasks = tasks.length;
  const totalCompleted = tasks.filter(t => t.status === 'completed').length;
  const averageScore = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;

  return (
    <div className="flex flex-col min-h-screen bg-[#faf8ff] pb-24">
      {/* Top App Bar */}
      <header className="w-full sticky top-0 bg-white border-b border-gray-200 z-50">
        <div className="flex justify-between items-center px-6 h-16 w-full max-w-md mx-auto">
          <button className="hover:bg-gray-100 transition-colors p-2 rounded-full">
            <Menu className="w-6 h-6 text-emerald-700" />
          </button>
          <h1 className="font-extrabold text-xl text-emerald-800">Weekly Overview</h1>
          <button
            onClick={() => onNavigate('settings')}
            className="hover:bg-gray-100 transition-colors p-2 rounded-full"
          >
            <Settings className="w-6 h-6 text-emerald-700" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-md mx-auto px-6 pt-6 w-full space-y-8">
        {/* Weekly Completion Summary */}
        <section>
          <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center justify-between shadow-sm">
            <div>
              <h2 className="text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-wider">
                WEEKLY SUMMARY
              </h2>
              <p className="text-2xl font-extrabold text-gray-900 leading-tight">Completion Score</p>
            </div>
            <div className="relative flex items-center justify-center w-28 h-28">
              <svg className="w-full h-full -rotate-90">
                <circle
                  className="text-gray-100"
                  cx="56"
                  cy="56"
                  fill="transparent"
                  r="48"
                  stroke="currentColor"
                  strokeWidth="8"
                />
                <motion.circle
                  className="text-emerald-400"
                  cx="56"
                  cy="56"
                  fill="transparent"
                  r="48"
                  stroke="currentColor"
                  strokeDasharray="301.44"
                  initial={{ strokeDashoffset: 301.44 }}
                  animate={{ strokeDashoffset: 301.44 - (301.44 * averageScore) / 100 }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  strokeLinecap="round"
                  strokeWidth="8"
                />
              </svg>
              <span className="absolute font-black text-2xl text-emerald-700">{averageScore}%</span>
            </div>
          </div>
        </section>

        {/* Daily Performance Chart */}
        <section>
          <h2 className="text-[10px] font-bold text-gray-400 mb-4 px-1 uppercase tracking-wider">
            DAILY PERFORMANCE
          </h2>
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-end justify-between h-48 gap-3 px-2">
              {dayStats.map((stat, index) => {
                const barHeight = stat.percentage > 0 ? `${stat.percentage}%` : '4%';
                // Colors match screenshot: weekdays = emerald green, Saturday = purple
                const isSaturday = stat.day === 'Saturday';
                const barColorClass = isSaturday
                  ? 'bg-purple-600 shadow-[0_-4px_12px_rgba(124,58,237,0.2)]'
                  : 'bg-emerald-600 shadow-[0_-4px_12px_rgba(5,150,105,0.2)]';

                return (
                  <div key={stat.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <div className="w-full bg-gray-50 rounded-t-lg h-full flex flex-col justify-end">
                      <motion.div
                        initial={{ height: '0%' }}
                        animate={triggerAnimate ? { height: barHeight } : { height: '0%' }}
                        transition={{ duration: 0.8, delay: index * 0.08, ease: 'easeOut' }}
                        className={`w-full rounded-t-lg ${barColorClass}`}
                      />
                    </div>
                    <span className="text-xs font-bold text-gray-500">{stat.abbr}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Detailed Breakdown */}
        <section>
          <h2 className="text-[10px] font-bold text-gray-400 mb-4 px-1 uppercase tracking-wider">
            DETAILED BREAKDOWN
          </h2>
          <div className="space-y-3">
            {dayStats.map(stat => {
              const isSaturday = stat.day === 'Saturday';
              const textClass = isSaturday ? 'text-purple-600 font-bold' : 'text-emerald-700 font-bold';
              const pillBgClass = stat.percentage >= 80 
                ? 'bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full text-xs font-bold border border-emerald-100' 
                : 'text-gray-500 text-xs font-bold';

              return (
                <div
                  key={stat.day}
                  className="bg-white border border-gray-200 rounded-2xl p-4 flex justify-between items-center hover:border-emerald-300 transition-all cursor-pointer shadow-sm"
                >
                  <span className="font-semibold text-gray-800">{stat.day}</span>
                  {stat.total > 0 ? (
                    <span className={stat.percentage >= 80 ? pillBgClass : textClass}>
                      {stat.completed}/{stat.total} tasks
                    </span>
                  ) : (
                    <span className="text-gray-400 text-xs">No tasks</span>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Motivational Insight */}
        <section className="mb-8">
          <div className="relative overflow-hidden bg-purple-600 p-6 rounded-3xl text-white shadow-xl">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-purple-200 fill-current" />
                <h2 className="text-[10px] font-bold text-purple-200 uppercase tracking-widest">
                  INSIGHT
                </h2>
              </div>
              <p className="text-lg font-extrabold mb-2">You're going in a good way!</p>
              <p className="text-sm opacity-90 leading-relaxed">
                Your consistency on weekdays is exceptional. Try to maintain a light routine on
                weekends to keep the momentum high for next Monday.
              </p>
            </div>
            {/* Background decoration */}
            <div className="absolute -right-12 -bottom-12 opacity-10">
              <TrendingUp className="w-48 h-48" />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
