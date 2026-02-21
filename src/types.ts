export interface Review {
  id: number;
  label: string;
  scheduledDate: string;
  isCompleted: boolean;
  isRefused?: boolean;
  daysFromPrevious: number;
  observation?: string;
  refusalReason?: string;
  responsible?: string;
  km?: string;
  photoUrl?: string;
  completionDate?: string;
}

export interface Quadricycle {
  id: string;
  model: string;
  purchaseDate: string;
  clientName: string;
  whatsapp: string;
  registrationResponsible?: string;
  reviews: Review[];
  status: 'active' | 'completed';
}
