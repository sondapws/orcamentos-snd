
import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  loading: boolean;
  isReady: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    let retryCount = 0;
    const maxRetries = 3;

    console.log('AuthProvider: Iniciando configuração de autenticação');

    // Função para tentar conectar com retry
    const initializeAuth = async () => {
      try {
        console.log('AuthProvider: Tentando conectar ao Supabase...');
        
        // Configurar listener de mudanças de autenticação
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, session) => {
            console.log('AuthProvider: Auth state change:', event, session?.user?.email);
            if (mounted) {
              setSession(session);
              setUser(session?.user ?? null);
              if (!isReady) {
                setIsReady(true);
              }
              setLoading(false);
            }
          }
        );

        // Verificar sessão existente
        console.log('AuthProvider: Verificando sessão existente...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('AuthProvider: Erro ao obter sessão:', error);
          throw error;
        }
        
        console.log('AuthProvider: Sessão inicial obtida:', session?.user?.email || 'nenhuma sessão');
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setIsReady(true);
          setLoading(false);
        }

        return () => {
          subscription.unsubscribe();
        };

      } catch (error) {
        console.error('AuthProvider: Erro na inicialização:', error);
        
        if (retryCount < maxRetries && mounted) {
          retryCount++;
          console.log(`AuthProvider: Tentativa ${retryCount} de ${maxRetries} em 2 segundos...`);
          setTimeout(() => {
            if (mounted) {
              initializeAuth();
            }
          }, 2000);
        } else {
          console.error('AuthProvider: Máximo de tentativas atingido ou componente desmontado');
          if (mounted) {
            setIsReady(true);
            setLoading(false);
          }
        }
      }
    };

    const cleanup = initializeAuth();

    return () => {
      mounted = false;
      if (cleanup && typeof cleanup.then === 'function') {
        cleanup.then(cleanupFn => {
          if (cleanupFn && typeof cleanupFn === 'function') {
            cleanupFn();
          }
        });
      }
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      try {
        console.log('AuthProvider: Tentativa de login:', email, `(tentativa ${retryCount + 1})`);
        
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          console.error('AuthProvider: Erro de login:', error.message);
          return { error };
        }
        
        console.log('AuthProvider: Login bem-sucedido');
        return { error: null };

      } catch (error) {
        console.error('AuthProvider: Erro de rede no login:', error);
        retryCount++;
        
        if (retryCount < maxRetries) {
          console.log(`AuthProvider: Tentando novamente em 1 segundo... (${retryCount}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
          return { 
            error: { 
              message: 'Erro de conexão. Verifique sua internet e tente novamente.' 
            } 
          };
        }
      }
    }

    return { 
      error: { 
        message: 'Erro de conexão após múltiplas tentativas.' 
      } 
    };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      console.log('AuthProvider: Tentativa de registro:', email);
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
          }
        }
      });
      
      if (error) {
        console.error('AuthProvider: Erro de registro:', error);
        return { error };
      }
      
      console.log('AuthProvider: Registro bem-sucedido');
      return { error: null };
    } catch (error) {
      console.error('AuthProvider: Erro de rede no registro:', error);
      return { 
        error: { 
          message: 'Erro de conexão. Verifique sua internet e tente novamente.' 
        } 
      };
    }
  };

  const signOut = async () => {
    try {
      console.log('AuthProvider: Fazendo logout');
      await supabase.auth.signOut();
    } catch (error) {
      console.error('AuthProvider: Erro no logout:', error);
    }
  };

  const value = {
    user,
    session,
    signIn,
    signUp,
    signOut,
    loading,
    isReady,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
