import { validateEmail } from '@/utils/emailValidation';

// Teste da validação de e-mail
const testEmails = [
  'willian_betin@hotmail.com',
  'test@gmail.com',
  'user@sonda.com',
  'invalid-email',
  'test@',
  '@domain.com',
  'test@domain',
  'valid@domain.com.br'
];

console.log('🧪 Testando validação de e-mail:');
testEmails.forEach(email => {
  const isValid = validateEmail(email);
  console.log(`${isValid ? '✅' : '❌'} ${email}: ${isValid ? 'Válido' : 'Inválido'}`);
});

export { testEmails };