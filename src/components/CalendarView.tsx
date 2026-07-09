/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Task } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, CheckCircle2, XCircle } from 'lucide-react';

interface CalendarViewProps {
  tasks: Task[];
  onAddTask: (day: string) => void;
  onUpdateTaskName: (id: string, name: string) => void;
  onUpdateTaskStatus: (id: string, status: 'pending' | 'completed' | 'failed') => void;
  onDeleteTask: (id: string) => void;
}

export default function CalendarView({
  tasks,
  onAddTask,
  onUpdateTaskName,
  onUpdateTaskStatus,
  onDeleteTask,
}: CalendarViewProps) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // State for modals
  const [feedbackModal, setFeedbackModal] = useState<{
    show: boolean;
    title: string;
    message: string;
    percentage: number;
  }>({
    show: false,
    title: '',
    message: '',
    percentage: 0,
  });

  const [deleteModal, setDeleteModal] = useState<{
    show: boolean;
    taskId: string | null;
  }>({
    show: false,
    taskId: null,
  });

  const handleCalculateDay = (day: string) => {
    const dayTasks = tasks.filter(t => t.day === day);
    if (dayTasks.length === 0) {
      setFeedbackModal({
        show: true,
        title: 'Ready to start?',
        message: 'Add some goals for today first!',
        percentage: 0,
      });
      return;
    }

    const completed = dayTasks.filter(t => t.status === 'completed').length;
    const percentage = Math.round((completed / dayTasks.length) * 100);

    let title = '';
    let message = '';

    if (percentage <= 30) {
      title = 'Keep Pushing!';
      message = `You achieved ${percentage}%. Stay focused and try to tackle one more task.`;
    } else if (percentage <= 60) {
      title = 'Nice Progress';
      message = `You achieved ${percentage}%. You're halfway there, keep the momentum!`;
    } else if (percentage <= 90) {
      title = 'Excellent Work!';
      message = `You achieved ${percentage}%. You are on fire! Almost a perfect score.`;
    } else {
      title = 'Kinetic Achievement!';
      message = `You achieved ${percentage}%. Absolute legend! You crushed it today.`;
    }

    setFeedbackModal({
      show: true,
      title,
      message,
      percentage,
    });
  };

  const triggerDeleteConfirm = (id: string) => {
    setDeleteModal({
      show: true,
      taskId: id,
    });
  };

  const confirmDelete = () => {
    if (deleteModal.taskId) {
      onDeleteTask(deleteModal.taskId);
    }
    setDeleteModal({ show: false, taskId: null });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 fixed top-0 w-full z-40">
        <div className="flex items-center justify-between px-6 h-16 w-full max-w-md mx-auto">
          <h1 className="font-extrabold text-xl text-gray-900">Routines Planner</h1>
        </div>
      </header>

      {/* Main Container */}
      <main className="pt-20 px-6 max-w-md mx-auto w-full space-y-10">
        {days.map(day => {
          const dayTasks = tasks.filter(t => t.day === day);

          return (
            <section key={day} className="day-section">
              {/* Day Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-gray-900">{day}</h2>
                  <button
                    onClick={() => onAddTask(day)}
                    className="w-8 h-8 flex items-center justify-center bg-emerald-100 text-emerald-800 hover:bg-emerald-200 rounded-full transition-all shadow-sm"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <button
                  onClick={() => handleCalculateDay(day)}
                  className="px-4 py-1.5 text-xs font-bold border border-gray-200 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-all active:bg-gray-100 shadow-sm"
                >
                  DAY COMPLETED
                </button>
              </div>

              {/* Task Cards Grid */}
              <div className="space-y-4">
                {dayTasks.map(task => {
                  const isCompleted = task.status === 'completed';
                  const isFailed = task.status === 'failed';

                  return (
                    <div
                      key={task.id}
                      className={`p-4 bg-white border rounded-2xl flex flex-col gap-4 relative shadow-sm transition-all duration-300 ${
                        isCompleted
                          ? 'border-emerald-400 bg-emerald-50/20'
                          : isFailed
                          ? 'border-red-400 bg-red-50/10'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={task.name}
                          onChange={e => onUpdateTaskName(task.id, e.target.value)}
                          placeholder="Enter task..."
                          className="w-full border-0 border-b border-transparent hover:border-gray-200 focus:border-purple-500 focus:ring-0 text-sm p-0 pb-1 font-semibold text-gray-800 bg-transparent placeholder-gray-400"
                        />
                        <button
                          onClick={() => triggerDeleteConfirm(task.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => onUpdateTaskStatus(task.id, 'completed')}
                          className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                            isCompleted
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Completed
                        </button>
                        <button
                          onClick={() => onUpdateTaskStatus(task.id, 'failed')}
                          className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                            isFailed
                              ? 'bg-red-100 text-red-800 border-red-300'
                              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <XCircle className="w-4 h-4" />
                          Not Completed
                        </button>
                      </div>
                    </div>
                  );
                })}

                {dayTasks.length === 0 && (
                  <div className="text-center py-6 border border-dashed border-gray-200 rounded-2xl bg-white/50 text-gray-400 text-xs">
                    No tasks scheduled for {day}
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </main>

      {/* MODALS */}
      <AnimatePresence>
        {/* Feedback Modal */}
        {feedbackModal.show && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white p-6 rounded-3xl max-w-sm w-full border-2 border-emerald-400 text-center shadow-2xl"
            >
              <div className="w-20 h-20 mx-auto mb-4 relative flex items-center justify-center">
                <svg className="w-full h-full -rotate-90">
                  <circle
                    className="text-gray-100"
                    cx="40"
                    cy="40"
                    fill="transparent"
                    r="34"
                    stroke="currentColor"
                    strokeWidth="6"
                  />
                  <circle
                    className="text-emerald-500"
                    cx="40"
                    cy="40"
                    fill="transparent"
                    r="34"
                    stroke="currentColor"
                    strokeDasharray="213.6"
                    strokeDashoffset={213.6 - (213.6 * feedbackModal.percentage) / 100}
                    strokeLinecap="round"
                    strokeWidth="6"
                  />
                </svg>
                <span className="absolute text-sm font-bold text-emerald-600">
                  {feedbackModal.percentage}%
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{feedbackModal.title}</h3>
              <p className="text-sm text-gray-500 mb-6">{feedbackModal.message}</p>
              <button
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-emerald-200 transition-all active:scale-[0.98]"
                onClick={() => setFeedbackModal(prev => ({ ...prev, show: false }))}
              >
                Awesome
              </button>
            </motion.div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteModal.show && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white p-6 rounded-3xl max-w-sm w-full border-2 border-purple-200 text-center shadow-2xl"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-2">Delete task?</h3>
              <p className="text-sm text-gray-500 mb-6">This action cannot be undone.</p>
              <div className="flex gap-4">
                <button
                  className="flex-1 border border-gray-300 py-2.5 rounded-xl font-bold text-sm text-gray-700 hover:bg-gray-50 transition-all"
                  onClick={() => setDeleteModal({ show: false, taskId: null })}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-xl font-bold text-sm transition-all active:scale-[0.98]"
                  onClick={confirmDelete}
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
