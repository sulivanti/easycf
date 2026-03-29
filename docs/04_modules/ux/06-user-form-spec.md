# 06-UserForm — Spec Definitiva

> **Rota:** `/usuarios/:id` | **Módulo:** MOD-000 | **Frame Penpot:** `06-UserForm`
> **Viewport:** 1440 × 900 px | **Font:** Plus Jakarta Sans
> **Referência:** `stitchusers.png` (região de formulário)

---

## 1. Decisões de Design (PO)

Mesmo AppShell da 05-UsersList. Ver `05-users-list-spec.md` para tokens globais.

| Item | Decisão |
|------|---------|
| Botão "Salvar" | Azul `#2E86C1` |
| Botão "Cancelar" | Secondary (branco + borda) |
| Info convite | Texto azul `#2E86C1` sobre fundo `#F0F8FF` |

---

## 2. Cores (adicionais ao AppShell)

```
INFO BG              #F0F8FF     Fundo da mensagem de convite
INFO TEXT            #2E86C1     Texto da mensagem de convite
TOGGLE ON            #2E86C1     Track do toggle ativo (modo edição)
TOGGLE OFF           #E8E8E6     Track do toggle inativo
```

---

## 3. Tipografia (conteúdo específico)

```
"Novo Usuário"                    800  28px  lh:34px  ls:-1px  #111111
"Preencha os dados..."            400  14px  #888888
Labels "NOME COMPLETO" etc.       700  11px  uppercase  ls:+0.8px  #333333
Input valor                       400  14px  #111111
Input placeholder                 400  14px  #CCCCCC
Info "Um convite será enviado..." 400  13px  #2E86C1
"Cancelar"                        600  13px  #555555
"Salvar"                          700  13px  #FFFFFF
```

---

## 4. Medidas

```
FormCard             680×auto    r:12   border:1px #E8E8E6   padding:36px
Form input           608×48      r:10   border:1px #E8E8E6
Form input com ícone pl:44px
Form select          296×48      r:10   border:1px #E8E8E6
Select chevron       14×14       posição: right 14px center
Info box             608×auto    r:8    fill:#F0F8FF   padding:12px 16px
Separador            608×1       fill:#E8E8E6
Botão Cancelar       h:44        r:8    border:1px #E8E8E6   fill:#FFF
Botão Salvar         h:44        r:8    fill:#2E86C1
Toggle track         40×22       r:11
Toggle thumb         18×18       r:50%  fill:#FFF
```

---

## 5. Estrutura — Frame 06-UserForm (Modo Criação)

```
06-UserForm (frame 1440×900)
│
├── Topbar (idêntico ao 05, breadcrumb: "Início › Usuários › Novo")
├── Sidebar (idêntico ao 05, ativo: "Usuários")
│
└── ContentArea (1200×836, fill #F5F5F3, padding 32px)
    │
    └── FormCard (frame 680×auto, fill #FFF, r:12, border 1px #E8E8E6, p:36px)
        │
        ├── "Novo Usuário" (text 28px 800 #111111)
        ├── "Preencha os dados para criar um novo usuário." (text 14px #888888, mt:6px)
        │
        ├── CampoNome (group, mt:28px)
        │   ├── "NOME COMPLETO" (text label)
        │   └── Input (608×48, r:10, border #E8E8E6)
        │       └── "Nome do usuário" (placeholder)
        │
        ├── CampoEmail (group, mt:20px)
        │   ├── "E-MAIL CORPORATIVO" (text label)
        │   └── Input com ícone envelope (608×48)
        │       ├── ÍconeEnvelope (18×18, stroke #CCCCCC, x:14)
        │       └── "usuario@grupoa1.com.br" (placeholder, x:44)
        │
        ├── LinhaSelects (group horizontal, gap 16px, mt:20px)
        │   ├── CampoPerfil (group, w:296)
        │   │   ├── "PERFIL" (text label)
        │   │   └── Select (296×48, r:10, border #E8E8E6)
        │   │       ├── "Selecione o perfil" (placeholder)
        │   │       └── ChevronDown (14×14, stroke #888888, right:14)
        │   └── CampoEmpresa (group, w:296)
        │       ├── "EMPRESA" (text label)
        │       └── Select (296×48, r:10, border #E8E8E6)
        │           ├── "Selecione a empresa" (placeholder)
        │           └── ChevronDown
        │
        ├── InfoConvite (group, mt:20px, fill #F0F8FF, r:8, p:12px 16px)
        │   ├── ÍconeInfo (16×16, stroke #2E86C1)
        │   └── "Um convite será enviado por e-mail para ativação da conta." (text 13px #2E86C1)
        │
        ├── Separador (rect 608×1, fill #E8E8E6, mt:28px)
        │
        └── BotõesAção (group, mt:20px, alinhado à direita, gap 12px)
            ├── "Cancelar" (btn secondary: h:44, r:8, border #E8E8E6, text #555555 600)
            └── "Salvar" (btn primary: h:44, r:8, fill #2E86C1, text #FFF 700)
```

---

## 6. Variante — 06-UserForm-Edit (Modo Edição)

Mesmo frame, com estas diferenças:

```
Diferenças:
├── Título: "Editar Usuário" (em vez de "Novo Usuário")
├── Breadcrumb: "Início › Usuários › Marcos Silva"
├── Descrição: "Atualize os dados do usuário."
├── Campos preenchidos com valores reais (não placeholders)
│
├── CampoStatus (group, mt:20px, entre LinhaSelects e Separador)
│   ├── "STATUS" (text label)
│   └── ToggleGroup (group horizontal, gap 10px)
│       ├── Toggle (group)
│       │   ├── Track (rect 40×22, r:11, fill #2E86C1)
│       │   └── Thumb (circle 18×18, fill #FFF, posição direita)
│       └── "Ativo" (text 13px 500 #333333)
│
├── SEM InfoConvite (removido)
│
├── BotãoResetar (entre Separador e BotõesAção)
│   └── "Resetar Senha" (btn secondary: h:40, r:8, border #E8E8E6, text #555555 500)
│
└── BotãoSalvar texto: "Salvar Alterações"
```

---

## 7. Ícones SVG

```
Envelope (Mail) — 18×18, viewBox="0 0 24 24"
  <rect x="2" y="4" width="20" height="16" rx="2"/>
  <path d="m2 7 10 6 10-6"/>

ChevronDown — 14×14, viewBox="0 0 24 24"
  <path d="m6 9 6 6 6-6"/>

Info — 16×16, viewBox="0 0 24 24"
  <circle cx="12" cy="12" r="10"/>
  <path d="M12 16v-4"/>
  <path d="M12 8h.01"/>
```

---

## 8. Checklist

### Modo Criação
- [ ] Breadcrumb "Início › Usuários › Novo"
- [ ] FormCard branco 680px, radius 12, borda #E8E8E6
- [ ] Título "Novo Usuário" 28px extrabold
- [ ] Campo Nome (input 608×48 simples)
- [ ] Campo Email (input 608×48 com ícone envelope)
- [ ] Perfil + Empresa lado a lado (2 selects 296×48)
- [ ] Info azul "Um convite será enviado..."
- [ ] Separador 1px
- [ ] "Cancelar" + "Salvar" alinhados à direita

### Modo Edição
- [ ] Breadcrumb "Início › Usuários › [nome]"
- [ ] Título "Editar Usuário"
- [ ] Campos preenchidos
- [ ] Toggle de status entre selects e separador
- [ ] SEM info de convite
- [ ] Botão "Resetar Senha" secondary
- [ ] "Salvar Alterações" no botão primary
