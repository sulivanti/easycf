# 01-Login — Spec Definitiva v3

> **Rota:** `/login` | **Módulo:** MOD-000 | **Frame Penpot:** `01-Login`
> **Viewport:** 1440 × 900 px | **Font:** Plus Jakarta Sans (`plusjakartasans`)

---

## 1. Visão Geral

Tela de autenticação do ECF — Enterprise Control Framework do Grupo A1.
Full-screen, SEM AppShell, SEM Topbar, SEM Sidebar.

**Layout:** Split-screen horizontal.
- **Esquerda (604px):** Painel de branding escuro.
- **Direita (836px):** Fundo `#F5F5F3` com card branco centralizado.

3 estados (frames separados no Penpot):
- `01-Login` — estado principal (LoginPanel)
- `01-Login-Forgot` — recuperação de senha
- `01-Login-Reset` — redefinição de senha

---

## 2. Decisões de Design (definidas pelo PO)

| Item | Decisão | Origem |
|------|---------|--------|
| Cor do botão "Entrar" | **Azul `#2E86C1`** | App real (design system: `--color-info`) |
| Checkbox "Manter conectado" | **Sim, incluir** | App real |
| Botão Microsoft SSO | **Sim, incluir** com divider "OU CONTINUE COM" | Stitch original |
| Subtítulo | **"Acesse o portal do Grupo A1"** | Stitch original |
| Link recuperação | **"Esqueci minha senha"** | Stitch original |
| "Primeiro acesso?" | **Sim, incluir** | Stitch original |
| Card branco | **Sim**, com borda e radius 16px | Stitch original |

---

## 3. Cores

```
AZUL BOTÃO (info)     #2E86C1     Botão "Entrar" — COR PRINCIPAL DE AÇÃO NESTA TELA
AZUL HOVER            #256FA0     Hover do botão Entrar
LARANJA (accent)      #F58C32     Link "Esqueci minha senha", barra de acento, logo A1
LARANJA GRAD          #F5A04E     Início do gradiente do logo
PRETO                 #111111     Fundo branding (base), títulos
VERDE ESCURO          #1a2318     Fundo branding (topo do gradiente)
FUNDO PÁGINA          #F5F5F3     Fundo do painel direito
BRANCO                #FFFFFF     Card de login, fundo dos inputs
BORDA                 #E8E8E6     Bordas de card, inputs, dividers, checkbox
TEXTO PRIMÁRIO        #111111     "Bem-vindo de volta"
TEXTO SECUNDÁRIO      #333333     Labels, "Entrar com Microsoft", "Solicite ao administrador"
TEXTO TERCIÁRIO       #555555     "Manter conectado"
TEXTO AUXILIAR        #888888     "Acesse o portal do Grupo A1", "Primeiro acesso?"
TEXTO HINT            #AAAAAA     "OU CONTINUE COM", footer
TEXTO PLACEHOLDER     #CCCCCC     Placeholders, ícones dentro de inputs
BRANDING TEXT         #FFFFFF     Tagline, "Grupo A1"
BRANDING MUTED        rgba(255,255,255,0.45)  Descrição
BRANDING SUBTLE       rgba(255,255,255,0.35)  "PORTAL INTERNO"
BRANDING FAINT        rgba(255,255,255,0.25)  "UNIDADES DO GRUPO"
BRANDING GHOST        rgba(255,255,255,0.20)  Copyright
PILL TEXT             rgba(255,255,255,0.50)  Texto pills
PILL BORDER           rgba(255,255,255,0.12)  Borda pills
MS RED                #F25022
MS GREEN              #7FBA00
MS BLUE               #00A4EF
MS YELLOW             #FFB900
ERROR                 #E74C3C     Validação (estados de erro)
SUCCESS               #27AE60     Senha forte, mensagem sucesso
SUCCESS BG            #E8F8EF     Fundo mensagem sucesso
```

---

## 4. Tipografia

Tudo **Plus Jakarta Sans**.

```
TAGLINE        "Soluções para a indústria."    800 italic  42px  lh:47px  ls:-1.2px  #FFFFFF
DESCRIÇÃO      "Plataforma de gestão..."       400         14px  lh:23px             rgba(255,255,255,0.45)
LOGO NOME      "Grupo A1"                      700         15px  lh:18px             #FFFFFF
LOGO SUB       "PORTAL INTERNO"                500 UPPER   10px  lh:12px  ls:+1.6px  rgba(255,255,255,0.35)
CARD TÍTULO    "Bem-vindo de volta"             800         24px  lh:30px  ls:-0.5px  #111111
CARD SUBTÍT    "Acesse o portal do Grupo A1"   400         14px  lh:20px             #888888
LABEL          "E-MAIL CORPORATIVO" "SENHA"    700 UPPER   11px  lh:14px  ls:+0.8px  #333333
LINK           "Esqueci minha senha"           600         12px  lh:16px             #F58C32
PLACEHOLDER    "seu@grupoa1.com.br" etc.       400         14px  lh:20px             #CCCCCC
CHECKBOX       "Manter conectado"              400         13px  lh:18px             #555555
BOTÃO          "Entrar"                        700         15px  lh:20px             #FFFFFF
DIVIDER        "OU CONTINUE COM"               600 UPPER   11px  lh:14px  ls:+0.8px  #AAAAAA
MICROSOFT      "Entrar com Microsoft"          600         14px  lh:20px             #333333
PRIMEIRO       "Primeiro acesso?"              400         13px  lh:18px             #888888
SOLICITE       "Solicite ao administrador"     700         13px  lh:18px             #333333
UNITS LABEL    "UNIDADES DO GRUPO"             700 UPPER   9px   lh:12px  ls:+1.4px  rgba(255,255,255,0.25)
PILL           "Engenharia" etc.               500         12px  lh:16px             rgba(255,255,255,0.50)
COPYRIGHT      "© 2026 Grupo A1..."            400         11px  lh:14px             rgba(255,255,255,0.20)
FOOTER         "Conexão segura (TLS)" etc.     500         12px  lh:16px             #AAAAAA
```

---

## 5. Medidas e Radius

```
Card de login         radius: 16px   border: 1px solid #E8E8E6   shadow: nenhum
Inputs                radius: 10px   border: 1px solid #E8E8E6   height: 48px
Botão Entrar          radius: 10px   height: 50px                fill: #2E86C1 sólido
Botão Microsoft       radius: 10px   height: 48px                border: 1px solid #E8E8E6
Pills (unidades)      radius: 20px   border: 1px solid rgba(255,255,255,0.12)   padding: 6px 16px
Logo ícone            radius: 8px    size: 44×44px               fill: gradiente #F5A04E→#F58C32
Barra de acento       radius: 2px    size: 56×4px                fill: #F58C32
Checkbox              size: 16×16    radius: 3px                 border: 1.5px solid #E8E8E6
```

---

## 6. Estrutura de Elementos

### Frame: 01-Login (1440×900)

```
01-Login (frame 1440×900)
│
├── PainelBranding (frame 604×900)
│   fill: gradiente linear 175° #1a2318(topo) → #111111(base)
│   │
│   ├── Logo (group, x:56 y:40)
│   │   ├── LogoIcone (rect 44×44, r:8, fill grad 135° #F5A04E→#F58C32)
│   │   │   └── "A1" (text branco 18px italic 800, centrado)
│   │   ├── "Grupo A1" (text)
│   │   └── "PORTAL INTERNO" (text)
│   │
│   ├── BlocoTagline (group, centrado verticalmente, x:56)
│   │   ├── "Soluções\npara a\nindústria." (text 42px 800 italic branco)
│   │   ├── "Plataforma de gestão de processos, aprovações e integração
│   │   │    com Protheus — desenvolvida para o Grupo A1." (text, max-w 380px)
│   │   └── BarraLaranja (rect 56×4, r:2, fill #F58C32)
│   │
│   └── RodapéBranding (group, x:56, ancorado ~y:780)
│       ├── "UNIDADES DO GRUPO" (text)
│       ├── FilaPills (group horizontal, gap 8)
│       │   ├── Pill "Engenharia"
│       │   ├── Pill "Industrial"
│       │   ├── Pill "Energia"
│       │   └── Pill "Agro"
│       └── "© 2026 Grupo A1 · Todos os direitos reservados" (text)
│
└── PainelFormulario (frame 836×900, x:604, fill #F5F5F3)
    │
    └── CardLogin (frame 420×auto, CENTRADO, fill #FFFFFF, r:16, border 1px #E8E8E6)
        │  padding: 44px top, 40px lados, 36px base
        │  (largura interna: 340px)
        │
        ├── "Bem-vindo de volta" (text 24px 800 #111111)
        ├── "Acesse o portal do Grupo A1" (text 14px 400 #888888, gap 6px)
        │
        ├── CampoEmail (group, gap 28px acima)
        │   ├── "E-MAIL CORPORATIVO" (text label)
        │   └── InputEmail (group, gap 8px)
        │       ├── FundoInput (rect 340×48, r:10, border #E8E8E6, fill #FFF)
        │       ├── ÍconeEnvelope (18×18, stroke #CCCCCC, x:14)
        │       └── "seu@grupoa1.com.br" (text placeholder, x:44)
        │
        ├── CampoSenha (group, gap 20px acima)
        │   ├── LinhaLabel (group horizontal, justify-between, w:340)
        │   │   ├── "SENHA" (text label)
        │   │   └── "Esqueci minha senha" (text 12px 600 #F58C32)
        │   └── InputSenha (group, gap 8px)
        │       ├── FundoInput (rect 340×48, r:10, border #E8E8E6, fill #FFF)
        │       ├── ÍconeCadeado (18×18, stroke #CCCCCC, esquerda)
        │       ├── "Digite sua senha" (text placeholder, x:44)
        │       └── ÍconeOlho (18×18, stroke #AAAAAA, direita)
        │
        ├── CheckboxManterConectado (group, gap 16px acima)
        │   ├── CheckboxBox (rect 16×16, r:3, border 1.5px #E8E8E6, fill #FFF)
        │   └── "Manter conectado" (text 13px 400 #555555, gap 8px à direita)
        │
        ├── BotãoEntrar (group, gap 20px acima)
        │   ├── FundoBotão (rect 340×50, r:10, fill #2E86C1)
        │   ├── "Entrar" (text branco 15px 700, centrado)
        │   └── ÍconeSeta→ (18×18, stroke branco, à direita do texto)
        │
        ├── Divisor (group, gap 24px acima, w:340)
        │   ├── LinhaEsq (rect flex, h:1, fill #E8E8E6)
        │   ├── "OU CONTINUE COM" (text centrado)
        │   └── LinhaDir (rect flex, h:1, fill #E8E8E6)
        │
        ├── BotãoMicrosoft (group, gap 24px acima)
        │   ├── FundoBotão (rect 340×48, r:10, fill #FFF, border 1px #E8E8E6)
        │   ├── LogoMS (group 18×18: 4 rects 8×8 gap 2px)
        │   │   ├── #F25022 (top-left)
        │   │   ├── #7FBA00 (top-right)
        │   │   ├── #00A4EF (bottom-left)
        │   │   └── #FFB900 (bottom-right)
        │   └── "Entrar com Microsoft" (text centrado)
        │
        ├── "Primeiro acesso? Solicite ao administrador" (text centrado, gap 20px)
        │   → "Primeiro acesso?" 400 #888888
        │   → "Solicite ao administrador" 700 #333333
        │
        └── RodapéCard (group, gap 28px, border-top 1px #E8E8E6, pt:20px)
            ├── ÍconeEscudo + "Conexão segura (TLS)" (esquerda)
            └── ÍconeInfo + "Suporte" (direita)
```

---

## 7. Ícones SVG

### Envelope (Mail) — 18×18, viewBox="0 0 24 24"
```svg
<rect x="2" y="4" width="20" height="16" rx="2"/>
<path d="m2 7 10 6 10-6"/>
```

### Cadeado (Lock) — 18×18
```svg
<rect x="3" y="11" width="18" height="11" rx="2"/>
<path d="M7 11V7a5 5 0 0 1 10 0v4"/>
```

### Olho (Eye) — 18×18
```svg
<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
<circle cx="12" cy="12" r="3"/>
```

### Seta Direita (ArrowRight) — 18×18
```svg
<path d="M5 12h14"/>
<path d="m12 5 7 7-7 7"/>
```

### Escudo (ShieldCheck) — 14×14
```svg
<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
```

### Info — 14×14
```svg
<circle cx="12" cy="12" r="10"/>
<path d="M12 16v-4"/>
<path d="M12 8h.01"/>
```

### Seta Esquerda (ArrowLeft) — 16×16 (Forgot/Reset)
```svg
<path d="M19 12H5"/>
<path d="m12 19-7-7 7-7"/>
```

### Logo Microsoft — 18×18 (4 quadrados sólidos 8×8, gap 2px)
```
#F25022 top-left    #7FBA00 top-right
#00A4EF bottom-left #FFB900 bottom-right
```

---

## 8. Componentes a Criar

### Novos (auth/)

| Componente | Descrição |
|------------|-----------|
| `auth/BrandingPanel` | Painel esquerdo 604×900 completo. Reutilizado em Forgot e Reset. |
| `auth/LoginCard` | Card branco com formulário, checkbox, botões, SSO e footer. |
| `auth/MicrosoftSSOButton` | Botão branco com borda + ícone MS + texto. |
| `auth/AuthDivider` | Linhas + "OU CONTINUE COM" centralizado. |
| `auth/ForgotCard` | Card com email + "Enviar link" + mensagem sucesso. |
| `auth/ResetCard` | Card com nova senha + confirmar + PasswordStrength. |

### Do Design System (usar como referência)

| Componente | Uso |
|------------|-----|
| `ui/Button` | Estilo do botão (mas cor azul #2E86C1, não laranja) |
| `ui/Input` | Campos com ícone |
| `ui/FormField` | Label + input |
| `ui/Pill` | Pills do branding |

---

## 9. Frames Adicionais

### 01-Login-Forgot (1440×900)

Mesmo PainelBranding. Card muda:

```
CardForgot (420×auto, centrado, mesma estética)
├── "← Voltar ao login" (ArrowLeft + text #888888 13px 600)
├── "Esqueceu a senha?" (24px 800 #111111)
├── "Informe seu e-mail corporativo e enviaremos um link para redefinição." (14px #888888)
├── CampoEmail (idêntico ao login)
├── BotãoEnviar (340×50, r:10, fill #2E86C1, text "Enviar link" branco)
└── MensagemSucesso (340×auto, r:8, fill #E8F8EF, border 1px #B5E8C9)
    └── "Se o e-mail estiver cadastrado, você receberá um link..." (13px #1E7A42)
```

### 01-Login-Reset (1440×900)

Mesmo PainelBranding. Card muda:

```
CardReset (420×auto, centrado)
├── "← Voltar ao login"
├── "Redefinir senha" (24px 800 #111111)
├── "Crie uma nova senha segura para sua conta." (14px #888888)
├── CampoNovaSenha (label "NOVA SENHA" + input + eye toggle)
│   └── BarrasForça (4 barras 3px, gap 4px)
│       vazio=#E8E8E6  fraca=#E74C3C  razoável=#E67E22  forte=#27AE60
│   └── "Razoável" (11px #AAAAAA)
├── CampoConfirmar (label "CONFIRMAR SENHA" + input)
└── BotãoRedefinir (340×50, r:10, fill #2E86C1, text "Redefinir" branco)
```

---

## 10. Checklist de Validação

- [ ] Botão "Entrar" é **AZUL `#2E86C1`** (não laranja, não outro azul)
- [ ] Card branco com borda `#E8E8E6` e radius 16px
- [ ] Fundo do painel direito é `#F5F5F3` (não branco)
- [ ] Checkbox "Manter conectado" existe entre campo senha e botão
- [ ] Título: "Bem-vindo de volta"
- [ ] Subtítulo: "Acesse o portal do Grupo A1"
- [ ] Link: "Esqueci minha senha" (cor laranja #F58C32)
- [ ] Divider: "OU CONTINUE COM"
- [ ] Botão "Entrar com Microsoft" com ícone 4 quadrados existe
- [ ] "Primeiro acesso? Solicite ao administrador" existe
- [ ] Footer: "Conexão segura (TLS)" + "Suporte"
- [ ] Logo A1 laranja com gradiente (não azul)
- [ ] Tagline itálica extrabold
- [ ] 4 pills no rodapé do branding
- [ ] Todos os textos em Plus Jakarta Sans
