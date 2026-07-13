import { useMemo, useState } from 'react'
import {
  AlertTriangle, ArrowLeft, ArrowRight, BaggageClaim, Bell, CalendarDays, Check,
  ChevronDown, ChevronRight, CircleUserRound, Clock3, ExternalLink, Fingerprint,
  History, Info, Luggage, MapPin, Minus, Plane, Plus, Search, ShieldCheck, Sparkles,
  Ticket, Trash2, WalletCards, X,
} from 'lucide-react'
import { dateFares, offers, trips } from './data'
import { filterOffers, historyRange } from './lib/pricing'
import type { AirlineType, FareOffer, Leg, Platform, TripPass } from './types'

const uid = () => Math.random().toString(36).slice(2, 9)

function KsiMark() {
  return (
    <div className="brand" aria-label="Ksi">
      <span className="brand-mark"><i /><i /><i /></span>
      <span>Ksi</span>
    </div>
  )
}

function IconButton({ label, onClick, children, className = '' }: {
  label: string; onClick?: () => void; children: React.ReactNode; className?: string
}) {
  return <button className={`icon-button ${className}`} aria-label={label} title={label} onClick={onClick}>{children}</button>
}

function SegmentEditor({ leg, index, canDelete, onChange, onDelete }: {
  leg: Leg; index: number; canDelete: boolean
  onChange: (next: Leg) => void; onDelete: () => void
}) {
  const swap = () => onChange({ ...leg, from: leg.to, to: leg.from })
  return (
    <div className="segment-row">
      <div className="segment-index">{index + 1}</div>
      <label className="field airport-field">
        <span>从</span>
        <input value={leg.from} maxLength={3} aria-label={`第${index + 1}程出发地`}
          onChange={(e) => onChange({ ...leg, from: e.target.value.toUpperCase() })} />
        <small>{leg.from === 'SIN' ? '新加坡' : leg.from === 'HKG' ? '香港' : '机场'}</small>
      </label>
      <IconButton label="交换出发与到达" onClick={swap} className="swap-button"><ArrowRight size={17} /></IconButton>
      <label className="field airport-field">
        <span>到</span>
        <input value={leg.to} maxLength={3} aria-label={`第${index + 1}程到达地`}
          onChange={(e) => onChange({ ...leg, to: e.target.value.toUpperCase() })} />
        <small>{leg.to === 'HKG' ? '香港' : leg.to === 'TPE' ? '台北' : '机场'}</small>
      </label>
      <label className="field date-field">
        <CalendarDays size={16} />
        <input type="date" value={leg.date} aria-label={`第${index + 1}程日期`}
          onChange={(e) => onChange({ ...leg, date: e.target.value })} />
      </label>
      {canDelete && <IconButton label={`删除第${index + 1}程`} onClick={onDelete} className="delete-leg"><Trash2 size={16} /></IconButton>}
    </div>
  )
}

function PriceCalendar({ activeDay, onSelect }: { activeDay: string; onSelect: (day: string) => void }) {
  return (
    <div className="date-fares" aria-label="日期价格概览">
      {dateFares.map((fare) => (
        <button key={fare.day} className={`date-fare tone-${fare.tone} ${activeDay === fare.day ? 'active' : ''}`}
          onClick={() => onSelect(fare.day)} aria-label={`7月${fare.day}日，${fare.amount}新元`}>
          <span>{fare.weekday}</span>
          <strong>{fare.day}</strong>
          <small>${fare.amount}</small>
        </button>
      ))}
    </div>
  )
}

function RiskDot({ risk }: { risk: FareOffer['risk'] }) {
  return <span className={`risk-dot ${risk}`} aria-label={risk === 'steady' ? '行程稳定' : risk === 'watch' ? '留意时刻变动' : '航班已变动'} />
}

function FlightCard({ offer, onHistory, onChoose }: {
  offer: FareOffer; onHistory: () => void; onChoose: () => void
}) {
  const low = offer.homeAmount === Math.min(...offers.filter(o => o.from === offer.from && o.to === offer.to).map(o => o.homeAmount))
  return (
    <article className={`flight-card ${low ? 'best-fare' : ''} risk-${offer.risk}`}>
      <div className="flight-main">
        <div className="flight-identity">
          <span className="airline-glyph">{offer.flightNumber.slice(0, 2)}</span>
          <div>
            <button className="flight-number" onClick={onHistory} aria-label={`查看${offer.flightNumber}价格历史`}>
              {offer.flightNumber}<History size={13} />
            </button>
            <small>{offer.airline}</small>
          </div>
        </div>
        <div className="time-block"><strong>{offer.depart}</strong><small>{offer.from}</small></div>
        <div className="flight-line">
          <span>{offer.duration}</span>
          <i><Plane size={13} /></i>
          <small>{offer.stops === 0 ? '直飞' : `${offer.stops}次经停`}</small>
        </div>
        <div className="time-block"><strong>{offer.arrive}</strong><small>{offer.to}</small></div>
        <div className="fare-block">
          <div><RiskDot risk={offer.risk} /><small>{offer.currency} {offer.amount.toLocaleString()}</small></div>
          <strong><sup>{offer.homeCurrency}</sup> {offer.homeAmount}</strong>
          <span>全部费用</span>
        </div>
        <button className="select-flight" onClick={onChoose} aria-label={`选择${offer.flightNumber}`}><ChevronRight size={20} /></button>
      </div>
      <div className="flight-meta">
        <span><Luggage size={14} /> {offer.baggage}kg</span>
        <span>{offer.aircraft}</span>
        <span>{offer.airlineType === 'lcc' ? 'LCC' : '全服务'}</span>
        {offer.note && <span className="risk-note"><AlertTriangle size={13} />{offer.note}</span>}
        <span className="merchant-note">由 {offer.merchant} 出票</span>
      </div>
    </article>
  )
}

function HistorySheet({ offer, onClose }: { offer: FareOffer; onClose: () => void }) {
  const { min, max } = historyRange(offer)
  const points = offer.history.map((point, index) => {
    const x = 18 + index * (264 / (offer.history.length - 1))
    const y = 116 - ((point.amount - min) / Math.max(max - min, 1)) * 84
    return `${x},${y}`
  }).join(' ')
  const latest = offer.history.at(-1)!
  return (
    <div className="scrim" onMouseDown={onClose}>
      <section className="sheet history-sheet" onMouseDown={(e) => e.stopPropagation()} aria-modal="true" role="dialog">
        <div className="sheet-handle" />
        <header><div><small>航班价格回溯</small><h2>{offer.flightNumber}</h2></div><IconButton label="关闭" onClick={onClose}><X size={19} /></IconButton></header>
        <div className="history-summary">
          <div><span>7月19日</span><strong>{offer.from} → {offer.to}</strong></div>
          <div><small>当前</small><strong>{offer.currency} {latest.amount.toLocaleString()}</strong></div>
        </div>
        <div className="chart-wrap">
          <svg viewBox="0 0 300 138" role="img" aria-label={`${offer.flightNumber}过去24日价格走势`}>
            <defs><linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--accent)" stopOpacity=".28"/><stop offset="1" stopColor="var(--accent)" stopOpacity="0"/></linearGradient></defs>
            <path d={`M ${points.split(' ').join(' L ')} L282 132 L18 132 Z`} fill="url(#chartFill)" />
            <polyline points={points} fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            {offer.history.map((point, index) => {
              const [x, y] = points.split(' ')[index].split(',')
              return <circle key={point.date} cx={x} cy={y} r={index === offer.history.length - 1 ? 5 : 2.5} fill="var(--surface)" stroke="var(--accent)" strokeWidth="2" />
            })}
          </svg>
          <div className="chart-axis"><span>{offer.history[0].date}</span><span>今天</span></div>
        </div>
        <div className="range-row"><span>低 {offer.currency} {min.toLocaleString()}</span><span>高 {offer.currency} {max.toLocaleString()}</span></div>
        <div className="history-insight"><Sparkles size={17}/><div><strong>接近近期低位</strong><span>当前价格低于过去24日的多数报价</span></div></div>
        <button className="primary wide" onClick={onClose}>完成</button>
      </section>
    </div>
  )
}

function TripCard({ trip, index, expanded, onClick }: { trip: TripPass; index: number; expanded: boolean; onClick: () => void }) {
  return (
    <button className={`trip-pass ${trip.tone} ${expanded ? 'expanded' : ''}`} style={{ '--stack': index } as React.CSSProperties} onClick={onClick}>
      <div className="pass-top"><span>{trip.city}</span><span>{trip.date}</span></div>
      <div className="pass-route"><strong>{trip.from}</strong><i><Plane size={18}/></i><strong>{trip.to}</strong></div>
      <div className="pass-details">
        <span><small>时间</small><strong>{trip.time}</strong></span>
        <span><small>航班</small><strong>{trip.flight}</strong></span>
        <span><small>登机口</small><strong>{trip.gate}</strong></span>
        <span><small>座位</small><strong>{trip.seat}</strong></span>
      </div>
      {trip.status === 'changed' && <div className="pass-change"><AlertTriangle size={16}/><span>{trip.solution}</span><ChevronRight size={16}/></div>}
      <div className="pass-barcode" aria-label="登机牌条码"><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/></div>
    </button>
  )
}

function WalletPanel() {
  const [expanded, setExpanded] = useState(0)
  return (
    <aside className="wallet-panel">
      <header className="panel-heading"><div><small>下一程</small><h2>旅程钱包</h2></div><span className="live-pill"><i/>实时</span></header>
      <div className="trip-stack">
        {trips.map((trip, index) => <TripCard key={trip.id} trip={trip} index={index} expanded={expanded === index} onClick={() => setExpanded(index)} />)}
      </div>
      <div className="wallet-footer"><ShieldCheck size={15}/><span>出票方数据 · Ksi 不保存支付卡</span></div>
    </aside>
  )
}

function PaymentSheet({ offer, platform, onClose }: { offer: FareOffer; platform: Platform; onClose: () => void }) {
  const [paid, setPaid] = useState(false)
  if (paid) return (
    <div className="scrim"><section className="sheet success-sheet" role="dialog" aria-modal="true">
      <div className="success-icon"><Check size={28}/></div><h2>已交给出票伙伴</h2><p>付款将在 {offer.merchant} 的安全页面完成。出票后，行程会自动回到 Ksi 钱包。</p>
      <div className="receipt-mini"><span>Ksi 服务费</span><strong>0</strong><span>收款与出票</span><strong>{offer.merchant}</strong></div>
      <button className="primary wide" onClick={onClose}>返回 Ksi</button>
    </section></div>
  )
  return (
    <div className="scrim" onMouseDown={onClose}>
      <section className="sheet payment-sheet" onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="sheet-handle"/><header><div><small>确认行程</small><h2>{offer.from} → {offer.to}</h2></div><IconButton label="关闭" onClick={onClose}><X size={19}/></IconButton></header>
        <div className="order-flight"><span className="airline-glyph">{offer.flightNumber.slice(0,2)}</span><div><strong>{offer.flightNumber}</strong><span>7月19日 · {offer.depart}–{offer.arrive}</span></div><strong>{offer.homeCurrency} {offer.homeAmount}</strong></div>
        <div className="price-lines">
          <div><span>机票与税费</span><strong>{offer.homeCurrency} {offer.homeAmount}</strong></div>
          <div><span>Ksi 服务费</span><strong>0</strong></div>
          <div className="total"><span>总计</span><strong>{offer.homeCurrency} {offer.homeAmount}</strong></div>
        </div>
        <div className="merchant-box"><ShieldCheck size={19}/><div><strong>由 {offer.merchant} 收款及出票</strong><span>原币支付与退款 · 无默认附加项目</span></div><Info size={16}/></div>
        <button className={`native-pay ${platform}`} onClick={() => setPaid(true)}>
          {platform === 'apple' ? <><span className="apple-logo">●</span> Pay</> : <><span className="g-logo">G</span> Pay</>}
        </button>
        <button className="quickpass" onClick={() => setPaid(true)}><span>云闪付</span><ChevronRight size={17}/></button>
        <p className="payment-note">Ksi 不接触或保存银行卡信息</p>
      </section>
    </div>
  )
}

function AuthSheet({ onClose }: { onClose: () => void }) {
  const [region, setRegion] = useState<'global'|'cn'>('global')
  return (
    <div className="scrim" onMouseDown={onClose}>
      <section className="sheet auth-sheet" onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="sheet-handle"/><header><KsiMark/><IconButton label="关闭" onClick={onClose}><X size={19}/></IconButton></header>
        <div className="auth-copy"><h2>一个人，一个 Ksi</h2><p>只用系统身份登录。两种方式可以绑定到同一个账户。</p></div>
        <div className="region-toggle"><button className={region==='global'?'active':''} onClick={()=>setRegion('global')}>全球</button><button className={region==='cn'?'active':''} onClick={()=>setRegion('cn')}>中国大陆</button></div>
        <button className="provider apple-provider"><span>●</span> 使用 Apple 登录</button>
        {region === 'global' ? <button className="provider google-provider"><span>G</span> 使用 Google 登录</button> : <button className="provider alipay-provider"><span>支</span> 支付宝认证</button>}
        <div className="auth-rule"><Fingerprint size={18}/><span>成年与唯一性认证由身份伙伴完成；Ksi 不保存证件或人脸。</span></div>
        <p className="legal-copy">继续即表示同意服务条款与隐私原则。可随时在应用内删除账户。</p>
      </section>
    </div>
  )
}

export default function App() {
  const [platform, setPlatform] = useState<Platform>(() => /Android/i.test(navigator.userAgent) ? 'pixel' : 'apple')
  const [legs, setLegs] = useState<Leg[]>([{ id: uid(), from: 'SIN', to: 'HKG', date: '2026-07-19' }])
  const [baggage, setBaggage] = useState(20)
  const [airlineType, setAirlineType] = useState<AirlineType>('all')
  const [searched, setSearched] = useState(true)
  const [activeDay, setActiveDay] = useState('19')
  const [historyOffer, setHistoryOffer] = useState<FareOffer | null>(null)
  const [paymentOffer, setPaymentOffer] = useState<FareOffer | null>(null)
  const [authOpen, setAuthOpen] = useState(false)
  const [mobileView, setMobileView] = useState<'search'|'wallet'>('search')

  const visibleOffers = useMemo(() => filterOffers(offers.filter(o => o.from === 'SIN'), baggage, airlineType), [baggage, airlineType])
  const updateLeg = (id: string, next: Leg) => setLegs(current => current.map(leg => leg.id === id ? next : leg))
  const addLeg = () => {
    const last = legs.at(-1)!
    setLegs([...legs, { id: uid(), from: last.to, to: '', date: last.date }])
  }

  return (
    <div className={`app platform-${platform}`}>
      <div className="ambient ambient-one"/><div className="ambient ambient-two"/>
      <header className="topbar">
        <KsiMark/>
        <nav className="main-nav"><button className={mobileView==='search'?'active':''} onClick={()=>setMobileView('search')}>搜索</button><button className={mobileView==='wallet'?'active':''} onClick={()=>setMobileView('wallet')}>行程</button></nav>
        <div className="top-actions">
          <button className="platform-switch" onClick={() => setPlatform(platform === 'apple' ? 'pixel' : 'apple')} aria-label="切换设备主题">
            <span className={platform==='apple'?'active':''}>iOS</span><span className={platform==='pixel'?'active':''}>Pixel</span>
          </button>
          <IconButton label="提醒"><Bell size={18}/></IconButton>
          <IconButton label="账户" onClick={()=>setAuthOpen(true)}><CircleUserRound size={20}/></IconButton>
        </div>
      </header>

      <main className={`workspace view-${mobileView}`}>
        <section className="search-column">
          <div className="search-intro"><div><small>无限串联</small><h1>下一程，去哪里？</h1></div><div className="principle"><ShieldCheck size={16}/><span>零加价 · 无捆绑</span></div></div>
          <div className="search-card glass-card">
            <div className="segments">
              {legs.map((leg, index) => <SegmentEditor key={leg.id} leg={leg} index={index} canDelete={legs.length > 1}
                onChange={(next)=>updateLeg(leg.id,next)} onDelete={()=>setLegs(legs.filter(item=>item.id!==leg.id))}/>) }
            </div>
            <div className="search-actions-row">
              <button className="add-segment" onClick={addLeg}><Plus size={17}/>添加一程</button>
              <div className="compact-filter" aria-label="托运行李额"><BaggageClaim size={17}/>{[0,20,30].map(v=><button key={v} className={baggage===v?'active':''} onClick={()=>setBaggage(v)}>{v}<small>kg</small></button>)}</div>
              <div className="compact-filter airline-filter" aria-label="航司类型">{([['all','全部'],['full','全服务'],['lcc','LCC']] as const).map(([v,label])=><button key={v} className={airlineType===v?'active':''} onClick={()=>setAirlineType(v)}>{label}</button>)}</div>
              <button className="search-button" onClick={()=>setSearched(true)}><Search size={19}/><span>搜索</span></button>
            </div>
          </div>

          {searched && <div className="results-area">
            <div className="results-top"><div><small>7月 · SGD</small><h2>SIN → HKG</h2></div><button className="currency-pill"><span>最优币种</span><strong>SGD</strong><ChevronDown size={14}/></button></div>
            <PriceCalendar activeDay={activeDay} onSelect={setActiveDay}/>
            <div className="color-key" aria-label="颜色越偏青价格越低，越偏紫价格越高"><span/><i/><i/><i/><i/><span/></div>
            <div className="flight-list">
              {visibleOffers.length ? visibleOffers.map(offer=><FlightCard key={offer.id} offer={offer} onHistory={()=>setHistoryOffer(offer)} onChoose={()=>setPaymentOffer(offer)}/>) :
                <div className="empty-state"><Luggage size={25}/><strong>没有包含 {baggage}kg 行李的匹配航班</strong><button onClick={()=>setBaggage(0)}>查看全部行李方案</button></div>}
            </div>
            <div className="coverage-note"><Info size={14}/><span>价格包含税费与出票伙伴费用。排序不受佣金影响。</span></div>
          </div>}
        </section>
        <WalletPanel/>
      </main>

      <nav className="mobile-nav">
        <button className={mobileView==='search'?'active':''} onClick={()=>setMobileView('search')}><Search size={20}/><span>搜索</span></button>
        <button className={mobileView==='wallet'?'active':''} onClick={()=>setMobileView('wallet')}><WalletCards size={20}/><span>行程</span></button>
        <button onClick={()=>setAuthOpen(true)}><CircleUserRound size={20}/><span>账户</span></button>
      </nav>

      {historyOffer && <HistorySheet offer={historyOffer} onClose={()=>setHistoryOffer(null)}/>} 
      {paymentOffer && <PaymentSheet offer={paymentOffer} platform={platform} onClose={()=>setPaymentOffer(null)}/>} 
      {authOpen && <AuthSheet onClose={()=>setAuthOpen(false)}/>} 
    </div>
  )
}
