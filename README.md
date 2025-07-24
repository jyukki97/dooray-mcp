# Dooray MCP Server

Dooray API와 상호작용하기 위한 Model Context Protocol (MCP) 서버입니다.

## 기능

이 MCP 서버는 다음과 같은 Dooray API 기능을 제공합니다:

- 📋 **프로젝트 관리**
  - 프로젝트 목록 조회
  - 프로젝트 상세 정보 조회

- 📝 **작업 관리**
  - 프로젝트별 작업 목록 조회
  - 새 작업 생성
  - 작업 상태별 필터링

## 설치 및 설정

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

```bash
# 환경 변수 파일 생성
cp env.example .env
```

`.env` 파일에서 다음 값들을 설정하세요:

```env
DOORAY_API_BASE_URL=https://api.dooray.com
DOORAY_API_TOKEN=your_dooray_api_token_here
```

### 3. Dooray API 토큰 획득

1. Dooray에 로그인
2. 설정 > API 토큰 관리
3. 새 토큰 생성
4. 생성된 토큰을 `.env` 파일의 `DOORAY_API_TOKEN`에 입력

### 4. 빌드

```bash
npm run build
```

## 사용법

### 개발 모드로 실행

```bash
npm run dev
```

### 프로덕션 모드로 실행

```bash
npm start
```

### MCP 클라이언트에서 사용

MCP 호환 클라이언트 (예: Claude Desktop, Cline 등)에서 이 서버를 설정하여 사용할 수 있습니다.

#### Claude Desktop 설정 예시

`~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "dooray": {
      "command": "node",
      "args": ["/path/to/dooray-mcp/dist/index.js"],
      "env": {
        "DOORAY_API_TOKEN": "your_token_here",
        "DOORAY_API_BASE_URL": "https://api.dooray.com"
      }
    }
  }
}
```

## 사용 가능한 도구들

### `dooray_list_projects`
Dooray의 모든 프로젝트 목록을 가져옵니다.

**매개변수:** 없음

### `dooray_get_project`
특정 프로젝트의 상세 정보를 조회합니다.

**매개변수:**
- `projectId` (string, 필수): 프로젝트 ID

### `dooray_list_tasks`
프로젝트의 작업 목록을 조회합니다.

**매개변수:**
- `projectId` (string, 필수): 프로젝트 ID
- `status` (string, 선택): 작업 상태 ("open", "closed", "all")

### `dooray_create_task`
새로운 작업을 생성합니다.

**매개변수:**
- `projectId` (string, 필수): 프로젝트 ID
- `subject` (string, 필수): 작업 제목
- `body` (string, 선택): 작업 내용

## 개발

### 파일 구조

```
dooray-mcp/
├── src/
│   ├── index.ts          # 메인 MCP 서버
│   └── dooray-client.ts  # Dooray API 클라이언트
├── dist/                 # 빌드된 JavaScript 파일들
├── package.json
├── tsconfig.json
├── .gitignore
├── env.example          # 환경 변수 예시
└── README.md
```

### 개발 명령어

```bash
# 개발 모드 (파일 변경 시 자동 재시작)
npm run watch

# 빌드
npm run build

# 빌드 결과물 정리
npm run clean
```

## 라이선스

MIT

## 기여하기

버그 리포트나 기능 요청은 GitHub Issues를 통해 해주세요.

## 지원

- Node.js 18 이상
- Dooray API v1
- MCP Protocol 0.4.0+