import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Bell,
  Heart,
  UserPlus,
  CheckCircle2,
  Clock,
  Flag,
  Film
} from 'lucide-react';
import {
  ShortNotification,
  shortsService
} from '../services/shortsService';

export const ShortsNotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<ShortNotification[]>(() => shortsService.getNotifications());
  const [filter, setFilter] = useState<'all' | 'likes' | 'follows' | 'moderation'>('all');

  useEffect(() => {
    const handleUpdate = () => {
      setNotifications(shortsService.getNotifications());
    };
    window.addEventListener('jio_shorts_notifications_updated', handleUpdate);
    return () => window.removeEventListener('jio_shorts_notifications_updated', handleUpdate);
  }, []);

  // Auto mark visible unread notifications as read when viewing the page
  useEffect(() => {
    const unread = notifications.filter(n => !n.read);
    if (unread.length > 0) {
      const timer = setTimeout(() => {
        unread.forEach(n => shortsService.markNotificationRead(n.id));
        setNotifications(shortsService.getNotifications());
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    if (filter === 'likes') {
      return notifications.filter(n => n.type === 'like');
    }
    if (filter === 'follows') {
      return notifications.filter(n => n.type === 'follow');
    }
    if (filter === 'moderation') {
      return notifications.filter(n => n.type === 'approved' || n.type === 'rejected' || n.type === 'submitted');
    }
    return notifications;
  }, [notifications, filter]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-24">
      {/* Top Header - Light Mode */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-2xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl hover:bg-gray-100 text-gray-700 transition-colors cursor-pointer"
              title="Back"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-base font-bold text-gray-900">Notifications</h1>
          </div>
        </div>

        {/* Filter Bubble Buttons */}
        <div className="max-w-2xl mx-auto px-4 pb-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
              filter === 'all'
                ? 'bg-[#002B7F] text-white shadow-xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All
          </button>

          <button
            type="button"
            onClick={() => setFilter('likes')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
              filter === 'likes'
                ? 'bg-[#002B7F] text-white shadow-xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Likes
          </button>

          <button
            type="button"
            onClick={() => setFilter('follows')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
              filter === 'follows'
                ? 'bg-[#002B7F] text-white shadow-xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Follows
          </button>

          <button
            type="button"
            onClick={() => setFilter('moderation')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
              filter === 'moderation'
                ? 'bg-[#002B7F] text-white shadow-xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Moderation & Approvals
          </button>
        </div>
      </div>

      {/* Main Notifications List */}
      <div className="max-w-2xl mx-auto p-4 space-y-2.5">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 shadow-xs space-y-3 mt-4">
            <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
              <Bell className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-gray-900">No notifications</h3>
            <p className="text-xs text-gray-500">
              {filter === 'all'
                ? "You're all caught up! Updates about your shorts, likes, and follows will appear here."
                : `No ${filter} notifications found.`}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => {
                shortsService.markNotificationRead(notif.id);
                setNotifications(shortsService.getNotifications());
                if (notif.reelId) {
                  navigate(`/shorts?short=${notif.reelId}`);
                }
              }}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 text-left ${
                !notif.read
                  ? 'bg-blue-50/60 border-blue-200 shadow-xs'
                  : 'bg-white border-gray-200 hover:border-gray-300 shadow-2xs'
              }`}
            >
              {/* Type Icon */}
              <div className="flex-shrink-0 mt-0.5">
                {notif.type === 'like' && (
                  <div className="w-9 h-9 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shadow-xs">
                    <Heart className="w-4.5 h-4.5 fill-current" />
                  </div>
                )}
                {notif.type === 'follow' && (
                  <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shadow-xs">
                    <UserPlus className="w-4.5 h-4.5" />
                  </div>
                )}
                {notif.type === 'approved' && (
                  <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs">
                    <CheckCircle2 className="w-4.5 h-4.5" />
                  </div>
                )}
                {notif.type === 'submitted' && (
                  <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shadow-xs">
                    <Clock className="w-4.5 h-4.5" />
                  </div>
                )}
                {notif.type === 'rejected' && (
                  <div className="w-9 h-9 rounded-full bg-red-100 text-red-600 flex items-center justify-center shadow-xs">
                    <Flag className="w-4.5 h-4.5" />
                  </div>
                )}
              </div>

              {/* Message Content */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                    {notif.title}
                  </h4>
                  <span className="text-[10px] text-gray-400 font-mono shrink-0">
                    {notif.timestamp}
                  </span>
                </div>

                <p className="text-xs text-gray-600 leading-relaxed mt-0.5">
                  {notif.message}
                </p>

                {notif.reelTitle && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-[#002B7F] font-bold">
                    <Film className="w-3.5 h-3.5" />
                    <span className="truncate">View Reel</span>
                  </div>
                )}
              </div>

              {/* Unread dot indicator */}
              {!notif.read && (
                <div className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0 mt-1.5" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ShortsNotificationsPage;
