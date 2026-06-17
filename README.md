# Fontana di Trevi de Serra Negra

Patch de correção para a landing page com sequência de frames no scroll.

## O que foi corrigido

- O fundo voltou a usar `canvas`, sem depender de vídeo.
- O frame agora é desenhado com comportamento de `cover`, sem distorcer a proporção.
- O progresso do fundo é calculado do topo ao fim real da página.
- O script continua no caminho `assets/js/scroll-video.js` para evitar quebra de link antigo.
- As seções ficam transparentes, sem boxes visíveis.
- Textos têm fade in com pequeno delay entre elementos.
- As colunas quebram melhor em telas menores.
- O canvas recalcula o tamanho no resize e orientation change.

## Estrutura esperada dos frames

A pasta de frames deve continuar na raiz do projeto:

```txt
frames fontana/
├─ Sequ#U00eancia 01_2000.jpg
├─ Sequ#U00eancia 01_2001.jpg
├─ ...
└─ Sequ#U00eancia 01_2336.jpg
```

O script também tenta carregar a variação com acento real no nome (`Sequência 01_2000.jpg`) caso o repositório tenha sido corrigido manualmente.
