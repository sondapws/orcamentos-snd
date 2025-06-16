
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
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
  return !freeEmailProviders.includes(domain);
};
