import { type FormEvent, useState } from 'react';

type Training = { date: string; distance: number };
const initial: Training[] = [
  { date: '20.07.2019', distance: 5.7 },
  { date: '19.07.2019', distance: 14.2 },
  { date: '18.07.2019', distance: 3.4 },
];

function dateValue(value: string): number {
  const [day, month, rawYear] = value.split('.').map(Number);
  const year = rawYear < 100 ? 2000 + rawYear : rawYear;
  return new Date(year, month - 1, day).getTime();
}

function isValidDate(value: string): boolean {
  if (!/^\d{2}\.\d{2}\.(?:\d{2}|\d{4})$/.test(value)) return false;
  const [day, month, rawYear] = value.split('.').map(Number);
  const year = rawYear < 100 ? 2000 + rawYear : rawYear;
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

export default function App() {
  const [items, setItems] = useState<Training[]>(initial);
  const [date, setDate] = useState('');
  const [distance, setDistance] = useState('');
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [error, setError] = useState('');

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const km = Number(distance.replace(',', '.'));
    if (!isValidDate(date) || !Number.isFinite(km) || km <= 0) {
      setError('Введите корректную дату и расстояние больше нуля.');
      return;
    }
    setItems((current) => {
      const withoutEdited = editingDate ? current.filter((item) => item.date !== editingDate) : current;
      const existing = withoutEdited.find((item) => item.date === date);
      const updated = existing
        ? withoutEdited.map((item) => item.date === date ? { ...item, distance: item.distance + km } : item)
        : [...withoutEdited, { date, distance: km }];
      return updated.sort((a, b) => dateValue(b.date) - dateValue(a.date));
    });
    setDate(''); setDistance(''); setEditingDate(null); setError('');
  };

  const edit = (item: Training) => {
    setDate(item.date); setDistance(String(item.distance)); setEditingDate(item.date); setError('');
  };

  return (
    <main className="container">
      <h1>Учёт тренировок</h1>
      <form onSubmit={submit} noValidate>
        <div className="form-row">
          <label>Дата (ДД.ММ.ГГ)<input aria-label="Дата" value={date} onChange={(e) => setDate(e.target.value)} placeholder="20.07.2019" /></label>
          <label>Пройдено км<input aria-label="Пройдено км" inputMode="decimal" value={distance} onChange={(e) => setDistance(e.target.value)} placeholder="5.7" /></label>
          <button className="submit-btn" type="submit">{editingDate ? 'Сохранить' : 'OK'}</button>
        </div>
        {error && <p className="error" role="alert">{error}</p>}
      </form>
      <section className="data-table" aria-label="Тренировки">
        <div className="table-header"><span>Дата (ДД.ММ.ГГ)</span><span>Пройдено км</span><span>Действия</span></div>
        <div className="table-body">
          {items.length === 0 && <p className="empty">Нет данных о тренировках</p>}
          {items.map((item) => <div className="table-row" key={item.date} data-date={item.date}>
            <span>{item.date}</span><span>{Number(item.distance.toFixed(2))}</span>
            <span className="actions"><button type="button" onClick={() => edit(item)} aria-label={`Редактировать ${item.date}`} title="Редактировать">✎</button><button type="button" onClick={() => setItems((current) => current.filter((row) => row.date !== item.date))} aria-label={`Удалить ${item.date}`} title="Удалить">✕</button></span>
          </div>)}
        </div>
      </section>
    </main>
  );
}
