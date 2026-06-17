# Patch final — Fontana di Trevi Serra Negra

Substitua estes arquivos no repositório atual:

- `index.html`
- `assets/css/styles.css`
- `assets/js/scroll-video.js`
- `assets/js/scroll-frames.js`

Os frames não estão incluídos no patch. A pasta esperada continua sendo:

```txt
frames fontana/
├─ Sequência 01_2000.jpg
├─ Sequência 01_2001.jpg
└─ ... até Sequência 01_2336.jpg
```

Correções aplicadas:

- textos maiores e mais próximos do modelo editorial anterior;
- distância menor entre seções;
- seções alternando lado do texto em layout desktop;
- numeração mantida sempre à esquerda no desktop;
- botão de mapa restaurado de forma discreta;
- scroll do canvas recalculado pelo tamanho real da página;
- carregamento de frames corrigido para a pasta `frames fontana`;
- fade in por scroll funcionando sem depender de IntersectionObserver;
- mobile centralizado e com numeração alinhada.
