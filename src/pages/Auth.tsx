
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, AlertCircle, Wifi, WifiOff } from 'lucide-react';

const Auth = () => {
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ email: '', password: '', fullName: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, signUp, user, isReady } = useAuth();

  // Verificar conectividade
  useEffect(() => {
    const checkConnection = async () => {
      try {
        setConnectionStatus('checking');
        const response = await fetch('https://ugwpnonuqhwjagwdpnbu.supabase.co/rest/v1/', {
          method: 'HEAD',
          timeout: 5000
        });
        setConnectionStatus(response.ok ? 'online' : 'offline');
      } catch (error) {
        console.error('Auth: Erro de conectividade:', error);
        setConnectionStatus('offline');
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 30000); // Verificar a cada 30 segundos

    return () => clearInterval(interval);
  }, []);

  // Redirecionar se já estiver autenticado
  useEffect(() => {
    if (user && isReady) {
      console.log('Auth: Usuário autenticado, redirecionando para dashboard');
      navigate('/admin/dashboard');
    }
  }, [user, isReady, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginData.email || !loginData.password) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    if (connectionStatus === 'offline') {
      toast({
        title: "Sem conexão",
        description: "Verifique sua conexão com a internet e tente novamente.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      console.log('Auth: Iniciando processo de login para:', loginData.email);
      const { error } = await signIn(loginData.email, loginData.password);

      if (error) {
        console.error('Auth: Erro no login:', error);
        
        let errorMessage = "Erro ao fazer login. Tente novamente.";
        
        if (error.message && error.message.includes('conexão')) {
          errorMessage = "Problema de conexão. Verifique sua internet e tente novamente.";
        } else if (error.message && error.message.includes('Invalid login credentials')) {
          errorMessage = "E-mail ou senha incorretos.";
        } else if (error.message) {
          errorMessage = error.message;
        }

        toast({
          title: "Erro no login",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        console.log('Auth: Login realizado com sucesso');
        toast({
          title: "Login realizado com sucesso!",
          description: "Redirecionando para o dashboard...",
        });
      }
    } catch (error) {
      console.error('Auth: Erro inesperado no login:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signupData.email || !signupData.password || !signupData.fullName) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    
    if (signupData.password !== signupData.confirmPassword) {
      toast({
        title: "Erro no cadastro",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }

    if (signupData.password.length < 6) {
      toast({
        title: "Erro no cadastro",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    if (connectionStatus === 'offline') {
      toast({
        title: "Sem conexão",
        description: "Verifique sua conexão com a internet e tente novamente.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      console.log('Auth: Iniciando processo de registro para:', signupData.email);
      const { error } = await signUp(signupData.email, signupData.password, signupData.fullName);

      if (error) {
        console.error('Auth: Erro no registro:', error);
        
        let errorMessage = "Erro ao criar conta.";
        
        if (error.message && error.message.includes('conexão')) {
          errorMessage = "Problema de conexão. Verifique sua internet e tente novamente.";
        } else if (error.message) {
          errorMessage = error.message;
        }

        toast({
          title: "Erro no cadastro",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        console.log('Auth: Registro realizado com sucesso');
        toast({
          title: "Conta criada com sucesso!",
          description: "Verifique seu e-mail para confirmar a conta.",
        });
        // Limpar formulário
        setSignupData({ email: '', password: '', fullName: '', confirmPassword: '' });
      }
    } catch (error) {
      console.error('Auth: Erro inesperado no registro:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Mostrar loading se AuthProvider ainda não estiver pronto
  if (!isReady) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Inicializando autenticação...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-blue-600">Sistema de Orçamentos</CardTitle>
          <CardDescription>Faça login ou crie sua conta</CardDescription>
          
          {/* Indicador de conectividade */}
          <div className="flex items-center justify-center gap-2 mt-2">
            {connectionStatus === 'checking' && (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                <span className="text-xs text-gray-500">Verificando conexão...</span>
              </>
            )}
            {connectionStatus === 'online' && (
              <>
                <Wifi className="h-4 w-4 text-green-500" />
                <span className="text-xs text-green-600">Conectado</span>
              </>
            )}
            {connectionStatus === 'offline' && (
              <>
                <WifiOff className="h-4 w-4 text-red-500" />
                <span className="text-xs text-red-600">Sem conexão</span>
              </>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {connectionStatus === 'offline' && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-700">
                Problema de conexão detectado. Verifique sua internet.
              </span>
            </div>
          )}
          
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Cadastro</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">E-mail</Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={loginData.email}
                    onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="seu@email.com"
                    required
                    disabled={loading || connectionStatus === 'offline'}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Senha</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Sua senha"
                    required
                    disabled={loading || connectionStatus === 'offline'}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading || connectionStatus === 'offline'}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    'Entrar'
                  )}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Nome Completo *</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    value={signupData.fullName}
                    onChange={(e) => setSignupData(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="Seu nome completo"
                    required
                    disabled={loading || connectionStatus === 'offline'}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">E-mail *</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={signupData.email}
                    onChange={(e) => setSignupData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="seu@email.com"
                    required
                    disabled={loading || connectionStatus === 'offline'}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Senha *</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={signupData.password}
                    onChange={(e) => setSignupData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Mínimo 6 caracteres"
                    required
                    minLength={6}
                    disabled={loading || connectionStatus === 'offline'}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-confirm">Confirmar Senha *</Label>
                  <Input
                    id="signup-confirm"
                    type="password"
                    value={signupData.confirmPassword}
                    onChange={(e) => setSignupData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirme sua senha"
                    required
                    disabled={loading || connectionStatus === 'offline'}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading || connectionStatus === 'offline'}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando conta...
                    </>
                  ) : (
                    'Criar Conta'
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
