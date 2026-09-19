import { isMine } from './isMine';

const me = (userId: number | null, name = '냐르', isLoggedIn = true) => ({ userId, name, isLoggedIn });

describe('isMine', () => {
  it('양쪽 id 가 있으면 id 로만 판별한다', () => {
    expect(isMine(me(10), { userId: 10, nickname: '다른이름' })).toBe(true);
    expect(isMine(me(10), { userId: 3, nickname: '냐르' })).toBe(false);
  });

  it('닉네임이 같아도 id 가 다르면 내 것이 아니다 — 동명이인에게 삭제 버튼이 뜨던 문제', () => {
    expect(isMine(me(10, '여행자'), { userId: 11, nickname: '여행자' })).toBe(false);
  });

  it('id 를 모르면 닉네임으로 폴백한다 (userinfo 실패·구버전 응답)', () => {
    expect(isMine(me(null), { userId: 10, nickname: '냐르' })).toBe(true);
    expect(isMine(me(10), { userId: null, nickname: '냐르' })).toBe(true);
    expect(isMine(me(null), { nickname: '연주' })).toBe(false);
  });

  it('로그인하지 않았거나 비교할 값이 없으면 false', () => {
    expect(isMine(me(10, '냐르', false), { userId: 10, nickname: '냐르' })).toBe(false);
    expect(isMine(me(null, ''), { userId: null, nickname: '' })).toBe(false);
    expect(isMine(me(null, ''), { nickname: undefined })).toBe(false);
  });
});
