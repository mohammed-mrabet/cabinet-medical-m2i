--------------------------------------------------------------------------------
-- 06_voir_erreur_trigger.sql
-- Affiche le detail exact de l'erreur de compilation du trigger
-- TRG_RDV_ANTI_DOUBLON, pour diagnostiquer precisement le probleme.
--
-- A executer connecte en tant que cabinet_medical :
--   SQL> @06_voir_erreur_trigger.sql
--------------------------------------------------------------------------------

SET PAGESIZE 200
SET LINESIZE 200
COLUMN line FORMAT 999
COLUMN position FORMAT 999
COLUMN text FORMAT A150

PROMPT === Erreurs de compilation sur TRG_RDV_ANTI_DOUBLON ===
SELECT line, position, text
FROM user_errors
WHERE name = 'TRG_RDV_ANTI_DOUBLON'
ORDER BY sequence;

PROMPT
PROMPT === Equivalent via SHOW ERRORS ===
SHOW ERRORS TRIGGER trg_rdv_anti_doublon;
