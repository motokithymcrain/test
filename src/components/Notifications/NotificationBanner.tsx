import { useEffect, useState } from 'react';
import { Bell, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface Notification {
  id: string;
  type: 'goal_deadline' | 'training_reminder';
  message: string;
  goalId?: string;
}

export function NotificationBanner() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user) {
      checkNotifications();
    }
  }, [user]);

  const checkNotifications = async () => {
    try {
      const today = new Date();
      const threeDaysFromNow = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);

      const { data: goals } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user!.id)
        .eq('status', 'active')
        .not('deadline', 'is', null);

      const newNotifications: Notification[] = [];

      goals?.forEach((goal) => {
        if (goal.deadline) {
          const deadline = new Date(goal.deadline);
          if (deadline <= threeDaysFromNow && deadline >= today) {
            const daysLeft = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            newNotifications.push({
              id: `goal-${goal.id}`,
              type: 'goal_deadline',
              message: `目標「${goal.title}」の期限まであと${daysLeft}日です`,
              goalId: goal.id,
            });
          }
        }
      });

      const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const { data: trainingRecords } = await supabase
        .from('training_records')
        .select('training_date')
        .eq('user_id', user!.id)
        .gte('training_date', lastWeek.toISOString().split('T')[0]);

      if (!trainingRecords || trainingRecords.length === 0) {
        newNotifications.push({
          id: 'training-reminder',
          type: 'training_reminder',
          message: '今週のトレーニング記録がありません。練習しましょう！',
        });
      }

      setNotifications(newNotifications);
    } catch (error) {
      console.error('Error checking notifications:', error);
    }
  };

  const handleDismiss = (id: string) => {
    setDismissed(new Set([...dismissed, id]));
  };

  const visibleNotifications = notifications.filter((n) => !dismissed.has(n.id));

  if (visibleNotifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 max-w-md space-y-2">
      {visibleNotifications.map((notification) => (
        <div
          key={notification.id}
          className="bg-blue-600 text-white rounded-lg shadow-lg p-4 flex items-start gap-3 animate-slide-in"
        >
          <Bell className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <p className="flex-1 text-sm">{notification.message}</p>
          <button
            onClick={() => handleDismiss(notification.id)}
            className="text-white hover:text-blue-200 transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
