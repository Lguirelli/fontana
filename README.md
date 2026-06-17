# Patch — Fontana di Trevi de Serra Negra

Correções aplicadas nesta versão:

- Fundo por sequência de frames em `canvas`, usando os JPGs já existentes no repositório.
- Scroll recalculado pela altura total da página: topo = primeiro frame, fim = último frame.
- Remoção de boxes visíveis: seções usam apenas texto, linhas, números e marcadores.
- Última seção com numeração no mesmo padrão das anteriores.
- Fade in com foco por scroll, com pequeno delay entre elementos da mesma seção.
- Elementos visuais sem gradientes, usando cores fixas e transparências sólidas.
- Responsividade reforçada para desktop, tablet e mobile, com quebra de colunas quando necessário.

## Arquivos alterados

```txt
index.html
assets/css/styles.css
assets/js/scroll-frames.js
README.md
```

## Observação sobre frames

O script procura os frames na pasta:

```txt
frames fontana/
```

E aceita nomes no formato extraído do repositório, incluindo:

```txt
Sequ#U00eancia 01_2000.jpg
...
Sequ#U00eancia 01_2336.jpg
```

Também há fallback para nomes com acento real e para `assets/frames/frame-0000.jpg`.
