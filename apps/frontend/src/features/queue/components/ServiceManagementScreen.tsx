import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@lib/supabase/client';
import { useTodayQueue } from '@features/queue/contexts/TodayQueueContext';
import ConfirmationModal from './ConfirmationModal';
import type { Service } from '@shared/types';
import { 
  Briefcase, 
  Plus, 
  Search, 
  RefreshCw, 
  Settings, 
  Trash2, 
  Save, 
  X,
  FileText,
  DollarSign,
  Receipt,
  Scale,
  Activity,
  UserPlus,
  Key,
  BarChart,
  Home,
  Mail,
  Fingerprint,
  Users,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ServiceDraft {
  name: string;
  description: string;
  icon: string;
  is_ouvidoria?: boolean;
}

const ServiceIcon: React.FC<{ iconName: string; className?: string; size?: number }> = ({ iconName, className, size = 18 }) => {
  switch (iconName) {
    case 'fingerprint': return <Fingerprint className={className} size={size} />;
    case 'person-add': return <UserPlus className={className} size={size} />;
    case 'family-restroom': return <Users className={className} size={size} />;
    case 'receipt-long': return <Receipt className={className} size={size} />;
    case 'elderly': return <Users className={className} size={size} />;
    case 'description': return <FileText className={className} size={size} />;
    case 'monetization-on': return <DollarSign className={className} size={size} />;
    case 'gavel': return <Scale className={className} size={size} />;
    case 'local-hospital': return <Activity className={className} size={size} />;
    case 'vpn-key': return <Key className={className} size={size} />;
    case 'bar-chart': return <BarChart className={className} size={size} />;
    case 'home': return <Home className={className} size={size} />;
    case 'email': return <Mail className={className} size={size} />;
    default:
      if (iconName && iconName.length <= 4) {
        return <span className={className} style={{ fontSize: size }}>{iconName}</span>;
      }
      return <HelpCircle className={className} size={size} />;
  }
};

const ICON_OPTIONS = [
  { value: 'description', label: 'Geral' },
  { value: 'monetization-on', label: 'Finanças' },
  { value: 'receipt-long', label: 'Docs' },
  { value: 'gavel', label: 'Jurídico' },
  { value: 'local-hospital', label: 'Saúde' },
  { value: 'person-add', label: 'Cadastro' },
  { value: 'vpn-key', label: 'Acesso' },
  { value: 'bar-chart', label: 'Análise' },
  { value: 'home', label: 'Imóveis' },
  { value: 'email', label: 'Social' },
  { value: 'fingerprint', label: 'Biometria' },
  { value: 'elderly', label: 'Idoso / Pref.' },
];

const Toast: React.FC<{ message: string; type: 'success' | 'error'; onClose: () => void }> = ({
  message,
  type,
  onClose,
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-6 right-6 rounded-2xl px-6 py-3.5 text-xs font-bold text-white shadow-2xl z-50 animate-fade-in-up flex items-center gap-3 backdrop-blur-md ${
        type === 'success' ? 'bg-emerald-950/90 border border-emerald-500/30 text-emerald-300' : 'bg-rose-950/90 border border-rose-500/30 text-rose-300'
      }`}
    >
      <span>{message}</span>
      <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg">
        <X size={14} />
      </button>
    </div>
  );
};

const ServiceManagementScreen: React.FC = () => {
  const { refreshTodayTickets } = useTodayQueue();
  const [services, setServices] = useState<Service[]>([]);
  const [draftsById, setDraftsById] = useState<Record<string, ServiceDraft>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingId, setIsSavingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  // HUD UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success',
  });
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; serviceId: string; serviceName: string }>({
    isOpen: false,
    serviceId: '',
    serviceName: '',
  });

  const [createForm, setCreateForm] = useState<ServiceDraft>({
    name: '',
    description: '',
    icon: 'description',
    is_ouvidoria: false,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type });
  }, []);

  const buildDraftMap = useCallback((rows: Service[]) => {
    const nextMap: Record<string, ServiceDraft> = {};
    rows.forEach((service) => {
      nextMap[service.id] = {
        name: service.name,
        description: service.description || '',
        icon: typeof service.icon === 'string' ? service.icon : 'description',
        is_ouvidoria: service.is_ouvidoria || false,
      };
    });
    return nextMap;
  }, []);

  const loadServices = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      const list: Service[] = (data || []).map((doc: any) => ({
        id: doc.id,
        name: doc.name,
        description: doc.description || '',
        icon: doc.icon || 'description',
        is_ouvidoria: doc.is_ouvidoria || false,
        created_at: doc.created_at,
        updated_at: doc.updated_at,
      }));

      setServices(list);
      setDraftsById(buildDraftMap(list));
    } catch (error) {
      console.error('Erro ao carregar servicos:', error);
      showToast('Falha ao carregar serviços.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [buildDraftMap, showToast]);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  const filteredServices = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return services
      .filter((s) => {
        return (
          s.name.toLowerCase().includes(query) ||
          s.description.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  }, [services, searchQuery]);

  const validateDraft = (draft: ServiceDraft) => {
    const errors: Record<string, string> = {};
    if (!draft.name.trim()) {
      errors.name = 'O nome do serviço é obrigatório.';
    } else if (draft.name.trim().length < 3) {
      errors.name = 'O nome deve ter no mínimo 3 caracteres.';
    }
    return errors;
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    const errors = validateDraft(createForm);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsCreating(true);
    try {
      const { error } = await supabase.from('services').insert([
        {
          name: createForm.name.trim(),
          description: createForm.description.trim(),
          icon: createForm.icon,
          is_ouvidoria: createForm.is_ouvidoria || false,
        },
      ]);

      if (error) throw error;

      showToast('Serviço criado com sucesso.', 'success');
      setCreateForm({ name: '', description: '', icon: 'description', is_ouvidoria: false });
      await loadServices();
      await refreshTodayTickets();
      setSelectedServiceId(null);
    } catch (error) {
      console.error('Erro ao criar servico:', error);
      showToast('Erro ao criar serviço.', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const updateDraft = (id: string, key: keyof ServiceDraft, value: string | boolean) => {
    setDraftsById((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [key]: value,
      },
    }));
  };

  const handleSaveService = async (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    const draft = draftsById[serviceId];
    if (!service || !draft) return;

    const errors = validateDraft(draft);
    if (Object.keys(errors).length > 0) {
      showToast(Object.values(errors)[0], 'error');
      return;
    }

    setIsSavingId(serviceId);
    try {
      const { error } = await supabase
        .from('services')
        .update({
          name: draft.name.trim(),
          description: draft.description.trim(),
          icon: draft.icon,
          is_ouvidoria: draft.is_ouvidoria || false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', serviceId);

      if (error) throw error;

      showToast('Serviço atualizado com sucesso.', 'success');
      await loadServices();
      await refreshTodayTickets();
    } catch (error) {
      console.error('Erro ao atualizar servico:', error);
      showToast('Erro ao atualizar serviço.', 'error');
    } finally {
      setIsSavingId(null);
    }
  };

  const confirmDeleteService = (serviceId: string, serviceName: string) => {
    setDeleteModal({ isOpen: true, serviceId, serviceName });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.serviceId) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', deleteModal.serviceId);

      if (error) throw error;

      showToast('Serviço excluído com sucesso.', 'success');
      if (selectedServiceId === deleteModal.serviceId) setSelectedServiceId(null);
      await loadServices();
      await refreshTodayTickets();
      setDeleteModal({ isOpen: false, serviceId: '', serviceName: '' });
    } catch (error) {
      console.error('Erro ao excluir servico:', error);
      showToast('Erro ao excluir serviço. Verifique se existem senhas vinculadas.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const selectedService = useMemo(() => {
    return services.find(s => s.id === selectedServiceId) || null;
  }, [services, selectedServiceId]);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto w-full text-slate-100 pb-8">
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast((prev) => ({ ...prev, show: false }))}
        />
      )}

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        title="Excluir Serviço"
        message={`Tem certeza que deseja excluir o serviço "${deleteModal.serviceName}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir Serviço"
        cancelText="Cancelar"
        isDangerous={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModal({ isOpen: false, serviceId: '', serviceName: '' })}
        isLoading={isDeleting}
      />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="font-montserrat text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Briefcase size={28} className="text-amber-400" />
            Gestão de Serviços da Previdência
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">
            Cadastre e edite as categorias de atendimento oferecidas nos totens e guichês.
          </p>
        </div>

        <div className="flex items-center gap-3 self-stretch sm:self-auto">
          <button
            onClick={() => loadServices()}
            className="p-2.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl transition-all text-slate-300"
            title="Atualizar Lista"
          >
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setSelectedServiceId(null)}
            className="flex items-center gap-2 py-2.5 px-5 bg-gradient-to-r from-jaboatao-yellow to-amber-500 text-slate-950 font-black text-xs rounded-2xl shadow-lg shadow-amber-500/10 hover:brightness-110 active:scale-95 transition-all"
          >
            <Plus size={16} />
            <span>Novo Serviço</span>
          </button>
        </div>
      </div>

      {/* Grid Principal: Lista (7 cols) + Form de Edição (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Lista de Serviços (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/60 backdrop-blur-md rounded-3xl border border-white/10 p-6 shadow-2xl flex flex-col">
          <div className="relative mb-6">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Pesquisar por nome ou descrição do serviço..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-950/80 border border-white/10 rounded-2xl text-xs text-white placeholder-slate-500 focus:border-amber-500/50 outline-none transition-all"
            />
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[600px] pr-1">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map(n => (
                  <div key={n} className="h-20 bg-white/5 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : filteredServices.length > 0 ? (
              filteredServices.map((service) => {
                const isSelected = selectedServiceId === service.id;
                const draft = draftsById[service.id] || service;

                return (
                  <div
                    key={service.id}
                    onClick={() => setSelectedServiceId(service.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                      isSelected
                        ? 'bg-slate-950 border-amber-500/50 shadow-lg shadow-amber-500/5'
                        : 'bg-slate-950/40 border-white/5 hover:border-white/15 hover:bg-slate-950/60'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold shrink-0">
                        <ServiceIcon iconName={draft.icon} size={20} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-white truncate flex items-center gap-2">
                          {service.name}
                          {service.is_ouvidoria && (
                            <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded text-[9px] font-bold">Ouvidoria</span>
                          )}
                        </h4>
                        <p className="text-xs text-slate-400 truncate mt-0.5">{service.description || 'Sem descrição cadastrada'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          confirmDeleteService(service.id, service.name);
                        }}
                        className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
                        title="Excluir Serviço"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-16 text-slate-500 text-xs font-bold">
                Nenhum serviço cadastrado.
              </div>
            )}
          </div>
        </div>

        {/* Formulário de Criação / Edição (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/60 backdrop-blur-md rounded-3xl border border-white/10 p-6 shadow-2xl flex flex-col">
          {selectedServiceId && selectedService ? (
            /* MODO EDIÇÃO */
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <ServiceIcon iconName={draftsById[selectedService.id]?.icon || 'description'} size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white">Editar Serviço</h3>
                    <p className="text-xs text-slate-400">Altere o nome e configurações.</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedServiceId(null)}
                  className="px-3 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-xs text-slate-300 font-bold"
                >
                  Novo
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Nome do Serviço *</label>
                  <input
                    type="text"
                    value={draftsById[selectedService.id]?.name || ''}
                    onChange={(e) => updateDraft(selectedService.id, 'name', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-2xl text-xs text-white focus:border-amber-500/50 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Descrição</label>
                  <textarea
                    rows={3}
                    value={draftsById[selectedService.id]?.description || ''}
                    onChange={(e) => updateDraft(selectedService.id, 'description', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-2xl text-xs text-white focus:border-amber-500/50 outline-none transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Ícone Visual</label>
                  <select
                    value={draftsById[selectedService.id]?.icon || 'description'}
                    onChange={(e) => updateDraft(selectedService.id, 'icon', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-2xl text-xs text-white focus:border-amber-500/50 outline-none cursor-pointer"
                  >
                    {ICON_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <label className="flex items-center gap-3 p-3 bg-slate-950 border border-white/5 rounded-2xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={draftsById[selectedService.id]?.is_ouvidoria || false}
                    onChange={(e) => updateDraft(selectedService.id, 'is_ouvidoria', e.target.checked)}
                    className="rounded accent-amber-500"
                  />
                  <span className="text-xs font-bold text-slate-200">Serviço de Ouvidoria (Requer Classificação ao Finalizar)</span>
                </label>
              </div>

              <button
                onClick={() => handleSaveService(selectedService.id)}
                disabled={isSavingId === selectedService.id}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-jaboatao-yellow to-amber-500 text-slate-950 font-black text-xs rounded-2xl shadow-lg shadow-amber-500/10 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
              >
                <Save size={16} />
                <span>{isSavingId === selectedService.id ? 'Salvando...' : 'Salvar Alterações'}</span>
              </button>
            </div>
          ) : (
            /* MODO CRIAÇÃO */
            <form onSubmit={handleCreateService} className="space-y-6">
              <div className="pb-4 border-b border-white/10">
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Plus size={18} className="text-amber-400" />
                  Cadastrar Novo Serviço
                </h3>
                <p className="text-xs text-slate-400 mt-1">Crie um novo serviço para emissão de senhas nos totens.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Nome do Serviço *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Recadastramento de Aposentado"
                    value={createForm.name}
                    onChange={(e) => setCreateForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-2xl text-xs text-white focus:border-amber-500/50 outline-none transition-all"
                  />
                  {formErrors.name && <p className="text-[10px] font-bold text-rose-400 mt-1">{formErrors.name}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Descrição</label>
                  <textarea
                    rows={3}
                    placeholder="Breve resumo sobre este atendimento..."
                    value={createForm.description}
                    onChange={(e) => setCreateForm(f => ({ ...f, description: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-2xl text-xs text-white focus:border-amber-500/50 outline-none transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Ícone Visual</label>
                  <select
                    value={createForm.icon}
                    onChange={(e) => setCreateForm(f => ({ ...f, icon: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-2xl text-xs text-white focus:border-amber-500/50 outline-none cursor-pointer"
                  >
                    {ICON_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <label className="flex items-center gap-3 p-3 bg-slate-950 border border-white/5 rounded-2xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={createForm.is_ouvidoria || false}
                    onChange={(e) => setCreateForm(f => ({ ...f, is_ouvidoria: e.target.checked }))}
                    className="rounded accent-amber-500"
                  />
                  <span className="text-xs font-bold text-slate-200">Serviço de Ouvidoria (Requer Classificação)</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isCreating}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-jaboatao-yellow to-amber-500 text-slate-950 font-black text-xs rounded-2xl shadow-lg shadow-amber-500/10 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
              >
                <Plus size={16} />
                <span>{isCreating ? 'Criando Serviço...' : 'Criar Serviço'}</span>
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};

export default ServiceManagementScreen;
