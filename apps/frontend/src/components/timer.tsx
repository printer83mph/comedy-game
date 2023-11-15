import { useEffect, useRef } from 'react';

export default function Timer({
  endTime,
  className = '',
  preText = '',
  postText = 'left',
}: {
  endTime: number;
  className?: string;
  preText?: string;
  postText?: string;
}) {
  const divRef = useRef<HTMLDivElement>(undefined!);
  useEffect(() => {
    function onInterval() {
      const secondsLeft = Math.ceil((endTime - Date.now()) * 0.001);
      divRef.current.innerHTML = `${preText} ${secondsLeft} ${
        secondsLeft === 1 ? 'second' : 'seconds'
      } ${postText}`;
    }

    const int = setInterval(onInterval, 100);
    return () => {
      clearInterval(int);
    };
  }, [endTime, preText, postText]);
  return (
    <div ref={divRef} className={className}>
      ...
    </div>
  );
}
