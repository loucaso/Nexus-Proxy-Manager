# Gerenciador de Proxy Reverso com SSL Automático

**Criado por Loucaso + AI**

Este projeto é uma solução completa para gerenciar múltiplos serviços/aplicações em uma rede local com um único IP externo, fornecendo SSL (HTTPS) automático e gratuito (Let's Encrypt) para todos os domínios e subdomínios.

Inclui um Painel de Controle Visual (GUI) para facilitar o gerenciamento sem precisar editar arquivos de configuração manualmente.

## 🚀 Funcionalidades

*   **Proxy Reverso Automático:** Redireciona domínios (ex: `app.meudominio.com`) para portas locais (ex: `192.168.1.50:3000`).
*   **SSL Gratuito e Automático:** Gera e renova certificados Let's Encrypt automaticamente.
*   **Interface Gráfica (Web):** Gerencie seus domínios pelo navegador.
*   **Segurança Avançada:** 
    *   Expõe apenas as portas 80 e 443 para a internet.
    *   Proteção contra ataques comuns (Helmet).
    *   Limitação de taxa (Rate Limit) no painel.
    *   HSTS (Strict-Transport-Security) forçado.
*   **Zero Configuração Complexa:** Não requer edição manual de arquivos Nginx ou Apache.
*   **Gestão de Domínios Base:** Cadastre seus domínios principais e crie subdomínios rapidamente.
*   **Emails SSL Dinâmicos:** O sistema gera automaticamente emails de contato válidos (ex: `admin@meudominio.com` ou `sub@meudominio.com`) para evitar erros de validação SSL.

## 📋 Pré-requisitos

Verifique o arquivo `requisitos.txt` para detalhes técnicos. Resumidamente:
1.  **Node.js** instalado.
2.  **Portas 80 e 443 livres** no computador onde o proxy vai rodar.
3.  **Domínio** registrado (ex: `meudominio.com`).
4.  **Acesso ao Roteador** para redirecionamento de portas.

## 🛠️ Instalação Automática

O projeto inclui um script automático para Windows:

1.  Baixe este repositório.
2.  Execute o arquivo `iniciar_sistema.bat`.
    *   Ele verificará se as dependências estão instaladas.
    *   Se for a primeira vez, instalará tudo automaticamente.
    *   Em seguida, iniciará o servidor.

## ⚙️ Configuração Inicial

### 1. Configuração do DNS (No seu registro de domínio)
Você precisa apontar seu domínio para o seu IP Externo. Crie os seguintes registros tipo **A**:

| Tipo | Nome | Valor/Destino |
|------|------|---------------|
| A    | @    | Seu IP Externo (ex: 189.123.x.x) |
| A    | *    | Seu IP Externo (ex: 189.123.x.x) |

*O registro `*` (Wildcard) garante que qualquer subdomínio (ex: `teste.dominio.com`) chegue ao seu servidor.*

### 2. Configuração do Roteador
Acesse seu roteador e procure por "Port Forwarding" ou "Servidor Virtual". Redirecione:

*   **Porta Externa 80** -> **Porta Interna 80** (IP do computador do Proxy)
*   **Porta Externa 443** -> **Porta Interna 443** (IP do computador do Proxy)

## ▶️ Como Usar

1.  Acesse o Painel de Controle:
    *   Abra o navegador em: `http://localhost:8080`

2.  Configurando Domínios:
    *   Cadastre seu domínio base (ex: `dominio.com`) na área "Meus Domínios".
    *   Para criar um novo serviço, digite apenas o subdomínio (ex: `game`), selecione o domínio base e o destino (IP:Porta).

3.  Aguarde e Teste:
    *   O sistema gerará o SSL automaticamente no primeiro acesso.
    *   Acesse `https://game.dominio.com` no navegador.

## ❓ Solução de Problemas

*   **Erro "EADDRINUSE":** Significa que a porta 80 ou 443 já está sendo usada por outro programa (IIS, Skype, Apache, outro servidor web). Encerre-os antes de iniciar.
*   **SSL não gera:** Verifique se as portas 80/443 estão realmente abertas no site [CanYouSeeMe.org](https://canyouseeme.org/). O Let's Encrypt precisa acessar a porta 80 para validar o domínio.

## 📂 Estrutura do Projeto

*   `src/index.js`: Ponto de entrada, configura o servidor HTTPS e Greenlock.
*   `src/dashboard.js`: API e servidor do Painel de Controle (porta 8080).
*   `src/proxyApp.js`: Lógica de roteamento do Proxy.
*   `src/db.js`: Gerenciamento do banco de dados local (db.json).
*   `public/`: Arquivos do Front-end do painel.
*   `greenlock.d/`: Configurações e certificados SSL (gerado automaticamente).
