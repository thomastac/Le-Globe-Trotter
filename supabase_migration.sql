-- 1. Ajouter la colonne `submission_number` (autorisée à être nulle dans un premier temps)
ALTER TABLE submissions ADD COLUMN submission_number INTEGER;

-- 2. Remplir la colonne avec l'ordre chronologique existant (du plus ancien au plus récent)
WITH chronological AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY submitted_at ASC) as row_num
  FROM submissions
)
UPDATE submissions
SET submission_number = chronological.row_num
FROM chronological
WHERE submissions.id = chronological.id;

-- (Optionnel mais recommandé) Rendre la colonne non-nulle et unique maintenant qu'elle est remplie
ALTER TABLE submissions ALTER COLUMN submission_number SET NOT NULL;
ALTER TABLE submissions ADD CONSTRAINT unique_submission_number UNIQUE (submission_number);

-- 3. Fonction et Trigger pour l'INSERTION (Nouvelle anecdote = N + 1)
CREATE OR REPLACE FUNCTION assign_submission_number()
RETURNS TRIGGER AS $$
BEGIN
  SELECT COALESCE(MAX(submission_number), 0) + 1 INTO NEW.submission_number FROM submissions;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_assign_submission_number ON submissions;
CREATE TRIGGER trigger_assign_submission_number
BEFORE INSERT ON submissions
FOR EACH ROW
EXECUTE FUNCTION assign_submission_number();

-- 4. Fonction et Trigger pour la SUPPRESSION (Re-numérotation pour éviter les trous)
CREATE OR REPLACE FUNCTION renumber_submissions_after_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- Décrémente de 1 le numéro de toutes les anecdotes ayant un numéro supérieur à celui supprimé
  UPDATE submissions
  SET submission_number = submission_number - 1
  WHERE submission_number > OLD.submission_number;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_renumber_submissions ON submissions;
CREATE TRIGGER trigger_renumber_submissions
AFTER DELETE ON submissions
FOR EACH ROW
EXECUTE FUNCTION renumber_submissions_after_delete();
