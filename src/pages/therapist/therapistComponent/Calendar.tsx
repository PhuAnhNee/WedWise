import { format, addMonths, subMonths, startOfMonth, getDaysInMonth, startOfDay } from "date-fns";

interface CalendarProps {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  isDateInPast: (date: Date) => boolean;
  isBeforeCurrentMonth: (date: Date) => boolean;
}

const Calendar: React.FC<CalendarProps> = ({
  selectedDate,
  setSelectedDate,
  isDateInPast,
  isBeforeCurrentMonth,
}) => {
  const daysInMonth = getDaysInMonth(selectedDate);
  const startDay = startOfMonth(selectedDate).getDay();

  const handlePrevMonth = () => {
    const newDate = subMonths(selectedDate, 1);
    if (!isBeforeCurrentMonth(newDate)) setSelectedDate(startOfDay(newDate));
  };

  const handleNextMonth = () => setSelectedDate(startOfDay(addMonths(selectedDate, 1)));

  return (
    <div className="w-full md:w-1/2">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={handlePrevMonth}
          className={`p-2 rounded ${
            isBeforeCurrentMonth(subMonths(selectedDate, 1))
              ? "bg-gray-200 cursor-not-allowed"
              : "bg-gray-300 hover:bg-gray-400"
          }`}
          disabled={isBeforeCurrentMonth(subMonths(selectedDate, 1))}
        >
          &lt;
        </button>
        <h2 className="text-lg font-semibold">{format(selectedDate, "MMMM yyyy")}</h2>
        <button onClick={handleNextMonth} className="p-2 bg-gray-300 rounded hover:bg-gray-400">
          &gt;
        </button>
      </div>
      <div className="grid grid-cols-7 gap-2 text-center">
        {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((day) => (
          <div key={day} className="font-semibold">{day}</div>
        ))}
        {Array.from({ length: startDay }, (_, i) => (
          <div key={`empty-${i}`} className="invisible">00</div>
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const currentDate = startOfDay(
            new Date(selectedDate.getFullYear(), selectedDate.getMonth(), i + 1)
          );
          const isPastDate = isDateInPast(currentDate);
          return (
            <button
              key={i}
              onClick={() => setSelectedDate(currentDate)}
              disabled={isPastDate}
              className={`p-2 rounded ${
                currentDate.toDateString() === selectedDate.toDateString()
                  ? "bg-blue-600 text-white"
                  : isPastDate
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "hover:bg-gray-200"
              }`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;