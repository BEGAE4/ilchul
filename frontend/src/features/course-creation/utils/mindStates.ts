// 감정 설문(Q1)의 선택지. label 은 서버로 보내는 문장(추천의 입력값)이라 바꾸지 않는다.
// short 는 카드와 기본 플랜 제목("울적한 연주님을 위한 힐링 플랜")에 쓰는 짧은 수식어,
// character 는 public/images/emotions 의 캐릭터 파일 이름이다.
// 캐릭터의 몸통은 일출 로고의 글자꼴 ㅇ · ㅊ · ㄹ 이다 (Figma "감정 캐릭터 · 로고형").
export interface MindState {
  label: string;
  short: string;
  character: string;
}

export const MIND_STATES: MindState[] = [
  { label: '그냥 기운이 없고 지쳤어요', short: '지친', character: 'tired' },
  { label: '마음이 좀 울적하고 속상해요', short: '울적한', character: 'sad' },
  { label: '답답하고 짜증이 많아졌어요', short: '답답한', character: 'irritated' },
  { label: '무기력하고 재미가 없어요', short: '무기력한', character: 'listless' },
  { label: '기분이 좋아요, 뭔가 하고 싶어요', short: '설레는', character: 'excited' },
  { label: '생각이 많아졌어요, 정리가 필요해요', short: '생각 많은', character: 'pensive' },
  { label: '아무 감정도 없이 멍한 느낌이에요', short: '멍한', character: 'blank' },
];

export const DIRECT_INPUT_CHARACTER = 'write';

export function findMindState(label: string | undefined): MindState | undefined {
  const key = (label ?? '').trim();
  return MIND_STATES.find((s) => s.label === key);
}

// 직접 적은 문장인가 — 비어 있지 않고 선택지에 없는 값
export function isCustomMindState(label: string | undefined): boolean {
  return !!(label ?? '').trim() && !findMindState(label);
}

export function characterSrc(character: string): string {
  return `/images/emotions/${character}.svg`;
}
