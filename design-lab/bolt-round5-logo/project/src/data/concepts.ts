export type Concept = {
  id: number;
  name: string;
  tagline: string;
  psychology: string;
  strengths: string[];
  risks: string[];
  silhouetteScore: number;
  prestigeScore: number;
  mysteryScore: number;
  scalabilityScore: number;
};

export const CONCEPTS: Concept[] = [
  {
    id: 1,
    name: 'CU Monogram',
    tagline: 'The Vault Seal',
    psychology:
      'A monogram communicates exclusivity and heritage — think luxury fashion houses and secret society rings. The interlocked C and U form a vault-like enclosure, suggesting something hidden, protected, and valuable. The geometric precision reads as deliberate and authoritative. At small sizes, the bold interlocking shapes remain instantly recognizable as a mark of identity rather than a sports reference.',
    strengths: ['Timeless and scalable', 'Works at 48x48 px', 'No cricket clichés', 'Luxury fashion feel'],
    risks: ['May read as abstract without context', 'Less obvious connection to the game'],
    silhouetteScore: 9,
    prestigeScore: 9,
    mysteryScore: 8,
    scalabilityScore: 10,
  },
  {
    id: 2,
    name: 'Hammer-Bat',
    tagline: 'The Auction Strike',
    psychology:
      'The auction hammer fused with a cricket bat is the most literal expression of the game\'s core loop: bidding for players in high-stakes auctions. The hammer symbolizes finality, power, and commerce — "SOLD." The bat grounds it in cricket without being generic. The impact spark at the top communicates energy and consequence. This concept tells a story in a single image: cricket meets the underworld of deals.',
    strengths: ['Directly communicates the game loop', 'Strong narrative', 'Memorable silhouette', 'Action-oriented'],
    risks: ['More complex at small sizes', 'Hammer-bat fusion could read ambiguous'],
    silhouetteScore: 7,
    prestigeScore: 7,
    mysteryScore: 6,
    scalabilityScore: 7,
  },
  {
    id: 3,
    name: 'Seam Ball CU',
    tagline: 'The Hidden Signature',
    psychology:
      'The cricket ball is the most iconic object in the sport, but here it is transformed: the raised seam — the ball\'s most distinctive feature — spells "CU." This is the most subtle and clever concept. The dark ball against a dark background feels mysterious and premium, like a hidden object in shadow. The gold seam draws the eye and rewards closer inspection. Players who notice the hidden letters feel like insiders who cracked a code.',
    strengths: ['Clever and rewarding', 'Premium dark aesthetic', 'Subtle cricket reference', 'Strong at small sizes'],
    risks: ['CU may not be legible at 48px', 'Requires dark background to shine'],
    silhouetteScore: 8,
    prestigeScore: 8,
    mysteryScore: 10,
    scalabilityScore: 8,
  },
  {
    id: 4,
    name: 'Stump Crown',
    tagline: 'The Empire\'s Crest',
    psychology:
      'Three cricket stumps arranged as a crown is the most powerful fusion of cricket and prestige. Stumps are the wicket — the core target, the thing you defend and attack. A crown represents sovereignty, dominance, and the right to rule. By transforming stumps into a crown, the logo declares that this is a game about ruling cricket, not just playing it. The gold metallic finish and pointed tips evoke a luxury crest. The base bar and diamond anchor it like a royal seal.',
    strengths: ['Instantly readable at any size', 'Perfect cricket-prestige fusion', 'Royal/luxury connotation', 'Strong silhouette', 'Timeless'],
    risks: ['Could be mistaken for a real cricket board emblem if not styled carefully'],
    silhouetteScore: 10,
    prestigeScore: 10,
    mysteryScore: 7,
    scalabilityScore: 10,
  },
  {
    id: 5,
    name: 'Geometric Emblem',
    tagline: 'The Elite Mark',
    psychology:
      'A hexagonal emblem with interlocking triangles evokes secret societies, elite clubs, and mystical orders. The Freemasons, the Illuminati, exclusive gentleman\'s clubs — all use geometric symbolism. The hidden cricket ball diamond at the center is a discovery reward. The six gold points at each vertex suggest a network of power. This is the most "underground" feeling concept — it looks like the insignia of a shadow organization that happens to involve cricket.',
    strengths: ['Strongest "underground" feel', 'Mysterious and intriguing', 'Unique in gaming', 'Scalable geometric form'],
    risks: ['Least obvious cricket connection', 'May feel too abstract to some'],
    silhouetteScore: 9,
    prestigeScore: 8,
    mysteryScore: 10,
    scalabilityScore: 9,
  },
  {
    id: 6,
    name: 'Empire Insignia',
    tagline: 'The Underground Crest',
    psychology:
      'An arched crest with crossed bats, a keyhole, and a crown point feels like the coat of arms of a clandestine cricket empire. The arch frames the mark like a vault entrance. The keyhole at the center suggests access, secrets, and exclusivity — you need a key to enter this world. Crossed bats replace crossed swords, subverting military heraldry into cricket. This is the most narrative-rich concept, but also the most complex.',
    strengths: ['Richest storytelling', 'Strong underground identity', 'Heraldic prestige', 'Unique in mobile gaming'],
    risks: ['Too complex for 48x48 px', 'Detail lost at small sizes', 'Harder to animate cleanly'],
    silhouetteScore: 6,
    prestigeScore: 9,
    mysteryScore: 9,
    scalabilityScore: 5,
  },
];
