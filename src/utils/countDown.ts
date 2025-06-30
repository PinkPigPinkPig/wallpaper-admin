export type Countdown = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

export const getTimeRemaining = (totalSeconds: number): Countdown => {
  const days = Math.floor(totalSeconds / (60 * 60 * 24));
  const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  return {
    days,
    hours,
    minutes,
    seconds,
  };
};

export const countdown = (totalSeconds: number, onTick: (time: Countdown) => void, onComplete?: () => void) => {
  let remainingSeconds = totalSeconds;
  let interval: NodeJS.Timeout;

  const start = () => {
    interval = setInterval(() => {
      const timeRemaining = getTimeRemaining(remainingSeconds);

      if (remainingSeconds <= 0) {
        clearInterval(interval);
        if (onComplete) {
          onComplete();
        }
      } else {
        onTick(timeRemaining);
        remainingSeconds -= 1;
      }
    }, 1000);
  };

  const stop = () => {
    if (interval) {
      clearInterval(interval);
    }
  };

  start();

  return { stop };
};
