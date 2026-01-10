import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { spawn } = require('child_process');

// Teste do MCP Server - Resources
const mcpServer = spawn('node', ['mcp-supabase-server.js'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

// Enviar comando resources/list
const request = {
  jsonrpc: '2.0',
  id: 2,
  method: 'resources/list',
  params: {}
};

mcpServer.stdin.write(JSON.stringify(request) + '\n');

mcpServer.stdout.on('data', (data) => {
  console.log('Resposta Resources do MCP:', data.toString());
});

mcpServer.stderr.on('data', (data) => {
  console.error('Erro do MCP:', data.toString());
});

setTimeout(() => {
  // Testar leitura de resource
  const readRequest = {
    jsonrpc: '2.0',
    id: 3,
    method: 'resources/read',
    params: {
      uri: 'supabase://project/info'
    }
  };
  
  mcpServer.stdin.write(JSON.stringify(readRequest) + '\n');
}, 1000);

setTimeout(() => {
  mcpServer.kill();
  process.exit(0);
}, 6000);
