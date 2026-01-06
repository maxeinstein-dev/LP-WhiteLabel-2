# 🚀 Landing Page SSG - White Label Boilerplate

Sistema profissional de geração de landing pages estáticas de alta performance. Configure via JSON e faça deploy automático via FTP com GitHub Actions.

## ✨ Características

- **⚡ Performance Extrema**: HTML estático puro, carregamento instantâneo
- **🎨 100% Personalizável**: Tudo configurável via JSON (cores, textos, estrutura)
- **📱 Mobile First**: Design responsivo com Bootstrap 5
- **🔍 SEO Otimizado**: Meta tags, Open Graph, estrutura semântica
- **♿ Acessível**: Compatível com WCAG 2.1
- **🚀 Deploy Automático**: CI/CD com GitHub Actions + FTP
- **🛠️ Zero Dependências**: Usa apenas PHP nativo (sem frameworks)

---

## 📁 Estrutura do Projeto

```
landing-page-ssg/
├── .github/
│   └── workflows/
│       └── main.yml          # GitHub Actions para deploy
├── src/
│   ├── layout.html           # Template principal
│   └── components/           # Componentes HTML
│       ├── hero.html
│       ├── features.html
│       ├── pricing.html
│       ├── cta.html
│       └── contact.html
├── assets/
│   ├── css/
│   │   └── custom.css       # Estilos personalizados
│   ├── js/
│   │   └── main.js          # JavaScript
│   └── images/              # Imagens do projeto
├── dist/                     # Pasta gerada (não versionar)
├── data.json                 # Arquivo de configuração
├── builder.php               # Script de build
└── README.md
```

---

## 🚀 Início Rápido

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/landing-page-ssg.git
cd landing-page-ssg
```

### 2. Configure o data.json

Edite o arquivo `data.json` com suas informações:

```json
{
  "seo": {
    "title": "Seu Título",
    "description": "Sua descrição"
  },
  "theme": {
    "primaryColor": "#6366f1",
    "secondaryColor": "#ec4899"
  },
  "sectionsOrder": ["hero", "features", "pricing", "cta", "contact"]
}
```

### 3. Execute o build

```bash
php builder.php
```

O HTML otimizado será gerado em `dist/index.html`.

### 4. Teste localmente

Abra o arquivo `dist/index.html` no navegador ou use um servidor local:

```bash
npx serve dist
```

---

## ⚙️ Configuração do Deploy (GitHub Actions)

### Passo 1: Configure os Secrets

No seu repositório GitHub, vá em **Settings → Secrets and variables → Actions** e adicione:

| Secret         | Descrição                | Exemplo               |
| -------------- | ------------------------ | --------------------- |
| `FTP_SERVER`   | Endereço do servidor FTP | `ftp.seuservidor.com` |
| `FTP_USERNAME` | Usuário FTP              | `usuario@dominio.com` |
| `FTP_PASSWORD` | Senha FTP                | `sua-senha-segura`    |

### Passo 2: Ajuste o workflow (se necessário)

Edite `.github/workflows/main.yml` para configurar o diretório de destino:

```yaml
server-dir: ./public_html/ # Ajuste conforme seu servidor
```

### Passo 3: Faça push para main

```bash
git add .
git commit -m "feat: configuração inicial"
git push origin main
```

O GitHub Actions irá:

1. ✅ Instalar PHP
2. 🔨 Executar o `builder.php`
3. 🚀 Fazer deploy via FTP automaticamente

---

## 🎨 Personalização

### Cores e Tema

Edite as cores em `data.json`:

```json
"theme": {
  "primaryColor": "#6366f1",
  "secondaryColor": "#ec4899",
  "accentColor": "#14b8a6",
  "darkColor": "#1e293b",
  "lightColor": "#f8fafc"
}
```

As cores são aplicadas como CSS Variables e afetam toda a página.

### Adicionar/Remover Seções

Edite o array `sectionsOrder` em `data.json`:

```json
"sectionsOrder": ["hero", "features", "cta", "contact"]
```

O builder irá montar a página na ordem especificada.

### Criar Novos Componentes

1. Crie um arquivo em `src/components/meu-componente.html`
2. Use placeholders: `{{MEU_COMPONENTE_TITULO}}`
3. Adicione os dados em `data.json`:

```json
"content": {
  "meu-componente": {
    "titulo": "Meu Título"
  }
}
```

4. Adicione `"meu-componente"` no `sectionsOrder`

---

## 🔧 Scripts Disponíveis

| Comando           | Descrição                            |
| ----------------- | ------------------------------------ |
| `php builder.php` | Gera a versão de produção em `/dist` |
| `npm run build`   | Alias para `php builder.php`         |
| `npm run dev`     | Build + mensagem de sucesso          |

---

## 📊 Performance

Este boilerplate gera páginas otimizadas:

- ✅ HTML estático (0ms de server-side processing)
- ✅ CSS inline para estilos críticos
- ✅ Bootstrap via CDN com cache
- ✅ Lazy loading de imagens
- ✅ Minificação automática (adicione se necessário)

---

## 🛡️ SEO & Acessibilidade

### SEO

- Meta tags completas
- Open Graph para redes sociais
- Estrutura semântica (header, main, footer)
- URLs amigáveis

### Acessibilidade

- ARIA labels
- Contraste de cores adequado
- Navegação por teclado
- Suporte a leitores de tela

---

## 📦 Dependências

Este projeto **não possui dependências externas** no build. Usa apenas:

- PHP 8.0+ (funções nativas)
- Bootstrap 5 (via CDN)
- Google Fonts (via CDN)

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/minha-feature`
3. Commit suas mudanças: `git commit -m 'feat: adiciona nova feature'`
4. Push para a branch: `git push origin feature/minha-feature`
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 🆘 Suporte

Encontrou um bug ou tem uma sugestão?

- Abra uma [Issue](https://github.com/seu-usuario/landing-page-ssg/issues)
- Entre em contato: contato@suaempresa.com

---

## 🎯 Roadmap

- [ ] Suporte a múltiplos idiomas (i18n)
- [ ] Temas pré-configurados
- [ ] CLI para geração de componentes
- [ ] Integração com CMS Headless
- [ ] Sistema de formulários com backend

---

**Desenvolvido com ❤️ para criar landing pages incríveis**
