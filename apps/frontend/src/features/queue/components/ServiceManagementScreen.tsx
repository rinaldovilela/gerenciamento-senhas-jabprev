import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@lib/supabase/client';
import { useTodayQueue } from '@features/queue/contexts/TodayQueueContext';
import ConfirmationModal from './ConfirmationModal';
import type { Service } from '@shared/types';
import { 
  Add, 
  Search, 
  Refresh, 
  Settings, 
  Delete, 
  Save, 
  Close,
  Category,
  Fingerprint, 
  PersonAdd, 
  FamilyRestroom, 
  ReceiptLong, 
  Elderly, 
  Help,
  Description,
  MonetizationOn,
  Gavel,
  LocalHospital,
  VpnKey,
  BarChart,
  Home,
  Email
} from '@mui/icons-material';

interface ServiceDraft {
  name: string;
  description: string;
  icon: string;
}

const ServiceIcon: React.FC<{ iconName: string; className?: string; size?: number }> = ({ iconName, className, size = 20 }) => {
  const sx = { fontSize: size };
  switch (iconName) {
    case 'fingerprint': return <Fingerprint className={className} sx={sx} />;
    case 'person-add': return <PersonAdd className={className} sx={sx} />;
    case 'family-restroom': return <FamilyRestroom className={className} sx={sx} />;
    case 'receipt-long': return <ReceiptLong className={className} sx={sx} />;
    case 'elderly': return <Elderly className={className} sx={sx} />;
    case 'description': return <Description className={className} sx={sx} />;
    case 'monetization-on': return <MonetizationOn className={className} sx={sx} />;
    case 'gavel': return <Gavel className={className} sx={sx} />;
    case 'local-hospital': return <LocalHospital className={className} sx={sx} />;
    case 'vpn-key': return <VpnKey className={className} sx={sx} />;
    case 'bar-chart': return <BarChart className={className} sx={sx} />;
    case 'home': return <Home className={className} sx={sx} />;
    case 'email': return <Email className={className} sx={sx} />;
    default:
      if (iconName && iconName.length <= 4) {
        return <span className={className} style={{ fontSize: size }}>{iconName}</span>;
      }
      return <Help className={className} sx={sx} />;
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
      className={`fixed bottom-6 right-6 rounded-2xl px-6 py-3.5 text-sm font-semibold text-white shadow-2xl z-50 animate-fade-in-up flex items-center gap-2.5 ${
        type === 'success' ? 'bg-[#1E7342] border border-emerald-600/30' : 'bg-red-600 border border-red-500/30'
      }`}
    >
      <span>{message}</span>
      <button onClick={onClose} className="p-0.5 hover:bg-white/10 rounded">
        <Close sx={{ fontSize: 16 }} />
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
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null); // null means "Create Mode"
  const [isDeleting, setIsDeleting] = useState(false);
  const [showFormOnMobile, setShowFormOnMobile] = useState(false);

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

  // Filter and search services
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
        },
      ]);

      if (error) throw error;

      showToast('Serviço criado com sucesso.', 'success');
      setCreateForm({ name: '', description: '', icon: 'description' });
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

  const updateDraft = (id: string, key: keyof ServiceDraft, value: string) => {
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
      showToast(errors.name || 'Erro nos campos informados.', 'error');
      return;
    }

    const payload: Partial<ServiceDraft> = {};
    if (draft.name.trim() !== service.name) payload.name = draft.name.trim();
    if (draft.description.trim() !== (service.description || '')) {
      payload.description = draft.description.trim();
    }
    if (draft.icon !== (service.icon || 'description')) payload.icon = draft.icon;

    if (Object.keys(payload).length === 0) {
      showToast('Nenhuma alteração para salvar.', 'error');
      return;
    }

    setIsSavingId(serviceId);
    try {
      const { error } = await supabase
        .from('services')
        .update(payload)
        .eq('id', serviceId);

      if (error) throw error;

      showToast('Serviço atualizado com sucesso.', 'success');
      await loadServices();
      await refreshTodayTickets();
    } catch (error) {
      console.error('Erro ao atualizar servico:', error);
      showToast('Erro ao atualizar o serviço.', 'error');
    } finally {
      setIsSavingId(null);
    }
  };

  const triggerDelete = (serviceId: string, serviceName: string) => {
    setDeleteModal({
      isOpen: true,
      serviceId,
      serviceName,
    });
  };

  const handleConfirmDelete = async () => {
    const serviceId = deleteModal.serviceId;
    if (!serviceId) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId);

      if (error) throw error;

      showToast('Serviço excluído com sucesso.', 'success');
      setSelectedServiceId(null);
      await loadServices();
      await refreshTodayTickets();
      setDeleteModal({ isOpen: false, serviceId: '', serviceName: '' });
    } catch (error) {
      console.error('Erro ao deletar servico:', error);
      showToast('Não foi possível excluir o serviço.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const activeService = useMemo(() => {
    return services.find(s => s.id === selectedServiceId) || null;
  }, [services, selectedServiceId]);

  const activeDraft = useMemo(() => {
    if (!selectedServiceId) return null;
    return draftsById[selectedServiceId] || null;
  }, [draftsById, selectedServiceId]);

  return (
    <div className="flex flex-col h-full gap-6 w-full text-slate-800">
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, show: false }))}
      />

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        title="Excluir Serviço"
        message={`Tem certeza que deseja excluir permanentemente o serviço "${deleteModal.serviceName}"? Esta ação não pode ser desfeita e pode afetar a fila.`}
        confirmText="Excluir Permanentemente"
        cancelText="Cancelar"
        isDangerous={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModal({ isOpen: false, serviceId: '', serviceName: '' })}
        isLoading={isDeleting}
      />

      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/50 pb-5">
        <div>
          <h1 className="font-montserrat text-3xl font-black text-slate-900 tracking-tight">
            Configuração de Guichês
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-semibold">
            Gerencie os tipos de serviços disponíveis para emissão de senhas e atendimento.
          </p>
        </div>
        <button
          onClick={loadServices}
          className="flex items-center gap-2 py-2.5 px-5 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:bg-slate-50 active:scale-95 transition-all duration-200 self-stretch sm:self-auto justify-center"
        >
          <Refresh sx={{ fontSize: 18 }} />
          Atualizar Lista
        </button>
      </header>

      {/* Cockpit Asimétrico (Master-Detail Layout) */}
      <div className="flex flex-col lg:flex-row gap-6 items-stretch flex-grow min-h-[500px]">
        
        {/* COLUNA ESQUERDA: Entity Deck */}
        <div className={`w-full lg:w-96 flex flex-col gap-4 bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-3xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.02)] ${showFormOnMobile ? 'hidden lg:flex' : 'flex'}`}>
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest">
              Serviços Habilitados ({filteredServices.length})
            </h2>
            <button
              onClick={() => { setSelectedServiceId(null); setShowFormOnMobile(true); }}
              className="flex items-center justify-center gap-1.5 px-3 py-2 text-[10px] font-black uppercase text-white bg-gradient-to-r from-jaboatao-blue to-[#2B6CB0] hover:shadow-md active:scale-95 rounded-xl transition-all duration-150"
            >
              <Add sx={{ fontSize: 14 }} />
              Novo
            </button>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" sx={{ fontSize: 18 }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nome ou descrição..."
              className="w-full pl-10 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-jaboatao-blue/5 focus:border-jaboatao-blue focus:bg-white text-xs font-bold transition-all duration-200"
            />
          </div>

          {/* List Deck */}
          <div className="flex-grow overflow-y-auto lg:max-h-[500px] space-y-2 pr-1">
            {isLoading ? (
              <div className="py-16 text-center">
                <div className="animate-spin inline-block w-8 h-8 border-[3px] border-current border-t-transparent text-jaboatao-blue rounded-full mb-3"></div>
                <p className="text-xs font-bold text-slate-400">Buscando canais...</p>
              </div>
            ) : filteredServices.length === 0 ? (
              <p className="text-center text-slate-400 py-16 text-xs font-bold">Nenhum serviço registrado.</p>
            ) : (
              filteredServices.map((service) => {
                const isSelected = selectedServiceId === service.id;
                return (
                  <button
                    key={service.id}
                    onClick={() => { setSelectedServiceId(service.id); setShowFormOnMobile(true); }}
                    className={`w-full text-left p-3.5 rounded-2xl border-2 flex items-center justify-between gap-4 transition-all duration-200 group active:scale-[0.97] ${
                      isSelected 
                        ? 'border-[#204FA1] bg-[#204FA1]/5 shadow-sm' 
                        : 'border-slate-100/80 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 shadow-sm transition-colors ${
                        isSelected 
                          ? 'bg-gradient-to-tr from-jaboatao-blue to-[#407BDE] text-white shadow-md' 
                          : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                      }`}>
                        <ServiceIcon iconName={typeof service.icon === 'string' ? service.icon : 'description'} className={isSelected ? 'text-white' : 'text-slate-600'} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-black text-slate-800 truncate">{service.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 truncate mt-0.5">{service.description || 'Sem descrição cadastrada.'}</p>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* COLUNA DIREITA: Control Console (Terminal de Operações) */}
        <div className={`flex-grow bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] flex flex-col justify-between ${!showFormOnMobile ? 'hidden lg:flex' : 'flex'}`}>
          
          {selectedServiceId && activeDraft && activeService ? (
            /* ================= EDIT MODE ================= */
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-[#204FA1]/10 text-[#204FA1] rounded-xl">
                    <Settings sx={{ fontSize: 20 }} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                      Parametrizar Canal de Atendimento
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 mt-0.5">Configure o comportamento do guichê.</p>
                  </div>
                </div>
                <button
                  onClick={() => { setSelectedServiceId(null); setShowFormOnMobile(false); }}
                  className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-800 rounded-xl transition-all"
                  title="Fechar"
                >
                  <Close sx={{ fontSize: 20 }} />
                </button>
              </div>

              {/* Form de Edição */}
              <div className="space-y-5">
                <div>
                  <label className="block text-[10px] font-black text-slate-700 uppercase tracking-wider mb-2">Nome do Guichê / Serviço</label>
                  <input
                    value={activeDraft.name}
                    onChange={(e) => updateDraft(activeService.id, 'name', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-4 focus:ring-jaboatao-blue/10 focus:border-jaboatao-blue focus:bg-white text-xs font-bold transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-700 uppercase tracking-wider mb-2">Descrição Operacional</label>
                  <textarea
                    rows={3}
                    value={activeDraft.description}
                    onChange={(e) => updateDraft(activeService.id, 'description', e.target.value)}
                    placeholder="Descreva o escopo e público-alvo deste serviço..."
                    className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-4 focus:ring-jaboatao-blue/10 focus:border-jaboatao-blue focus:bg-white text-xs font-bold transition-all duration-200 resize-none"
                  />
                </div>

                {/* Seletor de Ícones */}
                <div>
                  <label className="block text-[10px] font-black text-slate-700 uppercase tracking-wider mb-3">Identificador Visual (Ícone/Emoji)</label>
                  <div className="grid grid-cols-5 sm:grid-cols-6 gap-2.5">
                    {ICON_OPTIONS.map((opt) => {
                      const isSelected = activeDraft.icon === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => updateDraft(activeService.id, 'icon', opt.value)}
                          className={`w-11 h-11 flex items-center justify-center rounded-xl border-2 transition-all duration-150 active:scale-90 shadow-sm ${
                            isSelected 
                              ? 'border-jaboatao-blue bg-jaboatao-blue/10 text-jaboatao-blue scale-105 shadow-md shadow-blue-700/5' 
                              : 'border-slate-100 hover:border-slate-200 bg-white hover:-translate-y-0.5'
                          }`}
                          title={opt.label}
                        >
                          <ServiceIcon iconName={opt.value} className={isSelected ? 'text-[#204FA1]' : 'text-slate-600'} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-5 mt-6">
                <button
                  onClick={() => triggerDelete(activeService.id, activeService.name)}
                  disabled={isSavingId !== null}
                  className="flex items-center gap-2 py-3 px-5 text-xs font-black uppercase tracking-wider text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl active:scale-95 transition-all duration-150 disabled:opacity-50"
                >
                  <Delete sx={{ fontSize: 18 }} />
                  Desabilitar Canal
                </button>
                <button
                  onClick={() => handleSaveService(activeService.id)}
                  disabled={isSavingId !== null}
                  className="flex items-center gap-2 py-3 px-6 text-xs font-black uppercase tracking-wider text-white bg-[#2E8B57] hover:bg-[#20623A] rounded-xl shadow-lg shadow-emerald-700/10 active:scale-95 transition-all duration-150 disabled:opacity-50"
                >
                  <Save sx={{ fontSize: 18 }} />
                  {isSavingId === activeService.id ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </div>
          ) : (
            /* ================= CREATE MODE ================= */
            <form onSubmit={handleCreateService} className="space-y-6 flex flex-col justify-between h-full">
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-[#2E8B57]/10 text-jaboatao-green-prev rounded-xl">
                      <Category sx={{ fontSize: 20 }} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                        Cadastrar Novo Serviço
                      </h3>
                      <p className="text-[10px] font-bold text-slate-400 mt-0.5">Adicione um new guichê de atendimento ao JaboatãoPrev.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowFormOnMobile(false)}
                    className="lg:hidden p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-800 rounded-xl transition-all"
                    title="Voltar"
                  >
                    <Close sx={{ fontSize: 20 }} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-700 uppercase tracking-wider mb-2">Nome do Guichê / Serviço</label>
                    <input
                      type="text"
                      required
                      value={createForm.name}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: Aposentadoria e Pensão"
                      className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-4 focus:ring-jaboatao-blue/10 focus:border-jaboatao-blue focus:bg-white text-xs font-bold transition-all duration-200"
                    />
                    {formErrors.name && <p className="mt-1 text-[10px] font-bold text-rose-500">{formErrors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-700 uppercase tracking-wider mb-2">Descrição Operacional</label>
                    <textarea
                      rows={3}
                      value={createForm.description}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descreva brevemente o propósito deste guichê..."
                      className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-4 focus:ring-jaboatao-blue/10 focus:border-jaboatao-blue focus:bg-white text-xs font-bold transition-all duration-200 resize-none"
                    />
                  </div>

                  {/* Seletor de Ícones */}
                  <div>
                    <label className="block text-[10px] font-black text-slate-700 uppercase tracking-wider mb-3">Identificador Visual (Ícone/Emoji)</label>
                    <div className="grid grid-cols-5 sm:grid-cols-6 gap-2.5">
                      {ICON_OPTIONS.map((opt) => {
                        const isSelected = createForm.icon === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setCreateForm(prev => ({ ...prev, icon: opt.value }))}
                            className={`w-11 h-11 flex items-center justify-center rounded-xl border-2 transition-all duration-150 active:scale-90 shadow-sm ${
                              isSelected 
                                ? 'border-jaboatao-blue bg-jaboatao-blue/10 text-jaboatao-blue scale-105 shadow-md shadow-blue-700/5' 
                                : 'border-slate-100 hover:border-slate-200 bg-white hover:-translate-y-0.5'
                            }`}
                            title={opt.label}
                          >
                            <ServiceIcon iconName={opt.value} className={isSelected ? 'text-[#204FA1]' : 'text-slate-600'} />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Botão de Envio */}
              <div className="border-t border-slate-100 pt-5 flex justify-end">
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex items-center gap-2 py-3.5 px-8 text-xs font-black uppercase tracking-wider text-white bg-[#204FA1] hover:bg-[#1C4690] rounded-xl shadow-lg shadow-blue-700/10 active:scale-95 transition-all duration-150 disabled:opacity-50"
                >
                  <Add sx={{ fontSize: 18 }} />
                  {isCreating ? 'Adicionando...' : 'Habilitar Serviço'}
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};

export default ServiceManagementScreen;
