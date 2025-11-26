'use client';

export default function HealingDiaryError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="healing-diary-error-container">
      <h2>힐링 다이어리를 불러오는데 실패했습니다</h2>
      <p>{error.message}</p>
      <button onClick={() => reset()}>다시 시도</button>
    </div>
  );
}
