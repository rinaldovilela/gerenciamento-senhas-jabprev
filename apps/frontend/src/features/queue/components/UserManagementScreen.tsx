import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { z } from 'zod';
import { ApiClient, ApiError } from '@lib/api';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'operator' | 'admin';
  status: 'active' | 'inactive' | 'blocked';
}

interface UserDraft {
  name: string;
  email: string;
  role: AdminUser['role'];
  status: AdminUser['status'];
  password: string;
}

const roleOptions: Array<AdminUser['role']> = ['user', 'operator', 'admin'];
const statusOptions: Array<AdminUser['status']> = ['active', 'inactive', 'blocked'];

const createUserSchema = z.object({
  name: z.string().trim().min(2, 'Nome deve ter ao menos 2 caracteres.'),
  email: z.string().trim().email('Informe um e-mail valido.'),
  role: z.enum(roleOptions),
  password: z.string().min(8, 'Senha deve ter no minimo 8 caracteres.'),
});

const updatePasswordSchema = z
  .string()
  .trim()
  .refine((value) => value.length === 0 || value.length >= 8, {
    message: 'Nova senha deve ter no minimo 8 caracteres.',
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
      className={`fixed bottom-5 right-5 rounded-lg px-5 py-3 text-sm font-semibold text-white shadow-xl z-50 ${
        type === 'success' ? 'bg-jaboatao-green-prev' : 'bg-red-600'
      }`}
    >
      {message}
    </div>
  );
};

const UserManagementScreen: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [draftsById, setDraftsById] = useState<Record<string, UserDraft>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingId, setIsSavingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loadingError, setLoadingError] = useState('');
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
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
      };
    });
    return nextMap;
  }, []);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setLoadingError('');
    try {
      const result = await ApiClient.listUsers();
      const list = Array.isArray(result) ? (result as AdminUser[]) : [];
      setUsers(list);
      setDraftsById(buildDraftMap(list));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao carregar usuarios.';
      setLoadingError(message);
    } finally {
      setIsLoading(false);
    }
  }, [buildDraftMap]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const sortedUsers = useMemo(
    () => [...users].sort((a, b) => a.email.localeCompare(b.email, 'pt-BR')),
    [users]
  );

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
      setCreateForm({ name: '', email: '', role: 'operator', password: '' });
      showToast('Usuario criado com sucesso.', 'success');
      await loadUsers();
    } catch (error) {
      if (error instanceof ApiError && error.details?.length) {
        setFormError(error.details.join(' | '));
      } else {
        setFormError(error instanceof Error ? error.message : 'Erro ao criar usuario.');
      }
      showToast('Nao foi possivel criar o usuario.', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const updateDraft = (id: string, key: keyof UserDraft, value: string) => {
    setDraftsById((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [key]: value,
      },
    }));
  };

  const handleSaveUser = async (user: AdminUser) => {
    const draft = draftsById[user.id];
    if (!draft) return;

    const parsedPassword = updatePasswordSchema.safeParse(draft.password);
    if (!parsedPassword.success) {
      showToast(parsedPassword.error.issues[0]?.message || 'Senha invalida.', 'error');
      return;
    }

    const payload: Record<string, string> = {};
    if (draft.name !== user.name) payload.name = draft.name;
    if (draft.email !== user.email) payload.email = draft.email;
    if (draft.role !== user.role) payload.role = draft.role;
    if (draft.status !== user.status) payload.status = draft.status;
    if (draft.password.trim()) payload.password = draft.password.trim();

    if (Object.keys(payload).length === 0) {
      showToast('Nenhuma alteracao para salvar.', 'error');
      return;
    }

    setIsSavingId(user.id);
    try {
      await ApiClient.updateUser(user.id, payload);
      showToast('Usuario atualizado com sucesso.', 'success');
      await loadUsers();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar usuario.';
      showToast(message, 'error');
    } finally {
      setIsSavingId(null);
    }
  };

  const handleDeleteUser = async (user: AdminUser) => {
    const confirmed = window.confirm(`Excluir usuario ${user.email}?`);
    if (!confirmed) return;

    setIsSavingId(user.id);
    try {
      await ApiClient.deleteUser(user.id);
      showToast('Usuario excluido.', 'success');
      await loadUsers();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao excluir usuario.';
      showToast(message, 'error');
    } finally {
      setIsSavingId(null);
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

      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-montserrat text-3xl font-semibold text-text-primary">Gestao de Usuarios</h1>
          <p className="text-sm text-text-secondary">Criar, editar role/status e redefinir senha.</p>
        </div>
        <button
          onClick={loadUsers}
          className="rounded-lg border border-border-color bg-white px-4 py-2 text-sm font-semibold text-jaboatao-blue shadow-sm hover:bg-slate-50"
        >
          Atualizar Lista
        </button>
      </header>

      <section className="rounded-xl border border-border-color bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-semibold text-text-primary">Novo Usuario</h2>
        <form onSubmit={handleCreateUser} className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-text-secondary">Nome</label>
            <input
              value={createForm.name}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full rounded-lg border border-border-color p-2 text-sm"
              placeholder="Nome completo"
            />
            {fieldErrors.name && <p className="mt-1 text-xs text-red-600">{fieldErrors.name}</p>}
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-text-secondary">E-mail</label>
            <input
              value={createForm.email}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, email: e.target.value }))}
              className="w-full rounded-lg border border-border-color p-2 text-sm"
              placeholder="usuario@org.br"
            />
            {fieldErrors.email && <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>}
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-text-secondary">Role</label>
            <select
              value={createForm.role}
              onChange={(e) =>
                setCreateForm((prev) => ({ ...prev, role: e.target.value as AdminUser['role'] }))
              }
              className="w-full rounded-lg border border-border-color p-2 text-sm"
            >
              {roleOptions.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            {fieldErrors.role && <p className="mt-1 text-xs text-red-600">{fieldErrors.role}</p>}
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-text-secondary">Senha Inicial</label>
            <input
              type="password"
              value={createForm.password}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, password: e.target.value }))}
              className="w-full rounded-lg border border-border-color p-2 text-sm"
              placeholder="Minimo 8 caracteres"
            />
            {fieldErrors.password && <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>}
          </div>

          <div className="md:col-span-2 xl:col-span-4 flex items-center gap-3">
            <button
              type="submit"
              disabled={isCreating}
              className="rounded-lg bg-jaboatao-blue px-4 py-2 text-sm font-semibold text-white shadow-md hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isCreating ? 'Criando...' : 'Criar Usuario'}
            </button>
            {formError && <p className="text-sm text-red-600">{formError}</p>}
          </div>
        </form>
      </section>

      <section className="rounded-xl border border-border-color bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-semibold text-text-primary">Usuarios Cadastrados</h2>

        {isLoading ? (
          <p className="text-sm text-text-secondary">Carregando usuarios...</p>
        ) : loadingError ? (
          <p className="text-sm text-red-600">{loadingError}</p>
        ) : sortedUsers.length === 0 ? (
          <p className="text-sm text-text-secondary">Nenhum usuario encontrado.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="border-b border-border-color">
                <tr>
                  <th className="p-2">Nome</th>
                  <th className="p-2">E-mail</th>
                  <th className="p-2">Role</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Nova Senha</th>
                  <th className="p-2 text-center">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {sortedUsers.map((user) => {
                  const draft = draftsById[user.id];
                  if (!draft) return null;

                  const saving = isSavingId === user.id;
                  return (
                    <tr key={user.id} className="border-b border-border-color last:border-0">
                      <td className="p-2">
                        <input
                          value={draft.name}
                          onChange={(e) => updateDraft(user.id, 'name', e.target.value)}
                          className="w-full rounded-md border border-border-color p-2"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          value={draft.email}
                          onChange={(e) => updateDraft(user.id, 'email', e.target.value)}
                          className="w-full rounded-md border border-border-color p-2"
                        />
                      </td>
                      <td className="p-2">
                        <select
                          value={draft.role}
                          onChange={(e) => updateDraft(user.id, 'role', e.target.value)}
                          className="w-full rounded-md border border-border-color p-2"
                        >
                          {roleOptions.map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2">
                        <select
                          value={draft.status}
                          onChange={(e) => updateDraft(user.id, 'status', e.target.value)}
                          className="w-full rounded-md border border-border-color p-2"
                        >
                          {statusOptions.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2">
                        <input
                          type="password"
                          value={draft.password}
                          onChange={(e) => updateDraft(user.id, 'password', e.target.value)}
                          className="w-full rounded-md border border-border-color p-2"
                          placeholder="Opcional"
                        />
                      </td>
                      <td className="p-2">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleSaveUser(user)}
                            disabled={saving}
                            className="rounded-md bg-jaboatao-blue px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {saving ? 'Salvando...' : 'Salvar'}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user)}
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

export default UserManagementScreen;
