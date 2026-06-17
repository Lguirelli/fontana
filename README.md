# Patch Fontana di Trevi — ajustes de texto, mobile e layout

Este patch corrige a versão com frames JPEG no canvas, mantendo a pasta de frames existente no repositório.

## Arquivos alterados

- `index.html`
- `assets/css/styles.css`
- `assets/js/scroll-video.js`
- `README.md`

## Ajustes aplicados

- Removido o botão `Abrir no mapa` da seção de localização.
- Métricas ajustadas com espaços não quebráveis para evitar números divididos, como `370 m²`, `11 m` e `20,70 m`.
- Títulos e textos com regras para evitar quebras ruins em desktop, tablet e mobile.
- Mobile centralizado: números, títulos, textos, linhas e elementos visuais ficam alinhados ao centro da tela.
- Seções em duas colunas com o corpo do texto alinhado no topo do conteúdo, não pela marcação lateral da seção.
- Colunas quebram automaticamente quando a largura não comporta o layout.
- Mantido o canvas de fundo com proporção `cover` e scroll sincronizado com a página inteira.

## Observação

A pasta de frames deve continuar na raiz do projeto:

```txt
frames fontana/
├─ Sequência 01_2000.jpg
├─ Sequência 01_2001.jpg
├─ ...
└─ Sequência 01_2336.jpg
```
