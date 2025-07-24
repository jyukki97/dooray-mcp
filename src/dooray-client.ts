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
  private baseUrl: string;
  private token: string;

  constructor() {
    // 환경변수에서 설정값 읽기
    this.baseUrl = process.env.DOORAY_API_BASE_URL || 'https://api.dooray.com';
    this.token = process.env.DOORAY_API_TOKEN || '';

    if (!this.token) {
      throw new Error('DOORAY_API_TOKEN 환경변수가 설정되지 않았습니다.');
    }

    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `dooray-api ${this.token}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
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
      const taskData = {
        subject,
        body: body || '',
      };

      const response = await this.client.post(`/project/v1/projects/${projectId}/posts`, taskData);
      
      if (!response.data.header?.isSuccessful) {
        throw new Error(`API 오류: ${response.data.header?.resultMessage || '알 수 없는 오류'}`);
      }
      
      const newTask = response.data.result;
      
      return {
        content: [
          {
            type: 'text' as const,
            text: `**새 업무가 생성되었습니다!**\n\n` +
                  `**제목:** ${newTask.subject}\n` +
                  `**번호:** #${newTask.number}\n` +
                  `**ID:** ${newTask.id}\n` +
                  `**완료상태:** ${newTask.closed ? '완료' : '진행중'}\n` +
                  `**우선순위:** ${newTask.priority || 'N/A'}\n` +
                  `**생성일:** ${new Date(newTask.createdAt).toLocaleDateString('ko-KR')}`
          }
        ]
      };
    } catch (error) {
      throw new Error(`업무 생성 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }
} 