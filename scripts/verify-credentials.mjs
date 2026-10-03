import fs from 'node:fs';
import path from 'node:path';

// Carrega variáveis do arquivo .env
const envPath = path.resolve(process.cwd(), '.env');

if (!fs.existsSync(envPath)) {
  console.error('❌ Arquivo .env não encontrado na raiz do projeto!');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};

for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx !== -1) {
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    envVars[key] = val;
  }
}

const supabaseUrl = envVars.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = envVars.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const geminiApiKey = envVars.GEMINI_API_KEY || process.env.GEMINI_API_KEY;

function mask(str, visibleChars = 6) {
  if (!str) return '(não configurado)';
  if (str.length <= visibleChars) return '***';
  return str.slice(0, visibleChars) + '...' + str.slice(-4);
}

console.log('====================================================');
console.log('   🔍 TasksAnywhere - Validador de Credenciais      ');
console.log('====================================================\n');

let allSuccess = true;

// 1. Validar Supabase
console.log('1️⃣  Testando conexão com o Supabase...');
console.log(`   URL: ${supabaseUrl ? supabaseUrl : '(vazio)'}`);
console.log(`   Anon Key: ${mask(supabaseAnonKey)}`);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('   ❌ VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não informados no .env!\n');
  allSuccess = false;
} else {
  try {
    const normalizedUrl = supabaseUrl.replace(/\/+$/, '');
    const res = await fetch(`${normalizedUrl}/auth/v1/settings`, {
      method: 'GET',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
      }
    });

    if (res.ok) {
      const data = await res.json();
      console.log('   ✅ Conexão com o Supabase bem-sucedida!');
      console.log(`   ℹ️  Auth status: HTTP ${res.status} OK (external providers: ${Object.keys(data.external || {}).length})`);
    } else {
      const errorText = await res.text();
      console.error(`   ❌ Falha ao conectar ao Supabase (HTTP ${res.status}): ${errorText}`);
      allSuccess = false;
    }
  } catch (err) {
    console.error(`   ❌ Erro de rede ao acessar o Supabase: ${err.message}`);
    allSuccess = false;
  }
}

console.log('\n----------------------------------------------------\n');

// 2. Validar Gemini
console.log('2️⃣  Testando chave da API do Google Gemini...');
console.log(`   API Key: ${mask(geminiApiKey)}`);

if (!geminiApiKey) {
  console.error('   ❌ GEMINI_API_KEY não informada no .env!\n');
  allSuccess = false;
} else {
  try {
    // Consulta lista de modelos disponíveis
    const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${geminiApiKey}`);
    if (!listRes.ok) {
      const err = await listRes.json().catch(() => ({}));
      console.error(`   ❌ Falha ao listar modelos do Gemini (HTTP ${listRes.status}):`, err.error?.message || listRes.statusText);
      allSuccess = false;
    } else {
      const listData = await listRes.json();
      const contentModels = (listData.models || [])
        .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
        .map(m => m.name.replace('models/', ''));
      
      console.log(`   ℹ️  Total de modelos disponíveis (${contentModels.length}):`, contentModels.join(', '));
      
      // Prioridade: gemini-3.8-flash, gemini-2.5-pro, gemma, etc.
      const candidateModels = ['gemini-3.8-flash', ...contentModels];
      let testedSuccess = false;

      for (const m of candidateModels) {
        process.stdout.write(`   Tentando gerar conteúdo com "${m}"... `);
        const testUrl = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${geminiApiKey}`;
        const res = await fetch(testUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Responda estritamente a palavra "PONG".' }] }]
          })
        });

        if (res.ok) {
          const data = await res.json();
          const reply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '(sem resposta)';
          console.log(`✅ OK! Resposta: "${reply}"`);
          testedSuccess = true;
          break;
        } else {
          const err = await res.json().catch(() => ({}));
          console.log(`❌ HTTP ${res.status}: ${err.error?.message?.slice(0, 80) || res.statusText}`);
        }
      }

      if (testedSuccess) {
        console.log('   ✅ Conexão com a API do Gemini validada com sucesso!');
      } else {
        allSuccess = false;
      }
    }
  } catch (err) {
    console.error(`   ❌ Erro de rede ao acessar a API do Gemini: ${err.message}`);
    allSuccess = false;
  }
}

console.log('\n====================================================');
if (allSuccess) {
  console.log('🎉 TODAS AS CREDENCIAIS ESTÃO VÁLIDAS E OPERACIONAIS!');
} else {
  console.log('⚠️  Algumas credenciais apresentaram problemas. Verifique as mensagens acima.');
}
console.log('====================================================\n');
process.exit(allSuccess ? 0 : 1);
