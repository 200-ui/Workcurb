
import React, { useState, useEffect } from 'react';

interface DigitalClockProps {
  isDarkMode: boolean;
}

const DigitalClock = ({ isDarkMode }: DigitalClockProps) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="relative p-4 rounded-xl border-2 border-transparent bg-transparent backdrop-blur-sm">
      <div className="text-center relative z-10">
        <div className={`text-lg font-bold ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        } font-mono tracking-wider mb-2 drop-shadow-lg`}>
          {formatTime(time)}
        </div>
        <div className={`text-xs ${
          isDarkMode ? 'text-gray-300' : 'text-gray-700'
        } font-medium`}>
          {formatDate(time)}
        </div>
      </div>
      
      <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${
        isDarkMode ? 'bg-blue-400' : 'bg-blue-500'
      } animate-pulse`}></div>
      <div className={`absolute bottom-2 left-2 w-1.5 h-1.5 rounded-full ${
        isDarkMode ? 'bg-indigo-400' : 'bg-indigo-500'
      } animate-pulse`} style={{ animationDelay: '0.5s' }}></div>
    </div>
  );
};

export default DigitalClock;
