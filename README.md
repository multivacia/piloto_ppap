# PPAP · Sistema de Fluxo de Aprovação (MVP)

Sistema para gestão dos 18 itens do PPAP entre fornecedores e a equipe
AQF da F2J: envio de documentos, análise, aprovação/reprovação com
retorno, histórico por item e upload de anexos.

## Stack

- **Backend**: Node.js + Express + TypeScript, Prisma ORM, PostgreSQL, JWT
- **Web**: React + Vite + TypeScript, SPA consumindo a API via REST/JSON
- **Mobile (fase seguinte)**: React Native/Expo consumindo a mesma API

## Estrutura

```
backend/   API REST (Express + Prisma)
web/       Frontend web (React SPA)
```

O backend é a única fonte de regras de negócio (isolamento por
fornecedor, transições de status, permissões). O frontend web e, mais
adiante, o app mobile são apenas clientes dessa mesma API — nada de
lógica de negócio duplicada entre eles.

## Rodando localmente

### 1. Banco de dados

Crie um banco e um usuário Postgres dedicados a este projeto (nunca
reaproveitar usuário/banco de outro sistema na mesma máquina):

```sql
CREATE USER ppap_user WITH PASSWORD 'uma_senha_forte';
CREATE DATABASE ppap_db OWNER ppap_user;
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# edite .env com a DATABASE_URL e um JWT_SECRET aleatório forte

npm install
npx prisma migrate dev --name init   # cria as tabelas
npm run seed                          # popula dados de demonstração
npm run dev                           # http://localhost:3001
```

O `npm run seed` imprime no console os usuários e senhas de demo
criados (3 fornecedores + 1 AQF), já com 3 pacotes de exemplo em
estados diferentes do fluxo (pendente, em análise, aprovado, reprovado
com comentário).

### 2.1. Testes automatizados (backend)

Usa um banco Postgres **separado** do de desenvolvimento (o setup dos
testes apaga as tabelas a cada teste):

```bash
createdb ppap_db_test
# TEST_DATABASE_URL já deve estar no seu .env (ver .env.example)
npx prisma migrate deploy   # aplica as migrations no banco de teste também
npm test                    # roda a suíte inteira uma vez
npm run test:watch          # modo watch, ao desenvolver
```

Os testes cobrem as regras de negócio marcadas como inegociáveis no
`CLAUDE.md` (isolamento por fornecedor, reprovação exigindo comentário,
histórico de auditoria). Se uma mudança quebrar um desses testes, trate
como regressão — não enfraqueça o teste para ele passar.

### 3. Frontend web

```bash
cd web
cp .env.example .env   # confira VITE_API_URL
npm install
npm run dev             # http://localhost:5173
```

## Deploy na VPS (HostGator)

Pressupondo uma VPS já rodando outro site que **não pode ser alterado**.

### Isolamento do site existente

- Banco: usuário e banco Postgres **novos e dedicados** (`ppap_user` / `ppap_db`), sem acesso a nada do outro site
- Domínio: um subdomínio próprio (ex.: `ppap.suaempresa.com.br`) com seu próprio `server block` no Nginx — o `server block` do site atual não é tocado
- Processo: o backend roda em porta interna própria (ex.: `3001`) via PM2, como um processo separado, nunca reaproveitando processo/porta de outro app
- Pasta: código em um diretório isolado, ex. `/home/usuario/apps/ppap/`, fora da pasta do site existente

### Passo a passo

```bash
# 1. Instalar Node via NVM (não depende da versão que o cPanel já usa)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
nvm install 20

# 2. Clonar o repositório
git clone https://github.com/multivacia/piloto_ppap.git
cd piloto_ppap

# 3. Backend
cd backend
cp .env.example .env      # editar com DATABASE_URL real e JWT_SECRET forte
npm install --production
npx prisma migrate deploy
npm run seed               # só na primeira vez, para a demo
npm run build

# 4. Rodar com PM2 (nome próprio, isolado de outros processos)
npm install -g pm2
pm2 start dist/server.js --name ppap-api
pm2 save

# 5. Frontend web: build estático
cd ../web
cp .env.example .env       # VITE_API_URL apontando para https://ppap.suaempresa.com.br/api
npm install
npm run build               # gera web/dist
```

### Nginx (novo server block, isolado do site existente)

```nginx
server {
    listen 443 ssl;
    server_name ppap.suaempresa.com.br;

    ssl_certificate     /etc/letsencrypt/live/ppap.suaempresa.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ppap.suaempresa.com.br/privkey.pem;

    # Frontend (build estático do React)
    location / {
        root /home/usuario/apps/ppap/web/dist;
        try_files $uri /index.html;
    }

    # Backend (proxy para o processo Node do PM2)
    location /api/ {
        proxy_pass http://127.0.0.1:3001/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Gerar o certificado com Certbot para esse subdomínio específico, sem
alterar a configuração do site já existente:

```bash
certbot --nginx -d ppap.suaempresa.com.br
```

## O que fica para a Fase 2

Combinado explicitamente para depois do MVP funcional:

- Criptografia de campos sensíveis em repouso (AES-256) + backups cifrados
- 2FA para todos os usuários
- Log de auditoria de visualização/download por documento
- Marca d'água nos PDFs baixados
- App mobile nativo (React Native/Expo) para publicação na App Store

## Usuários de demonstração

Criados pelo `npm run seed` (backend). **Trocar antes de usar dados
reais** — estas credenciais existem só para validar o fluxo:

| username         | senha      | papel                     |
|------------------|------------|---------------------------|
| fcs.qualidade    | Fcs#4821   | Fornecedor (FCS)          |
| piatex.pcp       | Pia#7395   | Fornecedor (Piatex)       |
| metalsul.eng     | Sul#2260   | Fornecedor (Metalúrgica Sul) |
| f2j.aqf          | F2j#9137   | AQF (F2J)                 |
