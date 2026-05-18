-- ====================================================================
-- SCRIPT DE INFRAESTRUTURA EXTRAJUS — ADICIONAR COLUNA OCCUPATION
-- ====================================================================
-- Como a coluna 'username' não existia originalmente na tabela 'profiles',
-- o comando de renomeação falhou.
--
-- O comando correto abaixo ADICIONA a coluna 'occupation' diretamente
-- na tabela 'profiles' para que você possa utilizá-la como desejar.
--
-- Como executar:
-- Copie e cole este script diretamente no painel "SQL Editor" do seu Supabase.
-- ====================================================================

-- 1. Adiciona a coluna occupation à tabela profiles
ALTER TABLE profiles ADD COLUMN occupation VARCHAR(255);

-- 2. Adiciona um comentário formal à coluna para manter a documentação da estrutura.
COMMENT ON COLUMN profiles.occupation IS 'A ocupação profissional ou cargo jurídico do usuário';

-- 3. Mensagem de sucesso
SELECT 'Migração concluída com sucesso! A coluna occupation foi adicionada à tabela profiles.' AS status;
