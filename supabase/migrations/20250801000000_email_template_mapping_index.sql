-- Migration: Add composite index for email template mapping optimization
-- This migration adds a composite index on (formulario, modalidade) for the email_templates table
-- to optimize queries for template mapping functionality

-- Create composite index for email template mapping queries
-- This index will significantly improve performance when searching for templates
-- by formulario and modalidade combination
CREATE INDEX IF NOT EXISTS idx_email_templates_mapping_composite 
ON public.email_templates(formulario, modalidade) 
WHERE ativo = true;

-- Add comment to document the purpose of this index
COMMENT ON INDEX idx_email_templates_mapping_composite IS 
'Composite index for optimizing email template mapping queries by formulario and modalidade, filtered by active templates only';

-- Create additional index for formulario alone (for fallback scenarios)
CREATE INDEX IF NOT EXISTS idx_email_templates_formulario_active 
ON public.email_templates(formulario) 
WHERE ativo = true AND modalidade IS NULL;

-- Add comment for the formulario-only index
COMMENT ON INDEX idx_email_templates_formulario_active IS 
'Index for fallback template queries by formulario only, for templates without specific modalidade';

-- Analyze the table to update statistics for the query planner
ANALYZE public.email_templates;