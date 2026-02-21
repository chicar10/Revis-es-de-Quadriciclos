export interface Review {
  id: number;
  label: string;
  scheduledDate: string;
  isCompleted: boolean;
  daysFromPrevious: number;
  observation?: string;
  responsible?: string;
  km?: string;
}

export interface Quadricycle {
  id: string;
  model: string;
  purchaseDate: string;
  clientName: string;
  whatsapp: string;
  reviews: Review[];
  status: 'active' | 'completed';
}
