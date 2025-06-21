
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import QuoteForm from "./components/form/QuoteForm";
import Auth from "./pages/Auth";
import Dashboard from "./pages/admin/Dashboard";
import EmailConfig from "./pages/admin/EmailConfig";
import Precificacao from "./pages/admin/Precificacao";
import Aplicativos from "./pages/admin/Aplicativos";
import DadosProdutos from "./pages/admin/DadosProdutos";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/orcamento" element={<QuoteForm />} />
            <Route path="/auth" element={<Auth />} />
            
            {/* Rotas administrativas protegidas */}
            <Route path="/admin/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/admin/email-config" element={<ProtectedRoute><EmailConfig /></ProtectedRoute>} />
            <Route path="/admin/precificacao" element={<ProtectedRoute><Precificacao /></ProtectedRoute>} />
            <Route path="/admin/aplicativos" element={<ProtectedRoute><Aplicativos /></ProtectedRoute>} />
            <Route path="/admin/dados-produtos" element={<ProtectedRoute><DadosProdutos /></ProtectedRoute>} />
            
            {/* Redirecionamento para dashboard se já autenticado */}
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            
            {/* Manter compatibilidade com /login existente */}
            <Route path="/login" element={<Navigate to="/auth" replace />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
