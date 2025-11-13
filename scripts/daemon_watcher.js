#!/usr/bin/env node

/**
 * Daemon para monitorar mudanças em arquivos locais e sincronizar com workspace
 * Uso: node daemon_watcher.js <workspaceId> <projectPath>
 */

const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const axios = require('axios');

const workspaceId = process.argv[2];
const projectPath = process.argv[3] || process.cwd();
const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:54321/functions/v1';
const supabaseToken = process.env.SUPABASE_TOKEN || process.env.SUPABASE_ANON_KEY;

if (!workspaceId) {
  console.error('Erro: workspaceId é obrigatório');
  console.log('Uso: node daemon_watcher.js <workspaceId> [projectPath]');
  process.exit(1);
}

if (!supabaseToken) {
  console.error('Erro: SUPABASE_TOKEN não configurado');
  process.exit(1);
}

console.log(`🚀 Iniciando daemon para workspace: ${workspaceId}`);
console.log(`📁 Monitorando: ${projectPath}`);

// Ignorar node_modules, .git, etc
const ignored = [
  '**/node_modules/**',
  '**/.git/**',
  '**/.next/**',
  '**/dist/**',
  '**/build/**',
  '**/.env*',
  '**/*.log',
];

const watcher = chokidar.watch(projectPath, {
  ignored,
  persistent: true,
  ignoreInitial: true,
});

const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const sendPatch = async (filePath, content) => {
  try {
    const relativePath = path.relative(projectPath, filePath);
    
    const response = await axios.post(
      `${apiUrl}/workspace/patch`,
      {
        workspaceId: workspaceId,
        path: relativePath,
        content: content.toString(),
        commitOnSave: false,
      },
      {
        headers: {
          'Authorization': `Bearer ${supabaseToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.ok) {
      console.log(`✅ Sincronizado: ${relativePath}`);
    } else {
      console.error(`❌ Erro ao sincronizar ${relativePath}:`, response.data.error);
    }
  } catch (error) {
    console.error(`❌ Erro ao sincronizar ${filePath}:`, error.message);
  }
};

const handleFileChange = debounce(async (filePath) => {
  try {
    const content = fs.readFileSync(filePath);
    await sendPatch(filePath, content);
  } catch (error) {
    console.error(`Erro ao ler arquivo ${filePath}:`, error.message);
  }
}, 500);

watcher
  .on('add', (filePath) => {
    console.log(`➕ Arquivo adicionado: ${filePath}`);
    handleFileChange(filePath);
  })
  .on('change', (filePath) => {
    console.log(`📝 Arquivo modificado: ${filePath}`);
    handleFileChange(filePath);
  })
  .on('unlink', (filePath) => {
    console.log(`🗑️  Arquivo removido: ${filePath}`);
    // TODO: Implementar remoção no workspace
  })
  .on('error', (error) => {
    console.error('Erro no watcher:', error);
  });

console.log('👀 Monitoramento ativo. Pressione Ctrl+C para parar.');

process.on('SIGINT', () => {
  console.log('\n🛑 Parando daemon...');
  watcher.close();
  process.exit(0);
});

