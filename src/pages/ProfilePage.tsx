import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Save } from 'lucide-react';
import { BackupManager } from '../components/Backup/BackupManager';

const POSITIONS = ['GK', 'CB', 'SB', 'DMF', 'CMF', 'AMF', 'WG', 'FW'];
const SKILL_OPTIONS = [
  'ドリブル', 'パス', 'シュート', 'クロス', 'ヘディング',
  'タックル', 'インターセプト', 'スピード', '持久力', 'フィジカル',
  '戦術理解', 'ポジショニング', 'メンタル', 'リーダーシップ'
];

export function ProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    username: '',
    team_name: '',
    position: '',
    strengths: [] as string[],
    weaknesses: [] as string[],
    favorite_player: '',
  });

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user!.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile({
          username: data.username || '',
          team_name: data.team_name || '',
          position: data.position || '',
          strengths: data.strengths || [],
          weaknesses: data.weaknesses || [],
          favorite_player: data.favorite_player || '',
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          team_name: profile.team_name,
          position: profile.position,
          strengths: profile.strengths,
          weaknesses: profile.weaknesses,
          favorite_player: profile.favorite_player,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user!.id);

      if (error) throw error;
      alert('プロフィールを保存しました');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const toggleSkill = (skill: string, type: 'strengths' | 'weaknesses') => {
    setProfile((prev) => {
      const skills = prev[type];
      if (skills.includes(skill)) {
        return { ...prev, [type]: skills.filter((s) => s !== skill) };
      } else {
        return { ...prev, [type]: [...skills, skill] };
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-6">プロフィール設定</h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ユーザー名
            </label>
            <input
              type="text"
              value={profile.username}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
            />
            <p className="text-xs text-gray-500 mt-1">ユーザー名は変更できません</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              所属チーム名
            </label>
            <input
              type="text"
              value={profile.team_name}
              onChange={(e) => setProfile({ ...profile, team_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="例: FCトーキョー"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ポジション
            </label>
            <select
              value={profile.position}
              onChange={(e) => setProfile({ ...profile, position: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">選択してください</option>
              {POSITIONS.map((pos) => (
                <option key={pos} value={pos}>
                  {pos}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              強み（複数選択可）
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SKILL_OPTIONS.map((skill) => (
                <button
                  key={skill}
                  onClick={() => toggleSkill(skill, 'strengths')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    profile.strengths.includes(skill)
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              弱み（複数選択可）
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SKILL_OPTIONS.map((skill) => (
                <button
                  key={skill}
                  onClick={() => toggleSkill(skill, 'weaknesses')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    profile.weaknesses.includes(skill)
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              好きな選手
            </label>
            <input
              type="text"
              value={profile.favorite_player}
              onChange={(e) => setProfile({ ...profile, favorite_player: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="例: 久保建英"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? '保存中...' : '保存'}
            </button>
          </div>
        </div>
      </div>

      <BackupManager />
    </div>
  );
}
