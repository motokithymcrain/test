import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { GoogleGenerativeAI } from 'npm:@google/generative-ai@0.21.0';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RequestBody {
  message: string;
  profile?: {
    username: string;
    team_name?: string;
    position?: string;
    strengths?: string[];
    weaknesses?: string[];
    favorite_player?: string;
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { message, profile }: RequestBody = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'メッセージが必要です' }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      console.error('GEMINI_API_KEY not found in environment variables');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    let systemPrompt = `あなたはサッカー選手の成長をサポートする専門的なコーチです。選手の質問に対して、具体的で実践的なアドバイスを提供してください。

アドバイスの際は以下を心がけてください：
- 具体的なトレーニング方法を提案する
- 戦術的な理解を深める説明をする
- メンタル面のサポートも行う
- ポジティブで前向きな言葉を使う
- 段階的な改善方法を示す`;

    if (profile) {
      systemPrompt += `\n\n選手のプロフィール情報：\n`;
      if (profile.username) systemPrompt += `名前: ${profile.username}\n`;
      if (profile.team_name) systemPrompt += `所属チーム: ${profile.team_name}\n`;
      if (profile.position) systemPrompt += `ポジション: ${profile.position}\n`;
      if (profile.strengths && profile.strengths.length > 0) {
        systemPrompt += `強み: ${profile.strengths.join(', ')}\n`;
      }
      if (profile.weaknesses && profile.weaknesses.length > 0) {
        systemPrompt += `弱み: ${profile.weaknesses.join(', ')}\n`;
      }
      if (profile.favorite_player) systemPrompt += `好きな選手: ${profile.favorite_player}\n`;
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      systemInstruction: systemPrompt,
    });

    const result = await model.generateContent(message);
    const aiResponse = result.response.text();

    return new Response(
      JSON.stringify({ response: aiResponse }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
 } catch (error) {
    console.error('Error:', error);
    return new Response(
        JSON.stringify({ error: `Gemini APIエラー: ${error.message}` }),
        {
            status: 500,
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json',
            },
        }
    );
}
});