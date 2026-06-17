# Fontana di Trevi — background em sequência no scroll

Este pacote usa as imagens enviadas como um vídeo MP4 de 24 fps e controla o `currentTime` pelo scroll. Essa abordagem é mais leve e estável do que carregar 337 imagens diretamente no navegador.

## Arquivos

- `assets/video/trevi-scroll-bg.mp4` — sequência renderizada em 24 fps a partir dos frames enviados.
- `trevi-scroll-section.html` — seção HTML pronta.
- `trevi-scroll.css` — CSS para vídeo fixo no fundo e conteúdo por cima.
- `trevi-scroll.js` — JS que sincroniza o vídeo com o scroll.

## Como instalar

1. Copie `assets/video/trevi-scroll-bg.mp4` para o projeto.
2. Cole o conteúdo de `trevi-scroll-section.html` no `index.html`.
3. Importe o CSS no `<head>`:

```html
<link rel="stylesheet" href="trevi-scroll.css">
```

4. Importe o JS antes de `</body>`:

```html
<script src="trevi-scroll.js" defer></script>
```

## Ajuste de velocidade do scroll

A duração visual depende da altura da seção:

```css
.trevi-scroll {
  min-height: 560vh;
}
```

Aumente para deixar a sequência mais lenta. Diminua para deixar mais rápida.
