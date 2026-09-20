This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

Node.js는 `20.19.x` 이상인 20 계열 또는 `22.12.0` 이상을 사용합니다.
배포 CI는 `yarn install --frozen-lockfile`을 사용하며, npm 사용 시 `npm ci`로 설치합니다.

### 의존성 보안 유지

- `yarn.lock`과 `package-lock.json`을 함께 갱신하고 `yarn audit`, `npm audit`, `npm audit --omit=dev`를 확인합니다.
- Next.js 15.5.25가 고정한 PostCSS 8.4.31의 취약점을 해결하기 위해 npm `overrides`와 Yarn `resolutions`에서 PostCSS 8.5.28을 지정합니다. Yarn의 원래 버전과 불일치 경고는 이 설정에 따른 것입니다. Next.js가 수정 버전을 직접 사용하면 재검증 후 제거합니다.
- `@testing-library/jest-dom`은 Node.js 20 호환성을 위해 6.9.1을 고정합니다. 6.10.0은 Node.js 22를 요구하는 변경으로 사용 중단이 권고된 버전입니다.
- Storybook은 10.6의 Next.js Vite 통합을 사용합니다. 기존 Webpack 통합의 취약한 암호화 polyfill과 Storybook 9의 취약한 mocker 의존성을 제거하기 위한 전환입니다.
- 의존성 변경 후 테스트, 타입 검사, Next.js 빌드와 Storybook 빌드를 모두 확인합니다. audit 0건은 조회 시점의 공개 공지 기준이며 실제 서비스 전체의 안전성을 보장하지 않습니다.

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
