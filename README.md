# Controle Inteligente de Estoque
Módulo de controle de estoque feito com HTML, CSS e JavaScript puro, sem bibliotecas externas.
Trabalho individual da disciplina de JavaScript (Prof. Cleidson Daniel).

## Funcionalidades
- Cadastro, listagem, edição e exclusão (com confirmação) de produtos
- Pesquisa por nome, filtro por categoria e por situação do estoque
- Ordenação por nome, quantidade ou preço
- Classificação automática: **Sem estoque**, **Estoque crítico** e **Estoque normal**
- Indicadores: total de produtos, sem estoque, estoque crítico e valor total do estoque
- Lista dos 5 produtos com menor quantidade (prioridade de reposição)
- Mensagens de sucesso, erro e ausência de resultados
- Dados salvos no `localStorage`
- Layout responsivo (computador e celular)

## Regras de negócio
| Situação | Condição |
|---|---|
| Sem estoque | quantidade = 0 |
| Estoque crítico | 0 < quantidade ≤ mínimo |
| Estoque normal | quantidade > mínimo |

Regras adicionais:
1. Impede quantidade negativa/fracionada e preço igual ou menor que zero.
2. Bloqueia produtos com nome duplicado.
3. Calcula o valor total por produto (quantidade × preço) e destaca os 3 de maior valor.

## Tecnologias
![HTML](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white) ![CSS](https://img.shields.io/badge/-CSS-1572B6?style=flat-square&logo=css&logoColor=white) ![JavaScript](https://shields.io/badge/JavaScript-F7DF1E?logo=JavaScript&logoColor=000&style=flat-square)

## Como executar
```
# 1. Clone o repositório
git clone https://github.com/AnaGFaria/controle-inteligente-de-estoque.git
cd aula_03-gerenciador_tarefas
# 2. Abra o arquivo `index.html` no navegador. Não precisa de servidor nem de instalação.
```

> O `localStorage` guarda os dados apenas no navegador usado; não é um banco compartilhado.

## Estrutura
```
controle-inteligente-de-estoque/
├── src/                 # Classes de domínio (entidades)
│   ├── style.css        # Estilos e responsividade
│   └── script.js        # lógica, regras de negócio e DOM
├── index.html           # Estrutura da página
└── README.md            # Documentação
```

## Autora
Ana Gabriela de Faria