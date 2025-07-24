# 🏠 로컬 IDE에서 Dooray MCP 서버 사용하기

이 가이드는 현재 프로젝트를 다른 IDE에서 MCP 서버로 직접 사용하는 방법을 설명합니다.

## 📁 프로젝트 경로

**현재 프로젝트 위치:** `/Users/nhn/Downloads/project/my-project/dooray-mcp`

## 🔧 IDE별 설정 방법

### 1. Cursor (다른 인스턴스)

프로젝트 폴더에서 `.cursor/mcp.json` 파일을 생성하고 다음 내용을 추가:

```json
{
  "mcpServers": {
    "dooray": {
      "command": "node",
      "args": ["/Users/nhn/Downloads/project/my-project/dooray-mcp/dist/index.js"],
      "env": {
        "DOORAY_API_TOKEN": "ajjt1imxmtj4:U7lnEMsySxu26sKywR4okQ",
        "DOORAY_ALLOWED_PROJECT_IDS": "3177894036055830875",
        "DOORAY_ALLOWED_TASK_IDS": "4119047429224778951,4119052943644031705"
      }
    }
  }
}
```

### 2. VSCode (Continue 확장 사용 시)

VSCode의 Continue 확장에서 MCP 설정:

```json
{
  "mcpServers": {
    "dooray": {
      "command": "node",
      "args": ["/Users/nhn/Downloads/project/my-project/dooray-mcp/dist/index.js"],
      "env": {
        "DOORAY_API_TOKEN": "ajjt1imxmtj4:U7lnEMsySxu26sKywR4okQ",
        "DOORAY_ALLOWED_PROJECT_IDS": "3177894036055830875",
        "DOORAY_ALLOWED_TASK_IDS": "4119047429224778951,4119052943644031705"
      }
    }
  }
}
```

### 3. Claude Desktop

`~/Library/Application Support/Claude/claude_desktop_config.json` 파일에 추가:

```json
{
  "mcpServers": {
    "dooray": {
      "command": "node",
      "args": ["/Users/nhn/Downloads/project/my-project/dooray-mcp/dist/index.js"],
      "env": {
        "DOORAY_API_TOKEN": "ajjt1imxmtj4:U7lnEMsySxu26sKywR4okQ",
        "DOORAY_ALLOWED_PROJECT_IDS": "3177894036055830875",
        "DOORAY_ALLOWED_TASK_IDS": "4119047429224778951,4119052943644031705"
      }
    }
  }
}
```

## 🚀 더 간편한 방법: 실행 스크립트 사용

### 스크립트를 사용한 설정

```json
{
  "mcpServers": {
    "dooray": {
      "command": "/Users/nhn/Downloads/project/my-project/dooray-mcp/run-dooray-mcp.sh",
      "env": {}
    }
  }
}
```

이 방법의 장점:
- ✅ 환경변수가 자동으로 `.env` 파일에서 로드됨
- ✅ 경로 관리가 더 간편함
- ✅ 스크립트만 실행하면 됨

## 🧪 테스트 방법

### 1. 직접 실행 테스트

터미널에서 다음 명령어로 서버가 정상 작동하는지 확인:

```bash
# 프로젝트 디렉토리에서
./run-dooray-mcp.sh

# 또는
node dist/index.js
```

### 2. MCP 클라이언트에서 테스트

1. IDE 재시작
2. AI 어시스턴트에게 요청:
   ```
   두레이 프로젝트를 검색해서 tc-iaas-console을 찾아줘
   ```

## 🔄 프로젝트 업데이트 시

코드를 수정한 경우 다시 빌드:

```bash
cd /Users/nhn/Downloads/project/my-project/dooray-mcp
npm run build
```

## 📂 프로젝트 구조

```
/Users/nhn/Downloads/project/my-project/dooray-mcp/
├── dist/
│   └── index.js              # 실제 실행되는 MCP 서버
├── src/                      # 소스 코드
├── .env                      # 환경변수 설정
├── run-dooray-mcp.sh        # 실행 스크립트 (권장)
├── package.json
└── LOCAL_USAGE.md           # 이 파일
```

## 🔒 보안 설정

현재 설정된 보안 제한:

- **허용된 프로젝트:** `3177894036055830875`
- **허용된 태스크:** `4119047429224778951,4119052943644031705`

새로운 태스크 ID를 허용하려면 `.env` 파일에서 `DOORAY_ALLOWED_TASK_IDS`를 수정하세요.

## 🐛 문제 해결

### 서버가 시작되지 않는 경우

1. **Node.js 설치 확인:**
   ```bash
   node --version  # v18.0.0 이상 필요
   ```

2. **프로젝트 빌드 확인:**
   ```bash
   ls -la dist/index.js  # 파일이 존재하는지 확인
   ```

3. **환경변수 확인:**
   ```bash
   cat .env  # 환경변수가 올바른지 확인
   ```

### MCP 클라이언트 연결 안됨

1. **절대 경로 확인:** `/Users/nhn/Downloads/project/my-project/dooray-mcp/dist/index.js`
2. **JSON 형식 확인:** 콤마, 따옴표 등이 올바른지 확인
3. **IDE 재시작:** 설정 변경 후 IDE 완전 재시작

---

**이제 다른 IDE에서도 두레이 MCP 서버를 자유롭게 사용하실 수 있습니다!** 🎉 