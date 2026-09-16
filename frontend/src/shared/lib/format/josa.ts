// 한글 조사 처리. 플랜 설명("도보로 떠나는…")처럼 사용자 입력·선택값 뒤에 조사를 붙일 때 쓴다.
// 완성형 한글(가~힣)은 (코드 - 0xAC00) % 28 이 받침 인덱스다. 0 이면 받침 없음, 8 이면 ㄹ.

const HANGUL_START = 0xac00;
const HANGUL_END = 0xd7a3;
const JONG_COUNT = 28;
const JONG_RIEUL = 8;

function finalConsonantIndex(char: string): number | null {
  const code = char.charCodeAt(0);
  if (code < HANGUL_START || code > HANGUL_END) return null;
  return (code - HANGUL_START) % JONG_COUNT;
}

// "로/으로": 받침이 없거나 ㄹ 받침이면 "로", 그 외 받침은 "으로". 한글이 아니면 "로".
export function withRo(word: string): string {
  const trimmed = word.trim();
  if (!trimmed) return '';
  const jong = finalConsonantIndex(trimmed[trimmed.length - 1]);
  const particle = jong === null || jong === 0 || jong === JONG_RIEUL ? '로' : '으로';
  return `${trimmed}${particle}`;
}
