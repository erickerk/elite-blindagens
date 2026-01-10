import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { spawn } = require('child_process');

// Teste do MCP Server
const mcpServer = spawn('node', ['mcp-supabase-server.js'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

// Enviar comando tools/list
const request = {
  jsonrpc: '2.0',
  id: 1,
  method: 'tools/list',
  params: {}
};

mcpServer.stdin.write(JSON.stringify(request) + '\n');

mcpServer.stdout.on('data', (data) => {
  console.log('Resposta do MCP:', data.toString());
});

mcpServer.stderr.on('data', (data) => {
  console.error('Erro do MCP:', data.toString());
});

setTimeout(() => {
  mcpServer.kill();
  process.exit(0);
}, 5000);
