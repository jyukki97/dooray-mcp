#!/bin/bash

# Dooray MCP Server 실행 스크립트
# 다른 IDE에서 MCP 서버로 사용하기 위한 스크립트

# 현재 스크립트가 있는 디렉토리로 이동
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 환경변수 로드 (.env 파일이 있으면)
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Node.js로 MCP 서버 실행
node dist/index.js 