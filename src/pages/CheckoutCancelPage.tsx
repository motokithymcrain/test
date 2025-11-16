import { XCircle } from 'lucide-react';

interface CheckoutCancelPageProps {
  onNavigate: (page: string) => void;
}

export function CheckoutCancelPage({ onNavigate }: CheckoutCancelPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 text-center">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
        </div>

        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
          決済がキャンセルされました
        </h1>

        <p className="text-gray-600 dark:text-gray-300 mb-6">
          決済はキャンセルされました。再度お試しいただくか、後でお手続きください。
        </p>

        <div className="space-y-3">
          <button
            onClick={() => onNavigate('pricing')}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            料金プランに戻る
          </button>

          <button
            onClick={() => onNavigate('dashboard')}
            className="w-full px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
          >
            ダッシュボードへ
          </button>
        </div>
      </div>
    </div>
  );
}
