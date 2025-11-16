import { useState, useEffect } from 'react';
import { Users, Plus, Edit2, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const FORMATIONS = [
  { id: '4-4-2', name: '4-4-2' },
  { id: '4-2-3-1', name: '4-2-3-1' },
  { id: '4-3-3', name: '4-3-3' },
];

const FORMATION_POSITIONS: Record<string, Array<{ x: number; y: number; label: string }>> = {
  '4-4-2': [
    { x: 50, y: 90, label: 'GK' },
    { x: 20, y: 70, label: 'LB' },
    { x: 40, y: 70, label: 'CB' },
    { x: 60, y: 70, label: 'CB' },
    { x: 80, y: 70, label: 'RB' },
    { x: 20, y: 45, label: 'LM' },
    { x: 40, y: 50, label: 'CM' },
    { x: 60, y: 50, label: 'CM' },
    { x: 80, y: 45, label: 'RM' },
    { x: 40, y: 20, label: 'ST' },
    { x: 60, y: 20, label: 'ST' },
  ],
  '4-2-3-1': [
    { x: 50, y: 90, label: 'GK' },
    { x: 20, y: 70, label: 'LB' },
    { x: 40, y: 70, label: 'CB' },
    { x: 60, y: 70, label: 'CB' },
    { x: 80, y: 70, label: 'RB' },
    { x: 40, y: 55, label: 'CDM' },
    { x: 60, y: 55, label: 'CDM' },
    { x: 20, y: 35, label: 'LW' },
    { x: 50, y: 35, label: 'CAM' },
    { x: 80, y: 35, label: 'RW' },
    { x: 50, y: 15, label: 'ST' },
  ],
  '4-3-3': [
    { x: 50, y: 90, label: 'GK' },
    { x: 20, y: 70, label: 'LB' },
    { x: 40, y: 70, label: 'CB' },
    { x: 60, y: 70, label: 'CB' },
    { x: 80, y: 70, label: 'RB' },
    { x: 35, y: 50, label: 'CM' },
    { x: 50, y: 50, label: 'CM' },
    { x: 65, y: 50, label: 'CM' },
    { x: 20, y: 20, label: 'LW' },
    { x: 50, y: 15, label: 'ST' },
    { x: 80, y: 20, label: 'RW' },
  ],
};

interface TeamMember {
  id: string;
  name: string;
  position: string;
  characteristics: string;
  jersey_number: number | null;
}

export function TeamPage() {
  const { user } = useAuth();
  const [selectedFormation, setSelectedFormation] = useState('4-4-2');
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    characteristics: '',
    jersey_number: '',
  });

  const positions = FORMATION_POSITIONS[selectedFormation] || [];

  useEffect(() => {
    if (user) {
      fetchMembers();
    }
  }, [user]);

  const fetchMembers = async () => {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setMembers(data);
    }
  };

  const handleAddMember = () => {
    setIsEditing(false);
    setFormData({ name: '', position: '', characteristics: '', jersey_number: '' });
    setShowModal(true);
  };

  const handleEditMember = (member: TeamMember) => {
    setIsEditing(true);
    setSelectedMember(member);
    setFormData({
      name: member.name,
      position: member.position,
      characteristics: member.characteristics,
      jersey_number: member.jersey_number?.toString() || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const memberData = {
      name: formData.name,
      position: formData.position,
      characteristics: formData.characteristics,
      jersey_number: formData.jersey_number ? parseInt(formData.jersey_number) : null,
      user_id: user?.id,
    };

    if (isEditing && selectedMember) {
      const { error } = await supabase
        .from('team_members')
        .update(memberData)
        .eq('id', selectedMember.id);

      if (!error) {
        fetchMembers();
        setShowModal(false);
      }
    } else {
      const { error } = await supabase
        .from('team_members')
        .insert([memberData]);

      if (!error) {
        fetchMembers();
        setShowModal(false);
      }
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (confirm('このメンバーを削除しますか？')) {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', id);

      if (!error) {
        fetchMembers();
        setShowModal(false);
      }
    }
  };

  const handlePositionClick = (posLabel: string) => {
    const member = members.find(m => m.position === posLabel);
    if (member) {
      setSelectedMember(member);
      setIsEditing(false);
      setShowModal(true);
      setFormData({
        name: member.name,
        position: member.position,
        characteristics: member.characteristics,
        jersey_number: member.jersey_number?.toString() || '',
      });
    } else {
      setIsEditing(false);
      setFormData({ name: '', position: posLabel, characteristics: '', jersey_number: '' });
      setShowModal(true);
    }
  };

  const getMemberAtPosition = (posLabel: string) => {
    return members.find(m => m.position === posLabel);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">チーム管理</h2>
        <button
          onClick={handleAddMember}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          メンバー追加
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            フォーメーション
          </label>
          <select
            value={selectedFormation}
            onChange={(e) => setSelectedFormation(e.target.value)}
            className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {FORMATIONS.map((formation) => (
              <option key={formation.id} value={formation.id}>
                {formation.name}
              </option>
            ))}
          </select>
        </div>

        <div className="relative bg-gradient-to-b from-green-600 to-green-700 rounded-lg p-4" style={{ aspectRatio: '2/3', maxHeight: '600px' }}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-full relative">
              <div className="absolute inset-x-0 top-0 h-1/2 border-b-2 border-white opacity-50" />
              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white opacity-50" />

              {positions.map((pos, index) => {
                const member = getMemberAtPosition(pos.label);
                return (
                  <div
                    key={index}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                    style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                    onClick={() => handlePositionClick(pos.label)}
                  >
                    <div className="relative">
                      <div className={`w-10 h-10 rounded-full shadow-lg flex items-center justify-center transition-colors border-2 ${
                        member ? 'bg-blue-500 border-blue-800 group-hover:bg-blue-600' : 'bg-white border-green-800 group-hover:bg-green-100'
                      }`}>
                        <Users className={`w-5 h-5 ${member ? 'text-white' : 'text-green-800'}`} />
                      </div>
                      <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 bg-white px-2 py-1 rounded text-xs font-medium text-gray-800 whitespace-nowrap shadow-md">
                        {member ? member.name : pos.label}
                      </div>
                      {member?.jersey_number && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold text-gray-800">
                          {member.jersey_number}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">メンバー一覧</h3>
        <div className="space-y-2">
          {members.length === 0 ? (
            <p className="text-gray-500 text-center py-4">メンバーがまだ登録されていません</p>
          ) : (
            members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {member.jersey_number && (
                    <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-sm font-bold text-gray-800">
                      {member.jersey_number}
                    </div>
                  )}
                  <div>
                    <div className="font-medium text-gray-800">{member.name}</div>
                    <div className="text-sm text-gray-600">{member.position}</div>
                  </div>
                </div>
                <button
                  onClick={() => handleEditMember(member)}
                  className="p-2 text-gray-600 hover:text-green-600 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {isEditing ? 'メンバー編集' : selectedMember ? 'メンバー詳細' : 'メンバー追加'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!isEditing && selectedMember ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">名前</label>
                  <p className="text-gray-800">{selectedMember.name || '未設定'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ポジション</label>
                  <p className="text-gray-800">{selectedMember.position}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">背番号</label>
                  <p className="text-gray-800">{selectedMember.jersey_number || '未設定'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">特徴</label>
                  <p className="text-gray-800 whitespace-pre-wrap">{selectedMember.characteristics || '未設定'}</p>
                </div>
                <div className="flex gap-2 pt-4">
                  <button
                    onClick={() => handleEditMember(selectedMember)}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => handleDeleteMember(selectedMember.id)}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    削除
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    名前
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ポジション
                  </label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
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
                    min="0"
                    max="99"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    特徴
                  </label>
                  <textarea
                    value={formData.characteristics}
                    onChange={(e) => setFormData({ ...formData, characteristics: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    rows={4}
                    placeholder="プレースタイル、強み、弱みなど"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    {isEditing ? '更新' : '追加'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
