import type { DateFare, FareOffer, TripPass } from './types'

const history = (base: number, seed = 0) =>
  [1.18, 1.12, 1.15, 1.04, 1.09, 0.98, 1.02, 0.94, 0.91, 0.96, 0.87, 0.84].map((v, i) => ({
    date: `06/${String(i * 2 + 4).padStart(2, '0')}`,
    amount: Math.round(base * v + seed * ((i % 3) - 1)),
  }))

export const offers: FareOffer[] = [
  {
    id: 'sq-856', flightNumber: 'SQ856', airline: 'Singapore Airlines', airlineType: 'full',
    from: 'SIN', to: 'HKG', depart: '09:30', arrive: '13:25', duration: '3h 55m', stops: 0,
    aircraft: 'A350-900', baggage: 25, cabinBaggage: 7, amount: 2280, currency: 'HKD',
    homeAmount: 386, homeCurrency: 'SGD', merchant: 'Atlas Tickets', risk: 'steady', history: history(2280, 18),
  },
  {
    id: 'tr-978', flightNumber: 'TR978', airline: 'Scoot', airlineType: 'lcc',
    from: 'SIN', to: 'HKG', depart: '06:05', arrive: '10:10', duration: '4h 05m', stops: 0,
    aircraft: 'B787-9', baggage: 20, cabinBaggage: 10, amount: 1298, currency: 'HKD',
    homeAmount: 220, homeCurrency: 'SGD', merchant: 'Atlas Tickets', risk: 'watch',
    note: '近14日有2次时刻调整', solution: ['免费改至当日其他航班', '延误超过4小时可申请退款'], history: history(1298, 11),
  },
  {
    id: 'cx-716', flightNumber: 'CX716', airline: 'Cathay Pacific', airlineType: 'full',
    from: 'SIN', to: 'HKG', depart: '18:00', arrive: '22:05', duration: '4h 05m', stops: 0,
    aircraft: 'A330-300', baggage: 23, cabinBaggage: 7, amount: 1840, currency: 'HKD',
    homeAmount: 312, homeCurrency: 'SGD', merchant: 'Northstar Travel', risk: 'steady', history: history(1840, 8),
  },
  {
    id: 'ak-703', flightNumber: 'AK703', airline: 'AirAsia', airlineType: 'lcc',
    from: 'KUL', to: 'SIN', depart: '07:20', arrive: '08:30', duration: '1h 10m', stops: 0,
    aircraft: 'A320neo', baggage: 20, cabinBaggage: 7, amount: 288, currency: 'MYR',
    homeAmount: 82, homeCurrency: 'SGD', merchant: 'Atlas Tickets', risk: 'changed',
    note: '起飞时间已提前35分钟', solution: ['接受新时刻', '免费改签前后7日航班', '原路全额退款'], history: history(288, 4),
  },
]

export const dateFares: DateFare[] = [
  { day: '16', weekday: '一', amount: 434, tone: 4 },
  { day: '17', weekday: '二', amount: 352, tone: 3 },
  { day: '18', weekday: '三', amount: 278, tone: 2 },
  { day: '19', weekday: '四', amount: 220, tone: 1 },
  { day: '20', weekday: '五', amount: 312, tone: 2 },
  { day: '21', weekday: '六', amount: 398, tone: 3 },
  { day: '22', weekday: '日', amount: 486, tone: 5 },
]

export const trips: TripPass[] = [
  {
    id: 'hkg', city: '香港', from: 'SIN', to: 'HKG', date: '7月19日', time: '09:30',
    flight: 'SQ856', gate: 'B7', seat: '22A', tone: 'dark', status: 'ready',
  },
  {
    id: 'tpe', city: '台北', from: 'HKG', to: 'TPE', date: '7月23日', time: '14:10',
    flight: 'CX470', gate: '24', seat: '18F', tone: 'mint', status: 'ready',
  },
  {
    id: 'kix', city: '大阪', from: 'TPE', to: 'KIX', date: '7月27日', time: '17:45',
    flight: 'BR130', gate: 'C3', seat: '31A', tone: 'coral', status: 'changed',
    solution: '新时刻延后 55 分钟 · 可免费改签或退款',
  },
]
