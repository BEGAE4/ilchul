// 순수 함수(정규화·복원 규칙)와 API 조합 로직만 단위 테스트한다. next/jest 가 SWC 로 TS 를 변환한다.
// tsconfig paths(@/…)는 자동으로 옮겨지지 않아 moduleNameMapper 로 직접 매핑한다.
// UI 는 QA 스크립트(cc/result/part_c_qa_scripts)로 검증한다.
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({ dir: './' });

export default createJestConfig({
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
});
