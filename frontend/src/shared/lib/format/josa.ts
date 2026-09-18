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

// 이미 저장된 문장의 잘못된 "으로"를 고친다 (B-23: "도보으로 떠나는" → "도보로 떠나는").
// 받침이 없거나 ㄹ 받침인 글자 뒤의 "으로"만 "로"로 바꾸고, "대중교통으로"처럼 맞는 것은 그대로 둔다.
// 백엔드가 DB 를 정정하기 전까지 화면 표시용으로 응답 정규화 지점에서 쓴다.
export function fixRoParticle(text: string | null | undefined): string {
  if (!text) return '';
  return text.replace(/([가-힣])으로/g, (match, prev: string) => {
    const jong = finalConsonantIndex(prev);
    return jong === 0 || jong === JONG_RIEUL ? `${prev}로` : match;
  });
}
