# 📦 Dooray MCP Server 설치 가이드

이 가이드는 다른 환경에서 Dooray MCP Server를 설치하고 사용하는 방법을 설명합니다.

## 🚀 설치 방법

### 방법 1: 로컬 패키지 설치 (권장)

1. **패키지 파일을 원하는 위치로 복사**
   ```bash
   # 생성된 패키지 파일을 복사
   cp dooray-mcp-server-1.0.0.tgz /path/to/your/target/directory/
   ```

2. **글로벌 설치**
   ```bash
   # 글로벌 설치 (어디서든 dooray-mcp 명령어 사용 가능)
   npm install -g dooray-mcp-server-1.0.0.tgz
   ```

3. **로컬 설치 (특정 프로젝트에서만 사용)**
   ```bash
   # 프로젝트 디렉토리에서
   npm install dooray-mcp-server-1.0.0.tgz
   ```

### 방법 2: GitHub에서 직접 설치

```bash
# Git repository에서 직접 설치 (GitHub에 업로드 후)
npm install -g git+https://github.com/yourusername/dooray-mcp-server.git
```

### 방법 3: 소스 코드로 빌드

```bash
# 소스 코드 클론
git clone https://github.com/yourusername/dooray-mcp-server.git
cd dooray-mcp-server

# 의존성 설치
npm install

# 빌드
npm run build

# 글로벌 링크 (개발용)
npm link
```

## ⚙️ 설정

### 1. 환경변수 파일 생성

설치 후 어떤 디렉토리에서든 사용할 수 있도록 홈 디렉토리에 설정 파일을 만드세요:

```bash
# 홈 디렉토리에 .dooray-mcp 폴더 생성
mkdir -p ~/.dooray-mcp

# 환경변수 파일 생성
cat > ~/.dooray-mcp/.env << EOF
# Dooray API 설정
DOORAY_API_BASE_URL=https://api.dooray.com
DOORAY_API_TOKEN=your_dooray_api_token_here

# 보안 설정: 수정/생성 허용할 프로젝트 ID 목록 (쉼표로 구분)
DOORAY_ALLOWED_PROJECT_IDS=3177894036055830875

# 보안 설정: 수정/생성 허용할 태스크 ID 목록 (쉼표로 구분)
DOORAY_ALLOWED_TASK_IDS=4119047429224778951,4119052943644031705
EOF
```

### 2. 환경변수 로드 스크립트 생성

```bash
# 환경변수 로드를 위한 스크립트 생성
cat > ~/.dooray-mcp/load-env.sh << 'EOF'
#!/bin/bash
if [ -f ~/.dooray-mcp/.env ]; then
    export $(cat ~/.dooray-mcp/.env | xargs)
fi
EOF

chmod +x ~/.dooray-mcp/load-env.sh
```

## 🔧 Cursor/MCP 클라이언트 설정

### Cursor 설정

`.cursor/mcp.json` 파일에 다음과 같이 설정:

```json
{
  "mcpServers": {
    "dooray": {
      "command": "dooray-mcp",
      "env": {
        "DOORAY_API_TOKEN": "your_token_here",
        "DOORAY_ALLOWED_PROJECT_IDS": "3177894036055830875",
        "DOORAY_ALLOWED_TASK_IDS": "4119047429224778951,4119052943644031705"
      }
    }
  }
}
```

### Claude Desktop 설정

`~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "dooray": {
      "command": "dooray-mcp",
      "env": {
        "DOORAY_API_TOKEN": "your_token_here",
        "DOORAY_ALLOWED_PROJECT_IDS": "3177894036055830875",
        "DOORAY_ALLOWED_TASK_IDS": "4119047429224778951,4119052943644031705"
      }
    }
  }
}
```

## 🧪 설치 확인

### 직접 실행 테스트

```bash
# 환경변수 로드
source ~/.dooray-mcp/load-env.sh

# 서버 실행 (Ctrl+C로 종료)
dooray-mcp
```

### MCP 클라이언트에서 테스트

1. Cursor나 Claude Desktop 재시작
2. AI 어시스턴트에게 다음과 같이 요청:
   ```
   두레이 프로젝트 목록을 보여줘
   ```

## 🔄 업데이트

### 새 버전 설치

```bash
# 기존 버전 제거
npm uninstall -g dooray-mcp-server

# 새 버전 설치
npm install -g dooray-mcp-server-1.1.0.tgz
```

### 설정 백업

```bash
# 설정 백업
cp ~/.dooray-mcp/.env ~/.dooray-mcp/.env.backup
```

## 🐛 문제 해결

### 권한 오류

```bash
# npm 글로벌 설치 권한 오류 시
sudo npm install -g dooray-mcp-server-1.0.0.tgz
```

### 환경변수 로드 안됨

```bash
# 환경변수 확인
echo $DOORAY_API_TOKEN

# 수동 설정
export DOORAY_API_TOKEN="your_token_here"
export DOORAY_ALLOWED_PROJECT_IDS="3177894036055830875"
```

### 명령어 찾을 수 없음

```bash
# 설치 경로 확인
which dooray-mcp

# PATH 확인
echo $PATH

# npm bin 경로 확인
npm bin -g
```

## 📁 디렉토리 구조

설치 후 생성되는 파일들:

```
~/.dooray-mcp/
├── .env                # 환경변수 설정
├── .env.backup         # 설정 백업
└── load-env.sh         # 환경변수 로드 스크립트

/usr/local/lib/node_modules/dooray-mcp-server/  (글로벌 설치 시)
├── dist/               # 빌드된 파일들
├── README.md           # 사용법
├── package.json        # 패키지 정보
└── env.example         # 환경변수 예시
```

## 🆘 지원

문제가 발생하면 다음을 확인해보세요:

1. Node.js 버전 (18.0.0 이상 필요)
2. npm 권한 설정
3. 환경변수 설정
4. 두레이 API 토큰 유효성

---

**설치가 완료되면 이제 어디서든 `dooray-mcp` 명령어로 서버를 실행할 수 있습니다!** 🎉 