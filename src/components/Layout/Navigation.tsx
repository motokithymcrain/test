import { Home, User, Users, Dumbbell, Target, FileText, MessageSquare, CreditCard } from 'lucide-react';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const navItems = [
    { id: 'dashboard', label: 'ダッシュボード', icon: Home },
    { id: 'profile', label: 'プロフィール', icon: User },
    { id: 'team', label: 'チーム', icon: Users },
    { id: 'training', label: 'トレーニング', icon: Dumbbell },
    { id: 'goals', label: '目標管理', icon: Target },
    { id: 'reflections', label: '試合振り返り', icon: FileText },
    { id: 'ai-chat', label: 'AI相談', icon: MessageSquare },
    { id: 'pricing', label: '料金プラン', icon: CreditCard },
  ];

  return (
    <nav className="bg-white shadow-sm border-r border-gray-200 h-full">
      <div className="p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-green-50 text-green-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
