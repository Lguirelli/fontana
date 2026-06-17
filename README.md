# Fontana di Trevi de Serra Negra

Landing page estática para o ponto turístico Fontana di Trevi de Serra Negra.

## Como funciona o fundo no scroll

O vídeo `assets/video/trevi-scroll-bg.mp4` fica fixo como fundo da página inteira.
O arquivo `assets/js/scroll-video.js` calcula o progresso do scroll total da página:

```js
scrollY / (documentElement.scrollHeight - window.innerHeight)
```

Esse progresso é convertido no tempo do vídeo, com arredondamento para 24 fps. Assim, o início da página corresponde ao início do vídeo e o fim do scroll corresponde ao fim do vídeo.

## Estrutura

```txt
index.html
assets/css/styles.css
assets/js/scroll-video.js
assets/video/trevi-scroll-bg.mp4
README.md
```

## Publicação

Pode ser publicado direto no GitHub Pages, Vercel ou hospedagem estática. Não usa npm, Vite ou build.
