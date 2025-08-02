# Requirements Document

## Introduction

Este documento define os requisitos para implementar um sistema de mapeamento entre formulários, modalidades e templates de e-mail. O objetivo é automatizar o envio de e-mails com layouts específicos baseados na combinação de formulário preenchido e modalidade selecionada pelo usuário. O sistema deve permitir que administradores configurem esses mapeamentos e que o sistema identifique automaticamente qual template usar durante o processo de envio de e-mail.

## Requirements

### Requirement 1

**User Story:** Como administrador do sistema, eu quero configurar mapeamentos entre formulários, modalidades e templates de e-mail, para que o sistema possa enviar automaticamente o e-mail correto baseado na seleção do usuário.

#### Acceptance Criteria

1. WHEN o administrador acessa a tela de configuração de mapeamentos THEN o sistema SHALL exibir uma interface para criar, editar e visualizar mapeamentos
2. WHEN o administrador cria um novo mapeamento THEN o sistema SHALL permitir selecionar um formulário (Comply Fiscal ou Comply e-DOCS), uma modalidade (On-premisse ou SaaS) e um template de e-mail
3. WHEN o administrador salva um mapeamento THEN o sistema SHALL validar que a combinação formulário + modalidade é única
4. IF já existe um mapeamento para a mesma combinação formulário + modalidade THEN o sistema SHALL exibir erro e não permitir duplicação
5. WHEN o administrador visualiza os mapeamentos existentes THEN o sistema SHALL exibir uma lista com formulário, modalidade e template associado

### Requirement 2

**User Story:** Como usuário do sistema, eu quero que o e-mail seja enviado automaticamente com o template correto quando eu preencher um formulário, para que eu receba a comunicação adequada à minha seleção.

#### Acceptance Criteria

1. WHEN o usuário submete um formulário com modalidade selecionada THEN o sistema SHALL identificar o formulário e modalidade
2. WHEN o sistema identifica formulário e modalidade THEN o sistema SHALL buscar o template de e-mail correspondente no mapeamento
3. IF existe um mapeamento para a combinação THEN o sistema SHALL usar o template configurado para gerar o e-mail
4. IF não existe mapeamento para a combinação THEN o sistema SHALL usar um template padrão ou exibir erro apropriado
5. WHEN o e-mail é gerado THEN o sistema SHALL aplicar o layout do template selecionado

### Requirement 3

**User Story:** Como desenvolvedor do sistema, eu quero que o mapeamento seja armazenado de forma estruturada no banco de dados, para que seja possível consultar e gerenciar os mapeamentos de forma eficiente.

#### Acceptance Criteria

1. WHEN um mapeamento é criado THEN o sistema SHALL armazenar no banco a relação entre formulário, modalidade e template
2. WHEN o sistema precisa buscar um template THEN o sistema SHALL consultar o banco usando formulário e modalidade como chave
3. WHEN um mapeamento é atualizado THEN o sistema SHALL manter a integridade referencial com templates existentes
4. WHEN um template é excluído THEN o sistema SHALL verificar se está sendo usado em mapeamentos e tratar adequadamente

### Requirement 4

**User Story:** Como administrador do sistema, eu quero validar se os mapeamentos estão funcionando corretamente, para que eu possa garantir que os usuários recebam os e-mails corretos.

#### Acceptance Criteria

1. WHEN o administrador visualiza um mapeamento THEN o sistema SHALL permitir testar o envio de e-mail com aquele template
2. WHEN o administrador testa um mapeamento THEN o sistema SHALL gerar uma prévia do e-mail usando o template configurado
3. WHEN há mudanças nos formulários ou modalidades THEN o sistema SHALL manter a consistência dos mapeamentos existentes
4. WHEN o sistema não consegue encontrar um mapeamento THEN o sistema SHALL registrar log apropriado para auditoria