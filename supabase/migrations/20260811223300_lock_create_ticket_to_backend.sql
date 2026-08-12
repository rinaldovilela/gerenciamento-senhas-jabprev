-- Restringe a emissao de senhas ao backend autenticado.
--
-- Contexto: a funcao public.create_ticket tinha EXECUTE para PUBLIC (padrao do
-- Postgres) e a tabela public.tickets tinha policy de INSERT com WITH CHECK (true).
-- Combinados com a anon key, isso permitia emitir senhas ilimitadas direto pela
-- API REST, sem passar pela aplicacao (flood).
--
-- A partir daqui a emissao passa por POST /api/v1/queue/tickets, que exige JWT
-- valido (authMiddleware, qualquer role) e usa a service_role key.
--
-- Nada de SELECT e alterado: o painel publico (TV) e o carregamento da fila
-- continuam funcionando sem login, como hoje.

-- 1. Somente o backend pode executar a funcao de emissao.
REVOKE EXECUTE ON FUNCTION public.create_ticket(uuid, public.user_type, boolean, text)
  FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.create_ticket(uuid, public.user_type, boolean, text)
  TO service_role;

-- 2. Revoga o privilegio de INSERT na tabela, senao seria possivel pular a
--    funcao e inserir direto via POST /rest/v1/tickets.
--    Este REVOKE e a protecao duravel: a migration
--    20260327113000_queue_bootstrap_if_missing.sql recria a policy permissiva de
--    INSERT caso ela nao exista, mas sem o GRANT o insert continua bloqueado.
REVOKE INSERT ON public.tickets FROM anon, authenticated;

-- 3. Substitui a policy permissiva de INSERT.
DROP POLICY IF EXISTS "Users can create their own tickets." ON public.tickets;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'tickets'
      AND policyname = 'Only backend can create tickets'
  ) THEN
    CREATE POLICY "Only backend can create tickets"
      ON public.tickets
      FOR INSERT
      TO service_role
      WITH CHECK (true);
  END IF;
END $$;

-- ROLLBACK (se precisar voltar ao comportamento anterior, sem redeploy):
--
--   GRANT EXECUTE ON FUNCTION public.create_ticket(uuid, public.user_type, boolean, text)
--     TO anon, authenticated;
--   GRANT INSERT ON public.tickets TO anon, authenticated;
--   DROP POLICY IF EXISTS "Only backend can create tickets" ON public.tickets;
--   CREATE POLICY "Users can create their own tickets."
--     ON public.tickets FOR INSERT WITH CHECK (true);
