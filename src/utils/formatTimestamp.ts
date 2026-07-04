const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

export function formatTimestamp(dateString: string): string {
  const date = new Date(dateString);
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const year = pad(date.getFullYear() % 100);
  const weekday = weekdays[date.getDay()];
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  return `${month}/${day}/${year}(${weekday})${hours}:${minutes}:${seconds}`;
}
