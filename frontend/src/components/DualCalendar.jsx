import { useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

function DualCalendar() {
  const today = new Date();

  const [currentDate, setCurrentDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Convert Gregorian date to Hijri
  const getHijriDate = (date) => {
    return new Intl.DateTimeFormat("en-US-u-ca-islamic", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  // Gregorian month name
  const monthName = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(currentDate);

  // Number of days in current month
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // First day of month
  const firstDay = new Date(year, month, 1).getDay();

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(
      new Date(today.getFullYear(), today.getMonth(), 1)
    );
  };

  const isToday = (day) => {
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  const days = [];

  // Empty spaces before first day
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Days of month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  const weekDays = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <div className="absolute right-0 top-12 z-50 w-[290px] overflow-hidden rounded-2xl border dark:border-[#15253f] border-slate-200 dark:border-[#15253f] bg-white dark:bg-[#0b1528] shadow-xl">

      {/* HEADER */}
      <div className="bg-[#1f6f5b] hover:bg-[#185848] px-4 py-3 text-white">

        <div className="flex items-center justify-between">

          <button
            type="button"
            onClick={previousMonth}
            className="flex h-7 w-7 items-center justify-center rounded-md transition hover:bg-white dark:bg-[#0b1528]/10"
          >
            <ChevronLeft size={16} />
          </button>

          <div className="text-center">
            <p className="text-sm font-bold">
              {monthName}
            </p>

            <p className="mt-0.5 text-[10px] text-slate-300">
              Dual Calendar
            </p>
          </div>

          <button
            type="button"
            onClick={nextMonth}
            className="flex h-7 w-7 items-center justify-center rounded-md transition hover:bg-white dark:bg-[#0b1528]/10"
          >
            <ChevronRight size={16} />
          </button>

        </div>
      </div>

      {/* CALENDAR */}
      <div className="p-3">

        {/* WEEK DAYS */}
        <div className="mb-2 grid grid-cols-7">
          {weekDays.map((day, index) => (
            <div
              key={index}
              className="text-center text-[10px] font-semibold text-slate-400"
            >
              {day}
            </div>
          ))}
        </div>

        {/* DAYS */}
        <div className="grid grid-cols-7 gap-y-1">

          {days.map((day, index) => {
            if (!day) {
              return (
                <div key={index} className="h-9" />
              );
            }

            const date = new Date(year, month, day);

            const hijri = getHijriDate(date);

            return (
              <div
                key={day}
                className="flex h-9 items-center justify-center"
              >
                <div
                  title={hijri}
                  className={`flex h-8 w-8 flex-col items-center justify-center rounded-lg ${
                    isToday(day)
                      ? "bg-[#1f6f5b] hover:bg-[#185848] text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <span className="text-[11px] font-semibold leading-none">
                    {day}
                  </span>

                  <span
                    className={`mt-0.5 text-[7px] leading-none ${
                      isToday(day)
                        ? "text-slate-300"
                        : "text-slate-400"
                    }`}
                  >
                    {new Intl.DateTimeFormat(
                      "en-US-u-ca-islamic",
                      {
                        day: "numeric",
                      }
                    ).format(date)}
                  </span>
                </div>
              </div>
            );
          })}

        </div>

        {/* TODAY */}
        <div className="mt-3 border-t border-slate-100 dark:border-[#15253f] pt-2">

          <button
            type="button"
            onClick={goToToday}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg py-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300 transition hover:bg-slate-100 dark:bg-[#070e1b]"
          >
            <CalendarDays size={13} />

            Today

          </button>

        </div>

        {/* TODAY'S HIJRI DATE */}
        <div className="mt-1 text-center">

          <p className="text-[10px] text-slate-400">
            Today
          </p>

          <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">
            {today.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
            {" • "}
            {getHijriDate(today)}
          </p>

        </div>

      </div>
    </div>
  );
}

export default DualCalendar;