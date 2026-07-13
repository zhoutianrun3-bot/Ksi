import type { AirlineType, FareOffer, Leg } from '../types'

/** A canonical Ksi search request. Provider-specific fields must not leak into UI code. */
export interface FlightSearchRequest {
  legs: Leg[]
  adults: number
  children: number
  checkedBaggageKg: number
  airlineType: AirlineType
  preferredCurrencies: string[]
}

export interface SearchProvider {
  readonly name: string
  search(request: FlightSearchRequest, signal?: AbortSignal): Promise<FareOffer[]>
  reprice(offerId: string, currency: string): Promise<PayableOffer>
  priceHistory(flightNumber: string, departureDate: string): Promise<Array<{ observedAt: string; amount: number; currency: string }>>
}

export interface PayableOffer {
  offerId: string
  amount: number
  currency: string
  expiresAt: string
  merchantOfRecord: string
  includedFees: Array<{ code: string; amount: number }>
  baggageKg: number
  refundCurrency: string
}

export interface TicketingPartner {
  readonly name: string
  createOrder(offer: PayableOffer, travellers: Traveller[]): Promise<PartnerOrder>
  checkout(orderId: string, wallet: 'apple_pay' | 'google_pay' | 'unionpay'): Promise<{ checkoutUrl: string }>
  cancelOrRefund(orderId: string, reason: string): Promise<{ status: string }>
}

export interface Traveller {
  givenName: string
  familyName: string
  dateOfBirth: string
  documentToken?: string
}

export interface PartnerOrder {
  partnerOrderId: string
  status: 'pending_payment' | 'paid' | 'ticketed' | 'failed'
  merchantOfRecord: string
  amount: number
  currency: string
}

export interface IdentityAssertion {
  provider: 'apple' | 'google' | 'alipay_cn'
  providerSubject: string
  adult: boolean
  /** Opaque, provider-issued person-level deduplication key. Never an ID number hash made by Ksi. */
  personKey?: string
}

export interface IdentityProvider {
  verify(code: string, nonce: string): Promise<IdentityAssertion>
  unlink(ksiPersonId: string): Promise<void>
}

export interface DisruptionEvent {
  orderId: string
  flightNumber: string
  type: 'schedule_change' | 'cancellation' | 'delay'
  previousDeparture?: string
  currentDeparture?: string
  remedies: Array<{ id: string; type: 'accept' | 'rebook' | 'refund'; label: string }>
}
