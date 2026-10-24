import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, 
  RotateCcw, Globe, Check, Clock 
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export type CalendarSystem = 'gregorian' | 'hijri';

interface DualCalendarComponentProps {
  value?: Date;
  onChange?: (date: Date, formattedDate: string, system: CalendarSystem) => void;
  className?: string;
  label?: string;
}

export const DualCalendarComponent: React.FC<DualCalendarComponentProps> = ({
  value = new Date(),
  onChange,
  className = '',
  label
}) => {
  const { language, dir, t } = useLanguage();
  const [selectedDate, setSelectedDate] = useState<Date>(value);
  const [calendarSystem, setCalendarSystem] = useState<CalendarSystem>(
    language === 'ar' ? 'hijri' : 'gregorian'
  );
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(new Date(value.getFullYear(), value.getMonth(), 1));

  // Formatted representations
  const gregorianFullStr = useMemo(() => {
    return new Intl.DateTimeFormat(language === 'ar' ? 'ar-EG' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(selectedDate);
  }, [selectedDate, language]);

  const hijriFullStr = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(language === 'ar' ? 'ar-SA-u-ca-islamic-umalqura' : 'en-US-u-ca-islamic-umalqura', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(selectedDate);
    } catch {
      return selectedDate.toLocaleDateString();
    }
  }, [selectedDate, language]);

  // Month header text
  const currentMonthDisplay = useMemo(() => {
    if (calendarSystem === 'hijri') {
      try {
        return new Intl.DateTimeFormat(language === 'ar' ? 'ar-SA-u-ca-islamic-umalqura' : 'en-US-u-ca-islamic-umalqura', {
          month: 'long',
          year: 'numeric'
        }).format(currentMonthDate);
      } catch {
        return currentMonthDate.toLocaleDateString();
      }
    } else {
      return new Intl.DateTimeFormat(language === 'ar' ? 'ar-EG' : 'en-US', {
        month: 'long',
        year: 'numeric'
      }).format(currentMonthDate);
    }
  }, [currentMonthDate, calendarSystem, language]);

  // Navigate months
  const handlePrevMonth = () => {
    setCurrentMonthDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleJumpToToday = () => {
    const today = new Date();
    setSelectedDate(today);
    setCurrentMonthDate(new Date(today.getFullYear(), today.getMonth(), 1));
    if (onChange) {
      onChange(today, calendarSystem === 'hijri' ? hijriFullStr : gregorianFullStr, calendarSystem);
    }
  };

  const handleSelectDay = (day: number) => {
    const newDate = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth(), day);
    setSelectedDate(newDate);
    if (onChange) {
      const formatted = calendarSystem === 'hijri' ? hijriFullStr : gregorianFullStr;
      onChange(newDate, formatted, calendarSystem);
    }
  };

  // Days in month calculation
  const daysInCurrentMonth = useMemo(() => {
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();
    return new Date(year, month + 1, 0).getDate();
  }, [currentMonthDate]);

  const firstDayOfWeek = useMemo(() => {
    return new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth(), 1).getDay();
  }, [currentMonthDate]);

  const dayNames = useMemo(() => {
    if (language === 'ar') {
      return ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];
    }
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  }, [language]);

  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl text-slate-100 max-w-sm w-full ${className}`}>
      
      {/* Header with Switcher */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <CalendarIcon size={18} className="text-blue-400" />
          <span className="text-xs font-bold text-slate-300">
            {label || (language === 'ar' ? 'التقويم المعتمد' : 'Operational Calendar')}
          </span>
        </div>

        {/* Calendar Mode Toggle */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px] font-bold">
          <button
            type="button"
            onClick={() => setCalendarSystem('gregorian')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              calendarSystem === 'gregorian'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {language === 'ar' ? 'ميلادي' : 'Gregorian'}
          </button>
          <button
            type="button"
            onClick={() => setCalendarSystem('hijri')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              calendarSystem === 'hijri'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {language === 'ar' ? 'أم القرى (هجري)' : 'Umm al-Qura'}
          </button>
        </div>
      </div>

      {/* Primary Displayed Date Banner */}
      <div className="my-3 p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center justify-between">
          <span>{calendarSystem === 'hijri' ? (language === 'ar' ? 'التاريخ الهجري' : 'Hijri Date') : (language === 'ar' ? 'التاريخ الميلادي' : 'Gregorian Date')}</span>
          <span className="font-mono text-blue-400">{selectedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div className="text-sm font-bold text-white font-arabic">
          {calendarSystem === 'hijri' ? hijriFullStr : gregorianFullStr}
        </div>
        <div className="text-[11px] text-slate-400 font-arabic">
          {calendarSystem === 'hijri' ? gregorianFullStr : hijriFullStr}
        </div>
      </div>

      {/* Month Navigator */}
      <div className="flex items-center justify-between px-1 mb-3">
        <button
          type="button"
          onClick={dir === 'rtl' ? handleNextMonth : handlePrevMonth}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
        >
          <ChevronLeft size={16} />
        </button>

        <span className="text-xs font-bold text-white font-arabic">
          {currentMonthDisplay}
        </span>

        <button
          type="button"
          onClick={dir === 'rtl' ? handlePrevMonth : handleNextMonth}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Day Name Headers */}
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 mb-1.5">
        {dayNames.map((d, i) => (
          <div key={i} className="py-1">{d}</div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="p-1.5 text-transparent">0</div>
        ))}

        {Array.from({ length: daysInCurrentMonth }).map((_, i) => {
          const dayNum = i + 1;
          const isToday = 
            new Date().getDate() === dayNum &&
            new Date().getMonth() === currentMonthDate.getMonth() &&
            new Date().getFullYear() === currentMonthDate.getFullYear();
          const isSelected = 
            selectedDate.getDate() === dayNum &&
            selectedDate.getMonth() === currentMonthDate.getMonth() &&
            selectedDate.getFullYear() === currentMonthDate.getFullYear();

          return (
            <button
              key={dayNum}
              type="button"
              onClick={() => handleSelectDay(dayNum)}
              className={`p-1.5 rounded-lg font-bold text-xs transition-all ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/50'
                  : isToday
                    ? 'border border-blue-500/60 text-blue-300 bg-blue-500/10'
                    : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              {dayNum}
            </button>
          );
        })}
      </div>

      {/* Jump to Today Button */}
      <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={handleJumpToToday}
          className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 transition-colors"
        >
          <RotateCcw size={12} />
          <span>{language === 'ar' ? 'الرجوع إلى اليوم' : 'Jump to Today'}</span>
        </button>

        <span className="text-[10px] text-slate-500 font-mono">
          {calendarSystem === 'hijri' ? 'تقويم أم القرى الرسمي' : 'ISO 8601 Standard'}
        </span>
      </div>

    </div>
  );
};

export default DualCalendarComponent;
