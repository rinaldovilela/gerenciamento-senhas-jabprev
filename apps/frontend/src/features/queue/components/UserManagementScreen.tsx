import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { z } from 'zod';
import { ApiClient, ApiError } from '@lib/api';
import { supabase } from '@lib/supabase/client';
import { 
    PersonAdd, 
    Search, 
    Refresh, 
    Shield, 
    CheckCircle, 
    Block, 
    Delete, 
    Save, 
    ArrowBack, 
    AssignmentInd,
    Close,
    ManageAccounts,
    Person
} from '@mui/icons-material';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'operator' | 'admin';
  status: 'active' | 'inactive' | 'blocked';
  serviceIds?: string[];
  avatarUrl?: string;
}

interface UserDraft {
  name: string;
  email: string;
  role: AdminUser['role'];
  status: AdminUser['status'];
  password: string;
  serviceIds: string[];
  avatarUrl: string;
}

const roleOptions: Array<AdminUser['role']> = ['user', 'operator', 'admin'];
const statusOptions: Array<AdminUser['status']> = ['active', 'inactive', 'blocked'];

const ROLE_LABELS: Record<AdminUser['role'], string> = {
  admin: 'Administrador',
  operator: 'Operador',
  user: 'Usuário',
};

const STATUS_CONFIG: Record<AdminUser['status'], { label: string; badge: string }> = {
  active: { label: 'Ativo', badge: 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-600' },
  inactive: { label: 'Inativo', badge: 'bg-slate-500/10 border border-slate-500/30 text-slate-500' },
  blocked: { label: 'Bloqueado', badge: 'bg-rose-500/10 border border-rose-500/30 text-rose-600 font-bold animate-pulse' },
};

const createUserSchema = z.object({
  name: z.string().trim().min(2, 'Nome deve ter ao menos 2 caracteres.'),
  email: z.string().trim().email('Informe um e-mail válido.'),
  role: z.enum(roleOptions),
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres.'),
  serviceIds: z.array(z.string()).optional(),
});

const updatePasswordSchema = z
  .string()
  .trim()
  .refine((value) => value.length === 0 || value.length >= 8, {
    message: 'Nova senha deve ter no mínimo 8 caracteres.',
  });

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

const UserManagementScreen: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [services, setServices] = useState<{id: string; name: string}[]>([]);
  const [draftsById, setDraftsById] = useState<Record<string, UserDraft>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingId, setIsSavingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loadingError, setLoadingError] = useState('');
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  
  // HUD UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null); // null means "Create Mode"
  const [isEditMode, setIsEditMode] = useState(false);
  const [showFormOnMobile, setShowFormOnMobile] = useState(false);

  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success',
  });

  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    role: 'operator' as AdminUser['role'],
    password: '',
    serviceIds: [] as string[],
  });

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type });
  }, []);

  const buildDraftMap = useCallback((rows: AdminUser[]) => {
    const nextMap: Record<string, UserDraft> = {};
    rows.forEach((user) => {
      nextMap[user.id] = {
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        password: '',
        serviceIds: user.serviceIds || [],
        avatarUrl: user.avatarUrl || '',
      };
    });
    return nextMap;
  }, []);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setLoadingError('');
    try {
      const [usersResult, servicesResult] = await Promise.all([
        ApiClient.listUsers(),
        supabase.from('services').select('id, name').order('name', { ascending: true })
      ]);
      const list = Array.isArray(usersResult) ? (usersResult as AdminUser[]) : [];
      setUsers(list);
      setDraftsById(buildDraftMap(list));
      
      const srvList = servicesResult.data || [];
      setServices(srvList);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao carregar dados.';
      setLoadingError(message);
    } finally {
      setIsLoading(false);
    }
  }, [buildDraftMap, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter & search users
  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return users
      .filter((user) => {
        return (
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  }, [users, searchQuery]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFieldErrors({});

    const parsed = createUserSchema.safeParse(createForm);
    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      setFieldErrors({
        name: errors.name?.[0] || '',
        email: errors.email?.[0] || '',
        role: errors.role?.[0] || '',
        password: errors.password?.[0] || '',
      });
      return;
    }

    setIsCreating(true);
    try {
      await ApiClient.createUser(parsed.data);
      setCreateForm({ name: '', email: '', role: 'operator', password: '', serviceIds: [] });
      showToast('Usuário criado com sucesso.', 'success');
      await loadData();
      setSelectedUserId(null); // Keep in create mode or select new
    } catch (error) {
      if (error instanceof ApiError && error.details?.length) {
        setFormError(error.details.join(' | '));
      } else {
        setFormError(error instanceof Error ? error.message : 'Erro ao criar usuário.');
      }
      showToast('Não foi possível criar o usuário.', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const updateDraft = (id: string, key: keyof UserDraft, value: any) => {
    setDraftsById((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [key]: value,
      },
    }));
  };

  const [isUploading, setIsUploading] = useState(false);

  const handleAvatarUpload = async (userId: string, file: File) => {
    setIsUploading(true);
    try {
      const reader = new FileReader();
      
      const fileBase64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
      });

      // Upload to backend API instead of Supabase Storage directly
      const response = await ApiClient.uploadAvatar(userId, fileBase64, file.name);
      
      // Update draft state
      updateDraft(userId, 'avatarUrl', response.publicUrl);
      showToast('Foto de perfil carregada. Salve o usuário para persistir.', 'success');
    } catch (error: any) {
      console.error('Erro no upload da imagem:', error);
      showToast('Erro ao carregar imagem: ' + (error.message || error), 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveUser = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    const draft = draftsById[userId];
    if (!user || !draft) return;

    const parsedPassword = updatePasswordSchema.safeParse(draft.password);
    if (!parsedPassword.success) {
      showToast(parsedPassword.error.issues[0]?.message || 'Senha inválida.', 'error');
      return;
    }

    const payload: Record<string, any> = {};
    if (draft.name !== user.name) payload.name = draft.name;
    if (draft.email !== user.email) payload.email = draft.email;
    if (draft.role !== user.role) payload.role = draft.role;
    if (draft.status !== user.status) payload.status = draft.status;
    if (draft.password.trim()) payload.password = draft.password.trim();
    if (draft.avatarUrl !== (user.avatarUrl || '')) payload.avatarUrl = draft.avatarUrl;
    if (JSON.stringify(draft.serviceIds) !== JSON.stringify(user.serviceIds || [])) {
      payload.serviceIds = draft.serviceIds;
    }

    if (Object.keys(payload).length === 0) {
      showToast('Nenhuma alteração para salvar.', 'error');
      return;
    }

    setIsSavingId(userId);
    try {
      await ApiClient.updateUser(userId, payload);
      showToast('Usuário atualizado com sucesso.', 'success');
      await loadData();
      updateDraft(userId, 'password', '');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar usuário.';
      showToast(message, 'error');
    } finally {
      setIsSavingId(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const confirmed = window.confirm(`Deseja realmente excluir o usuário ${user.email}?`);
    if (!confirmed) return;

    setIsSavingId(userId);
    try {
      await ApiClient.deleteUser(userId);
      showToast('Usuário excluído com sucesso.', 'success');
      setSelectedUserId(null);
      await loadData();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao excluir usuário.';
      showToast(message, 'error');
    } finally {
      setIsSavingId(null);
    }
  };

  const activeUser = useMemo(() => {
    return users.find(u => u.id === selectedUserId) || null;
  }, [users, selectedUserId]);

  const activeDraft = useMemo(() => {
    if (!selectedUserId) return null;
    return draftsById[selectedUserId] || null;
  }, [draftsById, selectedUserId]);

  return (
    <div className="flex flex-col h-full gap-6 w-full text-slate-800">
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast((prev) => ({ ...prev, show: false }))}
        />
      )}

      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/50 pb-5">
        <div>
          <h1 className="font-montserrat text-3xl font-black text-slate-900 tracking-tight">
            Gestão de Credenciais
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-semibold">
            Cadastre novos operadores, configure níveis de acesso e vincule guichês.
          </p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-2 py-2.5 px-5 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:bg-slate-50 active:scale-95 transition-all duration-200 self-stretch sm:self-auto justify-center"
        >
          <Refresh sx={{ fontSize: 18 }} />
          Atualizar Fila
        </button>
      </header>

      {/* Cockpit Asimétrico (Master-Detail Layout) */}
      <div className="flex flex-col lg:flex-row gap-6 items-stretch flex-grow min-h-[500px]">
        
        {/* COLUNA ESQUERDA: Entity Deck */}
        <div className={`w-full lg:w-96 flex flex-col gap-4 bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-3xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.02)] ${showFormOnMobile ? 'hidden lg:flex' : 'flex'}`}>
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest">
              Usuários cadastrados ({filteredUsers.length})
            </h2>
            <button
              onClick={() => { setSelectedUserId(null); setIsEditMode(false); setShowFormOnMobile(true); }}
              className="flex items-center justify-center gap-1.5 px-3 py-2 text-[10px] font-black uppercase text-white bg-gradient-to-r from-jaboatao-blue to-[#2B6CB0] hover:shadow-md active:scale-95 rounded-xl transition-all duration-150"
            >
              <PersonAdd sx={{ fontSize: 14 }} />
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
              placeholder="Buscar por nome ou e-mail..."
              className="w-full pl-10 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-jaboatao-blue/5 focus:border-jaboatao-blue focus:bg-white text-xs font-bold transition-all duration-200"
            />
          </div>

          {/* List Deck */}
          <div className="flex-grow overflow-y-auto lg:max-h-[500px] space-y-2 pr-1">
            {isLoading ? (
              <div className="py-16 text-center">
                <div className="animate-spin inline-block w-8 h-8 border-[3px] border-current border-t-transparent text-jaboatao-blue rounded-full mb-3"></div>
                <p className="text-xs font-bold text-slate-400">Carregando credenciais...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <p className="text-center text-slate-400 py-16 text-xs font-bold">Nenhum operador encontrado.</p>
            ) : (
              filteredUsers.map((user) => {
                const isSelected = selectedUserId === user.id;
                const initials = user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
                
                return (
                  <button
                    key={user.id}
                    onClick={() => { setSelectedUserId(user.id); setIsEditMode(true); setShowFormOnMobile(true); }}
                    className={`w-full text-left p-3.5 rounded-2xl border-2 flex items-center justify-between gap-4 transition-all duration-200 group active:scale-[0.97] ${
                      isSelected 
                        ? 'border-[#204FA1] bg-[#204FA1]/5 shadow-sm' 
                        : 'border-slate-100/80 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black shrink-0 shadow-sm overflow-hidden transition-colors ${
                        isSelected 
                          ? 'bg-gradient-to-tr from-jaboatao-blue to-[#407BDE] text-white' 
                          : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                      }`}>
                        {user.avatarUrl ? (
                          <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          initials || 'OP'
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-black text-slate-800 truncate">{user.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 truncate mt-0.5">{user.email}</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider border ${STATUS_CONFIG[user.status].badge}`}>
                        {STATUS_CONFIG[user.status].label}
                      </span>
                      <span className="text-[9px] font-black text-slate-400 group-hover:text-slate-800 transition-colors">
                        {ROLE_LABELS[user.role]}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* COLUNA DIREITA: Control Console (Terminal de Operações) */}
        <div className={`flex-grow bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] flex flex-col justify-between ${!showFormOnMobile ? 'hidden lg:flex' : 'flex'}`}>
          
          {selectedUserId && activeDraft && activeUser ? (
            /* ================= EDIT MODE ================= */
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-[#204FA1]/10 text-[#204FA1] rounded-xl">
                    <Shield sx={{ fontSize: 20 }} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                      Painel de Controle do Usuário
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 mt-0.5">{activeUser.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => { setSelectedUserId(null); setShowFormOnMobile(false); }}
                  className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-800 rounded-xl transition-all"
                  title="Fechar"
                >
                  <Close sx={{ fontSize: 20 }} />
                </button>
              </div>

              {/* Form de Edição */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2 flex items-center gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                  <div className="relative w-16 h-16 rounded-2xl bg-slate-200 flex items-center justify-center overflow-hidden border-2 border-white shadow-md shrink-0">
                    {activeDraft.avatarUrl ? (
                      <img src={activeDraft.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <Person className="text-slate-400" sx={{ fontSize: 32 }} />
                    )}
                    {isUploading && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                      </div>
                    )}
                  </div>
                  <div className="flex-grow">
                    <label className="block text-[10px] font-black text-slate-700 uppercase tracking-wider mb-1.5">Foto de Perfil</label>
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer bg-white hover:bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase text-slate-700 tracking-wider shadow-sm transition-all active:scale-95 flex items-center gap-1.5">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) await handleAvatarUpload(activeUser.id, file);
                          }}
                          disabled={isUploading}
                        />
                        Selecionar Foto
                      </label>
                      {activeDraft.avatarUrl && (
                        <button
                          type="button"
                          onClick={() => updateDraft(activeUser.id, 'avatarUrl', '')}
                          className="bg-rose-50 hover:bg-rose-100 border border-rose-200/50 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase text-rose-600 tracking-wider transition-all active:scale-95"
                          disabled={isUploading}
                        >
                          Remover
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-700 uppercase tracking-wider mb-2">Nome Completo</label>
                  <input
                    value={activeDraft.name}
                    onChange={(e) => updateDraft(activeUser.id, 'name', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-4 focus:ring-jaboatao-blue/10 focus:border-jaboatao-blue focus:bg-white text-xs font-bold transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-700 uppercase tracking-wider mb-2">E-mail Corporativo</label>
                  <input
                    value={activeDraft.email}
                    onChange={(e) => updateDraft(activeUser.id, 'email', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-4 focus:ring-jaboatao-blue/10 focus:border-jaboatao-blue focus:bg-white text-xs font-bold transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-700 uppercase tracking-wider mb-2">Perfil de Acesso</label>
                  <select
                    value={activeDraft.role}
                    onChange={(e) => updateDraft(activeUser.id, 'role', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-4 focus:ring-jaboatao-blue/10 focus:border-jaboatao-blue focus:bg-white text-xs font-bold transition-all duration-200 cursor-pointer"
                  >
                    {roleOptions.map((role) => (
                      <option key={role} value={role}>
                        {ROLE_LABELS[role]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-700 uppercase tracking-wider mb-2">Status da Conta</label>
                  <select
                    value={activeDraft.status}
                    onChange={(e) => updateDraft(activeUser.id, 'status', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-4 focus:ring-jaboatao-blue/10 focus:border-jaboatao-blue focus:bg-white text-xs font-bold transition-all duration-200 cursor-pointer"
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {STATUS_CONFIG[status].label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-slate-700 uppercase tracking-wider mb-2">Nova Senha (Reset)</label>
                  <input
                    type="password"
                    value={activeDraft.password}
                    onChange={(e) => updateDraft(activeUser.id, 'password', e.target.value)}
                    placeholder="Deixe em branco para manter a senha atual"
                    className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-4 focus:ring-jaboatao-blue/10 focus:border-jaboatao-blue focus:bg-white text-xs transition-all duration-200"
                  />
                </div>
              </div>

              {/* Serviços Vinculados (apenas se for operador) */}
              {activeDraft.role === 'operator' && (
                <div className="border-t border-slate-100 pt-5 mt-4">
                  <label className="block text-[10px] font-black text-slate-700 uppercase tracking-wider mb-3">
                    Vincular Serviços a este Operador
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {services.map(s => {
                      const isLinked = activeDraft.serviceIds.includes(s.id);
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            const currentList = [...activeDraft.serviceIds];
                            if (isLinked) {
                              updateDraft(activeUser.id, 'serviceIds', currentList.filter(id => id !== s.id));
                            } else {
                              updateDraft(activeUser.id, 'serviceIds', [...currentList, s.id]);
                            }
                          }}
                          className={`flex items-center gap-2.5 p-3 rounded-xl border-2 text-left text-xs font-bold transition-all duration-150 active:scale-95 ${
                            isLinked 
                              ? 'border-jaboatao-blue bg-jaboatao-blue/5 text-[#204FA1]' 
                              : 'border-slate-100 hover:border-slate-200 bg-white text-slate-600'
                          }`}
                        >
                          <span className={`w-4 h-4 rounded-md flex items-center justify-center border text-[9px] ${isLinked ? 'bg-jaboatao-blue border-jaboatao-blue text-white' : 'border-slate-300 bg-white'}`}>
                            {isLinked ? '✓' : ''}
                          </span>
                          <span className="truncate">{s.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Botões de Ação */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-5 mt-6">
                <button
                  onClick={() => handleDeleteUser(activeUser.id)}
                  disabled={isSavingId !== null}
                  className="flex items-center gap-2 py-3 px-5 text-xs font-black uppercase tracking-wider text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl active:scale-95 transition-all duration-150 disabled:opacity-50"
                >
                  <Delete sx={{ fontSize: 18 }} />
                  Excluir Operador
                </button>
                <button
                  onClick={() => handleSaveUser(activeUser.id)}
                  disabled={isSavingId !== null}
                  className="flex items-center gap-2 py-3 px-6 text-xs font-black uppercase tracking-wider text-white bg-[#2E8B57] hover:bg-[#20623A] rounded-xl shadow-lg shadow-emerald-700/10 active:scale-95 transition-all duration-150 disabled:opacity-50"
                >
                  <Save sx={{ fontSize: 18 }} />
                  {isSavingId === activeUser.id ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </div>
          ) : (
            /* ================= CREATE MODE ================= */
            <form onSubmit={handleCreateUser} className="space-y-6 flex flex-col justify-between h-full">
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-[#2E8B57]/10 text-jaboatao-green-prev rounded-xl">
                      <PersonAdd sx={{ fontSize: 20 }} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                        Cadastrar Novo Usuário
                      </h3>
                      <p className="text-[10px] font-bold text-slate-400 mt-0.5">Preencha as informações básicas de acesso.</p>
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

                {formError && (
                  <div className="p-4 rounded-xl bg-rose-50 border-2 border-rose-100 text-xs font-bold text-rose-600">
                    ⚠️ {formError}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[10px] font-black text-slate-700 uppercase tracking-wider mb-2">Nome Completo</label>
                    <input
                      type="text"
                      required
                      value={createForm.name}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: João da Silva"
                      className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-4 focus:ring-jaboatao-blue/10 focus:border-jaboatao-blue focus:bg-white text-xs font-bold transition-all duration-200"
                    />
                    {fieldErrors.name && <p className="mt-1 text-[10px] font-bold text-rose-500">{fieldErrors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-700 uppercase tracking-wider mb-2">E-mail Corporativo</label>
                    <input
                      type="email"
                      required
                      value={createForm.email}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="nome@jaboataoprev.pe.gov.br"
                      className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-4 focus:ring-jaboatao-blue/10 focus:border-jaboatao-blue focus:bg-white text-xs font-bold transition-all duration-200"
                    />
                    {fieldErrors.email && <p className="mt-1 text-[10px] font-bold text-rose-500">{fieldErrors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-700 uppercase tracking-wider mb-2">Perfil de Acesso</label>
                    <select
                      value={createForm.role}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, role: e.target.value as any }))}
                      className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-4 focus:ring-jaboatao-blue/10 focus:border-jaboatao-blue focus:bg-white text-xs font-bold transition-all duration-200 cursor-pointer"
                    >
                      {roleOptions.map((role) => (
                        <option key={role} value={role}>
                          {ROLE_LABELS[role]}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-700 uppercase tracking-wider mb-2">Senha Provisória</label>
                    <input
                      type="password"
                      required
                      value={createForm.password}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Mínimo 8 caracteres"
                      className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-4 focus:ring-jaboatao-blue/10 focus:border-jaboatao-blue focus:bg-white text-xs transition-all duration-200"
                    />
                    {fieldErrors.password && <p className="mt-1 text-[10px] font-bold text-rose-500">{fieldErrors.password}</p>}
                  </div>
                </div>

                {/* Serviços Vinculados (apenas se for operador) */}
                {createForm.role === 'operator' && (
                  <div className="border-t border-slate-100 pt-5 mt-4">
                    <label className="block text-[10px] font-black text-slate-700 uppercase tracking-wider mb-3">
                      Vincular Serviços Iniciais
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                      {services.map(s => {
                        const isLinked = createForm.serviceIds.includes(s.id);
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => {
                              const currentList = [...createForm.serviceIds];
                              if (isLinked) {
                                setCreateForm(prev => ({ ...prev, serviceIds: currentList.filter(id => id !== s.id) }));
                              } else {
                                setCreateForm(prev => ({ ...prev, serviceIds: [...currentList, s.id] }));
                              }
                            }}
                            className={`flex items-center gap-2.5 p-3 rounded-xl border-2 text-left text-xs font-bold transition-all duration-150 active:scale-95 ${
                              isLinked 
                                ? 'border-jaboatao-blue bg-jaboatao-blue/5 text-[#204FA1]' 
                                : 'border-slate-100 hover:border-slate-200 bg-white text-slate-600'
                            }`}
                          >
                            <span className={`w-4 h-4 rounded-md flex items-center justify-center border text-[9px] ${isLinked ? 'bg-jaboatao-blue border-jaboatao-blue text-white' : 'border-slate-300 bg-white'}`}>
                              {isLinked ? '✓' : ''}
                            </span>
                            <span className="truncate">{s.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Botão de Envio */}
              <div className="border-t border-slate-100 pt-5 flex justify-end">
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex items-center gap-2 py-3.5 px-8 text-xs font-black uppercase tracking-wider text-white bg-[#204FA1] hover:bg-[#1C4690] rounded-xl shadow-lg shadow-blue-700/10 active:scale-95 transition-all duration-150 disabled:opacity-50"
                >
                  <Save sx={{ fontSize: 18 }} />
                  {isCreating ? 'Cadastrando...' : 'Cadastrar Credencial'}
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};

export default UserManagementScreen;
