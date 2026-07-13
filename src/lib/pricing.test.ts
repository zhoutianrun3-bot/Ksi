import { describe, expect, it } from 'vitest'
import { offers } from '../data'
import { allInPrice, filterOffers, historyRange } from './pricing'

describe('Ksi pricing rules', () => {
  it('keeps the payable price all-in', () => {
    expect(allInPrice(offers[0])).toBe(offers[0].homeAmount)
  })

  it('filters baggage and airline type without changing source data', () => {
    const result = filterOffers(offers, 23, 'full')
    expect(result.every((offer) => offer.baggage >= 23 && offer.airlineType === 'full')).toBe(true)
    expect(offers).toHaveLength(4)
  })

  it('returns a valid price history range', () => {
    const range = historyRange(offers[0])
    expect(range.min).toBeLessThan(range.max)
  })
})
