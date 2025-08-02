# Implementation Plan

- [x] 1. Criar serviço de mapeamento de templates





  - Implementar `EmailTemplateMappingService` com métodos para buscar templates por formulário e modalidade
  - Adicionar método `findByMapping(formulario, modalidade)` que retorna o template específico ou null
  - Implementar método `validateUniqueness()` para verificar se já existe mapeamento para a combinação
  - Criar método `getMappingsList()` para listar todos os mapeamentos ativos
  - Adicionar sistema de fallback que usa template padrão quando não encontra mapeamento específico
  - _Requirements: 1.2, 1.3, 2.2, 2.3, 3.2_

- [x] 2. Implementar otimizações de banco de dados





  - Criar migração SQL para adicionar índice composto em (formulario, modalidade) na tabela email_templates
  - Implementar índice condicional que considera apenas templates ativos
  - Escrever testes para verificar que as consultas utilizam os índices corretamente
  - _Requirements: 3.1, 3.2_

- [x] 3. Criar hook personalizado para mapeamento de templates





  - Implementar `useEmailTemplateMapping` hook que integra com os formulários
  - Adicionar função que identifica automaticamente formulário e modalidade do contexto
  - Implementar cache local para evitar consultas repetidas durante a sessão
  - Criar função de invalidação de cache quando templates são modificados
  - _Requirements: 2.1, 2.2_

- [x] 4. Implementar validação de mapeamentos únicos





  - Criar função de validação que verifica unicidade antes de salvar template
  - Implementar verificação no frontend que mostra erro em tempo real
  - Adicionar validação no backend para garantir integridade dos dados
  - Criar testes unitários para todas as combinações de validação
  - _Requirements: 1.3, 1.4_

- [x] 5. Criar interface administrativa para visualizar mapeamentos





  - Implementar componente `TemplateMappingList` que exibe todos os mapeamentos existentes
  - Adicionar colunas para formulário, modalidade e nome do template associado
  - Implementar filtros por formulário e modalidade
  - Adicionar indicadores visuais para mapeamentos ativos/inativos
  - _Requirements: 1.1, 1.5_

- [x] 6. Implementar funcionalidade de teste de mapeamentos





  - Criar componente `TestMappingDialog` para testar envio de e-mail com template específico
  - Implementar prévia do e-mail usando o template do mapeamento selecionado
  - Adicionar função para enviar e-mail de teste para o administrador
  - Criar logs de auditoria para testes realizados
  - _Requirements: 4.1, 4.2_

- [x] 7. Integrar mapeamento com formulários existentes





  - Modificar `FormularioComplyFiscal2.tsx` para usar o serviço de mapeamento
  - Integrar com formulário Comply e-DOCS para identificar template automaticamente
  - Implementar lógica que captura formulário e modalidade no momento do submit
  - Adicionar tratamento de erro quando não encontra template apropriado
  - _Requirements: 2.1, 2.4_

- [x] 8. Implementar sistema de fallback para templates





  - Criar lógica que usa template padrão quando não há mapeamento específico
  - Implementar logs informativos quando fallback é utilizado
  - Adicionar configuração para definir qual template usar como padrão
  - Criar testes para verificar que fallback funciona em todos os cenários
  - _Requirements: 2.3, 2.4, 4.4_

- [x] 9. Adicionar tratamento de erros e logs de auditoria





  - Implementar classe `EmailTemplateError` com códigos específicos de erro
  - Adicionar logs detalhados para todas as operações de mapeamento
  - Criar sistema de notificação para administradores quando há falhas
  - Implementar recuperação automática para erros temporários
  - _Requirements: 4.4_

- [x] 10. Criar testes unitários para o serviço de mapeamento





  - Escrever testes para `findByMapping()` com diferentes combinações
  - Implementar testes para validação de unicidade
  - Criar testes para sistema de fallback
  - Adicionar testes de performance para consultas com índices
  - _Requirements: 1.2, 1.3, 2.2, 2.3_

- [x] 11. Implementar testes de integração





  - Criar testes que verificam integração entre formulários e mapeamento
  - Implementar testes de fluxo completo: formulário → mapeamento → e-mail
  - Adicionar testes para cenários de erro e recuperação
  - Criar testes para validação de dados no banco
  - _Requirements: 2.1, 2.2, 3.1, 3.3_

- [x] 12. Adicionar documentação e exemplos de uso





  - Criar documentação técnica para desenvolvedores sobre como usar o serviço
  - Implementar exemplos de código para diferentes cenários de uso
  - Adicionar comentários JSDoc em todas as funções públicas
  - Criar guia de troubleshooting para problemas comuns
  - _Requirements: 4.1, 4.2_