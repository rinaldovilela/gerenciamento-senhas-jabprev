# Supabase Setup - Gerenciamento de Senhas JabPrev

## ✅ Configuração Concluída

### Informações do Projeto

- **Nome**: gerenciamento-senhas-jabprev
- **Referência**: vrxlaphgwzmtwoweecjp
- **Região**: South America (São Paulo)
- **URL**: https://vrxlaphgwzmtwoweecjp.supabase.co
- **Dashboard**: https://supabase.com/dashboard/project/vrxlaphgwzmtwoweecjp

### Credenciais de Acesso

As seguintes credenciais foram adicionadas ao arquivo `.env.local`:

```env
VITE_SUPABASE_URL=https://vrxlaphgwzmtwoweecjp.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyeGxhcGhnd3ptdHdvd2VlY2pwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0NDQ0MTcsImV4cCI6MjA5MDAyMDQxN30.Jdd7rjTTsSAzdOR6p1AGzD4qvKF2DOhlA-x6nMZ1yz8
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyeGxhcGhnd3ptdHdvd2VlY2pwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDQ0NDQxNywiZXhwIjoyMDkwMDIwNDE3fQ.2bWlnntFdnMpe_XcHITiGaIrcNaSCaAvjw8zCWCyG_8
```

### O que foi feito

1. ✅ **Instalação da CLI**: Supabase CLI v2.78.1 instalada via Scoop
2. ✅ **Autenticação**: Login realizado com token de acesso
3. ✅ **Criação do Projeto**: Projeto `gerenciamento-senhas-jabprev` criado na região São Paulo
4. ✅ **Link Local**: Projeto local vinculado ao projeto remoto
5. ✅ **Migrações**: Schema inicial aplicado (arquivo `0000_initial_schema.sql`)
6. ✅ **Configuração**: Variáveis de ambiente adicionadas ao `.env.local`

### Próximos Passos

1. **Gerar tipos TypeScript** (opcional mas recomendado):
   ```bash
   supabase gen types typescript --project-ref vrxlaphgwzmtwoweecjp > types/supabase.ts
   ```

2. **Iniciar o servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```

3. **Usar o cliente Supabase** na aplicação:
   ```typescript
   import { supabase } from './supabase/client';
   
   // Exemplo: obter dados
   const { data, error } = await supabase
     .from('sua_tabela')
     .select('*');
   ```

### Informações Importantes

- **Senha de Banco de Dados**: `JabPrev@DB#12345` (salve em local seguro)
- **Token de Acesso**: Já autenticado na CLI
- **API Anon Key**: Use para operações do cliente (públicas)
- **Service Role Key**: Use no servidor para operações privilegiadas (NUNCA exponha ao cliente)

### Documentação Útil

- [Supabase CLI Documentation](https://supabase.com/docs/reference/cli/introduction)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript/introduction)
- [Database Migrations](https://supabase.com/docs/guides/cli/local-development)

---

Configuração realizada em: 2026-03-25 13:13:37 UTC
