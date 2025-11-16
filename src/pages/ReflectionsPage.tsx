import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Plus, FileText, Trash2, Upload, Video, Loader } from 'lucide-react';
import { DateRangeFilter } from '../components/Filters/DateRangeFilter';
import { SearchBar } from '../components/Filters/SearchBar';
import { ExportButton } from '../components/Export/ExportButton';

interface MatchReflection {
  id: string;
  match_date: string;
  opponent: string;
  jersey_number: number | null;
  scene_description: string;
  thoughts: string;
  video_url: string | null;
  video_analysis: any;
  analysis_status: string | null;
}

export function ReflectionsPage() {
  const { user } = useAuth();
  const [reflections, setReflections] = useState<MatchReflection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [formData, setFormData] = useState({
    match_date: new Date().toISOString().split('T')[0],
    opponent: '',
    jersey_number: '',
    scene_description: '',
    thoughts: '',
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) {
      loadReflections();
    }
  }, [user]);

  const loadReflections = async () => {
    try {
      const { data, error } = await supabase
        .from('match_reflections')
        .select('*')
        .eq('user_id', user!.id)
        .order('match_date', { ascending: false });

      if (error) throw error;
      setReflections(data || []);
    } catch (error) {
      console.error('Error loading reflections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      let videoUrl = null;

      if (videoFile) {
        const fileExt = videoFile.name.split('.').pop();
        const fileName = `${user!.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('match-videos')
          .upload(fileName, videoFile);

        if (uploadError) throw uploadError;

        videoUrl = fileName;
      }

      const dataToSave = {
        match_date: formData.match_date,
        opponent: formData.opponent,
        jersey_number: formData.jersey_number ? parseInt(formData.jersey_number) : null,
        scene_description: formData.scene_description,
        thoughts: formData.thoughts,
        video_url: videoUrl,
        analysis_status: videoUrl ? 'pending' : null,
        user_id: user!.id,
      };

      const { data: newReflection, error } = await supabase
        .from('match_reflections')
        .insert(dataToSave)
        .select()
        .single();

      if (error) throw error;

      if (videoUrl && newReflection) {
        requestAIAnalysis(newReflection.id, videoUrl);
      }

      setFormData({
        match_date: new Date().toISOString().split('T')[0],
        opponent: '',
        jersey_number: '',
        scene_description: '',
        thoughts: '',
      });
      setVideoFile(null);
      setShowForm(false);
      loadReflections();
    } catch (error) {
      console.error('Error saving reflection:', error);
      alert('保存に失敗しました');
    } finally {
      setUploading(false);
    }
  };

  const requestAIAnalysis = async (reflectionId: string, videoUrl: string) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const { data: profile } = await supabase
        .from('profiles')
        .select('position')
        .eq('user_id', user!.id)
        .maybeSingle();

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-video-analysis`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${sessionData.session?.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            videoUrl,
            reflectionId,
            context: {
              opponent: formData.opponent,
              position: profile?.position,
              sceneDescription: formData.scene_description,
            },
          }),
        }
      );

      if (response.ok) {
        const analysisData = await response.json();

        await supabase
          .from('match_reflections')
          .update({
            video_analysis: analysisData,
            analysis_status: 'completed',
          })
          .eq('id', reflectionId);
      } else {
        console.error('Failed to request AI analysis');
        await supabase
          .from('match_reflections')
          .update({ analysis_status: 'failed' })
          .eq('id', reflectionId);
      }
    } catch (error) {
      console.error('Error requesting AI analysis:', error);
      await supabase
        .from('match_reflections')
        .update({ analysis_status: 'failed' })
        .eq('id', reflectionId);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('この振り返りを削除しますか？')) return;

    try {
      const { error } = await supabase
        .from('match_reflections')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadReflections();
    } catch (error) {
      console.error('Error deleting reflection:', error);
      alert('削除に失敗しました');
    }
  };

  const filteredReflections = useMemo(() => {
    return reflections.filter((reflection) => {
      const matchesSearch =
        searchQuery === '' ||
        reflection.opponent.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reflection.scene_description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reflection.thoughts.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDateRange =
        (dateRange.start === '' || reflection.match_date >= dateRange.start) &&
        (dateRange.end === '' || reflection.match_date <= dateRange.end);

      return matchesSearch && matchesDateRange;
    });
  }, [reflections, searchQuery, dateRange]);

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
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">試合振り返り</h2>
        <div className="flex gap-2">
          <ExportButton data={filteredReflections} filename="match-reflections" />
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center px-3 py-2 sm:px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm sm:text-base"
          >
            <Plus className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">新規振り返り</span>
          </button>
        </div>
      </div>

      <div className="mb-6">
        <SearchBar onSearch={setSearchQuery} placeholder="対戦相手、シーン、振り返りで検索..." />
      </div>

      <DateRangeFilter onFilterChange={handleDateRangeChange} />

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">新規振り返り</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  試合日
                </label>
                <input
                  type="date"
                  value={formData.match_date}
                  onChange={(e) => setFormData({ ...formData, match_date: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  対戦相手
                </label>
                <input
                  type="text"
                  value={formData.opponent}
                  onChange={(e) => setFormData({ ...formData, opponent: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="例: FCバルセロナ"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  背番号
                </label>
                <input
                  type="number"
                  value={formData.jersey_number}
                  onChange={(e) => setFormData({ ...formData, jersey_number: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="10"
                  min="1"
                  max="99"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                シーンの説明
              </label>
              <textarea
                value={formData.scene_description}
                onChange={(e) => setFormData({ ...formData, scene_description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="例: 前半15分、相手のコーナーキック時のマーク対応について"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                あなたの思考・振り返り
              </label>
              <textarea
                value={formData.thoughts}
                onChange={(e) => setFormData({ ...formData, thoughts: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="例: マークする相手を見失ってしまった。もっと早く動き出すべきだった。"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                試合動画 (任意)
              </label>
              <div className="mt-1">
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="video-upload"
                />
                <label
                  htmlFor="video-upload"
                  className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-green-500 transition-colors"
                >
                  <Upload className="w-5 h-5 mr-2 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {videoFile ? videoFile.name : '動画ファイルを選択 (AI解析されます)'}
                  </span>
                </label>
                {videoFile && (
                  <button
                    type="button"
                    onClick={() => setVideoFile(null)}
                    className="mt-2 text-sm text-red-600 hover:text-red-700"
                  >
                    ファイルを削除
                  </button>
                )}
              </div>
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
                disabled={uploading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {uploading && <Loader className="w-4 h-4 mr-2 animate-spin" />}
                {uploading ? 'アップロード中...' : '保存'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4">
        {filteredReflections.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
            {reflections.length === 0 ? '試合振り返りがありません' : '条件に一致する振り返りがありません'}
          </div>
        ) : (
          filteredReflections.map((reflection) => (
            <div key={reflection.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-start">
                  <FileText className="w-5 h-5 mr-2 mt-1 text-green-600" />
                  <div>
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold text-gray-800">
                        vs {reflection.opponent || '対戦相手未記入'}
                      </h3>
                      {reflection.jersey_number && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                          #{reflection.jersey_number}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {new Date(reflection.match_date).toLocaleDateString('ja-JP')}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(reflection.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {reflection.scene_description && (
                <div className="mb-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-1">シーン</h4>
                  <p className="text-sm text-gray-600">{reflection.scene_description}</p>
                </div>
              )}

              {reflection.thoughts && (
                <div className="mb-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-1">振り返り</h4>
                  <p className="text-sm text-gray-600">{reflection.thoughts}</p>
                </div>
              )}

              {reflection.video_url && (
                <div className="mb-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <Video className="w-4 h-4 text-green-600" />
                    <h4 className="text-sm font-medium text-gray-700">試合動画</h4>
                  </div>
                  <div className="bg-gray-100 p-2 rounded text-xs text-gray-600">
                    動画がアップロードされています
                  </div>
                </div>
              )}

              {reflection.video_analysis && (
                <div className="mb-3 bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <h4 className="text-sm font-medium text-blue-800">AI分析結果</h4>
                  </div>
                  <p className="text-sm text-blue-900 whitespace-pre-wrap">
                    {typeof reflection.video_analysis === 'string'
                      ? reflection.video_analysis
                      : reflection.video_analysis?.summary}
                  </p>
                </div>
              )}

              {reflection.video_url && reflection.analysis_status === 'pending' && (
                <div className="flex items-center space-x-2 text-sm text-yellow-600">
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>AI解析待ち...</span>
                </div>
              )}

              {reflection.video_url && reflection.analysis_status === 'processing' && (
                <div className="flex items-center space-x-2 text-sm text-blue-600">
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>AI解析中...</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
