#!/bin/bash
# Next.js 개발 서버 재시작 스크립트

echo "🛑 기존 Next.js 프로세스 종료 중..."
pkill -f "next dev" || true

echo "⏳ 3초 대기..."
sleep 3

echo "🚀 개발 서버 시작 중..."
cd ~/kiwoom-lottery/frontend
npm run dev

