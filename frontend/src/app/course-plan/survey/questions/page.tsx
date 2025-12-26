'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageLayout from '@/shared/ui/PageLayout';
import Header from '@/shared/ui/Header';
import styles from './questions.module.scss';

// 문항 1: 마음 상태 선택지
const moodOptions = [
  { id: 'mood1', label: '그냥 기운이 없고 지쳐요 😞' },
  { id: 'mood2', label: '마음이 좀 울적하고 속상해요 😢' },
  { id: 'mood3', label: '답답하고 짜증이 많아졌어요 😠' },
  { id: 'mood4', label: '무기력하고 재미가 없어요 😐' },
  { id: 'mood5', label: '기분이 좋아요, 뭔가 하고 싶어요 😊' },
  { id: 'mood6', label: '생각이 많아졌어요, 정리가 필요해요 🤔' },
  { id: 'mood7', label: '아무 감정도 없이 멍한 느낌이에요 😶‍🌫' },
  { id: 'mood8', label: '직접 입력하기' },
];

// 문항 2: 교통 수단 선택지
const transportationOptions = [
  { id: 'trans1', label: '걸어서' },
  { id: 'trans2', label: '대중 교통' },
  { id: 'trans3', label: '자가용' },
];

// 문항 2: 이동 시간 선택지
const travelTimeOptions = [
  { id: 'time1', label: '1시간 이내' },
  { id: 'time2', label: '상관 없어요' },
  { id: 'time3', label: '직접 입력' },
];

// 문항 3: 여행 기간 선택지
const periodOptions = [
  { id: 'period1', label: '지금 당장' },
  { id: 'period2', label: '내일' },
];

const SurveyQuestionsPage: React.FC = () => {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const totalQuestions = 3;

  // 문항 1: 마음 상태
  const [selectedMood, setSelectedMood] = useState<string>('');

  // 문항 2: 교통 수단 및 이동 시간
  const [selectedTransportation, setSelectedTransportation] =
    useState<string>('');
  const [selectedTravelTime, setSelectedTravelTime] = useState<string>('');

  // 문항 3: 여행 기간 및 날짜/시간
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [departureDate, setDepartureDate] = useState({
    year: '2025',
    month: '11',
    day: '4',
    period: '오전',
    hour: '11',
    minute: '11',
  });
  const [arrivalDate, setArrivalDate] = useState({
    year: '2025',
    month: '11',
    day: '4',
    period: '오전',
    hour: '11',
    minute: '11',
  });
  const [openDropdown, setOpenDropdown] = useState<string>('');

  // 드롭다운 옵션 리스트 생성
  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => String(currentYear + i));
  };

  const getMonthOptions = () => {
    return Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  };

  const getDayOptions = (year: string, month: string) => {
    const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) =>
      String(i + 1).padStart(2, '0')
    );
  };

  const timePeriodOptions = ['오전', '오후'];
  const hourOptions = Array.from({ length: 12 }, (_, i) =>
    String(i + 1).padStart(2, '0')
  );
  const minuteOptions = Array.from({ length: 12 }, (_, i) =>
    String(i * 5).padStart(2, '0')
  ); // 0, 5, 10, ..., 55

  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const progressText = `${currentQuestionIndex + 1}/${totalQuestions}`;

  // 현재 날짜/시간 가져오기
  const getCurrentDateTime = () => {
    const now = new Date();
    return {
      year: String(now.getFullYear()),
      month: String(now.getMonth() + 1).padStart(2, '0'),
      day: String(now.getDate()).padStart(2, '0'),
      period: now.getHours() < 12 ? '오전' : '오후',
      hour: String(
        now.getHours() > 12 ? now.getHours() - 12 : now.getHours() || 12
      ).padStart(2, '0'),
      minute: String(Math.floor(now.getMinutes() / 5) * 5).padStart(2, '0'),
    };
  };

  // 내일 오전 6시 날짜/시간 가져오기
  const getTomorrowMorningDateTime = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return {
      year: String(tomorrow.getFullYear()),
      month: String(tomorrow.getMonth() + 1).padStart(2, '0'),
      day: String(tomorrow.getDate()).padStart(2, '0'),
      period: '오전',
      hour: '06',
      minute: '00',
    };
  };

  // 출발 기간 선택 시 날짜/시간 자동 설정
  useEffect(() => {
    if (selectedPeriod === 'period1') {
      // 지금 당장
      setDepartureDate(getCurrentDateTime());
    } else if (selectedPeriod === 'period2') {
      // 내일
      setDepartureDate(getTomorrowMorningDateTime());
    }
  }, [selectedPeriod]);

  // 각 문항별로 답변 완료 여부 확인
  const isQuestionComplete = () => {
    if (currentQuestionIndex === 0) {
      return selectedMood !== '';
    } else if (currentQuestionIndex === 1) {
      return selectedTransportation !== '' && selectedTravelTime !== '';
    } else if (currentQuestionIndex === 2) {
      // 문항 3: 모든 날짜/시간 필드가 입력되었는지 확인
      return (
        selectedPeriod !== '' &&
        departureDate.year !== '' &&
        departureDate.month !== '' &&
        departureDate.day !== '' &&
        departureDate.period !== '' &&
        departureDate.hour !== '' &&
        departureDate.minute !== '' &&
        arrivalDate.year !== '' &&
        arrivalDate.month !== '' &&
        arrivalDate.day !== '' &&
        arrivalDate.period !== '' &&
        arrivalDate.hour !== '' &&
        arrivalDate.minute !== ''
      );
    }
    return false;
  };

  const handleBackClick = () => {
    router.back();
  };

  const handleNext = () => {
    if (!isQuestionComplete()) return;

    if (isLastQuestion) {
      console.log('설문 완료:', {
        mood: selectedMood,
        transportation: selectedTransportation,
        travelTime: selectedTravelTime,
        period: selectedPeriod,
        departureDate,
        arrivalDate,
      });
      return;
    }

    setCurrentQuestionIndex(prev => prev + 1);
  };

  const handlePrevious = () => {
    if (currentQuestionIndex === 0) return;
    setCurrentQuestionIndex(prev => prev - 1);
  };

  // 문항 1 렌더링
  const renderQuestion1 = () => (
    <>
      <div className={styles.questionHeader}>
        <div className={styles.progressBadge}>{progressText}</div>
        <h2 className={styles.questionTitle}>요즘 마음 상태는 어떤가요?</h2>
        <p className={styles.questionDescription}>
          만약 현재의 상태가 없다면, 직접 입력할 수 있어요.
        </p>
      </div>
      <div className={styles.optionsContainer}>
        {moodOptions.map(option => {
          const isSelected = selectedMood === option.id;
          return (
            <button
              key={option.id}
              type="button"
              className={`${styles.optionButton} ${
                isSelected ? styles.optionButtonSelected : ''
              }`}
              onClick={() => setSelectedMood(option.id)}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </>
  );

  // 문항 2 렌더링
  const renderQuestion2 = () => (
    <>
      <div className={styles.questionHeader}>
        <div className={styles.progressBadge}>{progressText}</div>
        <h2 className={styles.questionTitle}>이동은 어느 정도가 괜찮으세요?</h2>
        <p className={styles.questionDescription}>
          만약 현재의 상태가 없다면, 직접 입력할 수 있어요.
        </p>
      </div>
      <div className={styles.question2Container}>
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>교통 수단</h3>
          <div className={styles.optionsContainer}>
            {transportationOptions.map(option => {
              const isSelected = selectedTransportation === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  className={`${styles.optionButton} ${
                    isSelected ? styles.optionButtonSelected : ''
                  }`}
                  onClick={() => setSelectedTransportation(option.id)}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>이동 시간</h3>
          <div className={styles.optionsContainer}>
            {travelTimeOptions.map(option => {
              const isSelected = selectedTravelTime === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  className={`${styles.optionButton} ${
                    isSelected ? styles.optionButtonSelected : ''
                  }`}
                  onClick={() => setSelectedTravelTime(option.id)}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );

  // 드롭다운 컴포넌트
  const DateDropdown: React.FC<{
    fieldId: string;
    value: string;
    options: string[];
    unit?: string;
    onSelect: (value: string) => void;
  }> = ({ fieldId, value, options, unit, onSelect }) => {
    const isOpen = openDropdown === fieldId;
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node)
        ) {
          setOpenDropdown('');
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isOpen]);

    return (
      <div className={styles.dropdownWrapper} ref={dropdownRef}>
        <button
          type="button"
          className={`${styles.dateInput} ${
            isOpen ? styles.dateInputSelected : ''
          }`}
          onClick={() => setOpenDropdown(isOpen ? '' : fieldId)}
        >
          {value}
          {unit && <span className={styles.dateUnit}>{unit}</span>}
        </button>
        {isOpen && (
          <div className={styles.dropdownMenu}>
            <div className={styles.dropdownList}>
              {options.map(option => (
                <button
                  key={option}
                  type="button"
                  className={`${styles.dropdownItem} ${
                    value === option ? styles.dropdownItemSelected : ''
                  }`}
                  onClick={() => {
                    onSelect(option);
                    setOpenDropdown('');
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // 문항 3 렌더링
  const renderQuestion3 = () => {
    return (
      <>
        <div className={styles.questionHeader}>
          <div className={styles.progressBadge}>{progressText}</div>
          <h2 className={styles.questionTitle}>여행 기간</h2>
          <p className={styles.questionDescription}>
            당장이어도 괜찮아요. 선택지가 적을 순 있지만, 가능한 일정들을 최대한
            제안해드립니다.
          </p>
        </div>
        <div className={styles.question3Container}>
          <div className={styles.dateSection}>
            <h3 className={styles.sectionTitle}>출발하는 일/시간</h3>
            <div className={styles.periodButtons}>
              {periodOptions.map(option => {
                const isSelected = selectedPeriod === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    className={`${styles.periodButton} ${
                      isSelected ? styles.periodButtonSelected : ''
                    }`}
                    onClick={() => setSelectedPeriod(option.id)}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
            <div className={styles.datePicker}>
              <div className={styles.dateRow}>
                <DateDropdown
                  fieldId="departure-year"
                  value={departureDate.year}
                  options={getYearOptions()}
                  unit="년"
                  onSelect={value =>
                    setDepartureDate(prev => ({ ...prev, year: value }))
                  }
                />
                <DateDropdown
                  fieldId="departure-month"
                  value={departureDate.month}
                  options={getMonthOptions()}
                  unit="월"
                  onSelect={value =>
                    setDepartureDate(prev => ({ ...prev, month: value }))
                  }
                />
                <DateDropdown
                  fieldId="departure-day"
                  value={departureDate.day}
                  options={getDayOptions(
                    departureDate.year,
                    departureDate.month
                  )}
                  unit="일"
                  onSelect={value =>
                    setDepartureDate(prev => ({ ...prev, day: value }))
                  }
                />
              </div>
              <div className={styles.timeSeparator} />
              <div className={styles.dateRow}>
                <DateDropdown
                  fieldId="departure-period"
                  value={departureDate.period}
                  options={timePeriodOptions}
                  onSelect={value =>
                    setDepartureDate(prev => ({ ...prev, period: value }))
                  }
                />
                <DateDropdown
                  fieldId="departure-hour"
                  value={departureDate.hour}
                  options={hourOptions}
                  unit="시"
                  onSelect={value =>
                    setDepartureDate(prev => ({ ...prev, hour: value }))
                  }
                />
                <DateDropdown
                  fieldId="departure-minute"
                  value={departureDate.minute}
                  options={minuteOptions}
                  unit="분"
                  onSelect={value =>
                    setDepartureDate(prev => ({ ...prev, minute: value }))
                  }
                />
              </div>
            </div>
          </div>

          <div className={styles.dateSection}>
            <h3 className={styles.sectionTitle}>도착하는 일/시간</h3>
            <div className={styles.periodButtons}>
              <button
                type="button"
                className={styles.periodButton}
                onClick={() => {
                  // 반나절 (12시간 후)
                  const departureHour =
                    departureDate.period === '오전'
                      ? parseInt(departureDate.hour)
                      : parseInt(departureDate.hour) + 12;
                  const departureMinute = parseInt(departureDate.minute);

                  const departure = new Date(
                    parseInt(departureDate.year),
                    parseInt(departureDate.month) - 1,
                    parseInt(departureDate.day),
                    departureHour,
                    departureMinute
                  );
                  departure.setHours(departure.getHours() + 12);

                  const arrivalHour = departure.getHours();
                  const arrival = {
                    year: String(departure.getFullYear()),
                    month: String(departure.getMonth() + 1).padStart(2, '0'),
                    day: String(departure.getDate()).padStart(2, '0'),
                    period: arrivalHour < 12 ? '오전' : '오후',
                    hour: String(
                      arrivalHour > 12
                        ? arrivalHour - 12
                        : arrivalHour === 0
                          ? 12
                          : arrivalHour
                    ).padStart(2, '0'),
                    minute: String(
                      Math.floor(departure.getMinutes() / 5) * 5
                    ).padStart(2, '0'),
                  };
                  setArrivalDate(arrival);
                }}
              >
                반나절
              </button>
              <button
                type="button"
                className={styles.periodButton}
                onClick={() => {
                  // 하루(24h) 후
                  const departureHour =
                    departureDate.period === '오전'
                      ? parseInt(departureDate.hour)
                      : parseInt(departureDate.hour) + 12;
                  const departureMinute = parseInt(departureDate.minute);

                  const departure = new Date(
                    parseInt(departureDate.year),
                    parseInt(departureDate.month) - 1,
                    parseInt(departureDate.day),
                    departureHour,
                    departureMinute
                  );
                  departure.setHours(departure.getHours() + 24);

                  const arrivalHour = departure.getHours();
                  const arrival = {
                    year: String(departure.getFullYear()),
                    month: String(departure.getMonth() + 1).padStart(2, '0'),
                    day: String(departure.getDate()).padStart(2, '0'),
                    period: arrivalHour < 12 ? '오전' : '오후',
                    hour: String(
                      arrivalHour > 12
                        ? arrivalHour - 12
                        : arrivalHour === 0
                          ? 12
                          : arrivalHour
                    ).padStart(2, '0'),
                    minute: String(
                      Math.floor(departure.getMinutes() / 5) * 5
                    ).padStart(2, '0'),
                  };
                  setArrivalDate(arrival);
                }}
              >
                하루(24h)
              </button>
            </div>
            <div className={styles.datePicker}>
              <div className={styles.dateRow}>
                <DateDropdown
                  fieldId="arrival-year"
                  value={arrivalDate.year}
                  options={getYearOptions()}
                  unit="년"
                  onSelect={value =>
                    setArrivalDate(prev => ({ ...prev, year: value }))
                  }
                />
                <DateDropdown
                  fieldId="arrival-month"
                  value={arrivalDate.month}
                  options={getMonthOptions()}
                  unit="월"
                  onSelect={value =>
                    setArrivalDate(prev => ({ ...prev, month: value }))
                  }
                />
                <DateDropdown
                  fieldId="arrival-day"
                  value={arrivalDate.day}
                  options={getDayOptions(arrivalDate.year, arrivalDate.month)}
                  unit="일"
                  onSelect={value =>
                    setArrivalDate(prev => ({ ...prev, day: value }))
                  }
                />
              </div>
              <div className={styles.timeSeparator} />
              <div className={styles.dateRow}>
                <DateDropdown
                  fieldId="arrival-period"
                  value={arrivalDate.period}
                  options={timePeriodOptions}
                  onSelect={value =>
                    setArrivalDate(prev => ({ ...prev, period: value }))
                  }
                />
                <DateDropdown
                  fieldId="arrival-hour"
                  value={arrivalDate.hour}
                  options={hourOptions}
                  unit="시"
                  onSelect={value =>
                    setArrivalDate(prev => ({ ...prev, hour: value }))
                  }
                />
                <DateDropdown
                  fieldId="arrival-minute"
                  value={arrivalDate.minute}
                  options={minuteOptions}
                  unit="분"
                  onSelect={value =>
                    setArrivalDate(prev => ({ ...prev, minute: value }))
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <PageLayout>
      <Header variant="withTitle" title="설문" onLeftClick={handleBackClick} />

      <div className={styles.content}>
        {currentQuestionIndex === 0 && renderQuestion1()}
        {currentQuestionIndex === 1 && renderQuestion2()}
        {currentQuestionIndex === 2 && renderQuestion3()}

        {/* 네비게이션 버튼 */}
        <div className={styles.navigationSection}>
          {currentQuestionIndex > 0 && (
            <button
              type="button"
              className={styles.prevButton}
              onClick={handlePrevious}
            >
              이전
            </button>
          )}
          <button
            type="button"
            className={styles.completeButton}
            onClick={handleNext}
            disabled={!isQuestionComplete()}
          >
            선택 완료
          </button>
        </div>
      </div>
    </PageLayout>
  );
};

export default SurveyQuestionsPage;
