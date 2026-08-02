export type PlayerTier = 'Legendary' | 'Elite' | 'Pro' | 'Rising';
export type PlayerRole = 'Batter' | 'Bowler' | 'All-Rounder' | 'Keeper';

export type Player = {
  id: string;
  name: string;
  role: PlayerRole;
  tier: PlayerTier;
  rating: number;
  basePrice: number;
  currentBid: number;
  bidLeader: string | null;
  nationality: string;
  stats: {
    batting: number;
    bowling: number;
    fielding: number;
    power: number;
  };
};

export type SquadPlayer = Player & {
  acquiredFor: number;
  morale: number;
  form: number;
};

export type Deal = {
  id: string;
  type: 'Transfer' | 'Loan' | 'Swap' | 'Underworld Contract';
  title: string;
  description: string;
  cost: number;
  reward: string;
  risk: 'Low' | 'Medium' | 'High' | 'Extreme';
  expiresIn: number;
};

export type MatchEvent = {
  over: string;
  text: string;
  type: 'boundary' | 'wicket' | 'six' | 'dot' | 'run' | 'info';
};

export type MatchState = {
  innings: 1;
  battingTeam: string;
  bowlingTeam: string;
  score: string;
  overs: string;
  target: number | null;
  status: 'live' | 'complete';
  events: MatchEvent[];
};

export const AUCTION_PLAYERS: Player[] = [
  {
    id: 'p1',
    name: 'Virat Storm',
    role: 'Batter',
    tier: 'Legendary',
    rating: 92,
    basePrice: 2500000,
    currentBid: 2500000,
    bidLeader: null,
    nationality: 'IND',
    stats: { batting: 95, bowling: 30, fielding: 88, power: 90 },
  },
  {
    id: 'p2',
    name: 'Marcus Cage',
    role: 'All-Rounder',
    tier: 'Legendary',
    rating: 89,
    basePrice: 2200000,
    currentBid: 2400000,
    bidLeader: 'Shadow Syndicate',
    nationality: 'AUS',
    stats: { batting: 85, bowling: 82, fielding: 80, power: 88 },
  },
  {
    id: 'p3',
    name: 'Kane Vortex',
    role: 'Bowler',
    tier: 'Elite',
    rating: 85,
    basePrice: 1500000,
    currentBid: 1500000,
    bidLeader: null,
    nationality: 'NZ',
    stats: { batting: 45, bowling: 90, fielding: 75, power: 70 },
  },
  {
    id: 'p4',
    name: 'Rashid Hex',
    role: 'Bowler',
    tier: 'Elite',
    rating: 83,
    basePrice: 1200000,
    currentBid: 1650000,
    bidLeader: 'Crimson Order',
    nationality: 'AFG',
    stats: { batting: 40, bowling: 88, fielding: 72, power: 65 },
  },
  {
    id: 'p5',
    name: 'Jos Inferno',
    role: 'Keeper',
    tier: 'Elite',
    rating: 84,
    basePrice: 1400000,
    currentBid: 1400000,
    bidLeader: null,
    nationality: 'ENG',
    stats: { batting: 80, bowling: 20, fielding: 92, power: 78 },
  },
  {
    id: 'p6',
    name: 'Babar Phantom',
    role: 'Batter',
    tier: 'Pro',
    rating: 78,
    basePrice: 800000,
    currentBid: 950000,
    bidLeader: 'Iron Pact',
    nationality: 'PAK',
    stats: { batting: 82, bowling: 25, fielding: 70, power: 72 },
  },
  {
    id: 'p7',
    name: 'Trent Wraith',
    role: 'Bowler',
    tier: 'Pro',
    rating: 76,
    basePrice: 600000,
    currentBid: 600000,
    bidLeader: null,
    nationality: 'NZ',
    stats: { batting: 35, bowling: 80, fielding: 68, power: 60 },
  },
  {
    id: 'p8',
    name: 'Suryakar Ember',
    role: 'Batter',
    tier: 'Rising',
    rating: 71,
    basePrice: 300000,
    currentBid: 450000,
    bidLeader: 'Night Cartel',
    nationality: 'IND',
    stats: { batting: 75, bowling: 20, fielding: 65, power: 80 },
  },
];

export const INITIAL_SQUAD: SquadPlayer[] = [
  {
    id: 's1',
    name: 'Rohit Shade',
    role: 'Batter',
    tier: 'Elite',
    rating: 86,
    basePrice: 1800000,
    currentBid: 1800000,
    bidLeader: null,
    nationality: 'IND',
    acquiredFor: 2100000,
    morale: 85,
    form: 78,
    stats: { batting: 88, bowling: 30, fielding: 82, power: 85 },
  },
  {
    id: 's2',
    name: 'Jofra Crypt',
    role: 'Bowler',
    tier: 'Elite',
    rating: 82,
    basePrice: 1300000,
    currentBid: 1300000,
    bidLeader: null,
    nationality: 'ENG',
    acquiredFor: 1550000,
    morale: 72,
    form: 88,
    stats: { batting: 40, bowling: 87, fielding: 70, power: 75 },
  },
  {
    id: 's3',
    name: 'Glenn Mirage',
    role: 'All-Rounder',
    tier: 'Pro',
    rating: 77,
    basePrice: 900000,
    currentBid: 900000,
    bidLeader: null,
    nationality: 'AUS',
    acquiredFor: 1100000,
    morale: 90,
    form: 65,
    stats: { batting: 75, bowling: 72, fielding: 78, power: 85 },
  },
  {
    id: 's4',
    name: 'Quinton Void',
    role: 'Keeper',
    tier: 'Pro',
    rating: 75,
    basePrice: 700000,
    currentBid: 700000,
    bidLeader: null,
    nationality: 'SA',
    acquiredFor: 820000,
    morale: 68,
    form: 72,
    stats: { batting: 72, bowling: 15, fielding: 85, power: 70 },
  },
  {
    id: 's5',
    name: 'Shubman Dusk',
    role: 'Batter',
    tier: 'Rising',
    rating: 70,
    basePrice: 350000,
    currentBid: 350000,
    bidLeader: null,
    nationality: 'IND',
    acquiredFor: 480000,
    morale: 95,
    form: 80,
    stats: { batting: 74, bowling: 20, fielding: 68, power: 72 },
  },
];

export const DEALS: Deal[] = [
  {
    id: 'd1',
    type: 'Underworld Contract',
    title: 'The Fixer\'s Promise',
    description: 'A shadow broker guarantees a star player will enter the next auction at a reduced base price. Your reputation in the underworld grows.',
    cost: 500000,
    reward: 'Next Legendary auction base price -30%',
    risk: 'High',
    expiresIn: 2,
  },
  {
    id: 'd2',
    type: 'Transfer',
    title: 'Crimson Order Offer',
    description: 'The Crimson Order wants your bowler. They\'re offering above market value plus a future favor.',
    cost: 0,
    reward: '1.8M + Favor Token',
    risk: 'Medium',
    expiresIn: 1,
  },
  {
    id: 'd3',
    type: 'Loan',
    title: 'Shadow Syndicate Exchange',
    description: 'Borrow an Elite all-rounder for 3 matches. Win all three and the loan becomes permanent at no extra cost.',
    cost: 300000,
    reward: 'Elite All-Rounder (3 matches)',
    risk: 'Low',
    expiresIn: 3,
  },
  {
    id: 'd4',
    type: 'Swap',
    title: 'The Iron Pact Proposition',
    description: 'Trade your Rising batter for their Pro bowler. A straight swap that fills your squad gap.',
    cost: 0,
    reward: 'Pro Bowler for Rising Batter',
    risk: 'Low',
    expiresIn: 2,
  },
  {
    id: 'd5',
    type: 'Underworld Contract',
    title: 'The Night Cartel\'s Gambit',
    description: 'Pay the Night Cartel to sabotage a rival empire\'s next auction bid. Their wallet will be drained when you need it most.',
    cost: 750000,
    reward: 'Rival budget -40% next auction',
    risk: 'Extreme',
    expiresIn: 1,
  },
];

export const MATCH_EVENTS: MatchEvent[] = [
  { over: '1.1', text: 'Rohit Shade opens with a crisp drive through the covers. FOUR.', type: 'boundary' },
  { over: '1.2', text: 'Dot ball. Good length, beaten outside off.', type: 'dot' },
  { over: '1.3', text: 'Short and pulled! SIX over midwicket. What a strike.', type: 'six' },
  { over: '2.1', text: 'WICKET! The Crypt special — clean bowled. Stumps shattered.', type: 'wicket' },
  { over: '2.2', text: 'New batter in. Takes guard. Dot ball to settle.', type: 'dot' },
  { over: '2.3', text: 'Driven through extra cover. Two runs taken.', type: 'run' },
  { over: '3.1', text: 'SIX! Dusk launches it into the stands. The crowd erupts.', type: 'six' },
  { over: '3.2', text: 'FOUR! Glorious timing, races to the boundary.', type: 'boundary' },
  { over: '3.3', text: 'WICKET! Caught at long-on. A crucial breakthrough.', type: 'wicket' },
  { over: '4.1', text: 'Dot. Pressure building now.', type: 'dot' },
  { over: '4.2', text: 'Single taken, rotates the strike.', type: 'run' },
  { over: '4.3', text: 'FOUR! Creamed through point. What a shot.', type: 'boundary' },
  { over: '5.1', text: 'SIX! That\'s gone miles! 95 meters!', type: 'six' },
  { over: '5.2', text: 'Dot ball. Nerve check.', type: 'dot' },
  { over: '5.3', text: 'SIX! THEY\'VE DONE IT! The Underworld wins the match!', type: 'six' },
];

export const RIVAL_EMPIRES = [
  { name: 'Shadow Syndicate', power: 78, color: '#8B5A2B' },
  { name: 'Crimson Order', power: 72, color: '#B5470D' },
  { name: 'Iron Pact', power: 65, color: '#6B7280' },
  { name: 'Night Cartel', power: 81, color: '#4A3C2A' },
];

export const EMPIRE_STATS = {
  treasury: 8500000,
  reputation: 68,
  influence: 54,
  squadSize: 5,
  tournamentsWon: 3,
  dealsCompleted: 12,
};
