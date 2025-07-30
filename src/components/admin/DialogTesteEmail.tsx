
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Send, Loader2 } from 'lucide-react';
import { emailService } from '@/services/emailService';

interface TestEmailDialogProps {
  emailTemplate: {
    assunto: string;
    corpo: string;
  };
  triggerButton?: React.ReactNode;
}

const TestEmailDialog: React.FC<TestEmailDialogProps> = ({ emailTemplate, triggerButton }) => {
  const [open, setOpen] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const handleSendTestEmail = async () => {
    if (!testEmail) {
      toast({
        title: "E-mail obrigatório",
        description: "Por favor, informe um e-mail para teste.",
        variant: "destructive",
      });
      return;
    }

    setSending(true);

    try {
      const result = await emailService.sendTestEmail(testEmail, emailTemplate);

      if (result.success) {
        toast({
          title: "E-mail de teste enviado!",
          description: `E-mail enviado com sucesso para ${testEmail}`,
        });
        setOpen(false);
        setTestEmail('');
      } else {
        toast({
          title: "Erro ao enviar e-mail",
          description: result.error || "Ocorreu um erro ao enviar o e-mail de teste.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao enviar e-mail de teste:', error);
      toast({
        title: "Erro ao enviar e-mail",
        description: "Ocorreu um erro inesperado ao enviar o e-mail de teste.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button variant="outline" className="w-full">
            <Send className="h-4 w-4 mr-2" />
            Enviar E-mail de Teste
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Enviar E-mail de Teste</DialogTitle>
          <DialogDescription>
            Digite um endereço de e-mail para receber uma prévia do template com dados fictícios.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="test-email">E-mail de destino</Label>
            <Input
              id="test-email"
              type="email"
              placeholder="seu-email@exemplo.com"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
            />
          </div>
          <div className="bg-blue-50 p-3 rounded-lg text-sm">
            <strong>Dados de teste que serão usados:</strong>
            <ul className="mt-2 space-y-1">
              <li>• Empresa: Empresa de Teste Ltda</li>
              <li>• Responsável: João da Silva</li>
              <li>• CNPJ: 12.345.678/0001-90</li>
              <li>• Segmento: Indústria</li>
              <li>• Modalidade: SaaS</li>
              <li>• Valor: R$ 5.000,00</li>
            </ul>
          </div>
          <Button onClick={handleSendTestEmail} disabled={sending}>
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Enviar Teste
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TestEmailDialog;
