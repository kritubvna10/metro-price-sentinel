export interface KPIs {
  storesTracked: number;
  highestPremium: number;
  bestValue: number;
  avgPovertyPenalty: number;
  annualPovertyPenalty: number;
}

export interface Store {
  rank: number;
  name: string;
  city: string;
  chain: string;
  premium: number;
  penalty: number;
  badge?: string;
}

export interface City {
  name: string;
  bestStore: string;
  premium: number;
  insight: string;
}

export interface Persona {
  id: string;
  label: string;
  basketCost: number;
  bestStore: string;
  color: string;
}

export const kpis: KPIs = {
  storesTracked: 22,
  highestPremium: 31,
  bestValue: -8,
  avgPovertyPenalty: 5.33,
  annualPovertyPenalty: 277,
}

export const stores: Store[] = [
  { rank: 1, name: 'Walmart Surrey Downtown', city: 'Surrey',
    chain: 'Walmart', premium: -8, penalty: 8.90, badge: 'BEST VALUE' },
  { rank: 2, name: 'Superstore Guildford', city: 'Surrey',
    chain: 'Loblaws', premium: -2, penalty: 10.60 },
  { rank: 3, name: 'Save-On-Foods Fleetwood', city: 'Surrey',
    chain: 'Save-On-Foods', premium: 6, penalty: 13.10 },
  { rank: 4, name: 'Superstore Richmond', city: 'Richmond',
    chain: 'Loblaws', premium: 14, penalty: 15.20 },
  { rank: 5, name: 'Save-On-Foods Lonsdale', city: 'North Vancouver',
    chain: 'Save-On-Foods', premium: 31, penalty: 19.80 },
  { rank: 6, name: 'CHALO! FreshCo Surrey', city: 'Surrey',
    chain: 'FreshCo', premium: -5, penalty: 9.40 },
  { rank: 7, name: 'No Frills Hastings', city: 'Vancouver',
    chain: 'No Frills', premium: -3, penalty: 9.80 },
  { rank: 8, name: 'Save-On-Foods Delta', city: 'Delta',
    chain: 'Save-On-Foods', premium: 4, penalty: 12.30 },
]

export const cities: City[] = [
  { name: 'Surrey', bestStore: 'Walmart Surrey Downtown',
    premium: -8, insight: 'Best overall value. Strong South Asian coverage.' },
  { name: 'Vancouver', bestStore: 'No Frills Hastings',
    premium: -3, insight: 'Budget option. Limited specialty items.' },
  { name: 'Richmond', bestStore: 'Superstore Richmond',
    premium: -1, insight: 'Good Asian product coverage.' },
  { name: 'Burnaby', bestStore: 'Superstore Lougheed',
    premium: 2, insight: 'Mid-range. Good frozen section.' },
  { name: 'North Vancouver', bestStore: 'Save-On-Foods Lonsdale',
    premium: 31, insight: 'Most expensive. No toor dal or bulk atta.' },
  { name: 'Delta', bestStore: 'Save-On-Foods Delta',
    premium: 4, insight: 'Only SOF with toor dal in stock.' },
  { name: 'Langley', bestStore: 'Save-On-Foods Langley',
    premium: 8, insight: 'Limited South Asian specialty products.' },
  { name: 'New Westminster', bestStore: 'Save-On-Foods New Westminster',
    premium: 5, insight: 'Decent coverage. Silken tofu available.' },
]

export const personas: Persona[] = [
  { id: 'south-asian', label: 'South Asian',
    basketCost: 127, bestStore: 'CHALO! FreshCo Surrey',
    color: '#F97316' },
  { id: 'chinese', label: 'Chinese',
    basketCost: 118, bestStore: 'Superstore Richmond',
    color: '#EF4444' },
  { id: 'filipino', label: 'Filipino',
    basketCost: 134, bestStore: 'Walmart Surrey Downtown',
    color: '#8B5CF6' },
  { id: 'korean', label: 'Korean',
    basketCost: 142, bestStore: 'Save-On-Foods New Westminster',
    color: '#06B6D4' },
  { id: 'european', label: 'European',
    basketCost: 109, bestStore: 'No Frills Hastings',
    color: '#10B981' },
  { id: 'indigenous', label: 'Indigenous',
    basketCost: 156, bestStore: 'Save-On-Foods Maple Ridge',
    color: '#F59E0B' },
  { id: 'others', label: 'Others',
    basketCost: 112, bestStore: 'Walmart Surrey Downtown',
    color: '#64748B' },
]
