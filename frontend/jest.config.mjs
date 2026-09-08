// 순수 함수(정규화·복원 규칙)만 단위 테스트한다. next/jest 가 SWC 로 TS 를 변환하고
// tsconfig paths(@/…) 를 moduleNameMapper 로 옮겨 준다. UI 는 QA 스크립트로 검증한다.
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({ dir: './' });

export default createJestConfig({
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/**/*.test.ts'],
});
