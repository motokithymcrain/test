import { useState } from 'react';
import { Download, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { exportAllData, importData } from '../../utils/backup';

export function BackupManager() {
  const { user } = useAuth();
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleExport = async () => {
    const result = await exportAllData(user!.id);
    if (result.success) {
      setMessage({ type: 'success', text: 'データをエクスポートしました' });
    } else {
      setMessage({ type: 'error', text: 'エクスポートに失敗しました' });
    }
    setTimeout(() => setMessage(null), 3000);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm('データをインポートすると、新しいデータが追加されます。続行しますか？')) {
      e.target.value = '';
      return;
    }

    setImporting(true);
    const result = await importData(file, user!.id);

    if (result.success) {
      setMessage({ type: 'success', text: 'データをインポートしました。ページを更新してください。' });
    } else {
      setMessage({ type: 'error', text: 'インポートに失敗しました' });
    }

    setImporting(false);
    e.target.value = '';
    setTimeout(() => setMessage(null), 5000);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">データのバックアップ</h3>

      <div className="space-y-4">
        <div>
          <button
            onClick={handleExport}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors w-full sm:w-auto"
          >
            <Download className="w-4 h-4 mr-2" />
            データをエクスポート
          </button>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            すべてのデータをJSONファイルとしてダウンロードします
          </p>
        </div>

        <div>
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            disabled={importing}
            className="hidden"
            id="import-file"
          />
          <label
            htmlFor="import-file"
            className={`flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors cursor-pointer w-full sm:w-auto ${
              importing ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Upload className="w-4 h-4 mr-2" />
            {importing ? 'インポート中...' : 'データをインポート'}
          </label>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            バックアップファイルからデータを復元します
          </p>
        </div>

        {message && (
          <div
            className={`flex items-center p-3 rounded-md ${
              message.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            )}
            <span className="text-sm">{message.text}</span>
          </div>
        )}
      </div>
    </div>
  );
}
