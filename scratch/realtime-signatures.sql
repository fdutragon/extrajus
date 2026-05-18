-- =====================================================================
-- 🔮 SISTEMA OPERACIONAL DO CAOS: EXTRAJUS REALTIME & TRIGGERS DE PODER
-- =====================================================================
-- Este script realiza duas ações fundamentais:
-- 1. Habilita o Supabase Realtime nas tabelas de assinaturas e notificações.
-- 2. Cria uma trigger que monitora a tabela 'signatures' e gera alertas
--    imediatos na tabela 'notifications' para o criador do contrato.

-- ---------------------------------------------------------------------
-- Passo 1: Habilitar Supabase Realtime nas Tabelas
-- ---------------------------------------------------------------------
BEGIN;
  -- Verifica se a publicação de realtime existe, se não cria
  DO $$
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
      CREATE PUBLICATION supabase_realtime;
    END IF;
  END $$;

  -- Adiciona as tabelas ao Realtime (se já não estiverem adicionadas)
  -- Nota: Usamos blocos de exceção para evitar erros caso já estejam na publicação
  DO $$
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE signatures;
  EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'A tabela signatures já está no Realtime.';
  END $$;

  DO $$
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
  EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'A tabela notifications já está no Realtime.';
  END $$;
COMMIT;

-- ---------------------------------------------------------------------
-- Passo 2: Função Trigger para Detecção e Alerta de Nova Assinatura
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION notify_on_signer_signature()
RETURNS TRIGGER AS $$
DECLARE
  contract_owner_id UUID;
  contract_title TEXT;
  signer_record RECORD;
  old_signer_signed BOOLEAN;
BEGIN
  -- 1. Buscar o proprietário do contrato (quem enviou para assinatura) e o título
  SELECT user_id, title INTO contract_owner_id, contract_title
  FROM contracts
  WHERE id = NEW.contract_id;

  -- Se o contrato não tiver proprietário, abortamos a execução
  IF contract_owner_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- 2. Iterar pelos signatários no novo estado da assinatura
  FOR signer_record IN 
    SELECT 
      (value->>'email') AS email,
      (value->>'name') AS name,
      (value->>'signed')::BOOLEAN AS signed
    FROM jsonb_array_elements(NEW.signers::jsonb)
  LOOP
    -- Somente verificamos signatários que estão marcados como assinados (signed = true)
    IF signer_record.signed = TRUE THEN
      
      -- Verificar se esse mesmo signatário já havia assinado no estado anterior (OLD)
      old_signer_signed := FALSE;
      
      IF OLD.signers IS NOT NULL THEN
        SELECT (value->>'signed')::BOOLEAN INTO old_signer_signed
        FROM jsonb_array_elements(OLD.signers::jsonb)
        WHERE (value->>'email') = signer_record.email;
      END IF;

      -- Se ele não havia assinado no OLD e assinou no NEW, enviamos a notificação em tempo real!
      IF old_signer_signed IS NOT TRUE OR old_signer_signed IS NULL THEN
        INSERT INTO notifications (user_id, title, message, type, read, created_at)
        VALUES (
          contract_owner_id,
          '✍️ Assinatura Coletada',
          signer_record.name || ' (' || signer_record.email || ') assinou o documento "' || contract_title || '".',
          'signature',
          FALSE,
          NOW()
        );
      END IF;
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ---------------------------------------------------------------------
-- Passo 3: Criar Trigger na Tabela 'signatures'
-- ---------------------------------------------------------------------
DROP TRIGGER IF EXISTS trigger_notify_on_signer_signature ON signatures;

CREATE TRIGGER trigger_notify_on_signer_signature
AFTER UPDATE ON signatures
FOR EACH ROW
WHEN (OLD.signers IS DISTINCT FROM NEW.signers)
EXECUTE FUNCTION notify_on_signer_signature();
