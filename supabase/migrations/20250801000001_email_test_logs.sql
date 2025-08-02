-- Migration: Create email_test_logs table for audit logging of email tests
-- Created: 2025-08-01

-- Create email_test_logs table
CREATE TABLE IF NOT EXISTS public.email_test_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    template_id UUID NOT NULL,
    template_name TEXT NOT NULL,
    formulario TEXT NOT NULL CHECK (formulario IN ('comply_edocs', 'comply_fiscal')),
    modalidade TEXT NOT NULL CHECK (modalidade IN ('on-premise', 'saas')),
    recipient_email TEXT NOT NULL,
    test_data JSONB,
    success BOOLEAN NOT NULL DEFAULT false,
    error_message TEXT,
    tested_by TEXT NOT NULL,
    tested_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key constraint to email_templates table
ALTER TABLE public.email_test_logs 
ADD CONSTRAINT fk_email_test_logs_template_id 
FOREIGN KEY (template_id) REFERENCES public.email_templates(id) ON DELETE CASCADE;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_email_test_logs_template_id ON public.email_test_logs(template_id);
CREATE INDEX IF NOT EXISTS idx_email_test_logs_tested_at ON public.email_test_logs(tested_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_test_logs_success ON public.email_test_logs(success);
CREATE INDEX IF NOT EXISTS idx_email_test_logs_formulario_modalidade ON public.email_test_logs(formulario, modalidade);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.email_test_logs ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to read all logs
CREATE POLICY "Allow authenticated users to read email test logs" ON public.email_test_logs
    FOR SELECT USING (auth.role() = 'authenticated');

-- Policy to allow authenticated users to insert logs
CREATE POLICY "Allow authenticated users to insert email test logs" ON public.email_test_logs
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Add comments for documentation
COMMENT ON TABLE public.email_test_logs IS 'Audit log for email template testing activities';
COMMENT ON COLUMN public.email_test_logs.template_id IS 'Reference to the email template that was tested';
COMMENT ON COLUMN public.email_test_logs.template_name IS 'Name of the template at the time of testing (for historical reference)';
COMMENT ON COLUMN public.email_test_logs.formulario IS 'Form type used in the test (comply_edocs or comply_fiscal)';
COMMENT ON COLUMN public.email_test_logs.modalidade IS 'Modality used in the test (on-premise or saas)';
COMMENT ON COLUMN public.email_test_logs.recipient_email IS 'Email address where the test email was sent';
COMMENT ON COLUMN public.email_test_logs.test_data IS 'JSON data used for template variable substitution during testing';
COMMENT ON COLUMN public.email_test_logs.success IS 'Whether the email test was successful';
COMMENT ON COLUMN public.email_test_logs.error_message IS 'Error message if the test failed';
COMMENT ON COLUMN public.email_test_logs.tested_by IS 'User who performed the test';
COMMENT ON COLUMN public.email_test_logs.tested_at IS 'Timestamp when the test was performed';
COMMENT ON COLUMN public.email_test_logs.created_at IS 'Timestamp when the log entry was created';