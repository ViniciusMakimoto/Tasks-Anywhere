// Supabase Edge Function: process-task-input
// Runtime: Deno (TypeScript)
// Model: Google Gemini Flash Multimodal

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestPayload {
  text?: string;
  audioUrl?: string;
  imageUrl?: string;
}

serve(async (req: Request) => {
  // CORS Preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY não configurada no ambiente do Supabase");
    }

    const payload: RequestPayload = await req.json();
    const { text, audioUrl, imageUrl } = payload;

    if (!text && !audioUrl && !imageUrl) {
      return new Response(
        JSON.stringify({ error: "Nenhum conteúdo de texto, áudio ou imagem fornecido." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `Você é o assistente inteligente do TasksAnywhere.
Sua missão é extrair e estruturar uma tarefa a partir da entrada fornecida pelo usuário (texto, descrição de áudio ou imagem).
Retorne SEMPRE e EXCLUSIVAMENTE um objeto JSON estrito com o seguinte formato:
{
  "title": "Título conciso e direto da tarefa (ação clara)",
  "description": "Detalhes adicionais ou contexto se houver (ou null)",
  "priority": "low" | "medium" | "high" | "urgent",
  "dueDate": "YYYY-MM-DD se mencionado explícita ou implicitamente (ex: hoje, amanhã, sexta-feira), caso contrário null",
  "tags": ["tags", "relevantes"],
  "clarificationNeeded": true ou false (true se a informação for muito vaga/ambígua para ser executada),
  "clarificationQuestion": "Pergunta curta e amigável pedindo o esclarecimento necessário se clarificationNeeded for true, caso contrário null"
}
Hoje é ${new Date().toISOString().split("T")[0]}.`;

    const contents: any[] = [];
    const parts: any[] = [];

    if (text) {
      parts.push({ text: `Entrada do usuário: ${text}` });
    }

    if (audioUrl) {
      parts.push({ text: `Áudio gravado disponível na URL efêmera: ${audioUrl}` });
    }

    if (imageUrl) {
      parts.push({ text: `Imagem anexada disponível na URL efêmera: ${imageUrl}` });
    }

    contents.push({ parts });

    // Chamada à API Gemini com response_mime_type application/json
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const geminiRes = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
        contents,
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      throw new Error(`Erro na API Gemini: ${geminiRes.status} - ${errText}`);
    }

    const geminiData = await geminiRes.json();
    const rawContent = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawContent) {
      throw new Error("Resposta vazia da API do Gemini.");
    }

    const parsedTask = JSON.parse(rawContent);

    return new Response(JSON.stringify(parsedTask), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || "Erro desconhecido ao processar tarefa com IA" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
