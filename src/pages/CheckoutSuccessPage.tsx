import { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';

interface CheckoutSuccessPageProps {
  onNavigate: (page: string) => void;
}

export function CheckoutSuccessPage({ onNavigate }: CheckoutSuccessPageProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onNavigate('dashboard');
    }, 5000);

    return () => clearTimeout(timer);
  }, [onNavigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 text-center">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
        </div>

        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
          決済が完了しました
        </h1>

        <p className="text-gray-600 dark:text-gray-300 mb-6">
          ご登録ありがとうございます。すべての機能がご利用いただけるようになりました。
        </p>

        <div className="space-y-3">
          <button
            onClick={() => onNavigate('dashboard')}
            className="w-full px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
          >
            ダッシュボードへ
          </button>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            5秒後に自動的にダッシュボードへ移動します
          </p>
        </div>
      </div>
    </div>
  );
}
