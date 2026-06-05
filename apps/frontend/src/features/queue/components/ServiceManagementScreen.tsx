import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@lib/supabase/client';
import { useTodayQueue } from '@features/queue/contexts/TodayQueueContext';
import ConfirmationModal from './ConfirmationModal';
import type { Service } from '@shared/types';

interface ServiceDraft {
  name: string;
  description: string;
  icon: string;
}

const ICON_OPTIONS = [
  { value: '📋', label: '📋 Geral' },
  { value: '💰', label: '💰 Financeiro' },
  { value: '📄', label: '📄 Documentos' },
  { value: '⚖️', label: '⚖️ Jurídico' },
  { value: '🏥', label: '🏥 Saúde' },
  { value: '👤', label: '👤 Cadastro' },
  { value: '🔑', label: '🔑 Acesso' },
  { value: '📊', label: '📊 Relatórios' },
  { value: '🏠', label: '🏠 Imóveis' },
  { value: '✉️', label: '✉️ Correspondência' },
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
      className={`fixed bottom-5 right-5 rounded-lg px-5 py-3 text-sm font-semibold text-white shadow-xl z-50 ${
        type === 'success' ? 'bg-jaboatao-green-prev' : 'bg-red-600'
      }`}
    >
      {message}
    </div>
  );
};

const ServiceManagementScreen: React.FC = () => {
  const { services: contextServices, refreshTodayTickets } = useTodayQueue();
  const [services, setServices] = useState<Service[]>([]);
  const [draftsById, setDraftsById] = useState<Record<string, ServiceDraft>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingId, setIsSavingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
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
  const [isDeleting, setIsDeleting] = useState(false);

  const [createForm, setCreateForm] = useState<ServiceDraft>({
    name: '',
    description: '',
    icon: '📋',
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
        icon: service.icon || '📋',
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
        icon: doc.icon || '📋',
        created_at: doc.created_at,
        updated_at: doc.updated_at,
      }));

      setServices(list);
      setDraftsById(buildDraftMap(list));
    } catch (error) {
      console.error('Erro ao carregar servicos:', error);
      showToast('Falha ao carregar servicos.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [buildDraftMap, showToast]);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  const sortedServices = useMemo(
    () => [...services].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')),
    [services]
  );

  const validateForm = (form: ServiceDraft): Record<string, string> => {
    const errors: Record<string, string> = {};
    if (!form.name.trim() || form.name.trim().length < 2) {
      errors.name = 'Nome deve ter ao menos 2 caracteres.';
    }
    return errors;
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    const errors = validateForm(createForm);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsCreating(true);
    try {
      const { error } = await supabase.from('services').insert({
        name: createForm.name.trim(),
        description: createForm.description.trim(),
        icon: createForm.icon,
      });

      if (error) throw error;

      setCreateForm({ name: '', description: '', icon: '📋' });
      showToast('Servico criado com sucesso!', 'success');
      await loadServices();
      await refreshTodayTickets();
    } catch (error) {
      console.error('Erro ao criar servico:', error);
      showToast('Erro ao criar servico.', 'error');
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

  const handleSaveService = async (service: Service) => {
    const draft = draftsById[service.id];
    if (!draft) return;

    const errors = validateForm(draft);
    if (Object.keys(errors).length > 0) {
      showToast(Object.values(errors)[0], 'error');
      return;
    }

    const payload: Record<string, string> = {};
    if (draft.name.trim() !== service.name) payload.name = draft.name.trim();
    if (draft.description.trim() !== (service.description || '')) payload.description = draft.description.trim();
    if (draft.icon !== (service.icon || '📋')) payload.icon = draft.icon;

    if (Object.keys(payload).length === 0) {
      showToast('Nenhuma alteracao para salvar.', 'error');
      return;
    }

    setIsSavingId(service.id);
    try {
      const { error } = await supabase
        .from('services')
        .update(payload)
        .eq('id', service.id);

      if (error) throw error;

      showToast('Servico atualizado com sucesso!', 'success');
      await loadServices();
      await refreshTodayTickets();
    } catch (error) {
      console.error('Erro ao atualizar servico:', error);
      showToast('Erro ao atualizar servico.', 'error');
    } finally {
      setIsSavingId(null);
    }
  };

  const handleDeleteService = async () => {
    if (!deleteModal.serviceId) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', deleteModal.serviceId);

      if (error) throw error;

      showToast('Servico excluido com sucesso!', 'success');
      setDeleteModal({ isOpen: false, serviceId: '', serviceName: '' });
      await loadServices();
      await refreshTodayTickets();
    } catch (error: any) {
      console.error('Erro ao excluir servico:', error);
      if (error?.message?.includes('violates foreign key') || error?.code === '23503') {
        showToast('Este servico possui senhas vinculadas e nao pode ser excluido.', 'error');
      } else {
        showToast('Erro ao excluir servico.', 'error');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fade-in space-y-6">
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast((prev) => ({ ...prev, show: false }))}
        />
      )}

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        title="Excluir Servico"
        message={`Tem certeza que deseja excluir o servico "${deleteModal.serviceName}"? Servicos com senhas vinculadas nao podem ser excluidos.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        isDangerous={true}
        onConfirm={handleDeleteService}
        onCancel={() => setDeleteModal({ isOpen: false, serviceId: '', serviceName: '' })}
        isLoading={isDeleting}
      />

      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-montserrat text-3xl font-semibold text-text-primary">Gestao de Servicos</h1>
          <p className="text-sm text-text-secondary">Cadastrar, editar e remover servicos de atendimento.</p>
        </div>
        <button
          onClick={loadServices}
          className="rounded-lg border border-border-color bg-white px-4 py-2 text-sm font-semibold text-jaboatao-blue shadow-sm hover:bg-slate-50"
        >
          Atualizar Lista
        </button>
      </header>

      {/* Criar novo servico */}
      <section className="rounded-xl border border-border-color bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-semibold text-text-primary">Novo Servico</h2>
        <form onSubmit={handleCreateService} className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-text-secondary">Nome do Servico *</label>
            <input
              value={createForm.name}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full rounded-lg border border-border-color p-2 text-sm"
              placeholder="Ex: Prova de Vida"
            />
            {formErrors.name && <p className="mt-1 text-xs text-red-600">{formErrors.name}</p>}
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-text-secondary">Descricao</label>
            <input
              value={createForm.description}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full rounded-lg border border-border-color p-2 text-sm"
              placeholder="Descricao breve do servico"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-text-secondary">Icone</label>
            <select
              value={createForm.icon}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, icon: e.target.value }))}
              className="w-full rounded-lg border border-border-color p-2 text-sm"
            >
              {ICON_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={isCreating}
              className="rounded-lg bg-jaboatao-blue px-4 py-2 text-sm font-semibold text-white shadow-md hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 w-full"
            >
              {isCreating ? 'Criando...' : 'Criar Servico'}
            </button>
          </div>
        </form>
      </section>

      {/* Lista de servicos */}
      <section className="rounded-xl border border-border-color bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-semibold text-text-primary">
          Servicos Cadastrados
          <span className="ml-2 text-sm font-normal text-text-secondary">({services.length})</span>
        </h2>

        {isLoading ? (
          <p className="text-sm text-text-secondary">Carregando servicos...</p>
        ) : sortedServices.length === 0 ? (
          <p className="text-sm text-text-secondary">Nenhum servico cadastrado.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="border-b-2 border-border-color">
                <tr>
                  <th className="p-3 font-semibold text-text-secondary w-12">Icone</th>
                  <th className="p-3 font-semibold text-text-secondary">Nome</th>
                  <th className="p-3 font-semibold text-text-secondary">Descricao</th>
                  <th className="p-3 font-semibold text-text-secondary text-center w-40">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {sortedServices.map((service) => {
                  const draft = draftsById[service.id];
                  if (!draft) return null;

                  const saving = isSavingId === service.id;
                  return (
                    <tr key={service.id} className="border-b border-border-color last:border-0 hover:bg-slate-50 transition-colors">
                      <td className="p-3">
                        <select
                          value={draft.icon}
                          onChange={(e) => updateDraft(service.id, 'icon', e.target.value)}
                          className="w-full rounded-md border border-border-color p-1.5 text-lg text-center"
                        >
                          {ICON_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.value}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-3">
                        <input
                          value={draft.name}
                          onChange={(e) => updateDraft(service.id, 'name', e.target.value)}
                          className="w-full rounded-md border border-border-color p-2 text-sm"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          value={draft.description}
                          onChange={(e) => updateDraft(service.id, 'description', e.target.value)}
                          className="w-full rounded-md border border-border-color p-2 text-sm"
                          placeholder="Sem descricao"
                        />
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleSaveService(service)}
                            disabled={saving}
                            className="rounded-md bg-jaboatao-blue px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {saving ? 'Salvando...' : 'Salvar'}
                          </button>
                          <button
                            onClick={() => setDeleteModal({ isOpen: true, serviceId: service.id, serviceName: service.name })}
                            disabled={saving}
                            className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default ServiceManagementScreen;
