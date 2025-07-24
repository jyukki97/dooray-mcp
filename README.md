# 🚪 Dooray MCP Server

NHN Dooray 프로젝트 관리 서비스와 AI 어시스턴트를 연결해주는 Model Context Protocol (MCP) 서버입니다.

## ✨ 주요 기능

### 📁 프로젝트 관리
- **프로젝트 목록 조회**: 접근 가능한 모든 프로젝트 확인
- **프로젝트 검색**: 이름이나 키워드로 프로젝트 찾기
- **프로젝트 상세 정보**: 특정 프로젝트의 세부 정보 조회

### 📋 업무(태스크) 관리
- **업무 목록 조회**: 프로젝트의 업무 목록 (페이징 지원)
- **🆕 고급 업무 검색**: 강력한 필터링과 페이징 기능
  - 키워드 검색 (제목, 내용)
  - 상태별 필터링 (등록됨, 진행중, 완료)
  - 우선순위별 필터링 (긴급, 높음, 보통, 낮음)
  - 담당자별 필터링
  - 날짜 범위 검색 (생성일, 수정일)
  - 마일스톤 및 태그 필터링
  - 다양한 정렬 옵션
- **업무 생성**: 새로운 업무 작성
- **업무 수정**: 기존 업무 내용 변경
- **업무 상세 조회**: 특정 업무의 완전한 정보

### 🔒 보안 기능
- **프로젝트별 접근 제어**: 허용된 프로젝트에서만 작업
- **업무별 수정 제한**: 지정된 업무 ID만 수정 가능
- **환경변수 기반 설정**: 민감한 정보 안전 관리

## 🛠 사용 가능한 MCP 도구

| 도구명 | 설명 | 주요 매개변수 |
|--------|------|---------------|
| `dooray_list_projects` | 프로젝트 목록 조회 | 없음 |
| `dooray_search_projects` | 프로젝트 검색 | `searchTerm` |
| `dooray_get_project` | 프로젝트 상세 정보 | `projectId` |
| `dooray_list_tasks` | 업무 목록 조회 (페이징) | `projectId`, `page?`, `size?` |
| **`dooray_search_tasks`** | **🆕 고급 업무 검색** | `projectId`, 필터 옵션들 |
| `dooray_create_task` | 새 업무 생성 | `projectId`, `subject`, `body?` |
| `dooray_update_task` | 업무 수정 | `projectId`, `postId`, `subject?`, `body?` |
| `dooray_get_task` | 업무 상세 조회 | `projectId`, `postId` |

### 🔍 고급 검색 필터 옵션

`dooray_search_tasks`에서 사용 가능한 필터들:

```json
{
  "projectId": "3177894036055830875",
  "page": 0,
  "size": 20,
  "q": "버그 수정",
  "status": "working",
  "priority": "high",
  "assigneeId": "사용자ID",
  "createdAtFrom": "2024-01-01T00:00:00Z",
  "createdAtTo": "2024-12-31T23:59:59Z",
  "sort": "updatedAt",
  "order": "desc"
}
```

#### 📊 필터 옵션 상세

- **페이징**: `page` (0부터), `size` (최대 100)
- **검색**: `q` (제목, 내용 키워드)
- **상태**: `status` (`registered`, `working`, `closed`)
- **우선순위**: `priority` (`urgent`, `high`, `normal`, `low`)
- **담당자**: `assigneeId` (사용자 ID)
- **마일스톤**: `milestoneId`
- **태그**: `tagId`
- **날짜 범위**: `createdAtFrom/To`, `updatedAtFrom/To` (ISO 8601 형식)
- **정렬**: `sort` (`createdAt`, `updatedAt`, `priority`, `dueDate`)
- **정렬 순서**: `order` (`asc`, `desc`)

## 📦 설치 방법

### 방법 1: npm 패키지 설치 (권장)

```bash
npm install -g dooray-mcp-server
```

### 방법 2: 소스코드에서 빌드

```bash
git clone <repository-url>
cd dooray-mcp-server
npm install
npm run build
```

## ⚙️ 환경 설정

`.env` 파일을 생성하고 다음 환경변수를 설정하세요:

```env
# 필수: Dooray API 토큰
DOORAY_API_TOKEN=your_dooray_api_token_here

# 선택사항: API 기본 URL (기본값: https://api.dooray.com)
DOORAY_API_BASE_URL=https://api.dooray.com

# 보안 설정: 허용된 프로젝트 ID (쉼표로 구분)
DOORAY_ALLOWED_PROJECT_IDS=3177894036055830875,다른_프로젝트_ID

# 보안 설정: 수정 가능한 업무 ID (쉼표로 구분)
DOORAY_ALLOWED_TASK_IDS=4119047429224778951,4119052943644031705
```

## 🔧 MCP 클라이언트 설정

### Cursor

`.cursor/mcp.json` 파일 생성:

```json
{
  "mcpServers": {
    "dooray": {
      "command": "dooray-mcp",
      "env": {
        "DOORAY_API_TOKEN": "your_token_here",
        "DOORAY_ALLOWED_PROJECT_IDS": "3177894036055830875",
        "DOORAY_ALLOWED_TASK_IDS": "task_id_1,task_id_2"
      }
    }
  }
}
```

### Claude Desktop

`~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "dooray": {
      "command": "dooray-mcp",
      "env": {
        "DOORAY_API_TOKEN": "your_token_here",
        "DOORAY_ALLOWED_PROJECT_IDS": "3177894036055830875",
        "DOORAY_ALLOWED_TASK_IDS": "task_id_1,task_id_2"
      }
    }
  }
}
```

## 💡 사용 예시

### 기본 업무 조회
```
프로젝트 3177894036055830875의 업무 목록을 보여줘
```

### 🆕 고급 검색 예시
```
프로젝트 3177894036055830875에서 '버그'라는 키워드가 들어간 진행중인 업무를 찾아줘

상태가 'working'이고 우선순위가 'high'인 업무들을 최신순으로 보여줘

2024년 1월 이후 생성된 완료된 업무들을 페이지 1에서 50개씩 보여줘
```

### 페이징 예시
```
다음 페이지 업무들을 보여줘 (page=1, size=10)

첫 번째 페이지로 돌아가서 20개씩 보여줘
```

## 🔒 보안 정책

- **생성/수정 제한**: 환경변수로 지정한 프로젝트와 업무에서만 가능
- **조회 권한**: API 토큰으로 접근 가능한 모든 리소스 조회 가능
- **환경변수 필수**: 허용된 ID 목록이 설정되지 않으면 생성/수정 차단

## 🐛 문제 해결

### 일반적인 오류

1. **토큰 오류**: `DOORAY_API_TOKEN` 환경변수 확인
2. **권한 오류**: 허용된 프로젝트/업무 ID 목록 확인
3. **네트워크 오류**: API 기본 URL과 네트워크 연결 확인

### 디버깅

환경변수 확인:
```bash
echo $DOORAY_API_TOKEN
echo $DOORAY_ALLOWED_PROJECT_IDS
echo $DOORAY_ALLOWED_TASK_IDS
```

서버 로그 확인:
```bash
node dist/index.js
```

## 🚀 새로운 기능 (v1.1.0)

- ✅ **고급 태스크 검색**: 키워드, 상태, 우선순위 등 다양한 필터
- ✅ **강화된 페이징**: 더 유연한 페이지 크기 설정
- ✅ **날짜 범위 검색**: 생성일/수정일 기준 검색
- ✅ **정렬 옵션**: 생성일, 수정일, 우선순위 등으로 정렬
- ✅ **상세한 검색 결과**: 담당자, 우선순위, 내용 미리보기 포함

## 📄 라이센스

MIT License - 자세한 내용은 LICENSE 파일을 참조하세요.

## 🤝 기여하기

1. 이 저장소를 포크하세요
2. 새로운 기능 브랜치를 만드세요 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋하세요 (`git commit -m 'Add amazing feature'`)
4. 브랜치에 푸시하세요 (`git push origin feature/amazing-feature`)
5. Pull Request를 열어주세요

## 📞 지원

- GitHub Issues: 버그 리포트 및 기능 요청
- 문서: 더 자세한 사용법은 설치 가이드를 참조하세요

---

**개발자 노트**: 이 프로젝트는 NHN Dooray의 공식 API를 사용하여 구현되었습니다.