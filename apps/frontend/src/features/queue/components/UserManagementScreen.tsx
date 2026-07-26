import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { z } from 'zod';
import { ApiClient, ApiError } from '@lib/api';
import { supabase } from '@lib/supabase/client';
import { 
    UserPlus, 
    Search, 
    RefreshCw, 
    Shield, 
    CheckCircle2, 
    UserX, 
    Trash2, 
    Save, 
    ArrowLeft, 
    UserCheck, 
    X, 
    User, 
    Users,
    Lock, 
    Key, 
    Filter,
    Sparkles,
    Briefcase,
    Mail,
    Camera
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  active: { label: 'Ativo', badge: 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold' },
  inactive: { label: 'Inativo', badge: 'bg-slate-500/10 border border-slate-500/30 text-slate-400' },
  blocked: { label: 'Bloqueado', badge: 'bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold animate-pulse' },
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
  const [roleFilter, setRoleFilter] = useState<'all' | AdminUser['role']>('all');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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
  }, [buildDraftMap]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter & search users
  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return users
      .filter((user) => {
        const matchesQuery = user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query);
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        return matchesQuery && matchesRole;
      })
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  }, [users, searchQuery, roleFilter]);

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
      setSelectedUserId(null);
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

  const handleAvatarUpload = async (userId: string, file: File) => {
    setIsUploading(true);
    try {
      const reader = new FileReader();
      const fileBase64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
      });

      const response = await ApiClient.uploadAvatar(userId, fileBase64, file.name);
      updateDraft(userId, 'avatarUrl', response.publicUrl);
      showToast('Foto de perfil salva. Clique em "Salvar" para aplicar.', 'success');
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
    if (!user || !window.confirm(`Tem certeza que deseja excluir o usuário ${user.name}?`)) return;

    try {
      await ApiClient.deleteUser(userId);
      showToast('Usuário excluído com sucesso.', 'success');
      if (selectedUserId === userId) setSelectedUserId(null);
      await loadData();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao excluir usuário.';
      showToast(message, 'error');
    }
  };

  const selectedUser = useMemo(() => {
    return users.find(u => u.id === selectedUserId) || null;
  }, [users, selectedUserId]);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto w-full text-slate-100 pb-8">
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast((prev) => ({ ...prev, show: false }))}
        />
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="font-montserrat text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Users size={28} className="text-amber-400" />
            Gestão de Usuários & Operadores
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">
            Gerencie credenciais, permissões de guichês e perfis da equipe de atendimento.
          </p>
        </div>

        <div className="flex items-center gap-3 self-stretch sm:self-auto">
          <button
            onClick={() => loadData()}
            className="p-2.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl transition-all text-slate-300"
            title="Atualizar Lista"
          >
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setSelectedUserId(null)}
            className="flex items-center gap-2 py-2.5 px-5 bg-gradient-to-r from-jaboatao-yellow to-amber-500 text-slate-950 font-black text-xs rounded-2xl shadow-lg shadow-amber-500/10 hover:brightness-110 active:scale-95 transition-all"
          >
            <UserPlus size={16} />
            <span>Novo Usuário</span>
          </button>
        </div>
      </div>

      {/* Grid Principal: Lista + Formulário de Edição/Criação */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Painel Esquerdo: Lista de Usuários (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/60 backdrop-blur-md rounded-3xl border border-white/10 p-6 shadow-2xl flex flex-col">
          
          {/* Barra de Pesquisa e Filtros Por Pílulas */}
          <div className="space-y-4 mb-6">
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Pesquisar por nome ou e-mail..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-950/80 border border-white/10 rounded-2xl text-xs text-white placeholder-slate-500 focus:border-amber-500/50 outline-none transition-all"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setRoleFilter('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${roleFilter === 'all' ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-white/5 border border-white/5 text-slate-400 hover:text-white'}`}
              >
                Todos ({users.length})
              </button>
              <button
                onClick={() => setRoleFilter('admin')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${roleFilter === 'admin' ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-white/5 border border-white/5 text-slate-400 hover:text-white'}`}
              >
                Admins ({users.filter(u => u.role === 'admin').length})
              </button>
              <button
                onClick={() => setRoleFilter('operator')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${roleFilter === 'operator' ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-white/5 border border-white/5 text-slate-400 hover:text-white'}`}
              >
                Operadores ({users.filter(u => u.role === 'operator').length})
              </button>
            </div>
          </div>

          {/* Cards de Usuários */}
          <div className="space-y-3 overflow-y-auto max-h-[600px] pr-1">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map(n => (
                  <div key={n} className="h-20 bg-white/5 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((userItem) => {
                const isSelected = selectedUserId === userItem.id;
                const draft = draftsById[userItem.id] || userItem;
                const statusInfo = STATUS_CONFIG[draft.status] || STATUS_CONFIG.active;

                return (
                  <div
                    key={userItem.id}
                    onClick={() => setSelectedUserId(userItem.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                      isSelected
                        ? 'bg-slate-950 border-amber-500/50 shadow-lg shadow-amber-500/5'
                        : 'bg-slate-950/40 border-white/5 hover:border-white/15 hover:bg-slate-950/60'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-yellow-500/10 border border-amber-500/30 flex items-center justify-center font-bold text-amber-400 shadow-inner shrink-0 overflow-hidden">
                        {draft.avatarUrl ? (
                          <img src={draft.avatarUrl} alt={userItem.name} className="w-full h-full object-cover" />
                        ) : (
                          userItem.name.slice(0, 2).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-white truncate flex items-center gap-2">
                          {userItem.name}
                          {userItem.role === 'admin' && <Shield size={14} className="text-amber-400 shrink-0" />}
                        </h4>
                        <p className="text-xs text-slate-400 truncate">{userItem.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] uppercase font-bold border ${statusInfo.badge}`}>
                        {statusInfo.label}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteUser(userItem.id);
                        }}
                        className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
                        title="Excluir Usuário"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-16 text-slate-500 text-xs font-bold">
                Nenhum usuário encontrado para a busca.
              </div>
            )}
          </div>
        </div>

        {/* Painel Direito: Formulário de Criação / Edição (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/60 backdrop-blur-md rounded-3xl border border-white/10 p-6 shadow-2xl flex flex-col">
          {selectedUserId && selectedUser ? (
            /* MODO EDIÇÃO */
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold overflow-hidden">
                    {draftsById[selectedUser.id]?.avatarUrl ? (
                      <img src={draftsById[selectedUser.id].avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      selectedUser.name.slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white">Editar Usuário</h3>
                    <p className="text-xs text-slate-400">{selectedUser.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedUserId(null)}
                  className="px-3 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-xs text-slate-300 font-bold"
                >
                  Novo
                </button>
              </div>

              {/* Upload de Avatar */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Foto de Perfil</label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl text-xs text-slate-200 font-bold cursor-pointer transition-all">
                    <Camera size={16} className="text-amber-400" />
                    <span>{isUploading ? 'Enviando...' : 'Carregar Imagem'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleAvatarUpload(selectedUser.id, file);
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Nome Completo</label>
                  <input
                    type="text"
                    value={draftsById[selectedUser.id]?.name || ''}
                    onChange={(e) => updateDraft(selectedUser.id, 'name', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-2xl text-xs text-white focus:border-amber-500/50 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">E-mail</label>
                  <input
                    type="email"
                    value={draftsById[selectedUser.id]?.email || ''}
                    onChange={(e) => updateDraft(selectedUser.id, 'email', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-2xl text-xs text-white focus:border-amber-500/50 outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Perfil de Acesso</label>
                    <select
                      value={draftsById[selectedUser.id]?.role || 'operator'}
                      onChange={(e) => updateDraft(selectedUser.id, 'role', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-2xl text-xs text-white focus:border-amber-500/50 outline-none cursor-pointer"
                    >
                      <option value="operator">Operador</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Status</label>
                    <select
                      value={draftsById[selectedUser.id]?.status || 'active'}
                      onChange={(e) => updateDraft(selectedUser.id, 'status', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-2xl text-xs text-white focus:border-amber-500/50 outline-none cursor-pointer"
                    >
                      <option value="active">Ativo</option>
                      <option value="inactive">Inativo</option>
                      <option value="blocked">Bloqueado</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Nova Senha (opcional)</label>
                  <input
                    type="password"
                    placeholder="Deixe em branco para manter a atual"
                    value={draftsById[selectedUser.id]?.password || ''}
                    onChange={(e) => updateDraft(selectedUser.id, 'password', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-2xl text-xs text-white focus:border-amber-500/50 outline-none transition-all"
                  />
                </div>

                {/* Vínculo de Serviços */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Serviços Permitidos</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto p-3 bg-slate-950 border border-white/5 rounded-2xl">
                    {services.map(s => {
                      const currentIds = draftsById[selectedUser.id]?.serviceIds || [];
                      const isChecked = currentIds.includes(s.id);

                      return (
                        <label key={s.id} className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              const nextIds = e.target.checked
                                ? [...currentIds, s.id]
                                : currentIds.filter(id => id !== s.id);
                              updateDraft(selectedUser.id, 'serviceIds', nextIds);
                            }}
                            className="rounded accent-amber-500"
                          />
                          <span>{s.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleSaveUser(selectedUser.id)}
                disabled={isSavingId === selectedUser.id}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-jaboatao-yellow to-amber-500 text-slate-950 font-black text-xs rounded-2xl shadow-lg shadow-amber-500/10 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
              >
                <Save size={16} />
                <span>{isSavingId === selectedUser.id ? 'Salvando...' : 'Salvar Alterações'}</span>
              </button>
            </div>
          ) : (
            /* MODO CRIAÇÃO */
            <form onSubmit={handleCreateUser} className="space-y-6">
              <div className="pb-4 border-b border-white/10">
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <UserPlus size={18} className="text-amber-400" />
                  Cadastrar Novo Usuário
                </h3>
                <p className="text-xs text-slate-400 mt-1">Preencha as informações para liberar o acesso ao sistema.</p>
              </div>

              {formError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl font-bold">
                  {formError}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Maria Silva"
                    value={createForm.name}
                    onChange={(e) => setCreateForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-2xl text-xs text-white focus:border-amber-500/50 outline-none transition-all"
                  />
                  {fieldErrors.name && <p className="text-[10px] font-bold text-rose-400 mt-1">{fieldErrors.name}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">E-mail de Acesso *</label>
                  <input
                    type="email"
                    required
                    placeholder="operador@jaboatão.pe.gov.br"
                    value={createForm.email}
                    onChange={(e) => setCreateForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-2xl text-xs text-white focus:border-amber-500/50 outline-none transition-all"
                  />
                  {fieldErrors.email && <p className="text-[10px] font-bold text-rose-400 mt-1">{fieldErrors.email}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Perfil *</label>
                    <select
                      value={createForm.role}
                      onChange={(e) => setCreateForm(f => ({ ...f, role: e.target.value as any }))}
                      className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-2xl text-xs text-white focus:border-amber-500/50 outline-none cursor-pointer"
                    >
                      <option value="operator">Operador</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Senha Inicial *</label>
                    <input
                      type="password"
                      required
                      placeholder="Mín. 8 caracteres"
                      value={createForm.password}
                      onChange={(e) => setCreateForm(f => ({ ...f, password: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-2xl text-xs text-white focus:border-amber-500/50 outline-none transition-all"
                    />
                    {fieldErrors.password && <p className="text-[10px] font-bold text-rose-400 mt-1">{fieldErrors.password}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Serviços Permitidos</label>
                  <div className="space-y-2 max-h-36 overflow-y-auto p-3 bg-slate-950 border border-white/5 rounded-2xl">
                    {services.map(s => {
                      const isChecked = createForm.serviceIds.includes(s.id);
                      return (
                        <label key={s.id} className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              const nextIds = e.target.checked
                                ? [...createForm.serviceIds, s.id]
                                : createForm.serviceIds.filter(id => id !== s.id);
                              setCreateForm(f => ({ ...f, serviceIds: nextIds }));
                            }}
                            className="rounded accent-amber-500"
                          />
                          <span>{s.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isCreating}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-jaboatao-yellow to-amber-500 text-slate-950 font-black text-xs rounded-2xl shadow-lg shadow-amber-500/10 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
              >
                <UserPlus size={16} />
                <span>{isCreating ? 'Criando Usuário...' : 'Criar Usuário'}</span>
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};

export default UserManagementScreen;
