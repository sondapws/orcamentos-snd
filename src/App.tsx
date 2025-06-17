
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import QuoteForm from "./components/form/QuoteForm";
import Login from "./pages/Login";
import Dashboard from "./pages/admin/Dashboard";
import EmailConfig from "./pages/admin/EmailConfig";
import Precificacao from "./pages/admin/Precificacao";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Componente para proteger rotas administrativas
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/orcamento" element={<QuoteForm />} />
          <Route path="/login" element={<Login />} />
          
          {/* Rotas administrativas protegidas */}
          <Route path="/admin/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/admin/email-config" element={<ProtectedRoute><EmailConfig /></ProtectedRoute>} />
          <Route path="/admin/precificacao" element={<ProtectedRoute><Precificacao /></ProtectedRoute>} />
          
          {/* Redirecionamento para dashboard se já autenticado */}
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
