// 이용약관·개인정보처리방침 본문. 문구는 상수로 두고 화면은 LegalDocumentPage 하나가 그린다.
export type LegalBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[]; ordered?: boolean }
  | { type: 'table'; headers: string[]; rows: string[][] };

export interface LegalSection {
  title: string;
  blocks: LegalBlock[];
}

export interface LegalDocument {
  title: string;
  effectiveDate: string;
  intro?: string;
  sections: LegalSection[];
}
