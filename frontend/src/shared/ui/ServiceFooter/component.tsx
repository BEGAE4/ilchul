import Link from 'next/link';
import { SERVICE_INFO, SERVICE_ROUTES } from '@/shared/lib/constants/service';

interface ServiceFooterProps {
  /** 약관·방침·고객센터 링크 줄. 앱 정보 화면처럼 링크 목록이 따로 있으면 끈다 */
  showLinks?: boolean;
  className?: string;
}

// 홈 푸터와 설정 > 앱 정보가 같은 운영 정보를 보이게 하는 공용 푸터.
// 이전에는 두 곳이 서로 다른 가짜 사업자 정보를 띄웠고, 링크는 모두 설정 화면이나 "준비 중" 토스트로 갔다.
const ServiceFooter = ({ showLinks = true, className = '' }: ServiceFooterProps) => (
  <footer className={`text-center ${className}`}>
    {showLinks && (
      <nav aria-label="서비스 정책" className="flex justify-center gap-4 mb-6 text-gray-400">
        <Link href={SERVICE_ROUTES.terms} className="text-xs hover:text-gray-600">
          이용약관
        </Link>
        <Link href={SERVICE_ROUTES.privacy} className="text-xs font-bold hover:text-gray-600">
          개인정보처리방침
        </Link>
        <Link href={SERVICE_ROUTES.support} className="text-xs hover:text-gray-600">
          고객센터
        </Link>
      </nav>
    )}
    <p className="text-[10px] text-gray-400 leading-relaxed">
      {SERVICE_INFO.name} | 팀 {SERVICE_INFO.teamName} · {SERVICE_INFO.contestName} 출품작
      <br />
      문의:{' '}
      <a href={`mailto:${SERVICE_INFO.contactEmail}`} className="underline underline-offset-2">
        {SERVICE_INFO.contactEmail}
      </a>
      <br />
      관광 정보 제공: 한국관광공사
      <br />
      <br />
      Copyright © {SERVICE_INFO.copyrightYear} 팀 {SERVICE_INFO.teamName}. All rights reserved.
    </p>
  </footer>
);

export default ServiceFooter;
