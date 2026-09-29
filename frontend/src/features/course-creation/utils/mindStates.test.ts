import fs from 'fs';
import path from 'path';
import {
  DIRECT_INPUT_CHARACTER,
  MIND_STATES,
  characterSrc,
  findMindState,
  isCustomMindState,
} from './mindStates';

describe('MIND_STATES', () => {
  it('선택지마다 캐릭터 파일이 실제로 있다', () => {
    const dir = path.join(process.cwd(), 'public');
    for (const c of [...MIND_STATES.map((s) => s.character), DIRECT_INPUT_CHARACTER]) {
      expect(fs.existsSync(path.join(dir, characterSrc(c)))).toBe(true);
    }
  });

  it('짧은 수식어와 서버로 보내는 문장은 겹치지 않는다', () => {
    expect(new Set(MIND_STATES.map((s) => s.label)).size).toBe(MIND_STATES.length);
    expect(new Set(MIND_STATES.map((s) => s.short)).size).toBe(MIND_STATES.length);
  });
});

describe('findMindState / isCustomMindState', () => {
  it('문장으로 선택지를 찾는다', () => {
    expect(findMindState('마음이 좀 울적하고 속상해요')?.short).toBe('울적한');
    expect(findMindState(undefined)).toBeUndefined();
  });

  it('선택지에 없는 문장은 직접 입력으로 본다 — 새로고침 뒤에도 직접 입력 카드가 켜져 있어야 한다', () => {
    expect(isCustomMindState('잠이 안 와서 피곤해요')).toBe(true);
    expect(isCustomMindState('그냥 기운이 없고 지쳤어요')).toBe(false);
    expect(isCustomMindState('')).toBe(false);
    expect(isCustomMindState(undefined)).toBe(false);
  });
});
