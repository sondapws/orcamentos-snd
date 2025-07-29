
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValid = emailRegex.test(email);
  console.log(`Validando e-mail "${email}": ${isValid ? 'VÁLIDO' : 'INVÁLIDO'}`);
  return isValid;
};

export const isSondaEmail = (email: string): boolean => {
  return email.toLowerCase().endsWith('@sonda.com');
};

export const validateCorporateEmail = (email: string): boolean => {
  const freeEmailProviders = [
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 
    'uol.com.br', 'terra.com.br', 'bol.com.br', 'ig.com.br'
  ];
  
  const domain = email.toLowerCase().split('@')[1];
  
  // @sonda.com é sempre considerado e-mail corporativo válido
  if (domain === 'sonda.com') {
    return true;
  }
  
  return !freeEmailProviders.includes(domain);
};

export const requiresApproval = (email: string): boolean => {
  return !isSondaEmail(email);
};
