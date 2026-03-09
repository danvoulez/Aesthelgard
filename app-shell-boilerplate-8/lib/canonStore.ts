import { Location, Character, Artifact, HistoricalEvent, Product } from '@/schemas/canon';

export const mockLocations: Location[] = [
  {
    id: 'loc-1',
    name: 'The Aether Spire',
    description: 'A towering structure reaching above the clouds.',
    controllingFaction: 'Cloud-Catchers',
  },
  {
    id: 'loc-2',
    name: 'The Deep Trenches',
    description: 'Dark, pressurized habitats at the bottom of the silt sea.',
    controllingFaction: 'Silt-Dwellers',
  },
];

export const mockCharacters: Character[] = [
  {
    id: 'char-1',
    name: 'Elder Zephyr',
    faction: 'Cloud-Catchers',
    timelineBoundary: { startYear: 150, endYear: null },
    isAlive: true,
    description: 'The current leader of the Cloud-Catchers.',
  },
  {
    id: 'char-2',
    name: 'Kaelen the Deep',
    faction: 'Silt-Dwellers',
    timelineBoundary: { startYear: 100, endYear: 200 },
    isAlive: false,
    description: 'A legendary explorer of the trenches.',
  },
];

export const mockArtifacts: Artifact[] = [
  {
    id: 'art-1',
    name: 'The Wind-Weaver',
    originEra: 'Before the Fall',
    currentLocationId: 'loc-1',
    powerLevel: 8,
    description: 'An ancient device capable of manipulating air currents.',
  },
];

export const mockEvents: HistoricalEvent[] = [
  {
    id: 'evt-1',
    name: 'The Great Treaty',
    date: 0,
    era: 'The 250-Year Peace',
    locationId: 'loc-1',
    involvedFactions: ['Cloud-Catchers', 'Silt-Dwellers', 'Guardians of Flow'],
    description: 'The signing of the treaty that began the 250-Year Peace.',
  },
];

export const mockProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'Scale-Cloak of the Fallen',
    type: 'PHYSICAL_MERCH',
    price: 45.00,
    imageUrl: 'https://picsum.photos/seed/cloak/400/400',
    loreDescription: 'Woven from the shed scales of a Guardian of Flow, this cloak repels both water and the biting winds of the upper tiers.',
    realWorldDescription: 'A high-quality, water-resistant windbreaker featuring a subtle scale pattern and the Guardians of Flow insignia.',
  },
  {
    id: 'prod-2',
    name: 'Secret Silt-Level Map',
    type: 'DIGITAL_ASSET',
    price: 15.00,
    imageUrl: 'https://picsum.photos/seed/map/400/400',
    loreDescription: 'A smuggled chart detailing the hidden currents and lost outposts of the Deep Trenches.',
    realWorldDescription: 'A digital unlock that grants access to a new interactive 3D map of the Silt-Level in your narrative journey.',
    unlocksArtifactId: 'art-map-1',
  },
  {
    id: 'prod-3',
    name: 'Gathering of the Cloud-Catchers',
    type: 'LIVE_EVENT',
    price: 25.00,
    imageUrl: 'https://picsum.photos/seed/gathering/400/400',
    loreDescription: 'An invitation to the annual summit at the Aether Spire, where the winds are read and futures are foretold.',
    realWorldDescription: 'A ticket to an exclusive live stream Q&A with the creators, featuring behind-the-scenes lore and interactive polls.',
  },
];

export const canonStore = {
  locations: mockLocations,
  characters: mockCharacters,
  artifacts: mockArtifacts,
  events: mockEvents,
  products: mockProducts,
};
