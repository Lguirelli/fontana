Patch de correção — Fontana di Trevi de Serra Negra

Arquivos incluídos:
- index.html
- assets/css/styles.css
- assets/js/scroll-video.js
- assets/js/scroll-frames.js
- assets/frames-optimized/*.webp

Principais ajustes:
- alternância de lado aplicada à seção completa, não apenas às colunas internas;
- numeração mantida sempre à esquerda;
- fade in controlado por scroll e finalizando quando a seção atinge o centro da viewport;
- scroll do fundo recalculado conforme o tamanho real da página;
- frames otimizados em WebP para reduzir lag;
- fallback para os JPGs originais caso algum arquivo otimizado não seja encontrado.


Observação: os frames otimizados estão em meia cadência (1 a cada 2 frames originais) para reduzir lag de scroll sem perder a leitura visual da sequência.
