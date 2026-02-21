import { Quadricycle, Review } from '../types';
import { supabase } from '../lib/supabase';

// LocalStorage Keys
const LS_KEY = 'quadricycles_data';

export const dataService = {
  async getAll(): Promise<Quadricycle[]> {
    try {
      // Busca quadriciclos
      const { data: quads, error: quadError } = await supabase
        .from('quadriciclos')
        .select('*');

      if (quadError) throw quadError;

      // Busca revisões para cada quadriciclo
      const result = await Promise.all((quads || []).map(async (q) => {
        const { data: reviews, error: reviewError } = await supabase
          .from('revisoes')
          .select('*')
          .eq('quadriciclo_id', q.id)
          .order('numero_revisao', { ascending: true });

        if (reviewError) throw reviewError;

        return {
          id: q.id,
          model: q.modelo,
          purchaseDate: q.data_compra,
          clientName: q.cliente,
          whatsapp: q.whatsapp,
          status: q.status,
          reviews: (reviews || []).map(r => ({
            id: r.numero_revisao,
            label: r.rotulo,
            scheduledDate: r.data_agendada,
            isCompleted: r.concluida === 1,
            isRefused: r.recusada === 1,
            daysFromPrevious: r.dias_desde_anterior,
            observation: r.observacao,
            refusalReason: r.motivo_recusa,
            responsible: r.responsavel,
            km: r.km
          }))
        };
      }));

      localStorage.setItem(LS_KEY, JSON.stringify(result));
      return result;
    } catch (e) {
      console.warn('Supabase indisponível, usando LocalStorage:', e);
      const saved = localStorage.getItem(LS_KEY);
      return saved ? JSON.parse(saved) : [];
    }
  },

  async save(quad: Quadricycle): Promise<boolean> {
    try {
      // Insere quadriciclo
      const { error: quadError } = await supabase
        .from('quadriciclos')
        .insert([{
          id: quad.id,
          modelo: quad.model,
          data_compra: quad.purchaseDate,
          cliente: quad.clientName,
          whatsapp: quad.whatsapp,
          status: quad.status
        }]);

      if (quadError) throw quadError;

      // Insere revisões
      const reviewsToInsert = quad.reviews.map(r => ({
        quadriciclo_id: quad.id,
        numero_revisao: r.id,
        rotulo: r.label,
        data_agendada: r.scheduledDate,
        concluida: r.isCompleted ? 1 : 0,
        recusada: r.isRefused ? 1 : 0,
        dias_desde_anterior: r.daysFromPrevious
      }));

      const { error: reviewError } = await supabase
        .from('revisoes')
        .insert(reviewsToInsert);

      if (reviewError) throw reviewError;

      return true;
    } catch (e) {
      console.warn('Falha ao salvar no Supabase:', e);
      const current = await this.getAll();
      localStorage.setItem(LS_KEY, JSON.stringify([quad, ...current]));
      return true;
    }
  },

  async updateStatus(id: string, status: 'active' | 'completed'): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('quadriciclos')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (e) {
      console.warn('Falha ao atualizar status:', e);
      const current = await this.getAll();
      const updated = current.map(q => q.id === id ? { ...q, status } : q);
      localStorage.setItem(LS_KEY, JSON.stringify(updated));
      return true;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('quadriciclos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (e) {
      console.warn('Falha ao deletar:', e);
      const current = await this.getAll();
      const filtered = current.filter(q => q.id !== id);
      localStorage.setItem(LS_KEY, JSON.stringify(filtered));
      return true;
    }
  },

  async updateReview(quadId: string, reviewNumber: number, data: Partial<Review>): Promise<boolean> {
    try {
      const updatePayload: any = {};
      if (data.isCompleted !== undefined) updatePayload.concluida = data.isCompleted ? 1 : 0;
      if (data.isRefused !== undefined) updatePayload.recusada = data.isRefused ? 1 : 0;
      if (data.observation !== undefined) updatePayload.observacao = data.observation;
      if (data.refusalReason !== undefined) updatePayload.motivo_recusa = data.refusalReason;
      if (data.responsible !== undefined) updatePayload.responsavel = data.responsible;
      if (data.km !== undefined) updatePayload.km = data.km;

      const { error } = await supabase
        .from('revisoes')
        .update(updatePayload)
        .match({ quadriciclo_id: quadId, numero_revisao: reviewNumber });

      if (error) throw error;
      return true;
    } catch (e) {
      console.warn('Falha ao atualizar revisão:', e);
      const current = await this.getAll();
      const updated = current.map(q => {
        if (q.id === quadId) {
          return {
            ...q,
            reviews: q.reviews.map(r => r.id === reviewNumber ? { ...r, ...data } : r)
          };
        }
        return q;
      });
      localStorage.setItem(LS_KEY, JSON.stringify(updated));
      return true;
    }
  }
};
