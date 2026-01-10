import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { spawn } = require('child_process');

// Teste do MCP Server - Query
const mcpServer = spawn('node', ['mcp-supabase-server.js'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

// Enviar comando tools/call para listar tabelas
const request = {
  jsonrpc: '2.0',
  id: 4,
  method: 'tools/call',
  params: {
    name: 'list_tables',
    arguments: {}
  }
};

mcpServer.stdin.write(JSON.stringify(request) + '\n');

mcpServer.stdout.on('data', (data) => {
  console.log('Resposta Query do MCP:', data.toString());
});

mcpServer.stderr.on('data', (data) => {
  console.error('Erro do MCP:', data.toString());
});

setTimeout(() => {
  // Testar query na tabela de veículos
  const queryRequest = {
    jsonrpc: '2.0',
    id: 5,
    method: 'tools/call',
    params: {
      name: 'supabase_query',
      arguments: {
        table: 'preowned_vehicles',
        method: 'select',
        filter: 'limit=5'
      }
    }
  };
  
  mcpServer.stdin.write(JSON.stringify(queryRequest) + '\n');
}, 1000);

setTimeout(() => {
  mcpServer.kill();
  process.exit(0);
}, 6000);
