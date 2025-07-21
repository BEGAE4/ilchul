#  환경 설정 및 dependancy 설치
FROM node:20-alpine AS base
FROM base AS deps
# 명령어를 실행할 디렉터리
WORKDIR /app
# Dependancy install을 위해 package.json, yarn.lock 복사
COPY package.json yarn.lock* ./
# Dependancy 설치
RUN yarn --frozen-lockfile

# next.js 빌드
FROM base AS builder
# Docker를 build할때 개발 모드 구분용 환경 변수
ARG ENV_MODE
# 명령어 실행할 디렉터리
WORKDIR /app
# node_modules 등의 dependancy를 복사함.
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN yarn build


# next.js 실행
FROM base AS runner
#명령어 실행할 디렉터리리
WORKDIR /app
# production 환경변수
ENV NODE_ENV production
# container 환경에 시스템 사용자를 추가
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --shown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

# 컨테이너의 수신 대기 포트를 3000번으로
EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]