# mini-q — exemplo de autenticação

SPA com **mini-q** no front e **Fastify** no back: cadastro PJ multi-step, sessão JWT
(access curto + refresh com rotação), toasts, popover e edição de perfil reusando os
mesmos campos do cadastro. CSS via `style` de `mini-q/style`: globais com `style.css`
e blocos `style(name, config)` (partes, variantes, slots), injetados num
`<style id="mq-styles">`.

Dados ficam **em memória** — somem ao reiniciar o servidor.

## Como rodar

Na raiz do repo, o exemplo é um pacote separado:

```bash
cd examples/auth
npm install
npm run dev
```

Sobe o back em `http://127.0.0.1:3001` e o Vite em `http://localhost:5174`
(proxy `/api` → Fastify). Abra o endereço do Vite.

## Fluxo

1. **Cadastrar** empresa (3 steps: dados, sócios, senha).
2. **Entrar** com e-mail e senha.
3. Ver / **editar perfil** (mesmos componentes de formulário).
4. Menu do usuário (popover) → **Sair**.

Validações: CNPJ/CPF com máscara, e-mail assíncrono, soma das % = 100, MEI com 1 sócio,
senha mínima + confirmação.

## Sessão JWT

- Access token (~15 min) no body, guardado em memória (signal).
- Refresh token em cookie httpOnly, com rotação em `POST /api/refresh`.
- O front renova antes do expiry e também após 401. Se o refresh falhar: toast + tela de login.

### Testar expiração

TTLs via env (segundos):

```bash
ACCESS_TTL_SEC=45 REFRESH_TTL_SEC=90 npm run dev
```

Espere o access expirar (ou mate o servidor e tente de novo) para ver o toast de sessão.

## API

| Método | Rota | Auth |
|---|---|---|
| POST | `/api/register` | — |
| POST | `/api/login` | — |
| POST | `/api/refresh` | cookie |
| POST | `/api/logout` | cookie |
| GET | `/api/me` | Bearer |
| PUT | `/api/me` | Bearer |
| GET | `/api/email-available?email=` | opcional Bearer (ignora o próprio e-mail) |
