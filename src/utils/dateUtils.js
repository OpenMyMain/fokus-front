export function formatDate(date) {
  const today = new Date();

  if (!date) return '';
  if (date.toDateString() === today.toDateString()) {
    return "Aujourd'hui";
  }
  if (date.toDateString() === new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1).toDateString()) {
    return "Hier";
  }
  if (date.toDateString() === new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toDateString()) {
    return "Demain";
  }
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function formatQuarter(quarter) {
  const totalMinutes = (quarter - 1) * 15;
  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function isToday(date) {
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

export function getIndexOfDay(date) {
  if (!date) return 0;
  return (date.getDay() + 6) % 7;
}

export function getStartOfWeek(inputDate) {
  const date = new Date(inputDate);
  const day = date.getDay();
  const diffToMonday = date.getDate() - ((day + 6) % 7);
  date.setDate(diffToMonday);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function getMonthName(date) {
  return date.toLocaleString('fr-FR', {month: 'long'})
}
