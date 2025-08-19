export function waitFor(condition: () => boolean, timeout = 1000) {
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      if (condition()) {
        clearInterval(interval);
        resolve(true);
      }
    }, 10);
    setTimeout(() => {
      clearInterval(interval);
      resolve(false);
    }, timeout);
  });
}
