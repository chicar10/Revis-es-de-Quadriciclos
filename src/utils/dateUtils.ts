import { addDays, format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Review } from '../types';

export const calculateReviews = (purchaseDate: string): Review[] => {
  const d0 = parseISO(purchaseDate);
  
  const d1 = addDays(d0, 90);
  const d2 = addDays(d1, 180);
  const d3 = addDays(d2, 180);

  return [
    {
      id: 1,
      label: '1ª Revisão',
      scheduledDate: d1.toISOString(),
      isCompleted: false,
      daysFromPrevious: 90,
    },
    {
      id: 2,
      label: '2ª Revisão',
      scheduledDate: d2.toISOString(),
      isCompleted: false,
      daysFromPrevious: 180,
    },
    {
      id: 3,
      label: '3ª Revisão',
      scheduledDate: d3.toISOString(),
      isCompleted: false,
      daysFromPrevious: 180,
    },
  ];
};

export const formatDate = (dateString: string) => {
  return format(parseISO(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
};

export const getStatus = (dateString: string, isCompleted: boolean) => {
  if (isCompleted) return 'completed';
  const date = parseISO(dateString);
  const now = new Date();
  if (date < now) return 'overdue';
  return 'upcoming';
};
