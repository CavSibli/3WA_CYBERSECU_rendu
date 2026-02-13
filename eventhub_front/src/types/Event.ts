export interface Event {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string | null
  venueId: string
  capacity: number
  price: number | null
  organizerId: string
  categoryId: string
  imageUrl: string | null
  createdAt: string
  updatedAt: string
}


