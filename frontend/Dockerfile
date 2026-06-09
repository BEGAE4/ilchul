# next.js 실행
FROM node:20-alpine AS runner
#명령어 실행할 디렉터리
WORKDIR /app
# production 환경변수
ENV NODE_ENV production
# container 환경에 시스템 사용자를 추가
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY public ./public
COPY --chown=nextjs:nodejs .next/standalone ./
COPY --chown=nextjs:nodejs .next/static ./.next/static

USER nextjs

# 컨테이너의 수신 대기 포트를 3000번으로
EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]