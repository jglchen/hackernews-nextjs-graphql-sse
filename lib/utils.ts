function timeDifference(current: any, previous: any) {
  const milliSecondsPerMinute = 60 * 1000;
  const milliSecondsPerHour = milliSecondsPerMinute * 60;
  const milliSecondsPerDay = milliSecondsPerHour * 24;
  const milliSecondsPerMonth = milliSecondsPerDay * 30;
  const milliSecondsPerYear = milliSecondsPerDay * 365;
  
  const elapsed = current - previous;
  
  if (elapsed < milliSecondsPerMinute / 3) {
    return 'just now';
  }
  
  if (elapsed < milliSecondsPerMinute) {
    return 'less than 1 min ago';
  } else if (elapsed < milliSecondsPerHour) {
    return (
      Math.round(elapsed / milliSecondsPerMinute) +
      ' min ago'
    );
  } else if (elapsed < milliSecondsPerDay) {
    return (
      Math.round(elapsed / milliSecondsPerHour) + ' h ago'
    );
  } else if (elapsed < milliSecondsPerMonth) {
    return (
      Math.round(elapsed / milliSecondsPerDay) + ' days ago'
    );
  } else if (elapsed < milliSecondsPerYear) {
    return (
      Math.round(elapsed / milliSecondsPerMonth) + ' mo ago'
    );
  } else {
    return (
      Math.round(elapsed / milliSecondsPerYear) +
      ' years ago'
    );
  }
}
  
export function timeDifferenceForDate(date: any) {
  const now = new Date().getTime();
  const updated = new Date(date).getTime();
  return timeDifference(now, updated);
}

export function passwdResetHTML(numForCheck: string): string{
  const htmlStr =  
  `
  <html>
  <body style="font-family: Arial, sans-serif;">
  <p>Hello,</p>
  <p>Please fill the following number in the designated box field of the page.</p>
  <p style="font-weight: 600; font-size: 24pt;">${numForCheck}</p>
  <p>Thanks,</p>
  Your Hacker News Clone Team
  </body>
  </html>
  `;

  return htmlStr;
}
