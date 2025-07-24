import axios, { AxiosInstance } from 'axios';
import { z } from 'zod';

// Dooray API 응답 타입 정의
const ProjectSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  description: z.string().optional(),
  scope: z.string(),
  status: z.string(),
});

const TaskSchema = z.object({
  id: z.string(),
  number: z.number(),
  subject: z.string(),
  body: z.string().optional(),
  status: z.string(),
  priority: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

type Project = z.infer<typeof ProjectSchema>;
type Task = z.infer<typeof TaskSchema>;

export class DoorayApiClient {
  private client: AxiosInstance;
  private allowedTaskIds: Set<string>;
  private allowedProjectIds: Set<string>;

  constructor() {
    const apiToken = process.env.DOORAY_API_TOKEN;
    const baseURL = process.env.DOORAY_API_BASE_URL || 'https://api.dooray.com';
    
    if (!apiToken) {
      throw new Error('DOORAY_API_TOKEN 환경변수가 설정되지 않았습니다.');
    }

    // 허용된 태스크 ID 목록 로드 (쉼표로 구분)
    const allowedIds = process.env.DOORAY_ALLOWED_TASK_IDS || '';
    this.allowedTaskIds = new Set(allowedIds.split(',').map(id => id.trim()).filter(id => id));

    // 허용된 프로젝트 ID 목록 로드 (쉼표로 구분)
    const allowedProjectIds = process.env.DOORAY_ALLOWED_PROJECT_IDS || '';
    this.allowedProjectIds = new Set(allowedProjectIds.split(',').map(id => id.trim()).filter(id => id));

    this.client = axios.create({
      baseURL,
      headers: {
        'Authorization': `dooray-api ${apiToken}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * 태스크 ID가 허용된 목록에 있는지 확인
   */
  private isTaskIdAllowed(taskId: string): boolean {
    return this.allowedTaskIds.has(taskId);
  }

  /**
   * 프로젝트 ID가 허용된 목록에 있는지 확인
   */
  private isProjectIdAllowed(projectId: string): boolean {
    return this.allowedProjectIds.has(projectId);
  }

  /**
   * 프로젝트 목록을 가져옵니다
   */
  async listProjects() {
    try {
      const allProjects: any[] = [];
      let page = 0;
      const size = 100; // 최대 사이즈로 설정하여 한 번에 더 많은 데이터 가져오기
      let hasMoreData = true;

      while (hasMoreData) {
        const response = await this.client.get('/project/v1/projects', {
          params: {
            page,
            size,
            member: 'me', // 내가 속한 프로젝트만 조회
            state: 'active' // 활성 프로젝트만 조회
          }
        });
        
        if (!response.data.header?.isSuccessful) {
          throw new Error(`API 오류: ${response.data.header?.resultMessage || '알 수 없는 오류'}`);
        }
        
        const projects = response.data.result || [];
        allProjects.push(...projects);
        
        // 결과가 요청한 size보다 적으면 더 이상 데이터가 없음
        if (projects.length < size) {
          hasMoreData = false;
        } else {
          page++; // 다음 페이지로
        }
      }
      
      return {
        content: [
          {
            type: 'text' as const,
            text: `총 ${allProjects.length}개의 프로젝트를 찾았습니다:\n\n${allProjects
              .map((project: any) => 
                `- **${project.code}** \n  ID: ${project.id}\n  상태: ${project.state}\n  공개여부: ${project.scope}\n  설명: ${project.description || '설명 없음'}`
              )
              .join('\n\n')}`
          }
        ]
      };
    } catch (error) {
      throw new Error(`프로젝트 목록 조회 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  /**
   * 프로젝트를 검색합니다
   */
  async searchProjects(searchTerm: string) {
    try {
      const allProjects: any[] = [];
      let page = 0;
      const size = 100;
      let hasMoreData = true;

      while (hasMoreData) {
        const response = await this.client.get('/project/v1/projects', {
          params: {
            page,
            size,
            member: 'me',
            state: 'active'
          }
        });
        
        if (!response.data.header?.isSuccessful) {
          throw new Error(`API 오류: ${response.data.header?.resultMessage || '알 수 없는 오류'}`);
        }
        
        const projects = response.data.result || [];
        allProjects.push(...projects);
        
        if (projects.length < size) {
          hasMoreData = false;
        } else {
          page++;
        }
      }

      // 검색어로 필터링
      const filteredProjects = allProjects.filter(project => 
        project.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      return {
        content: [
          {
            type: 'text' as const,
            text: `"${searchTerm}" 검색 결과: ${filteredProjects.length}개의 프로젝트를 찾았습니다.\n\n${filteredProjects
              .map((project: any) => 
                `- **${project.code}** \n  ID: ${project.id}\n  상태: ${project.state}\n  공개여부: ${project.scope}\n  설명: ${project.description || '설명 없음'}`
              )
              .join('\n\n')}`
          }
        ]
      };
    } catch (error) {
      throw new Error(`프로젝트 검색 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  /**
   * 특정 프로젝트의 상세 정보를 가져옵니다
   */
  async getProject(projectId: string) {
    try {
      const response = await this.client.get(`/project/v1/projects/${projectId}`);
      
      if (!response.data.header?.isSuccessful) {
        throw new Error(`API 오류: ${response.data.header?.resultMessage || '알 수 없는 오류'}`);
      }
      
      const project = response.data.result;
      
      return {
        content: [
          {
            type: 'text' as const,
            text: `**프로젝트 정보**\n\n` +
                  `**이름:** ${project.code}\n` +
                  `**ID:** ${project.id}\n` +
                  `**설명:** ${project.description || '설명 없음'}\n` +
                  `**상태:** ${project.state || 'N/A'}\n` +
                  `**공개여부:** ${project.scope || 'N/A'}\n` +
                  `**타입:** ${project.type || 'N/A'}`
          }
        ]
      };
    } catch (error) {
      throw new Error(`프로젝트 조회 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  /**
   * 프로젝트의 작업 목록을 가져옵니다
   */
  async listTasks(projectId: string, status?: string) {
    try {
      let url = `/project/v1/projects/${projectId}/posts`;
      const params: any = {};
      
      // Dooray API는 closed 상태로 필터링 가능
      if (status === 'closed') {
        params.closed = true;
      } else if (status === 'open') {
        params.closed = false;
      }

      const response = await this.client.get(url, { params });
      
      if (!response.data.header?.isSuccessful) {
        throw new Error(`API 오류: ${response.data.header?.resultMessage || '알 수 없는 오류'}`);
      }
      
      const tasks = response.data.result || [];
      
      return {
        content: [
          {
            type: 'text' as const,
            text: `**프로젝트 ${projectId}의 업무 목록** (총 ${tasks.length}개)\n\n${tasks
              .map((task: any) => 
                `**#${task.number}** ${task.subject}\n` +
                `완료상태: ${task.closed ? '완료' : '진행중'}\n` +
                `생성일: ${new Date(task.createdAt).toLocaleDateString('ko-KR')}\n` +
                `작성자: ${task.users?.from?.member?.name || task.users?.from?.name || 'N/A'}\n` +
                `우선순위: ${task.priority || 'N/A'}\n` +
                `ID: ${task.id}`
              )
              .join('\n\n')}`
          }
        ]
      };
    } catch (error) {
      throw new Error(`업무 목록 조회 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  /**
   * 새로운 업무를 생성합니다
   */
  async createTask(projectId: string, subject: string, body?: string) {
    try {
      // 보안 검증 1: 허용된 프로젝트 ID인지 확인
      if (!this.isProjectIdAllowed(projectId)) {
        throw new Error(`🔒 보안상 이 프로젝트(ID: ${projectId})에서는 업무를 생성할 수 없습니다. 허용된 프로젝트 ID가 아닙니다.`);
      }

      // 보안 검증 2: 허용된 태스크 ID가 명시적으로 설정되지 않은 경우 생성 불가
      const allowedIdsEnv = process.env.DOORAY_ALLOWED_TASK_IDS || '';
      if (allowedIdsEnv.trim() === '' || this.allowedTaskIds.size === 0) {
        throw new Error('🔒 보안상 업무 생성이 제한되어 있습니다. DOORAY_ALLOWED_TASK_IDS 환경변수에 허용할 태스크 ID를 설정하세요.');
      }

      const taskData: any = {
        subject,
      };

      // body가 제공된 경우에만 추가
      if (body) {
        taskData.body = {
          mimeType: 'text/html',
          content: body
        };
      }

      const response = await this.client.post(`/project/v1/projects/${projectId}/posts`, taskData);
      
      if (!response.data.header?.isSuccessful) {
        throw new Error(`API 오류: ${response.data.header?.resultMessage || '알 수 없는 오류'}`);
      }
      
      const newTask = response.data.result;
      
      return {
        content: [
          {
            type: 'text' as const,
            text: `**새 업무가 생성되었습니다!**\\n\\n` +
                  `**제목:** ${newTask.subject}\\n` +
                  `**번호:** #${newTask.number}\\n` +
                  `**ID:** ${newTask.id}\\n` +
                  `**완료상태:** ${newTask.closed ? '완료' : '진행중'}\\n` +
                  `**프로젝트 ID:** ${projectId}\\n\\n` +
                  `**⚠️ 중요:** 이 업무 ID(${newTask.id})를 허용 목록에 추가하세요!`
          }
        ]
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text' as const,
            text: `오류 발생: 업무 생성 실패: ${error.message}`
          }
        ]
      };
    }
  }

  /**
   * 기존 업무를 수정합니다
   */
  async updateTask(projectId: string, postId: string, subject?: string, body?: string) {
    try {
      // 보안 검증 1: 허용된 프로젝트 ID인지 확인
      if (!this.isProjectIdAllowed(projectId)) {
        throw new Error(`🔒 보안상 이 프로젝트(ID: ${projectId})에서는 업무를 수정할 수 없습니다. 허용된 프로젝트 ID가 아닙니다.`);
      }

      // 보안 검증 2: 허용된 태스크 ID인지 확인
      if (!this.isTaskIdAllowed(postId)) {
        throw new Error(`🔒 보안상 이 업무(ID: ${postId})는 수정할 수 없습니다. 허용된 태스크 ID가 아닙니다.`);
      }

      const updateData: any = {};
      
      if (subject) {
        updateData.subject = subject;
      }
      
      if (body) {
        updateData.body = {
          mimeType: 'text/html',
          content: body
        };
      }

      const response = await this.client.put(`/project/v1/projects/${projectId}/posts/${postId}`, updateData);
      
      if (!response.data.header?.isSuccessful) {
        throw new Error(`API 오류: ${response.data.header?.resultMessage || '알 수 없는 오류'}`);
      }
      
      const updatedTask = response.data.result;
      
      // 응답이 null이거나 빈 경우 처리
      if (!updatedTask) {
        return {
          content: [
            {
              type: 'text' as const,
              text: `**✅ 업무가 성공적으로 수정되었습니다!**\\n\\n` +
                    `**업무 ID:** ${postId}\\n` +
                    `**프로젝트 ID:** ${projectId}\\n\\n` +
                    `수정사항이 정상적으로 반영되었습니다.`
            }
          ]
        };
      }
      
      return {
        content: [
          {
            type: 'text' as const,
            text: `**✅ 업무가 성공적으로 수정되었습니다!**\\n\\n` +
                  `**제목:** ${updatedTask.subject || '제목 정보 없음'}\\n` +
                  `**번호:** #${updatedTask.number || 'N/A'}\\n` +
                  `**ID:** ${updatedTask.id || postId}\\n` +
                  `**완료상태:** ${updatedTask.closed ? '완료' : '진행중'}\\n` +
                  `**프로젝트 ID:** ${projectId}`
          }
        ]
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text' as const,
            text: `오류 발생: 업무 수정 실패: ${error.message}`
          }
        ]
      };
    }
  }

  /**
   * 특정 업무의 상세 정보를 가져옵니다
   */
  async getTask(projectId: string, postId: string) {
    try {
      const response = await this.client.get(`/project/v1/projects/${projectId}/posts/${postId}`);
      
      if (!response.data.header?.isSuccessful) {
        throw new Error(`API 오류: ${response.data.header?.resultMessage || '알 수 없는 오류'}`);
      }
      
      const task = response.data.result;
      
      return {
        content: [
          {
            type: 'text' as const,
            text: `**업무 상세 정보**\n\n` +
                  `**제목:** ${task.subject}\n` +
                  `**번호:** #${task.number}\n` +
                  `**ID:** ${task.id}\n` +
                  `**내용:** ${task.body?.content || '내용 없음'}\n` +
                  `**완료상태:** ${task.closed ? '완료' : '진행중'}\n` +
                  `**우선순위:** ${task.priority || 'N/A'}\n` +
                  `**생성일:** ${new Date(task.createdAt).toLocaleDateString('ko-KR')}\n` +
                  `**수정일:** ${new Date(task.updatedAt).toLocaleDateString('ko-KR')}\n` +
                  `**작성자:** ${task.users?.from?.member?.name || task.users?.from?.name || 'N/A'}`
          }
        ]
      };
    } catch (error) {
      throw new Error(`업무 조회 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }
} 