import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.57.4';
import { GoogleGenerativeAI } from 'npm:@google/generative-ai@0.21.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { videoUrl, reflectionId, context } = await req.json();

    if (!videoUrl || !reflectionId) {
      return new Response(
        JSON.stringify({ error: 'Missing videoUrl or reflectionId' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    await supabase
      .from('match_reflections')
      .update({ analysis_status: 'processing' })
      .eq('id', reflectionId);

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `あなたはサッカーのコーチです。以下の試合の状況について分析してください。

対戦相手: ${context.opponent || '不明'}
ポジション: ${context.position || '不明'}
シーンの説明: ${context.sceneDescription || '記録なし'}

動画の内容を踏まえて、以下の観点から具体的なフィードバックを提供してください：
1. 良かった点（技術面・戦術面）
2. 改善すべき点
3. 次の試合に向けた具体的なアドバイス

※動画は参照できないため、シーンの説明に基づいた一般的なアドバイスを提供してください。`;

    const result = await model.generateContent(prompt);
    const analysis = result.response.text();

    await supabase
      .from('match_reflections')
      .update({
        video_analysis: analysis,
        analysis_status: 'completed',
      })
      .eq('id', reflectionId);

    return new Response(
      JSON.stringify({ summary: analysis }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error analyzing video:', error);

    if (reflectionId) {
      try {
        const supabase = createClient(
          Deno.env.get('SUPABASE_URL') || '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
        );
        await supabase
          .from('match_reflections')
          .update({ analysis_status: 'failed' })
          .eq('id', reflectionId);
      } catch (dbError) {
        console.error('Failed to update status:', dbError);
      }
    }

    return new Response(
      JSON.stringify({ error: error.message || 'エラーが発生しました' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});