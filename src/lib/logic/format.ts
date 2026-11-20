/** "14 октября", in the reader's own timezone. */
export function formatDay(iso: string): { day: string; month: string } {
  const d = new Date(iso)
  return {
    day: new Intl.DateTimeFormat('ru-RU', { day: 'numeric' }).format(d),
    month: new Intl.DateTimeFormat('ru-RU', { month: 'long', day: 'numeric' }).format(d).replace(/^\d+\s/, ''),
  }
}

/** "20:00 GMT+2" — webinars are live, so the reader needs their local time with the zone. */
export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  }).format(new Date(iso))
}

