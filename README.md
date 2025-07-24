# 🚀 Dooray MCP Server

두레이(Dooray) API와 연동되는 MCP(Model Context Protocol) 서버입니다.
AI 어시스턴트가 두레이 프로젝트 관리 기능을 사용할 수 있도록 해줍니다.

## ✨ 주요 기능

- 📋 **프로젝트 관리**: 프로젝트 조회, 검색
- 📝 **업무 관리**: 업무 생성, 수정, 조회
- 📊 **업무 목록**: 프로젝트별 업무 목록 조회
- 🔒 **보안 기능**: 프로젝트/태스크 ID 기반 접근 제한
- 🔍 **검색 기능**: 프로젝트명으로 검색

## 🛠️ 설치 방법

### npm으로 설치
```bash
npm install -g dooray-mcp-server
```

### 로컬에서 빌드
```bash
git clone https://github.com/yourusername/dooray-mcp-server.git
cd dooray-mcp-server
npm install
npm run build
```

## ⚙️ 설정

### 1. 환경변수 설정

`.env` 파일을 생성하고 다음 내용을 추가하세요:

```bash
# Dooray API 설정
DOORAY_API_BASE_URL=https://api.dooray.com
DOORAY_API_TOKEN=your_dooray_api_token_here

# 보안 설정: 수정/생성 허용할 프로젝트 ID 목록 (쉼표로 구분)
DOORAY_ALLOWED_PROJECT_IDS=3177894036055830875

# 보안 설정: 수정/생성 허용할 태스크 ID 목록 (쉼표로 구분)
DOORAY_ALLOWED_TASK_IDS=4119047429224778951,4119052943644031705
```

### 2. Dooray API 토큰 발급

1. 두레이 웹사이트에 로그인
2. 설정 > API > 토큰 생성
3. 생성된 토큰을 `DOORAY_API_TOKEN`에 설정

## 🚀 사용 방법

### 직접 실행
```bash
# 글로벌 설치 후
dooray-mcp

# 또는 로컬에서
npm start
```

### MCP 클라이언트에서 사용

#### Cursor에서 사용
`.cursor/mcp.json` 파일에 다음과 같이 설정:

```json
{
  "mcpServers": {
    "dooray": {
      "command": "dooray-mcp",
      "env": {
        "DOORAY_API_TOKEN": "your_token_here",
        "DOORAY_ALLOWED_PROJECT_IDS": "your_project_ids",
        "DOORAY_ALLOWED_TASK_IDS": "your_task_ids"
      }
    }
  }
}
```

## 🔧 사용 가능한 MCP 도구

| 도구명 | 설명 | 매개변수 |
|--------|------|----------|
| `dooray_list_projects` | 모든 프로젝트 조회 | 없음 |
| `dooray_search_projects` | 프로젝트 검색 | `searchTerm`: 검색어 |
| `dooray_get_project` | 특정 프로젝트 조회 | `projectId`: 프로젝트 ID |
| `dooray_list_tasks` | 프로젝트의 업무 목록 조회 | `projectId`: 프로젝트 ID |
| `dooray_get_task` | 특정 업무 조회 | `projectId`, `postId` |
| `dooray_create_task` | 새 업무 생성 | `projectId`, `subject`, `body`(선택) |
| `dooray_update_task` | 업무 수정 | `projectId`, `postId`, `subject`(선택), `body`(선택) |

## 🔒 보안 기능

### 프로젝트 ID 제한
- `DOORAY_ALLOWED_PROJECT_IDS`에 지정된 프로젝트에서만 업무 생성 가능
- 다른 프로젝트에 대한 접근은 조회만 가능

### 태스크 ID 제한
- `DOORAY_ALLOWED_TASK_IDS`에 지정된 태스크만 수정 가능
- 보안상 중요한 업무의 실수 수정 방지

### 사용 예시
```bash
# 허용된 프로젝트에서만 업무 생성
DOORAY_ALLOWED_PROJECT_IDS=3177894036055830875

# 특정 태스크만 수정 허용
DOORAY_ALLOWED_TASK_IDS=4119047429224778951,4119052943644031705
```

## 📝 사용 예시

### 프로젝트 검색
```json
{
  "name": "dooray_search_projects",
  "arguments": {
    "searchTerm": "tc-iaas-console"
  }
}
```

### 업무 생성
```json
{
  "name": "dooray_create_task",
  "arguments": {
    "projectId": "3177894036055830875",
    "subject": "새로운 기능 개발",
    "body": "상세한 업무 설명입니다."
  }
}
```

### 업무 수정
```json
{
  "name": "dooray_update_task",
  "arguments": {
    "projectId": "3177894036055830875",
    "postId": "4119052943644031705",
    "subject": "수정된 제목",
    "body": "수정된 내용입니다."
  }
}
```

## 🐛 문제 해결

### 환경변수 로드 오류
- `.env` 파일이 프로젝트 루트에 있는지 확인
- 환경변수 값에 공백이나 특수문자가 있는지 확인

### API 토큰 오류
- 두레이에서 발급받은 토큰이 유효한지 확인
- 토큰 형식: `{tenant_id}:{token}`

### 보안 오류
- 허용된 프로젝트/태스크 ID가 올바르게 설정되었는지 확인
- 쉼표로 구분된 ID 목록 형식 확인

## 🤝 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 라이센스

MIT License. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 🔗 관련 링크

- [Dooray API 문서](https://helpdesk.dooray.com/share/pages/9wWo-xwiR66BO5LGshgVTg)
- [Model Context Protocol](https://modelcontextprotocol.io/)

---

⭐ 이 프로젝트가 유용하다면 Star를 눌러주세요!