// このファイルは、Boltプロジェクトの構造に合わせて提供されています
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

// Edge Function URL（環境変数から取得）
const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-consultation`;

// 型定義（プロジェクトの既存の型に合わせる必要があります）
interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
}

interface Profile {
  username?: string;
  team_name?: string;
  position?: string;
  strengths?: string[];
  weaknesses?: string[];
  favorite_player?: string;
}

interface AIChatResponse {
  response: string;
}

const AIChatPage: React.FC = () => {
  const { user } = useAuth(); // 認証ユーザー情報を取得
  const [profile, setProfile] = useState<Profile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // プロフィール情報を取得
  useEffect(() => {
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
            username: data.username || undefined,
            team_name: data.team_name || undefined,
            position: data.position || undefined,
            strengths: data.strengths || [],
            weaknesses: data.weaknesses || [],
            favorite_player: data.favorite_player || undefined,
          });
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };

    if (user) {
      loadProfile();
    }
  }, [user]);

  // 初期メッセージの設定（任意）
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: 1,
        text: 'こんにちは！私はサッカー選手の成長を専門とするAIコーチです。どんな質問や相談がありますか？',
        sender: 'ai'
      }]);
    }
  }, []);

  const handleSend = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now(), text, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // AIからの応答を待つダミーメッセージを追加
    const loadingMessageId = Date.now() + 1;
    setMessages(prev => [...prev, { id: loadingMessageId, text: '考え中...', sender: 'ai' }]);
    
    // プロフィール情報を整形
    const userProfile: Profile = {
        username: profile?.username,
        team_name: profile?.team_name,
        position: profile?.position,
        strengths: profile?.strengths || [],
        weaknesses: profile?.weaknesses || [],
        favorite_player: profile?.favorite_player
    };

    try {
      // ------------------------------------------------
      // ★ 修正箇所：ハードコードされたURLを使用
      // ------------------------------------------------
      const res = await fetch(EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 認証が必要な場合はAuthorizationヘッダーも必要ですが、
          // Edge Functionを`--no-verify-jwt`でデプロイしたので不要です。
        },
        body: JSON.stringify({ message: text, profile: userProfile, userId: user?.id }),
      });

      // エラー応答の処理
      if (!res.ok) {
        let errorDetail = res.statusText;
        try {
            errorDetail = await res.json().then(data => data.error || res.statusText);
        } catch (e) {
            // JSONでパースできなかった場合はテキストをそのまま使用
            errorDetail = await res.text();
        }
        throw new Error(`Edge Functionからエラー応答: HTTP ${res.status} - ${errorDetail}`);
      }

      const data: AIChatResponse = await res.json();
      
      const aiResponseText = data.response || "AIからの応答が取得できませんでした。";
      
      // ダミーの「考え中...」メッセージを削除し、実際のAI応答を追加
      setMessages(prev => 
        prev.filter(msg => msg.id !== loadingMessageId)
            .concat({ id: Date.now(), text: aiResponseText, sender: 'ai' })
      );

    } catch (error) {
      console.error('AIチャットの通信エラー:', error);
      
      // 通信エラーメッセージを更新
      setMessages(prev => 
        prev.filter(msg => msg.id !== loadingMessageId)
            .concat({ 
                id: Date.now(), 
                text: "申し訳ありません。通信またはサーバーエラーが発生しました。もう一度お試しください。", 
                sender: 'ai' 
            })
      );
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, profile, user]);

  // ... (JSXのレンダリング部分は既存のコードを使用)

  return (
    <div className="flex flex-col h-full bg-gray-50 p-4">
      <h1 className="text-2xl font-bold mb-2">AI相談</h1>
      <p className="text-gray-600 mb-4">サッカーに関する質問や相談をしてください</p>
      
      <div className="flex-grow overflow-y-auto space-y-4 p-4 border rounded-lg bg-white shadow-inner">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-xl p-3 rounded-xl shadow-md ${
                msg.sender === 'user' 
                  ? 'bg-green-500 text-white rounded-br-none' 
                  : 'bg-gray-200 text-gray-800 rounded-tl-none'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {/* ローディングスピナーをここに追加することもできます */}
      </div>

      <div className="mt-4 flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !isLoading) {
              handleSend(input);
            }
          }}
          placeholder={isLoading ? "AIが応答中です..." : "質問を入力してください。"}
          className="flex-grow p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:border-green-500 disabled:bg-gray-100"
          disabled={isLoading}
        />
        <button
          onClick={() => handleSend(input)}
          className="bg-green-600 text-white p-3 rounded-r-lg hover:bg-green-700 transition duration-150 disabled:bg-gray-400"
          disabled={isLoading || !input.trim()}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default AIChatPage;