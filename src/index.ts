#!/usr/bin/env node

// 환경변수 로드
import 'dotenv/config';

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
  CallToolRequest,
} from '@modelcontextprotocol/sdk/types.js';
import { DoorayApiClient } from './dooray-client.js';
import fs from 'fs';
import path from 'path';

/**
 * Dooray MCP Server
 * 
 * Dooray API와 상호작용하기 위한 MCP 서버입니다.
 * 프로젝트, 업무, 메시지 등을 관리할 수 있습니다.
 */

// CLI 명령어 처리
const args = process.argv.slice(2);

if (args.length > 0) {
  switch (args[0]) {
    case 'init':
      await initMcpConfig();
      process.exit(0);
    case 'help':
    case '--help':
    case '-h':
      showHelp();
      process.exit(0);
    case 'version':
    case '--version':
    case '-v':
      showVersion();
      process.exit(0);
  }
}

/**
 * 도움말을 표시합니다
 */
function showHelp() {
  console.log('🚀 Dooray MCP Server');
  console.log('');
  console.log('사용법:');
  console.log('  dooray-mcp init       .mcp.json 파일 초기화/업데이트');
  console.log('  dooray-mcp help       이 도움말 표시');
  console.log('  dooray-mcp version    버전 정보 표시');
  console.log('  dooray-mcp            MCP 서버 실행 (stdin/stdout)');
  console.log('');
  console.log('사용 가능한 도구:');
  console.log('  • dooray_list_projects   Dooray 프로젝트 목록 조회');
  console.log('  • dooray_search_projects 프로젝트 검색');
  console.log('  • dooray_get_project     프로젝트 상세 정보 조회');
  console.log('  • dooray_list_tasks      프로젝트 업무 목록 조회 (페이징)');
  console.log('  • dooray_search_tasks    업무 고급 검색 (필터링 + 페이징)');
  console.log('  • dooray_create_task     새 업무 생성');
  console.log('  • dooray_update_task     기존 업무 수정');
  console.log('  • dooray_get_task        업무 상세 정보 조회');
  console.log('');
  console.log('더 많은 정보: https://github.com/your-org/dooray-mcp-server');
}

/**
 * 버전 정보를 표시합니다
 */
function showVersion() {
  console.log('dooray-mcp-server v1.0.0');
}

/**
 * .mcp.json 파일을 초기화하거나 업데이트합니다
 */
async function initMcpConfig() {
  const mcpConfigPath = path.join(process.cwd(), '.mcp.json');
  let mcpConfig: any = { mcpServers: {} };

  // 기존 .mcp.json 파일이 있으면 로드
  if (fs.existsSync(mcpConfigPath)) {
    try {
      const existingConfig = fs.readFileSync(mcpConfigPath, 'utf8');
      mcpConfig = JSON.parse(existingConfig);
      console.log('✅ 기존 .mcp.json 파일을 찾았습니다.');
    } catch (error) {
      console.log('⚠️ 기존 .mcp.json 파일을 읽는데 실패했습니다. 새로 생성합니다.');
    }
  } else {
    console.log('📝 새로운 .mcp.json 파일을 생성합니다.');
  }

  // mcpServers가 없으면 초기화
  if (!mcpConfig.mcpServers) {
    mcpConfig.mcpServers = {};
  }

  // Dooray MCP 설정 추가/업데이트
  mcpConfig.mcpServers.dooray = {
    type: "stdio",
    command: "dooray-mcp",
    env: {
      DOORAY_API_TOKEN: "YOUR_DOORAY_API_TOKEN_HERE",
      DOORAY_API_BASE_URL: "https://api.dooray.com"
    }
  };

  // 파일 저장
  try {
    fs.writeFileSync(mcpConfigPath, JSON.stringify(mcpConfig, null, 2));
    console.log('🎉 .mcp.json 파일이 성공적으로 업데이트되었습니다!');
    console.log('');
    console.log('📋 다음 단계:');
    console.log('1. .mcp.json 파일에서 YOUR_DOORAY_API_TOKEN_HERE를 실제 토큰으로 변경하세요');
    console.log('2. Cursor를 재시작하세요');
    console.log('3. AI와 대화하여 "Dooray 프로젝트 목록 보여줘"라고 말해보세요');
    console.log('');
    console.log('🔑 Dooray API 토큰 발급: https://helpdesk.dooray.com/');
  } catch (error) {
    console.error('❌ .mcp.json 파일 저장에 실패했습니다:', error);
    process.exit(1);
  }
}

// 두레이 클라이언트 인스턴스 생성
const doorayClient = new DoorayApiClient();

// MCP 서버 생성
const server = new Server({
  name: 'dooray-mcp',
  version: '1.0.0',
});

// 사용 가능한 도구 목록 정의
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'dooray_list_projects',
        description: '두레이에서 접근 가능한 모든 프로젝트 목록을 가져옵니다',
        inputSchema: {
          type: 'object',
          properties: {},
          required: [],
        },
      },
      {
        name: 'dooray_search_projects',
        description: '두레이에서 프로젝트를 검색합니다',
        inputSchema: {
          type: 'object',
          properties: {
            searchTerm: {
              type: 'string',
              description: '검색할 프로젝트명 또는 키워드',
            },
          },
          required: ['searchTerm'],
        },
      },
      {
        name: 'dooray_get_project',
        description: '특정 프로젝트의 상세 정보를 가져옵니다',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: {
              type: 'string',
              description: '조회할 프로젝트 ID',
            },
          },
          required: ['projectId'],
        },
      },
      {
        name: 'dooray_list_tasks',
        description: '특정 프로젝트의 업무 목록을 가져옵니다 (간단한 페이징 지원)',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: {
              type: 'string',
              description: '업무를 조회할 프로젝트 ID',
            },
            page: {
              type: 'number',
              description: '페이지 번호 (0부터 시작, 기본값: 0)',
            },
            size: {
              type: 'number',
              description: '페이지 크기 (기본값: 20, 최대: 100)',
            },
          },
          required: ['projectId'],
        },
      },
      {
        name: 'dooray_search_tasks',
        description: '프로젝트의 태스크를 고급 필터링과 페이징으로 검색합니다 (실제 Dooray API 명세)',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: {
              type: 'string',
              description: '태스크를 검색할 프로젝트 ID',
            },
            page: {
              type: 'number',
              description: '페이지 번호 (0부터 시작, 기본값: 0)',
            },
            size: {
              type: 'number',
              description: '페이지 크기 (기본값: 20, 최대: 100)',
            },
            fromEmailAddress: {
              type: 'string',
              description: 'From 이메일 주소로 업무 필터링',
            },
            fromMemberIds: {
              type: 'string',
              description: '특정 멤버가 작성한 업무 목록 (쉼표로 구분)',
            },
            toMemberIds: {
              type: 'string',
              description: '특정 멤버가 담당자인 업무 목록 (쉼표로 구분)',
            },
            ccMemberIds: {
              type: 'string',
              description: '특정 멤버가 참조자인 업무 목록 (쉼표로 구분)',
            },
            tagIds: {
              type: 'string',
              description: '특정 태그가 붙은 업무 목록 (쉼표로 구분)',
            },
            parentPostId: {
              type: 'string',
              description: '특정 업무의 하위 업무 목록',
            },
            postNumber: {
              type: 'string',
              description: '특정 업무의 번호',
            },
            postWorkflowClasses: {
              type: 'string',
              description: '워크플로우 상태 (backlog, registered, working, closed - 쉼표로 구분)',
            },
            postWorkflowIds: {
              type: 'string',
              description: '해당 프로젝트에 정의된 workflowId로 필터 (쉼표로 구분)',
            },
            milestoneIds: {
              type: 'string',
              description: '마일스톤 ID 기준 필터 (쉼표로 구분)',
            },
            subjects: {
              type: 'string',
              description: '업무 제목으로 필터',
            },
            createdAt: {
              type: 'string',
              description: '생성시간 기준 필터 (today, thisweek, prev-3d, next-7d, 또는 ISO8601 범위)',
            },
            updatedAt: {
              type: 'string',
              description: '업데이트 기준 필터 (today, thisweek, prev-3d, next-7d, 또는 ISO8601 범위)',
            },
            dueAt: {
              type: 'string',
              description: '만기시간 기준 필터 (today, thisweek, prev-3d, next-7d, 또는 ISO8601 범위)',
            },
            order: {
              type: 'string',
              description: '정렬 조건 (postDueAt, postUpdatedAt, createdAt - 역순은 앞에 - 붙임)',
            },
          },
          required: ['projectId'],
        },
      },
      {
        name: 'dooray_create_task',
        description: '새로운 업무를 생성합니다',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: {
              type: 'string',
              description: '업무를 생성할 프로젝트 ID',
            },
            subject: {
              type: 'string',
              description: '업무 제목',
            },
            body: {
              type: 'string',
              description: '업무 내용',
            },
          },
          required: ['projectId', 'subject'],
        },
      },
      {
        name: 'dooray_update_task',
        description: '기존 업무를 수정합니다',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: {
              type: 'string',
              description: '업무가 있는 프로젝트 ID',
            },
            postId: {
              type: 'string',
              description: '수정할 업무의 ID',
            },
            subject: {
              type: 'string',
              description: '새로운 업무 제목 (선택사항)',
            },
            body: {
              type: 'string',
              description: '새로운 업무 내용 (선택사항)',
            },
          },
          required: ['projectId', 'postId'],
        },
      },
      {
        name: 'dooray_get_task',
        description: '특정 업무의 상세 정보를 조회합니다',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: {
              type: 'string',
              description: '업무가 있는 프로젝트 ID',
            },
            postId: {
              type: 'string',
              description: '조회할 업무의 ID',
            },
          },
          required: ['projectId', 'postId'],
        },
      },
    ],
  };
});

// 도구 호출 요청 처리
server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'dooray_list_projects':
        return await doorayClient.listProjects();

      case 'dooray_search_projects':
        if (!args?.searchTerm) {
          throw new Error('searchTerm이 필요합니다');
        }
        return await doorayClient.searchProjects(args.searchTerm as string);

      case 'dooray_get_project':
        if (!args?.projectId) {
          throw new Error('projectId가 필요합니다');
        }
        return await doorayClient.getProject(args.projectId as string);

      case 'dooray_list_tasks':
        if (!args?.projectId) {
          throw new Error('projectId가 필요합니다');
        }
        return await doorayClient.listTasks(
          args.projectId as string,
          args.page as number || 0,
          args.size as number || 20
        );

      case 'dooray_search_tasks':
        if (!args?.projectId) {
          throw new Error('projectId가 필요합니다');
        }
        const filters = {
          page: args.page as number,
          size: args.size as number,
          fromEmailAddress: args.fromEmailAddress as string,
          fromMemberIds: args.fromMemberIds as string,
          toMemberIds: args.toMemberIds as string,
          ccMemberIds: args.ccMemberIds as string,
          tagIds: args.tagIds as string,
          parentPostId: args.parentPostId as string,
          postNumber: args.postNumber as string,
          postWorkflowClasses: args.postWorkflowClasses as string,
          postWorkflowIds: args.postWorkflowIds as string,
          milestoneIds: args.milestoneIds as string,
          subjects: args.subjects as string,
          createdAt: args.createdAt as string,
          updatedAt: args.updatedAt as string,
          dueAt: args.dueAt as string,
          order: args.order as string,
        };
        return await doorayClient.searchTasks(args.projectId as string, filters);

      case 'dooray_create_task':
        if (!args?.projectId || !args?.subject) {
          throw new Error('projectId와 subject가 필요합니다');
        }
        return await doorayClient.createTask(
          args.projectId as string,
          args.subject as string,
          args.body as string
        );

      case 'dooray_update_task':
        if (!args?.projectId || !args?.postId) {
          throw new Error('projectId와 postId가 필요합니다');
        }
        return await doorayClient.updateTask(
          args.projectId as string,
          args.postId as string,
          args.subject as string,
          args.body as string
        );

      case 'dooray_get_task':
        if (!args?.projectId || !args?.postId) {
          throw new Error('projectId와 postId가 필요합니다');
        }
        return await doorayClient.getTask(
          args.projectId as string,
          args.postId as string
        );

      default:
        throw new Error(`알 수 없는 도구: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
    return {
      content: [
        {
          type: 'text',
          text: `오류 발생: ${errorMessage}`,
        },
      ],
    };
  }
});

// 서버 시작
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Dooray MCP 서버가 시작되었습니다');
}

main().catch((error) => {
  console.error('서버 시작 중 오류 발생:', error);
  process.exit(1);
}); 