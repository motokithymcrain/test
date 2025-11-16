import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Check, Loader } from 'lucide-react';

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  type: 'individual' | 'team';
  features: string[];
  priceId: string;
}

const PLANS: PricingPlan[] = [
  {
    id: 'individual-month',
    name: '個人プラン（月額）',
    price: 980,
    interval: 'month',
    type: 'individual',
    priceId: 'price_1SOzBJ3cqCzJXUz9qidhVT2Y',
    features: [
      '試合振り返り記録',
      'トレーニング記録',
      '目標管理',
      'AI相談',
      '動画アップロード（月10本まで）',
      'AI動画解析（月5本まで）',
    ],
  },
  {
    id: 'individual-year',
    name: '個人プラン（年額）',
    price: 9800,
    interval: 'year',
    type: 'individual',
    priceId: 'price_1SOzCy3cqCzJXUz93M2sfXWv',
    features: [
      '試合振り返り記録',
      'トレーニング記録',
      '目標管理',
      'AI相談',
      '動画アップロード（無制限）',
      'AI動画解析（月10本まで）',
      '2ヶ月分お得',
    ],
  },
  {
    id: 'team-month',
    name: 'チームプラン（月額）',
    price: 4980,
    interval: 'month',
    type: 'team',
    priceId: 'price_1SOzDm3cqCzJXUz92cI0m52F',
    features: [
      '個人プランの全機能',
      'チーム管理（最大30名）',
      'フォーメーション作成',
      'チーム統計',
      '動画アップロード（無制限）',
      'AI動画解析（月30本まで）',
      'チーム専用AI相談',
    ],
  },
  {
    id: 'team-year',
    name: 'チームプラン（年額）',
    price: 49800,
    interval: 'year',
    type: 'team',
    priceId: 'price_1SOzEh3cqCzJXUz9LnHsYPQ2',
    features: [
      '個人プランの全機能',
      'チーム管理（最大30名）',
      'フォーメーション作成',
      'チーム統計',
      '動画アップロード（無制限）',
      'AI動画解析（無制限）',
      'チーム専用AI相談',
      '2ヶ月分お得',
    ],
  },
];

export function PricingPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (plan: PricingPlan) => {
    if (!user) {
      alert('ログインしてください');
      return;
    }

    setLoading(plan.id);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            priceId: plan.priceId,
            userId: user.id,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('決済ページの作成に失敗しました');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-2">
          料金プラン
        </h2>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
          あなたに最適なプランを選んでください
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 flex flex-col ${
              plan.type === 'team' ? 'border-2 border-green-500' : ''
            }`}
          >
            {plan.type === 'team' && (
              <div className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-4 self-start">
                人気
              </div>
            )}

            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
              {plan.name}
            </h3>

            <div className="mb-6">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                ¥{plan.price.toLocaleString()}
              </span>
              <span className="text-gray-600 dark:text-gray-400 text-sm">
                /{plan.interval === 'month' ? '月' : '年'}
              </span>
            </div>

            <ul className="space-y-3 mb-6 flex-1">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start text-sm">
                  <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSubscribe(plan)}
              disabled={loading === plan.id}
              className={`w-full py-3 rounded-md font-medium transition-colors flex items-center justify-center ${
                plan.type === 'team'
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-800 text-white hover:bg-gray-900'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading === plan.id ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  処理中...
                </>
              ) : (
                '登録する'
              )}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-3">
          よくある質問
        </h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-800 dark:text-white mb-1">
              いつでも解約できますか？
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              はい、いつでも解約可能です。解約後も契約期間の終了まではサービスをご利用いただけます。
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-800 dark:text-white mb-1">
              支払い方法は？
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              クレジットカード（Visa、Mastercard、JCB等）に対応しています。
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-800 dark:text-white mb-1">
              プランの変更は可能ですか？
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              はい、いつでもプランのアップグレード・ダウングレードが可能です。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
