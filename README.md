# Fontana di Trevi de Serra Negra

Landing page estática para a Fontana di Trevi de Serra Negra.

## Correções desta versão

- Fundo trocado de vídeo para `canvas` com os JPEGs originais já presentes no repositório.
- Scroll sincronizado com a página inteira: topo = primeiro frame, fim da página = último frame.
- Caminho dos frames mantido como `frames fontana/Sequência 01_2000.jpg` até `Sequência 01_2336.jpg`.
- Boxes visíveis removidos: cards, métricas, lista e chamada visual agora usam apenas texto, linhas, marcadores e detalhes gráficos.
- Seções continuam com fundo transparente.
- Layout ajustado para mobile, com melhor escala de títulos, espaçamentos, grid em uma coluna e canvas cobrindo a tela inteira.
- Header segue removido.
- Galeria e Melhor horário seguem removidos.
- Paleta mantida: `#dddddd`, `#42a573`, `#c1503a`, `#000000`.
- Fontes mantidas: Crimson Text + Oxygen.

## Estrutura principal

```txt
index.html
assets/css/styles.css
assets/js/scroll-frames.js
frames fontana/
  Sequência 01_2000.jpg
  ...
  Sequência 01_2336.jpg
```

## Observação

O arquivo `assets/js/scroll-video.js` e o MP4 podem permanecer no repositório, mas não são mais chamados pelo `index.html`.
A versão atual usa `assets/js/scroll-frames.js`.
