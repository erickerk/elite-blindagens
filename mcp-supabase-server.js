#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// Configuração do Supabase para Elite Blindagens
const SUPABASE_URL = 'https://rlaxbloitiknjikrpbim.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsYXhibG9pdGlrbmppa3JwYmltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4MzQwNzcsImV4cCI6MjA4MjQxMDA3N30.pq550K7XirbU8QnKSNOaIvs9WD-wi6cLQbS0GlH_9o8';

class SupabaseMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'supabase-elite-blindagens',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupResourceHandlers();
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'supabase_query',
          description: 'Executa uma query no Supabase',
          inputSchema: {
            type: 'object',
            properties: {
              table: {
                type: 'string',
                description: 'Nome da tabela',
              },
              method: {
                type: 'string',
                enum: ['select', 'insert', 'update', 'delete'],
                description: 'Método HTTP',
              },
              data: {
                type: 'object',
                description: 'Dados para insert/update',
              },
              filter: {
                type: 'string',
                description: 'Filtro para select/update/delete',
              },
            },
            required: ['table', 'method'],
          },
        },
        {
          name: 'list_tables',
          description: 'Lista todas as tabelas do projeto',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'supabase_query':
            return await this.handleSupabaseQuery(args);
          case 'list_tables':
            return await this.handleListTables();
          default:
            throw new Error(`Tool desconhecido: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Erro: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  setupResourceHandlers() {
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
      resources: [
        {
          uri: 'supabase://project/info',
          name: 'Informações do Projeto',
          description: 'Informações básicas do projeto Supabase',
          mimeType: 'application/json',
        },
        {
          uri: 'supabase://tables/preowned_vehicles',
          name: 'Veículos',
          description: 'Dados da tabela de veículos',
          mimeType: 'application/json',
        },
        {
          uri: 'supabase://tables/preowned_photos',
          name: 'Fotos dos Veículos',
          description: 'Dados da tabela de fotos',
          mimeType: 'application/json',
        },
        {
          uri: 'supabase://tables/site_admin_users',
          name: 'Usuários Admin',
          description: 'Dados da tabela de usuários admin',
          mimeType: 'application/json',
        },
      ],
    }));

    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;

      try {
        switch (uri) {
          case 'supabase://project/info':
            return await this.getProjectInfo();
          case 'supabase://tables/preowned_vehicles':
            return await this.getTableData('preowned_vehicles');
          case 'supabase://tables/preowned_photos':
            return await this.getTableData('preowned_photos');
          case 'supabase://tables/site_admin_users':
            return await this.getTableData('site_admin_users');
          default:
            throw new Error(`Recurso desconhecido: ${uri}`);
        }
      } catch (error) {
        return {
          contents: [
            {
              uri,
              mimeType: 'text/plain',
              text: `Erro: ${error.message}`,
            },
          ],
        };
      }
    });
  }

  async handleSupabaseQuery(args) {
    const { table, method, data, filter } = args;
    
    let url = `${SUPABASE_URL}/rest/v1/${table}`;
    let options = {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    };

    switch (method) {
      case 'select':
        url += '?select=*';
        if (filter) url += `&${filter}`;
        break;
      case 'insert':
        options.method = 'POST';
        options.body = JSON.stringify(data);
        break;
      case 'update':
        options.method = 'PATCH';
        url += `?${filter}`;
        options.body = JSON.stringify(data);
        break;
      case 'delete':
        options.method = 'DELETE';
        url += `?${filter}`;
        break;
    }

    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  async handleListTables() {
    const tables = ['preowned_vehicles', 'preowned_photos', 'site_admin_users'];
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(tables, null, 2),
        },
      ],
    };
  }

  async getProjectInfo() {
    const info = {
      project_id: 'rlaxbloitiknjikrpbim',
      name: 'Elite Blindagens',
      url: SUPABASE_URL,
      tables: ['preowned_vehicles', 'preowned_photos', 'site_admin_users']
    };

    return {
      contents: [
        {
          uri: 'supabase://project/info',
          mimeType: 'application/json',
          text: JSON.stringify(info, null, 2),
        },
      ],
    };
  }

  async getTableData(table) {
    const url = `${SUPABASE_URL}/rest/v1/${table}?select=*&limit=10`;
    const response = await fetch(url, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      contents: [
        {
          uri: `supabase://tables/${table}`,
          mimeType: 'application/json',
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('MCP Server do Supabase para Elite Blindagens rodando...');
  }
}

const server = new SupabaseMCPServer();
server.run().catch(console.error);
