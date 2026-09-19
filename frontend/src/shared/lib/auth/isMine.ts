// "이 글·플랜·프로필이 내 것인가"를 한곳에서 판별한다.
//
// 2026-09-18 부터 GET /api/sign/userinfo 가 숫자 userId 를 준다. 그 전에는 내 id 를 주는 API 가 없어
// 전부 닉네임 문자열로 비교했고, 닉네임이 겹치거나 바뀌면 남의 댓글에 삭제 버튼이 뜨거나 내 것에 안 떴다.
// 양쪽 id 를 모두 알면 id 로만 판별한다. 하나라도 모르면(userinfo 실패 · id 없는 응답) 닉네임으로 폴백한다.
export interface Me {
  isLoggedIn: boolean;
  userId: number | null | undefined;
  name: string | null | undefined;
}

export interface Owner {
  userId?: number | null;
  nickname?: string | null;
}

export function isMine(me: Me, owner: Owner): boolean {
  if (!me.isLoggedIn) return false;
  if (me.userId != null && owner.userId != null) return me.userId === owner.userId;
  return !!me.name && me.name === owner.nickname;
}
