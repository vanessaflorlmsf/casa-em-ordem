# 🏠 Casa em Ordem

Aplicação web para organização e gerenciamento de tarefas domésticas durante a semana.

O **Casa em Ordem** foi desenvolvido para facilitar a organização da rotina, permitindo cadastrar, editar, concluir e excluir tarefas, com persistência dos dados em banco de dados e autenticação de usuários.

## ✨ Funcionalidades

* 🔐 Cadastro e login de usuários
* 🔑 Recuperação de senha
* ➕ Cadastro de tarefas
* ✏️ Edição de tarefas
* 🗑️ Exclusão de tarefas
* ✅ Marcação de tarefas concluídas
* 💾 Persistência dos dados no Supabase
* 👤 Dados separados por usuário
* 🛡️ Controle de acesso com Row Level Security (RLS)
* 📅 Organização das tarefas por dia da semana
* 🏠 Organização por ambientes
* ⏱️ Definição de duração das tarefas
* 🔄 Tarefas recorrentes
* 🎯 Organização da rotina doméstica
* 📱 Interface responsiva

## 🚀 Tecnologias

### Front-end

* React
* TypeScript
* Vite
* CSS

### Back-end / Dados

* Supabase
* PostgreSQL
* Supabase Authentication
* Row Level Security (RLS)

### Ferramentas

* Git
* GitHub
* VS Code
* Cypress

## 🧩 Arquitetura

A aplicação utiliza uma arquitetura baseada em componentes React e integração com o Supabase.

```text
Casa em Ordem
│
├── React
│   ├── Componentes
│   ├── Estados
│   ├── Formulários
│   └── Regras da aplicação
│
├── Supabase
│   ├── Authentication
│   ├── PostgreSQL
│   └── Row Level Security
│
└── GitHub
    └── Versionamento do projeto
```

## 🔐 Segurança

Os dados das tarefas são associados ao usuário autenticado através do `user_id`.

O banco utiliza **Row Level Security (RLS)** para garantir que cada usuário tenha acesso somente aos seus próprios registros.

As credenciais e variáveis de ambiente utilizadas pela aplicação ficam armazenadas em arquivos `.env`, que não são versionados no Git.

## 📋 Principais operações

O sistema possui operações completas de gerenciamento de tarefas:

```text
Create → Criar tarefa
Read   → Carregar tarefas
Update → Editar/concluir tarefa
Delete → Excluir tarefa
```

## 🖥️ Executando o projeto localmente

### 1. Clone o repositório

```bash
git clone https://github.com/vanessaflorlmsf/casa-em-ordem.git
```

### 2. Entre na pasta

```bash
cd casa-em-ordem
```

### 3. Instale as dependências

```bash
npm install
```

### 4. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=seu_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=sua_chave_publica
```

Não compartilhe o arquivo `.env` nem suas credenciais.

### 5. Execute o projeto

```bash
npm run dev
```

A aplicação estará disponível em:

```text
http://localhost:5173
```

## 📦 Build de produção

Para gerar a versão de produção:

```bash
npm run build
```

## 🧪 Testes

O projeto também está preparado para testes automatizados utilizando **Cypress**.

## 🎯 Objetivo do projeto

O Casa em Ordem foi desenvolvido como projeto prático de desenvolvimento Full Stack, com foco em:

* Desenvolvimento de aplicações web
* Integração entre front-end e banco de dados
* Autenticação de usuários
* APIs e persistência de dados
* Operações CRUD
* Segurança de dados
* Organização de código
* Experiência do usuário
* Versionamento com Git e GitHub

## 🔮 Próximas melhorias

* [ ] Dashboard de progresso semanal
* [ ] Sistema de lembretes
* [ ] Notificações
* [ ] Filtros por ambiente
* [ ] Filtros por prioridade
* [ ] Calendário de tarefas
* [ ] Relatórios de produtividade
* [ ] Melhorias na experiência mobile
* [ ] Testes automatizados completos
* [ ] Deploy da aplicação

## 👩‍💻 Desenvolvedora

**Vanessa Alves**

Desenvolvedora Full Stack

📍 Fortaleza - CE, Brasil

### 🔗 Links

* GitHub: https://github.com/vanessaflorlmsf
* LinkedIn: https://www.linkedin.com/in/vanessaflor/

---

⭐ Projeto desenvolvido para estudos, portfólio e evolução prática em desenvolvimento Full Stack.

