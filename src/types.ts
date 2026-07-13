export type Platform = 'apple' | 'pixel'
export type AirlineType = 'all' | 'full' | 'lcc'
export type RiskLevel = 'steady' | 'watch' | 'changed'

export interface Leg {
  id: string
  from: string
  to: string
  date: string
}

export interface PricePoint {
  date: string
  amount: number
}

export interface DateFare {
  day: string
  weekday: string
  amount: number
  tone: 1 | 2 | 3 | 4 | 5
}

export interface FareOffer {
  id: string
  flightNumber: string
  airline: string
  airlineType: Exclude<AirlineType, 'all'>
  from: string
  to: string
  depart: string
  arrive: string
  duration: string
  stops: number
  aircraft: string
  baggage: number
  cabinBaggage: number
  amount: number
  currency: string
  homeAmount: number
  homeCurrency: string
  merchant: string
  risk: RiskLevel
  note?: string
  solution?: string[]
  history: PricePoint[]
}

export interface TripPass {
  id: string
  city: string
  from: string
  to: string
  date: string
  time: string
  flight: string
  gate: string
  seat: string
  tone: 'dark' | 'mint' | 'coral'
  status: 'ready' | 'changed'
  solution?: string
}
