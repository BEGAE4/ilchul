import { classifyUserProfileError, isOwnProfile, parseUserId } from './userProfile';

describe('parseUserId', () => {
  it('양의 정수 문자열만 숫자로 바꾼다', () => {
    expect(parseUserId('1')).toBe(1);
    expect(parseUserId('42')).toBe(42);
  });

  it('닉네임·0·음수·소수·빈값은 null', () => {
    expect(parseUserId('새벽여행자')).toBeNull();
    expect(parseUserId('0')).toBeNull();
    expect(parseUserId('-3')).toBeNull();
    expect(parseUserId('1.5')).toBeNull();
    expect(parseUserId('')).toBeNull();
    expect(parseUserId(undefined)).toBeNull();
  });
});

describe('classifyUserProfileError', () => {
  it('404 는 없는 사용자, 410 은 탈퇴한 사용자', () => {
    expect(classifyUserProfileError(404)).toBe('not-found');
    expect(classifyUserProfileError(410)).toBe('withdrawn');
  });

  it('그 밖(500·네트워크 오류)은 일반 오류', () => {
    expect(classifyUserProfileError(500)).toBe('error');
    expect(classifyUserProfileError(null)).toBe('error');
    expect(classifyUserProfileError(undefined)).toBe('error');
  });
});

describe('isOwnProfile', () => {
  it('로그인했고 닉네임이 같으면 본인', () => {
    expect(isOwnProfile({ isLoggedIn: true, name: '새벽여행자' }, '새벽여행자')).toBe(true);
  });

  it('비로그인이거나 닉네임이 다르거나 비어 있으면 본인이 아니다', () => {
    expect(isOwnProfile({ isLoggedIn: false, name: '새벽여행자' }, '새벽여행자')).toBe(false);
    expect(isOwnProfile({ isLoggedIn: true, name: '새벽여행자' }, '조용한바다')).toBe(false);
    expect(isOwnProfile({ isLoggedIn: true, name: '' }, '')).toBe(false);
    expect(isOwnProfile({ isLoggedIn: true, name: '새벽여행자' }, null)).toBe(false);
  });

  it('내 id 와 프로필 id 를 알면 id 로만 판별한다 — 닉네임이 같은 다른 사람은 본인이 아니다', () => {
    expect(isOwnProfile({ isLoggedIn: true, userId: 10, name: '새벽여행자' }, '새벽여행자', 10)).toBe(true);
    expect(isOwnProfile({ isLoggedIn: true, userId: 10, name: '새벽여행자' }, '새벽여행자', 3)).toBe(false);
    expect(isOwnProfile({ isLoggedIn: true, userId: 10, name: '바뀐이름' }, '옛이름', 10)).toBe(true);
  });
});
