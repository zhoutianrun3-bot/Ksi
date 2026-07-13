import type { FareOffer } from '../types'

export function filterOffers(offers: FareOffer[], baggage: number, airlineType: 'all' | 'full' | 'lcc') {
  return offers
    .filter((offer) => offer.baggage >= baggage)
    .filter((offer) => airlineType === 'all' || offer.airlineType === airlineType)
    .sort((a, b) => a.homeAmount - b.homeAmount)
}

export function allInPrice(offer: FareOffer) {
  return offer.homeAmount
}

export function historyRange(offer: FareOffer) {
  const values = offer.history.map((item) => item.amount)
  return { min: Math.min(...values), max: Math.max(...values) }
}
