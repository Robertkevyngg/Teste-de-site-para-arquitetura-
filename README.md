# Estúdio Arquitetura — Portfólio

Site institucional e portfólio para estúdio de arquitetura. Projeto estático (HTML + CSS + JS), sem dependências ou build.

## Visão geral

- Design minimalista editorial, tipografia serifada para títulos (Cormorant Garamond) e sans-serif para corpo (Inter).
- Navegação fixa com efeito *glassmorphism* ao rolar.
- Hero em tela cheia com imagem de capa e chamadas para ação.
- Seção de projetos com **filtros por categoria** (Residencial, Comercial, Interiores).
- **Lightbox** com galeria navegável (teclas de seta e ESC).
- Botões de contato com **WhatsApp** e **Instagram** no hero, seção de contato e rodapé.
- Totalmente responsivo, acessível (WAI-ARIA, navegação por teclado, respeita `prefers-reduced-motion`).

## Leis de UX/UI aplicadas

| Lei | Onde foi aplicada |
|-----|-------------------|
| **Jakob** | Padrões familiares: menu fixo topo, hero + CTA, grid de cards, rodapé com redes. |
| **Hick** | Menu com 5 itens, filtros com 4 opções — escolhas reduzidas. |
| **Fitts** | Botões grandes (mínimo 44px), áreas clicáveis amplas nos cards e ícones sociais. |
| **Proximidade** | Agrupamento visual claro: título + lead, ações em par, metadados juntos. |
| **Estético-usabilidade** | Tipografia cuidadosa, espaçamentos generosos, animações sutis. |
| **Von Restorff** | Destaques em terracota/dourado (`--color-accent`) sobre base neutra. |
| **Lei da região comum** | Cards, painéis de serviço e bloco de estatísticas delimitados visualmente. |
| **Miller** | Estatísticas em grupos de 3, navegação com 5 itens, seções compactas. |

## Estrutura de arquivos

```
.
├── index.html              # Estrutura e conteúdo
├── css/style.css           # Design system e responsivo
├── js/main.js              # Lógica (render, filtros, lightbox)
├── data/projects.json      # DADOS: projetos + links sociais  ← edite aqui
└── assets/images/projects/ # (Opcional) imagens locais
```

## Como adicionar ou remover projetos e imagens

Todo o conteúdo dinâmico fica em **`data/projects.json`**. Não é preciso mexer em HTML/CSS/JS para gerenciar o portfólio.

### Adicionar um novo projeto

Abra `data/projects.json` e adicione um objeto ao array `"projects"`:

```json
{
  "id": "nome-unico-do-projeto",
  "title": "Título do Projeto",
  "category": "residencial",
  "year": 2025,
  "location": "Cidade, Estado",
  "cover": "assets/images/projects/minha-capa.jpg",
  "gallery": [
    "assets/images/projects/minha-capa.jpg",
    "assets/images/projects/foto-02.jpg",
    "assets/images/projects/foto-03.jpg"
  ],
  "description": "Uma descrição curta do projeto."
}
```

Campos:

- `id` *(obrigatório, único)* — identificador do projeto.
- `title` *(obrigatório)* — título exibido no card e lightbox.
- `category` *(obrigatório)* — `residencial`, `comercial` ou `interiores` (controla o filtro).
- `year` — ano de entrega.
- `location` — localização.
- `cover` — URL da imagem de capa (aparece no card).
- `gallery` — array de URLs das imagens do lightbox (pode repetir a capa como primeira).
- `description` — descrição curta (opcional, pronta para uso futuro).

### Remover um projeto

Exclua o objeto correspondente do array `"projects"` em `data/projects.json`.

### Usar imagens locais

1. Coloque os arquivos em `assets/images/projects/` (ex.: `casa-xyz-01.jpg`).
2. Referencie com caminho relativo no JSON: `"assets/images/projects/casa-xyz-01.jpg"`.

**Dicas de imagem:**
- Proporção recomendada das capas: **4:5** (ex.: 1200×1500 px).
- Formato: **JPG** (foto) ou **WebP** (menor tamanho, melhor performance).
- Otimize antes de subir (ex.: squoosh.app ou `cwebp`). Mantenha cada imagem abaixo de ~300 KB.

### Configurar links sociais (WhatsApp e Instagram)

Edite o bloco `"social"` no topo de `data/projects.json`:

```json
"social": {
  "instagram": "https://instagram.com/seuusuario",
  "whatsapp": "5511999999999",
  "whatsappMessage": "Olá! Gostaria de conversar sobre um projeto."
}
```

- `whatsapp`: somente dígitos, com **código do país** (55) + **DDD** + número.
- `whatsappMessage`: mensagem pré-preenchida ao abrir o chat.
- `instagram`: URL completa do perfil.

Os botões no hero, seção de contato e rodapé são atualizados automaticamente.

### Adicionar/remover categorias de filtro

1. Adicione o botão em `index.html` dentro de `.filters`:
   ```html
   <button class="filter" data-filter="paisagismo" role="tab" aria-selected="false">Paisagismo</button>
   ```
2. Use a mesma string (`paisagismo`) no campo `category` de cada projeto no JSON.
3. Opcional: adicione o label em `categoryLabel()` em `js/main.js` (para exibição formatada).

## Rodar localmente

Por causa do `fetch()` do JSON, é preciso um servidor HTTP (abrir o `index.html` direto no navegador não funciona). Escolha uma opção:

```bash
# Python 3
python3 -m http.server 8080

# Node
npx serve .

# PHP
php -S localhost:8080
```

Depois acesse `http://localhost:8080`.

## Publicar (GitHub Pages)

1. No GitHub, vá em **Settings → Pages**.
2. Em *Source*, selecione a branch (`main` ou a branch desejada) e a pasta raiz (`/`).
3. Salve. O site ficará disponível em `https://seuusuario.github.io/nome-do-repo/`.

Alternativas: Netlify, Vercel, Cloudflare Pages — todas fazem deploy direto do repositório sem configuração.

## Licença

Conteúdo e código sob uso livre para o projeto. Imagens de demonstração vêm de Unsplash (licença Unsplash).
