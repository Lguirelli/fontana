# Fontana di Trevi de Serra Negra

Landing page estática com fundo animado controlado pelo scroll.

## Estrutura

```txt
index.html
assets/
  css/styles.css
  js/scroll-video.js
  video/trevi-scroll-bg.mp4
```

## Como rodar localmente

Abra o `index.html` no navegador.

Para uma simulação mais próxima do deploy, rode um servidor local simples:

```bash
python -m http.server 8000
```

Depois acesse:

```txt
http://localhost:8000
```

## Como publicar

### GitHub Pages

1. Suba todos os arquivos para um repositório.
2. Vá em Settings > Pages.
3. Em Branch, selecione `main` e `/root`.
4. Salve.

### Vercel

1. Importe o repositório na Vercel.
2. Framework Preset: `Other`.
3. Build Command: deixe vazio.
4. Output Directory: deixe vazio ou `.`.

## Observações

- O vídeo de fundo fica em `assets/video/trevi-scroll-bg.mp4`.
- O JS sincroniza o tempo do vídeo com o scroll usando 24 fps.
- Não usa npm, Vite ou build.
