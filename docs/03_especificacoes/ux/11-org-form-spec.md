# 11-OrgForm — Spec Definitiva

> **Rota:** `/organizacao/:id` | **Módulo:** MOD-001 | **Frame Penpot:** `11-OrgForm`
> **Viewport:** 1440 × 900 px | **Font:** Plus Jakarta Sans
> **Contexto:** Drawer lateral que abre sobre o painel de detalhe da 10-OrgTree

---

## 1. Visão Geral

O OrgForm **não é uma página separada** — é um **drawer** (painel lateral deslizante) que abre por cima do painel de detalhe da 10-OrgTree quando o usuário clica em "Editar Dados" ou "+ Nova Subdivisão".

3 estados para prototipação no Penpot (3 frames):
- `11-OrgForm-Edit` — Editar dados de unidade existente
- `11-OrgForm-Create` — Criar nova subdivisão
- `11-OrgForm-Deactivate` — Modal de confirmação de desativação

---

## 2. Comportamento do Formulário

Quando o usuário clica em "Editar Dados" ou "+ Nova Subdivisão":
1. O **painel da árvore (380px) é ocultado** completamente
2. Um **painel de formulário** aparece no lugar, ocupando o espaço da árvore
3. O **painel de detalhe continua visível** ao lado, sem overlay, sem escurecimento
4. O layout permanece split-panel, só muda o conteúdo do lado esquerdo

**NÃO usar drawer com overlay cinza.** O formulário substitui a árvore diretamente.

```
FormPanel (frame 480×836, fill #FFFFFF, border-right 1px #E8E8E6)
│  Ocupa o espaço onde estava o PainelÁrvore
│
├── FormHeader (group, h:64, border-bottom 1px #E8E8E6, p:0 24px)
│   ├── BotãoVoltar (IconButton ArrowLeft, 20×20, stroke #888888)
│   ├── Título (text 18px 700 #111111, ml:12px)
│   └── BotãoFechar (IconButton X, 20×20, stroke #888888, alinhado à direita)
│
├── FormBody (group, flex:1, padding 24px, overflow-y auto)
│   └── {conteúdo do formulário}
│
└── FormFooter (group, h:72, border-top 1px #E8E8E6, p:16px 24px, justify-end, gap 12px)
    ├── "Cancelar" (btn secondary: h:44, r:8, border #E8E8E6, text #555 600)
    └── "Salvar" (btn primary: h:44, r:8, fill #2E86C1, text #FFF 700)
```

**Ao clicar "Cancelar" ou "X":** o formulário fecha, a árvore reaparece.

---

## 3. Frame: 11-OrgForm-Edit (Editar Dados)

Acionado pelo botão **"Editar Dados"** no header do detalhe.

```
11-OrgForm-Edit (frame 1440×900)
│
├── AppShell (Topbar + Sidebar — idênticos à 10-OrgTree)
│
└── ContentArea (split-panel)
    │
    ├── FormPanel (480px, fill #FFFFFF, border-right 1px #E8E8E6)
    │   │  SUBSTITUI o PainelÁrvore — a árvore está oculta
    │   │
    │   ├── Header: ← "Editar Unidade"  ×
    │   │   (ArrowLeft volta para árvore, X fecha o form)
    │   │
    │   ├── Body (scrollável):
    │   │   ├── ReadOnlyField "CÓDIGO" = "UN-0012" + 🔒
    │   │   ├── FormField "NOME DA UNIDADE" (editável) = "A1 Engenharia"
    │   │   ├── ReadOnlyField "NÍVEL" = "N2 — Regional" + 🔒
    │   │   ├── ReadOnlyField "UNIDADE PAI" = "Grupo A1" + 🔒
    │   │   ├── Separador
    │   │   ├── SectionLabel "DADOS CADASTRAIS"
    │   │   ├── FormField "CNPJ" = "12.345.678/0001-90"
    │   │   ├── FormField "RAZÃO SOCIAL" = "A1 Engenharia e Construções Civis Ltda"
    │   │   ├── Row: FormField "FILIAL" + FormField "RESPONSÁVEL"
    │   │   ├── FormField "TELEFONE" = "(11) 3456-7890"
    │   │   ├── FormField "E-MAIL DE CONTATO" = "contato@a1engenharia.com.br"
    │   │   ├── Separador
    │   │   ├── SectionLabel "STATUS"
    │   │   └── Toggle (Ativo/Inativo)
    │   │
    │   └── Footer: "Cancelar" + "Salvar Alterações"
    │
    └── PainelDetalhe (flex, fill #F5F5F3, VISÍVEL NORMALMENTE)
        │  Exatamente como na 10-OrgTree: header, dados cadastrais,
        │  departamentos, metric cards — SEM overlay, SEM escurecimento
        └── (conteúdo idêntico ao detalhe da 10-OrgTree)
```

### Regras de imutabilidade

| Campo | Editável? | Componente |
|-------|-----------|------------|
| Código | ❌ | ReadOnlyField + 🔒 |
| Nome | ✅ | FormField + Input |
| Nível | ❌ | ReadOnlyField + 🔒 |
| Unidade Pai | ❌ | ReadOnlyField + 🔒 |
| CNPJ | ✅ | FormField + Input |
| Razão Social | ✅ | FormField + Input |
| Filial | ✅ | FormField + Input |
| Responsável | ✅ | FormField + Input |
| Telefone | ✅ | FormField + Input |
| E-mail | ✅ | FormField + Input |
| Status | ✅ | Toggle |

---

## 4. Frame: 11-OrgForm-Create (Nova Subdivisão)

Acionado pelo botão **"+ Nova Subdivisão"** no header do detalhe.

```
11-OrgForm-Create (frame 1440×900)
│
├── AppShell (Topbar + Sidebar)
│
└── ContentArea (split-panel)
    │
    ├── FormPanel (480px, fill #FFFFFF, border-right 1px #E8E8E6)
    │   │  SUBSTITUI o PainelÁrvore — a árvore está oculta
    │   │
    │   ├── Header: ← "Nova Subdivisão"  ×
    │   │
    │   ├── Body:
    │   │   ├── InfoBox azul "A nova subdivisão será criada como filha de A1 Engenharia (N2)."
    │   │   ├── ReadOnlyField "UNIDADE PAI" = "A1 Engenharia" + 🔒
    │   │   ├── ReadOnlyField "NÍVEL" = "N3 — Unidade" + 🔒 (auto-calculado)
    │   │   ├── FormField "NOME DA SUBDIVISÃO" (obrigatório)
    │   │   ├── Separador
    │   │   ├── SectionLabel "DADOS CADASTRAIS (opcional)"
    │   │   ├── FormField "CNPJ"
    │   │   ├── FormField "RAZÃO SOCIAL"
    │   │   └── FormField "RESPONSÁVEL"
    │   │
    │   └── Footer: "Cancelar" + "Criar Subdivisão"
    │
    └── PainelDetalhe (flex, VISÍVEL NORMALMENTE — sem overlay)
```

---

## 5. Frame: 11-OrgForm-Deactivate (Modal de Confirmação)

Acionado por um dropdown ou ação futura de "Desativar" no nó.

```
11-OrgForm-Deactivate (frame 1440×900)
│
├── AppShell (Topbar + Sidebar)
│
├── ContentArea (estado normal da 10-OrgTree visível por trás)
│   ├── PainelÁrvore (380px, visível normalmente)
│   └── PainelDetalhe (flex, visível normalmente)
│
└── ConfirmationModal (centrado sobre toda a tela)
    │
    ├── ÍconeAlerta (48×48, r:50%, fill #FFEBEE)
    │   └── TriangleAlert (24×24, stroke #E74C3C)
    │
    ├── "Desativar unidade?" (text 20px 700 #111111, mt:16px, text-center)
    │
    ├── Descrição (text 14px 400 #555555, mt:8px, text-center, max-w:380px)
    │   "A unidade A1 Engenharia será desativada. Todas as subdivisões
    │    vinculadas também serão afetadas. Você poderá restaurá-la
    │    posteriormente."
    │
    ├── WarningBox (fill #FFF3E0, r:8, p:12px 16px, mt:20px)
    │   ├── ÍconeWarning (16×16, stroke #E67E22)
    │   └── "3 subdivisões e 156 colaboradores serão impactados." (13px #B8860B)
    │
    └── BotõesModal (group horizontal, gap:12px, mt:24px, justify-center)
        ├── "Cancelar" (btn secondary: h:44, r:8, w:180)
        └── "Desativar" (btn danger: h:44, r:8, w:180, fill #E74C3C, text #FFF 700)
```

---

## 6. Cores (específicas desta tela)

```
FORM PANEL           fill:#FFFFFF  border-right:1px #E8E8E6  (substitui a árvore, sem shadow)
MODAL OVERLAY        rgba(0,0,0,0.4)    Somente para o modal de desativação
READONLY BG          #F8F8F6             Campos imutáveis
READONLY BORDER      #F0F0EE
LOCK ICON            #AAAAAA             Cadeado nos campos imutáveis
INFO BOX BG          #F0F8FF             Info de criação
INFO BOX TEXT        #2E86C1
WARNING BOX BG       #FFF3E0             Warning no modal
WARNING BOX TEXT     #B8860B
ALERT ICON BG        #FFEBEE             Fundo do ícone de alerta
ALERT ICON           #E74C3C
BTN DANGER           fill:#E74C3C  text:#FFFFFF  hover:#C0392B
```

---

## 7. Tipografia (conteúdo específico)

```
DRAWER
  Título drawer       700  18px  #111111
  Ícone fechar        20×20  stroke #888888
  Section label        700  10px  uppercase  ls:+1px  #888888
  ReadOnly label       700  10px  uppercase  ls:+0.8px  #888888
  ReadOnly valor       500  14px  #111111
  Form label           700  11px  uppercase  ls:+0.8px  #333333
  Form input           400  14px  #111111
  Form placeholder     400  14px  #CCCCCC
  Toggle label         500  13px  #333333
  Info text            400  13px  #2E86C1
  Footer btn cancel    600  13px  #555555
  Footer btn primary   700  13px  #FFFFFF

MODAL
  Título               700  20px  #111111
  Descrição            400  14px  #555555
  Warning text         400  13px  #B8860B
  Btn cancel           600  13px  #555555
  Btn danger           700  13px  #FFFFFF
```

---

## 8. Medidas

```
FormPanel            480×836     fill:#FFF  border-right:1px #E8E8E6  (no lugar da árvore)
FormHeader           480×64      border-bottom:1px #E8E8E6  padding:0 24px
FormBody             480×auto    padding:24px  overflow-y:auto
FormFooter           480×72      border-top:1px #E8E8E6  padding:16px 24px
Form input           ~432×48     r:10  border:1px #E8E8E6
ReadOnly field       ~432×42     r:8   fill:#F8F8F6  border:1px #F0F0EE
Lock icon            14×14       stroke:#AAAAAA
Toggle track         40×22       r:11
Toggle thumb         18×18       r:50%  fill:#FFF
Modal                480×auto    r:16  padding:32px  max-width:480px
Modal alert icon bg  48×48       r:50%  fill:#FFEBEE
Modal btn            180×44      r:8
```

---

## 9. Componentes Reutilizáveis

| Componente | Novo? | Descrição |
|------------|-------|-----------|
| `ui/FormPanel` | **Sim** | Painel lateral 480px com header(←/título/×)/body/footer que substitui a árvore | 
| `ui/ReadOnlyField` | Existente (10-OrgTree) | Com adição do ícone 🔒 nesta variante |
| `ui/Toggle` | Existente | Track + thumb para status |
| `ui/ConfirmationModal` | **Sim** | Modal centrado com ícone alerta, descrição, warning box, 2 botões |
| `ui/WarningBox` | **Sim** | Box amarelo com ícone + texto de impacto |
| `ui/InfoBox` | Existente (06-UserForm) | Box azul com ícone info + texto |

---

## 10. Checklist

### 11-OrgForm-Edit
- [ ] Árvore OCULTA — não aparece durante edição
- [ ] FormPanel 480px no lugar da árvore, com fill branco e border-right
- [ ] Detalhe visível normalmente ao lado — SEM overlay, SEM escurecimento
- [ ] FormHeader: botão ← (volta para árvore) + "Editar Unidade" + botão ×
- [ ] Código com ReadOnlyField + ícone cadeado
- [ ] Nome como input editável com valor preenchido
- [ ] Nível e Pai com ReadOnlyField + cadeado
- [ ] Separador + seção "DADOS CADASTRAIS"
- [ ] 6 campos editáveis (CNPJ, Razão, Filial, Responsável, Tel, Email)
- [ ] Toggle de status (Ativo/Inativo)
- [ ] Footer: "Cancelar" + "Salvar Alterações"

### 11-OrgForm-Create
- [ ] Árvore OCULTA — FormPanel no lugar
- [ ] Detalhe visível normalmente ao lado
- [ ] FormHeader: ← + "Nova Subdivisão" + ×
- [ ] InfoBox azul "será criada como filha de..."
- [ ] Pai e Nível readonly (nível auto-calculado)
- [ ] Campo Nome obrigatório
- [ ] Campos cadastrais opcionais
- [ ] Footer: "Cancelar" + "Criar Subdivisão"

### 11-OrgForm-Deactivate
- [ ] Árvore e Detalhe visíveis por trás do modal (estado normal da 10-OrgTree)
- [ ] Modal centrado com overlay escuro sobre toda a tela
- [ ] Ícone de alerta vermelho em fundo circular
- [ ] "Desativar unidade?" como título
- [ ] Descrição do impacto
- [ ] WarningBox amarelo com contagem de afetados
- [ ] Botões "Cancelar" + "Desativar" (vermelho)
