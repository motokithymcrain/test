import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Plus, Target, Trash2 } from 'lucide-react';

interface Goal {
  id: string;
  title: string;
  description: string;
  deadline: string | null;
  progress: number;
  status: string;
}

export function GoalsPage() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    progress: 0,
  });

  useEffect(() => {
    if (user) {
      loadGoals();
    }
  }, [user]);

  const loadGoals = async () => {
    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGoals(data || []);
    } catch (error) {
      console.error('Error loading goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase
        .from('goals')
        .insert({
          ...formData,
          user_id: user!.id,
        });

      if (error) throw error;

      setFormData({
        title: '',
        description: '',
        deadline: '',
        progress: 0,
      });
      setShowForm(false);
      loadGoals();
    } catch (error) {
      console.error('Error saving goal:', error);
      alert('保存に失敗しました');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('この目標を削除しますか？')) return;

    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadGoals();
    } catch (error) {
      console.error('Error deleting goal:', error);
      alert('削除に失敗しました');
    }
  };

  const updateProgress = async (id: string, progress: number) => {
    try {
      const status = progress >= 100 ? 'completed' : 'active';
      const { error } = await supabase
        .from('goals')
        .update({
          progress,
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
      loadGoals();
    } catch (error) {
      console.error('Error updating progress:', error);
      alert('更新に失敗しました');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">目標管理</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          新規目標
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">新規目標</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                目標タイトル
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="例: 左足のシュート精度向上"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                目標詳細
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="例: 毎日100本のシュート練習を行い、成功率70%を目指す"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                期限
              </label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                保存
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4">
        {goals.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
            目標がありません
          </div>
        ) : (
          goals.map((goal) => {
            const isCompleted = goal.status === 'completed';

            return (
              <div key={goal.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-start">
                    <Target className={`w-5 h-5 mr-2 mt-1 ${isCompleted ? 'text-green-600' : 'text-gray-400'}`} />
                    <div>
                      <h3 className={`text-lg font-semibold ${isCompleted ? 'text-green-600' : 'text-gray-800'}`}>
                        {goal.title}
                      </h3>
                      {goal.description && (
                        <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(goal.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {goal.deadline && (
                  <div className="text-sm text-gray-600 mb-3">
                    期限: {new Date(goal.deadline).toLocaleDateString('ja-JP')}
                  </div>
                )}

                <div className="mb-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">進捗</span>
                    <span className="text-sm font-medium text-gray-700">{goal.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        isCompleted ? 'bg-green-600' : 'bg-blue-600'
                      }`}
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>

                {!isCompleted && (
                  <div className="mt-3">
                    <label className="block text-xs text-gray-600 mb-1">進捗を更新</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={goal.progress}
                      onChange={(e) => updateProgress(goal.id, parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                )}

                {isCompleted && (
                  <div className="mt-3 bg-green-50 text-green-700 px-3 py-2 rounded-md text-sm font-medium">
                    達成済み
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
