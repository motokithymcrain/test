import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Target, Dumbbell, FileText, TrendingUp, Crown } from 'lucide-react';
import { TrainingChart } from '../components/Charts/TrainingChart';
import { GoalsProgressChart } from '../components/Charts/GoalsProgressChart';

interface Subscription {
  id: string;
  stripe_subscription_id: string;
  status: string;
  plan_type: string;
  billing_period: string;
  current_period_end: string;
}

interface TrainingRecord {
  training_date: string;
  duration_minutes: number;
}

export function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    activeGoals: 0,
    completedGoals: 0,
    trainingThisWeek: 0,
    recentReflections: 0,
  });
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [trainingData, setTrainingData] = useState<TrainingRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      const today = new Date();
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      const [goalsData, trainingDataWeek, trainingDataAll, reflectionsData, subscriptionData] = await Promise.all([
        supabase.from('goals').select('*').eq('user_id', user!.id),
        supabase
          .from('training_records')
          .select('*')
          .eq('user_id', user!.id)
          .gte('training_date', weekAgo.toISOString().split('T')[0]),
        supabase
          .from('training_records')
          .select('training_date, duration_minutes')
          .eq('user_id', user!.id)
          .order('training_date', { ascending: true }),
        supabase.from('match_reflections').select('*').eq('user_id', user!.id),
        supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user!.id)
          .eq('status', 'active')
          .maybeSingle(),
      ]);

      const activeGoals = goalsData.data?.filter((g) => g.status === 'active').length || 0;
      const completedGoals = goalsData.data?.filter((g) => g.status === 'completed').length || 0;
      const trainingThisWeek = trainingDataWeek.data?.length || 0;
      const recentReflections = reflectionsData.data?.slice(0, 5).length || 0;

      setStats({
        activeGoals,
        completedGoals,
        trainingThisWeek,
        recentReflections,
      });

      if (trainingDataAll.data) {
        setTrainingData(
          trainingDataAll.data.map((t) => ({
            date: t.training_date,
            duration: t.duration_minutes,
          }))
        );
      }

      if (subscriptionData.data) {
        setSubscription(subscriptionData.data);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    );
  }

  const getPlanName = (planType: string, billingPeriod: string) => {
    const plans = {
      individual_monthly: '個人プラン（月額）',
      individual_yearly: '個人プラン（年額）',
      team_monthly: 'チームプラン（月額）',
      team_yearly: 'チームプラン（年額）',
    };
    const key = `${planType}_${billingPeriod}` as keyof typeof plans;
    return plans[key] || planType;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">ダッシュボード</h2>
        <p className="text-sm text-gray-600 mt-1">あなたの成長を一目で確認</p>
      </div>

      {subscription && (
        <div className="mb-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Crown className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm opacity-90">現在のプラン</p>
                <p className="text-xl font-bold">{getPlanName(subscription.plan_type, subscription.billing_period)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90">次回更新日</p>
              <p className="font-semibold">{formatDate(subscription.current_period_end)}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">進行中の目標</p>
              <p className="text-3xl font-bold text-gray-800">{stats.activeGoals}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">達成した目標</p>
              <p className="text-3xl font-bold text-gray-800">{stats.completedGoals}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">今週のトレーニング</p>
              <p className="text-3xl font-bold text-gray-800">{stats.trainingThisWeek}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <Dumbbell className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">試合振り返り</p>
              <p className="text-3xl font-bold text-gray-800">{stats.recentReflections}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrainingChart data={trainingData} />
        <GoalsProgressChart activeGoals={stats.activeGoals} completedGoals={stats.completedGoals} />
      </div>
    </div>
  );
}
