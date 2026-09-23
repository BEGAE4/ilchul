/**
 * @jest-environment jsdom
 */
import { consumeLoginReturnTo, saveLoginReturnTo } from './loginReturnTo';

describe('loginReturnTo', () => {
  beforeEach(() => sessionStorage.clear());

  it('저장한 경로를 한 번만 돌려준다', () => {
    saveLoginReturnTo('/course/12');
    expect(consumeLoginReturnTo()).toBe('/course/12');
    expect(consumeLoginReturnTo()).toBeNull();
  });

  it('로그인 화면이나 외부 주소는 저장하지 않는다', () => {
    saveLoginReturnTo('/login');
    expect(consumeLoginReturnTo()).toBeNull();
    saveLoginReturnTo('https://evil.example');
    expect(consumeLoginReturnTo()).toBeNull();
  });

  it('빈 값은 이전 저장을 지운다', () => {
    saveLoginReturnTo('/place/3');
    saveLoginReturnTo(null);
    expect(consumeLoginReturnTo()).toBeNull();
  });
});
