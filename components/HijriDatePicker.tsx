import React, { useState } from 'react';
import { DualCalendarComponent, CalendarSystem } from './DualCalendarComponent';
import { Calendar, ChevronDown } from 'lucide-react';

interface HijriDatePickerProps {
  id?: string;
  className?: string;
  placeholder?: string;
  onChange?: (date: string) => void;
  value?: Date;
}

export const HijriDatePicker: React.FC<HijriDatePickerProps> = ({ 
  id = 'hijriDate', 
  className = '', 
  placeholder = 'اختر التاريخ الهجري أو الميلادي',
  onChange,
  value = new Date()
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedText, setSelectedText] = useState(() => {
    try {
      return new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(value);
    } catch {
      return value.toLocaleDateString();
    }
  });

  const handleDateChange = (date: Date, formatted: string) => {
    setSelectedText(formatted);
    if (onChange) onChange(formatted);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block w-full">
      <button
        id={id}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-3 rounded-xl border border-slate-700 bg-slate-900 text-slate-100 text-xs font-bold transition-all hover:border-slate-600 focus:outline-none focus:border-blue-500 ${className}`}
      >
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-blue-400" />
          <span className="font-arabic">{selectedText || placeholder}</span>
        </div>
        <ChevronDown size={14} className="text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 start-0 animate-in fade-in slide-in-from-top-2 duration-150">
          <DualCalendarComponent 
            value={value}
            onChange={handleDateChange}
          />
        </div>
      )}
    </div>
  );
};

export default HijriDatePicker;
