import React, { useState, useEffect } from 'react';
import { Plus, Calendar, CheckCircle2, AlertCircle, Trash2, Bike, MessageCircle, User, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Quadricycle, Review } from './types';
import { calculateReviews, formatDate, getStatus } from './utils/dateUtils';

export default function App() {
  const [quads, setQuads] = useState<Quadricycle[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newModel, setNewModel] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newClientName, setNewClientName] = useState('');
  const [newWhatsapp, setNewWhatsapp] = useState('');

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('quadricycles');
    if (saved) {
      setQuads(JSON.parse(saved));
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem('quadricycles', JSON.stringify(quads));
  }, [quads]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModel || !newDate || !newClientName || !newWhatsapp) return;

    const newQuad: Quadricycle = {
      id: crypto.randomUUID(),
      model: newModel,
      purchaseDate: newDate,
      clientName: newClientName,
      whatsapp: newWhatsapp.replace(/\D/g, ''),
      reviews: calculateReviews(newDate),
    };

    setQuads([newQuad, ...quads]);
    setNewModel('');
    setNewDate('');
    setNewClientName('');
    setNewWhatsapp('');
    setIsAdding(false);
  };

  const toggleReview = (quadId: string, reviewId: number) => {
    setQuads(quads.map(q => {
      if (q.id === quadId) {
        return {
          ...q,
          reviews: q.reviews.map(r => 
            r.id === reviewId ? { ...r, isCompleted: !r.isCompleted } : r
          )
        };
      }
      return q;
    }));
  };

  const deleteQuad = (id: string) => {
    if (confirm('Tem certeza que deseja remover este quadriciclo?')) {
      setQuads(quads.filter(q => q.id !== id));
    }
  };

  const sendWhatsappMessage = (quad: Quadricycle, review?: Review) => {
    const phone = quad.whatsapp;
    let message = `Olá ${quad.clientName}! 👋\n\nEstamos entrando em contato sobre o seu quadriciclo *${quad.model}*.`;
    
    if (review) {
      message += `\n\nLembramos que a sua *${review.label}* está agendada para o dia *${formatDate(review.scheduledDate)}*.`;
    } else {
      message += `\n\nComo podemos ajudar hoje?`;
    }
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/55${phone}?text=${encodedMessage}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-slate-900 font-sans p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
              <Bike className="w-8 h-8 text-indigo-600" />
              Revisões de Quadriciclos
            </h1>
            <p className="text-slate-500 mt-1">Gerencie o cronograma e contato com clientes.</p>
          </div>
          <button
            onClick={() => setIsAdding(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-md active:scale-95 font-semibold"
          >
            <Plus className="w-5 h-5" />
            Novo Registro
          </button>
        </header>

        {/* Add Form Modal */}
        <AnimatePresence>
          {isAdding && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg"
              >
                <h2 className="text-2xl font-bold mb-6 text-slate-900">Novo Registro de Veículo</h2>
                <form onSubmit={handleAdd} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
                        <User className="w-4 h-4 text-indigo-500" /> Nome do Cliente
                      </label>
                      <input
                        autoFocus
                        type="text"
                        required
                        value={newClientName}
                        onChange={(e) => setNewClientName(e.target.value)}
                        placeholder="Nome completo"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-indigo-500" /> WhatsApp
                      </label>
                      <input
                        type="tel"
                        required
                        value={newWhatsapp}
                        onChange={(e) => setNewWhatsapp(e.target.value)}
                        placeholder="(00) 00000-0000"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
                        <Bike className="w-4 h-4 text-indigo-500" /> Modelo do Veículo
                      </label>
                      <input
                        type="text"
                        required
                        value={newModel}
                        onChange={(e) => setNewModel(e.target.value)}
                        placeholder="Ex: Honda TRX 420"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-indigo-500" /> Data da Compra
                      </label>
                      <input
                        type="date"
                        required
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsAdding(false)}
                      className="flex-1 px-4 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all font-semibold text-slate-600"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-xl transition-all shadow-md font-semibold"
                    >
                      Salvar Registro
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* List */}
        <div className="space-y-8">
          {quads.length === 0 ? (
            <div className="bg-white rounded-2xl p-16 text-center border border-dashed border-slate-300">
              <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bike className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Nenhum registro encontrado</h3>
              <p className="text-slate-500 mb-8 max-w-xs mx-auto">Cadastre o primeiro cliente e veículo para começar o monitoramento.</p>
              <button
                onClick={() => setIsAdding(true)}
                className="bg-indigo-50 text-indigo-600 px-6 py-2 rounded-full font-bold hover:bg-indigo-100 transition-all"
              >
                Adicionar agora
              </button>
            </div>
          ) : (
            quads.map((quad) => (
              <motion.div
                layout
                key={quad.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
              >
                <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-indigo-50 p-3 rounded-2xl">
                      <Bike className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{quad.model}</h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-500 text-sm mt-1">
                        <span className="flex items-center gap-1.5 font-medium text-slate-700">
                          <User className="w-3.5 h-3.5" /> {quad.clientName}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" /> Compra: {formatDate(quad.purchaseDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <button
                      onClick={() => sendWhatsappMessage(quad)}
                      className="flex-1 md:flex-none bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 text-sm font-bold"
                    >
                      <MessageCircle className="w-4 h-4" />
                      WhatsApp
                    </button>
                    <button
                      onClick={() => deleteQuad(quad.id)}
                      className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      title="Excluir Registro"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                  {quad.reviews.map((review) => {
                    const status = getStatus(review.scheduledDate, review.isCompleted);
                    return (
                      <div
                        key={review.id}
                        className={`relative p-5 rounded-2xl border transition-all flex flex-col h-full ${
                          review.isCompleted 
                            ? 'bg-emerald-50/30 border-emerald-100' 
                            : status === 'overdue'
                              ? 'bg-rose-50/30 border-rose-100'
                              : 'bg-slate-50/50 border-slate-100'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${
                            review.isCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {review.label}
                          </span>
                          {review.isCompleted ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                          ) : status === 'overdue' ? (
                            <AlertCircle className="w-5 h-5 text-rose-500 animate-pulse" />
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-slate-200" />
                          )}
                        </div>
                        
                        <div className="mb-6 flex-grow">
                          <div className="text-base font-bold text-slate-900">
                            {formatDate(review.scheduledDate)}
                          </div>
                          <div className="text-xs text-slate-500 mt-1 font-medium">
                            {review.daysFromPrevious} dias após {review.id === 1 ? 'a compra' : 'revisão anterior'}
                          </div>
                        </div>

                        <div className="space-y-2">
                          {!review.isCompleted && (
                            <button
                              onClick={() => sendWhatsappMessage(quad, review)}
                              className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-white border border-emerald-200 text-emerald-600 hover:bg-emerald-50 transition-all flex items-center justify-center gap-2"
                            >
                              <MessageCircle className="w-3.5 h-3.5" /> Notificar Cliente
                            </button>
                          )}
                          <button
                            onClick={() => toggleReview(quad.id, review.id)}
                            className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                              review.isCompleted
                                ? 'bg-emerald-500 text-white shadow-sm'
                                : 'bg-slate-900 text-white hover:bg-slate-800'
                            }`}
                          >
                            {review.isCompleted ? 'Revisão Realizada' : 'Concluir Revisão'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Info Footer */}
        <footer className="mt-16 pb-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-slate-100 shadow-sm text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <Bike className="w-3 h-3" /> Sistema de Gestão de Revisões
          </div>
          <p className="mt-4 text-slate-400 text-xs">© {new Date().getFullYear()} • Desenvolvido para eficiência mecânica</p>
        </footer>
      </div>
    </div>
  );
}
