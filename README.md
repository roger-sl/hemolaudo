# Laudos de Cateterismo

Ferramenta web para gerar laudos de **coronariografia diagnóstica** e
**angioplastia coronariana**, com texto pronto para colar em qualquer
prontuário.

## Como usar

Abra `index.html` (ou publique a pasta em qualquer hospedagem estática — não
depende de servidor nem de internet, exceto para carregar as fontes). Duas
abas:

- **Coronariografia** — técnica de acesso, vasos avaliados, achados,
  circulação colateral (com opção de omitir do laudo), padrão obstrutivo,
  métodos adjuntos (IVUS/FFR/QCA/OCT) — IVUS e OCT têm um construtor de frase
  padrão com campos estruturados, além do campo de texto livre —,
  ventriculografia e aortografia.
- **Angioplastia** — técnica, medicação, intercorrências, vasos tratados com
  seus dispositivos em ordem clínica: IVUS/OCT (antes da ICP, após
  pré-dilatação, após o stent), Rotablator, litotripsia intracoronária,
  cutting balloon, balões e stents — resultado e conclusão.

O texto do laudo é montado em tempo real no painel da direita e pode ser
copiado com um clique.

## Comportamento importante

- **Nada é enviado a servidor algum** — todo o processamento acontece no seu
  navegador. Os dados do laudo em andamento (vasos, achados, campos da
  técnica) ficam salvos em `localStorage` só neste navegador, para não se
  perderem num refresh acidental.
- O campo **"Ref."** (nome do paciente, no topo) é proposital e
  **nunca é salvo** — existe só para você não se perder entre as abas
  enquanto preenche, e some ao recarregar a página.
- **"Novo laudo"** limpa vasos, achados e campos das duas abas para o
  próximo paciente. A **equipe** (responsável/executor/assistentes) é mantida
  de propósito, já que costuma ser a mesma ao longo do plantão.
- **"Ver exemplo"** preenche as duas abas com um caso fictício, só para
  quem quiser conhecer o app — não carrega mais sozinho ao abrir a página.
  Quando carregado, um aviso fica visível até você iniciar um novo laudo,
  lembrando para apagar o exemplo antes de copiar um laudo real.

## Tecnologia

HTML, CSS e JavaScript puro — sem dependências, sem build.

```
.
├── index.html   # estrutura das duas abas
├── styles.css   # estilos e temas (claro/escuro)
└── app.js       # lógica do formulário, cálculo do texto e persistência
```

## Rodando localmente

```bash
python3 -m http.server 8000
```

Depois acesse `http://localhost:8000`.

## Publicando no GitHub Pages

1. Envie este projeto para um repositório no GitHub (`git push`).
2. Em **Settings → Pages**, escolha **Deploy from a branch**, branch `main`,
   pasta `/ (root)`.
3. O app fica em `https://SEU-USUARIO.github.io/hemolaudo/`.

## Privacidade

Este app não tem backend e não transmite nada pela rede além de carregar as
fontes do Google Fonts. Os dados digitados ficam apenas no `localStorage` do
seu próprio navegador — evite usá-lo em computadores compartilhados sem
limpar os dados do site depois (ou use a janela anônima/privada).

## Licença

MIT — veja [LICENSE](LICENSE).
