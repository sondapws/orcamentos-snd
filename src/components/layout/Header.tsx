
import React from 'react';
import { MoreHorizontal } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute right-0 top-0 w-96 h-full opacity-20">
        <img 
          src="/lovable-uploads/a794b093-7b63-4034-afb5-988846dd828b.png" 
          alt="Logo N"
          className="absolute right-8 top-8 w-32 h-32 opacity-30"
        />
      </div>
      
      <div className="container mx-auto px-6 py-8 relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <img 
                src="/lovable-uploads/a794b093-7b63-4034-afb5-988846dd828b.png" 
                alt="Sonda Logo"
                className="w-8 h-8"
              />
              <div>
                <div className="text-2xl font-bold">SONDA.</div>
                <div className="text-sm opacity-90">make it easy</div>
              </div>
            </div>
          </div>
          
          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <MoreHorizontal className="w-6 h-6" />
          </button>
        </div>
        
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-4">Orçamento Comply e-DOCS</h1>
          
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Conheça o nosso produto</span>
              <br />
              <a 
                href="https://aplicativos.sonda.com/SitePages/produto3.aspx?produto=complyedocs&page=home" 
                className="text-blue-200 hover:text-white underline transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://aplicativos.sonda.com/SitePages/produto3.aspx?produto=complyedocs&page=home
              </a>
            </div>
            
            <div>
              <span className="font-medium">Escopo do produto</span>
              <br />
              <a 
                href="https://aplicativos.sonda.com/SitePages/produto3.aspx?produto=complyedocs&page=escopoproduto" 
                className="text-blue-200 hover:text-white underline transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://aplicativos.sonda.com/SitePages/produto3.aspx?produto=complyedocs&page=escopoproduto
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
