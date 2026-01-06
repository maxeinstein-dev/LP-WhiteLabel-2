<?php

// Cores ANSI para logs coloridos
class Colors
{
    const RESET = "\033[0m";
    const BRIGHT = "\033[1m";
    const GREEN = "\033[32m";
    const YELLOW = "\033[33m";
    const BLUE = "\033[34m";
    const RED = "\033[31m";
}

function logMessage($message, $color = Colors::RESET)
{
    echo $color . $message . Colors::RESET . PHP_EOL;
}

function logStep($step, $message)
{
    logMessage("[{$step}] {$message}", Colors::BLUE);
}

function logSuccess($message)
{
    logMessage("✓ {$message}", Colors::GREEN);
}

function logError($message)
{
    logMessage("✗ {$message}", Colors::RED);
}

// Utilitário para criar diretórios recursivamente
function ensureDirectoryExists($dirPath)
{
    if (!is_dir($dirPath)) {
        mkdir($dirPath, 0755, true);
    }
}

// Função para substituir placeholders no template
function replacePlaceholders($template, $data, $prefix = '')
{
    $result = $template;

    foreach ($data as $key => $value) {
        $placeholder = $prefix
            ? '{{' . $prefix . '_' . strtoupper($key) . '}}'
            : '{{' . strtoupper($key) . '}}';

        if (is_array($value) && !isset($value[0])) {
            // Recursivamente processa objetos aninhados
            $newPrefix = $prefix ? $prefix . '_' . strtoupper($key) : strtoupper($key);
            $result = replacePlaceholders($result, $value, $newPrefix);
        } elseif (is_string($value)) {
            $result = str_replace($placeholder, $value, $result);
        }
    }

    return $result;
}

// Função para processar componentes
function processComponent($componentName, $data)
{
    logStep('COMPONENT', "Processando {$componentName}.html");

    $componentPath = __DIR__ . "/src/components/{$componentName}.html";

    if (!file_exists($componentPath)) {
        logError("Componente {$componentName}.html não encontrado em src/components/");
        return '';
    }

    $componentHTML = file_get_contents($componentPath);

    // Substitui placeholders do componente específico (suporta variantes: hero/hero2)
    $baseName = preg_replace('/\d+$/', '', $componentName);
    $baseKey = strtolower($baseName);
    $prefix = strtoupper($baseName);

    $componentData = $data['content'][$componentName] ?? $data['content'][$baseKey] ?? [];

    $componentHTML = replacePlaceholders($componentHTML, $componentData, $prefix);

    // Substitui placeholders globais (theme, seo, etc)
    $componentHTML = replacePlaceholders($componentHTML, $data);

    logSuccess("{$componentName}.html processado");
    return $componentHTML;
}

// Função para gerar CSS Variables do tema
function generateThemeCSS($theme)
{
    return "
    :root {
      --primary-color: {$theme['primaryColor']};
      --secondary-color: {$theme['secondaryColor']};
      --accent-color: {$theme['accentColor']};
      --dark-color: {$theme['darkColor']};
      --light-color: {$theme['lightColor']};
      --font-family: {$theme['fontFamily']};
    }
  ";
}

// Função para copiar diretório recursivamente
function copyDirectory($source, $destination)
{
    ensureDirectoryExists($destination);

    $items = scandir($source);

    foreach ($items as $item) {
        if ($item === '.' || $item === '..') {
            continue;
        }

        $srcPath = $source . '/' . $item;
        $destPath = $destination . '/' . $item;

        if (is_dir($srcPath)) {
            copyDirectory($srcPath, $destPath);
        } else {
            copy($srcPath, $destPath);
        }
    }
}

// Função principal de build
function build()
{
    try {
        logMessage("\n🚀 Iniciando processo de build...", Colors::BRIGHT);
        logMessage(str_repeat("═", 50), Colors::BLUE);

        // 1. Carrega o data.json
        logStep('1/7', 'Carregando data.json');
        $dataPath = __DIR__ . '/data.json';
        $data = json_decode(file_get_contents($dataPath), true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception('Erro ao decodificar data.json: ' . json_last_error_msg());
        }

        logSuccess('data.json carregado com sucesso');

        // 2. Carrega o layout principal
        logStep('2/7', 'Carregando src/layout.html');
        $layoutPath = __DIR__ . '/src/layout.html';
        $layoutHTML = file_get_contents($layoutPath);
        logSuccess('layout.html carregado');

        // 3. Gera e injeta CSS do tema
        logStep('3/7', 'Gerando variáveis CSS do tema');
        $themeCSS = generateThemeCSS($data['theme']);
        $layoutHTML = str_replace('/*THEME_CSS*/', $themeCSS, $layoutHTML);
        logSuccess('Tema CSS aplicado');

        // 4. Substitui meta tags de SEO
        logStep('4/7', 'Aplicando configurações de SEO');
        $layoutHTML = replacePlaceholders($layoutHTML, $data['seo'], 'SEO');
        $layoutHTML = replacePlaceholders($layoutHTML, $data['theme'], 'THEME');
        $layoutHTML = replacePlaceholders($layoutHTML, $data['content']['footer'] ?? [], 'FOOTER');
        logSuccess('SEO configurado');

        // 5. Processa componentes na ordem definida
        logStep('5/7', 'Processando componentes');
        $componentsHTML = '';

        foreach ($data['sectionsOrder'] as $componentName) {
            $componentsHTML .= processComponent($componentName, $data);
        }

        // Injeta o conteúdo no layout
        $layoutHTML = str_replace('{{CONTENT}}', $componentsHTML, $layoutHTML);
        logSuccess(count($data['sectionsOrder']) . ' componentes processados');

        // 6. Cria a pasta dist e salva o index.html
        logStep('6/7', 'Gerando index.html na pasta dist/');
        $distPath = __DIR__ . '/dist';
        ensureDirectoryExists($distPath);

        $indexPath = $distPath . '/index.html';
        file_put_contents($indexPath, $layoutHTML);
        logSuccess('index.html gerado');

        // 7. Copia assets para dist
        logStep('7/7', 'Copiando assets para dist/');
        $assetsSource = __DIR__ . '/assets';
        $assetsDest = $distPath . '/assets';

        if (is_dir($assetsSource)) {
            copyDirectory($assetsSource, $assetsDest);
            logSuccess('Assets copiados');
        } else {
            logMessage('⚠ Pasta assets/ não encontrada, pulando...', Colors::YELLOW);
        }

        // Relatório final
        logMessage("\n" . str_repeat("═", 50), Colors::BLUE);
        logMessage('✨ Build concluído com sucesso!', Colors::BRIGHT);
        logMessage("📦 Arquivo gerado: {$indexPath}", Colors::GREEN);

        $fileSize = filesize($indexPath) / 1024;
        logMessage(sprintf('📊 Tamanho: %.2f KB', $fileSize), Colors::GREEN);
        logMessage(str_repeat("═", 50) . "\n", Colors::BLUE);
    } catch (Exception $e) {
        logError("\n❌ Erro durante o build: " . $e->getMessage());
        echo $e->getTraceAsString() . PHP_EOL;
        exit(1);
    }
}

// Executa o build
build();
