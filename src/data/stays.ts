export interface Stay {
  id: string;
  name: string;
  location: string;
  price?: number;
  rating: number;
  image: string;
  amenities: string[];
  distanceToUni: string;
  type: 'PG' | 'Hostel' | 'Flat';
  description: string;
  ownerId?: string;
  status?: 'pending' | 'approved' | 'rejected';
  createdAt?: any;
}

export const MOCK_STAYS: Stay[] = [
  {
    id: '1',
    name: 'Oakwood Residency',
    location: 'North Campus District',
    price: 8500,
    rating: 4.8,
    image: 'https://picsum.photos/seed/oakwood/800/600',
    amenities: ['WiFi', 'AC', 'Laundry', 'Meals'],
    distanceToUni: '1.2 km from main campus',
    type: 'PG',
    description: 'A premium PG with modern amenities and instant move-in availability.',
    ownerId: 'mock-owner',
    status: 'approved'
  },
  {
    id: '2',
    name: 'Scholars Home',
    location: 'University District',
    price: 6000,
    rating: 4.5,
    image: 'https://picsum.photos/seed/scholars/800/600',
    amenities: ['WiFi', 'Library', 'Gym', 'Meals'],
    distanceToUni: '2.5 km from campus center',
    type: 'Hostel',
    description: 'Perfect for serious students who value peace and quiet.',
    ownerId: 'mock-owner',
    status: 'approved'
  },
  {
    id: '3',
    name: 'Skyline Heights',
    location: 'Downtown Tech Park',
    price: 12000,
    rating: 4.9,
    image: 'https://picsum.photos/seed/skyline2/800/600',
    amenities: ['WiFi', 'AC', 'Parking', 'Security'],
    distanceToUni: '0.5 km from transit hub',
    type: 'Flat',
    description: 'Luxury studio apartments ready for immediate move-in.',
    ownerId: 'mock-owner',
    status: 'approved'
  },
  {
    id: '4',
    name: 'Riverside PG',
    location: 'South Block',
    price: 7500,
    rating: 4.2,
    image: 'https://picsum.photos/seed/riverside2/800/600',
    amenities: ['WiFi', 'Power Backup', 'Laundry'],
    distanceToUni: '3.0 km from South Campus',
    type: 'PG',
    description: 'Affordable and comfortable stay with great views and instant setup.',
    ownerId: 'mock-owner',
    status: 'approved'
  },
  {
    id: '5',
    name: 'Unity Living',
    location: 'Science Park Area',
    price: 5500,
    rating: 4.0,
    image: 'https://picsum.photos/seed/unity2/800/600',
    amenities: ['WiFi', 'Meals', 'Common Area'],
    distanceToUni: '1.0 km from Tech Hub',
    type: 'Hostel',
    description: 'A community-focused hostel for immediate occupancy.',
    ownerId: 'mock-owner',
    status: 'approved'
  },
  {
    id: '6',
    name: 'The Royal Stay',
    location: 'Heritage District',
    price: 9000,
    rating: 4.7,
    image: 'https://picsum.photos/seed/royalstay/800/600',
    amenities: ['WiFi', 'AC', 'Gym', 'Meals'],
    distanceToUni: '2.0 km from Central Library',
    type: 'PG',
    description: 'Experience premium lifestyle with modern comforts and zero waiting time.',
    ownerId: 'mock-owner',
    status: 'approved'
  }
];
