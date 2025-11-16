import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Plus, Calendar, Clock, Trash2 } from 'lucide-react';
import { DateRangeFilter } from '../components/Filters/DateRangeFilter';
import { SearchBar } from '../components/Filters/SearchBar';
import { ExportButton } from '../components/Export/ExportButton';

interface TrainingRecord {
  id: string;
  title: string;
  content: string;
  training_date: string;
  duration_minutes: number;
  notes: string;
}

export function TrainingPage() {
  const { user } = useAuth();
  const [records, setRecords] = useState<TrainingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    training_date: new Date().toISOString().split('T')[0],
    duration_minutes: 60,
    notes: '',
  });

  useEffect(() => {
    if (user) {
      loadRecords();
    }
  }, [user]);

  const loadRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('training_records')
        .select('*')
        .eq('user_id', user!.id)
        .order('training_date', { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (error) {
      console.error('Error loading training records:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase
        .from('training_records')
        .insert({
          ...formData,
          user_id: user!.id,
        });

      if (error) throw error;

      setFormData({
        title: '',
        content: '',
        training_date: new Date().toISOString().split('T')[0],
        duration_minutes: 60,
        notes: '',
      });
      setShowForm(false);
      loadRecords();
    } catch (error) {
      console.error('Error saving training record:', error);
      alert('保存に失敗しました');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('このトレーニング記録を削除しますか？')) return;

    try {
      const { error } = await supabase
        .from('training_records')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadRecords();
    } catch (error) {
      console.error('Error deleting training record:', error);
      alert('削除に失敗しました');
    }
  };

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const matchesSearch =
        searchQuery === '' ||
        record.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.notes.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDateRange =
        (dateRange.start === '' || record.training_date >= dateRange.start) &&
        (dateRange.end === '' || record.training_date <= dateRange.end);

      return matchesSearch && matchesDateRange;
    });
  }, [records, searchQuery, dateRange]);

  const handleDateRangeChange = (start: string, end: string) => {
    setDateRange({ start, end });
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
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">トレーニング記録</h2>
        <div className="flex gap-2">
          <ExportButton data={filteredRecords} filename="training-records" />
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            新規記録
          </button>
        </div>
      </div>

      <div className="mb-6">
        <SearchBar onSearch={setSearchQuery} placeholder="タイトル、内容、メモで検索..." />
      </div>

      <DateRangeFilter onFilterChange={handleDateRangeChange} />

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">新規トレーニング記録</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                タイトル
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="例: 基礎トレーニング"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  実施日
                </label>
                <input
                  type="date"
                  value={formData.training_date}
                  onChange={(e) => setFormData({ ...formData, training_date: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  時間（分）
                </label>
                <input
                  type="number"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                  required
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                トレーニング内容
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="例: ドリブル練習、パス練習"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                メモ・気づき
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="例: 左足のキックが改善された"
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
        {filteredRecords.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
            {records.length === 0 ? 'トレーニング記録がありません' : '条件に一致する記録がありません'}
          </div>
        ) : (
          filteredRecords.map((record) => (
            <div key={record.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-gray-800">{record.title}</h3>
                <button
                  onClick={() => handleDelete(record.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center text-sm text-gray-600 space-x-4 mb-3">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {new Date(record.training_date).toLocaleDateString('ja-JP')}
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {record.duration_minutes}分
                </div>
              </div>

              {record.content && (
                <div className="mb-2">
                  <span className="text-sm font-medium text-gray-700">内容: </span>
                  <span className="text-sm text-gray-600">{record.content}</span>
                </div>
              )}

              {record.notes && (
                <div className="bg-gray-50 rounded-md p-3">
                  <span className="text-sm font-medium text-gray-700">メモ: </span>
                  <span className="text-sm text-gray-600">{record.notes}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
