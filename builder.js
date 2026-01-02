const fs = require("fs");
const path = require("path");

// Cores ANSI para logs coloridos
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  red: "\x1b[31m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`[${step}] ${message}`, "blue");
}

function logSuccess(message) {
  log(`✓ ${message}`, "green");
}

function logError(message) {
  log(`✗ ${message}`, "red");
}

// Utilitário para criar diretórios recursivamente
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Função para substituir placeholders no template
function replacePlaceholders(template, data, prefix = "") {
  let result = template;

  for (const [key, value] of Object.entries(data)) {
    const placeholder = prefix
      ? `{{${prefix}_${key.toUpperCase()}}}`
      : `{{${key.toUpperCase()}}}`;

    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      // Recursivamente processa objetos aninhados
      result = replacePlaceholders(
        result,
        value,
        prefix ? `${prefix}_${key.toUpperCase()}` : key.toUpperCase()
      );
    } else if (typeof value === "string") {
      result = result.replace(new RegExp(placeholder, "g"), value);
    }
  }

  return result;
}

// Função para processar componentes
function processComponent(componentName, data) {
  logStep("COMPONENT", `Processando ${componentName}.html`);

  const componentPath = path.join(
    __dirname,
    "src",
    "components",
    `${componentName}.html`
  );

  if (!fs.existsSync(componentPath)) {
    logError(
      `Componente ${componentName}.html não encontrado em src/components/`
    );
    return "";
  }

  let componentHTML = fs.readFileSync(componentPath, "utf8");

  // Substitui placeholders do componente específico (suporta variantes: hero/hero2)
  const baseName = componentName.replace(/\d+$/, "");
  const baseKey = baseName.toLowerCase();
  const prefix = baseName.toUpperCase();
  const componentData =
    data.content[componentName] || data.content[baseKey] || {};

  componentHTML = replacePlaceholders(componentHTML, componentData, prefix);

  // Substitui placeholders globais (theme, seo, etc)
  componentHTML = replacePlaceholders(componentHTML, data);

  logSuccess(`${componentName}.html processado`);
  return componentHTML;
}

// Função para gerar CSS Variables do tema
function generateThemeCSS(theme) {
  return `
    :root {
      --primary-color: ${theme.primaryColor};
      --secondary-color: ${theme.secondaryColor};
      --accent-color: ${theme.accentColor};
      --dark-color: ${theme.darkColor};
      --light-color: ${theme.lightColor};
      --font-family: ${theme.fontFamily};
    }
  `;
}

// Função para copiar diretório recursivamente
function copyDirectory(source, destination) {
  ensureDirectoryExists(destination);

  const entries = fs.readdirSync(source, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(source, entry.name);
    const destPath = path.join(destination, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Função principal de build
async function build() {
  try {
    log("\n🚀 Iniciando processo de build...", "bright");
    log("═".repeat(50), "blue");

    // 1. Carrega o data.json
    logStep("1/7", "Carregando data.json");
    const dataPath = path.join(__dirname, "data.json");
    const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
    logSuccess("data.json carregado com sucesso");

    // 2. Carrega o layout principal
    logStep("2/7", "Carregando src/layout.html");
    const layoutPath = path.join(__dirname, "src", "layout.html");
    let layoutHTML = fs.readFileSync(layoutPath, "utf8");
    logSuccess("layout.html carregado");

    // 3. Gera e injeta CSS do tema
    logStep("3/7", "Gerando variáveis CSS do tema");
    const themeCSS = generateThemeCSS(data.theme);
    layoutHTML = layoutHTML.replace("/*THEME_CSS*/", themeCSS);
    logSuccess("Tema CSS aplicado");

    // 4. Substitui meta tags de SEO
    logStep("4/7", "Aplicando configurações de SEO");
    layoutHTML = replacePlaceholders(layoutHTML, data.seo, "SEO");
    layoutHTML = replacePlaceholders(layoutHTML, data.theme, "THEME");
    layoutHTML = replacePlaceholders(
      layoutHTML,
      data.content.footer || {},
      "FOOTER"
    );
    logSuccess("SEO configurado");

    // 5. Processa componentes na ordem definida
    logStep("5/7", "Processando componentes");
    let componentsHTML = "";

    for (const componentName of data.sectionsOrder) {
      componentsHTML += processComponent(componentName, data);
    }

    // Injeta o conteúdo no layout
    layoutHTML = layoutHTML.replace("{{CONTENT}}", componentsHTML);
    logSuccess(`${data.sectionsOrder.length} componentes processados`);

    // 6. Cria a pasta dist e salva o index.html
    logStep("6/7", "Gerando index.html na pasta dist/");
    const distPath = path.join(__dirname, "dist");
    ensureDirectoryExists(distPath);

    const indexPath = path.join(distPath, "index.html");
    fs.writeFileSync(indexPath, layoutHTML, "utf8");
    logSuccess("index.html gerado");

    // 7. Copia assets para dist
    logStep("7/7", "Copiando assets para dist/");
    const assetsSource = path.join(__dirname, "assets");
    const assetsDest = path.join(distPath, "assets");

    if (fs.existsSync(assetsSource)) {
      copyDirectory(assetsSource, assetsDest);
      logSuccess("Assets copiados");
    } else {
      log("⚠ Pasta assets/ não encontrada, pulando...", "yellow");
    }

    // Relatório final
    log("\n═".repeat(50), "blue");
    log("✨ Build concluído com sucesso!", "bright");
    log(`📦 Arquivo gerado: ${indexPath}`, "green");

    const stats = fs.statSync(indexPath);
    log(`📊 Tamanho: ${(stats.size / 1024).toFixed(2)} KB`, "green");
    log("═".repeat(50) + "\n", "blue");
  } catch (error) {
    logError(`\n❌ Erro durante o build: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// Executa o build
build();
