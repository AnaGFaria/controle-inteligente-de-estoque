// ===== Dados =====
const CHAVE = "estoque_produtos";
let produtos = [];
let idEditando = null; // null = cadastrando; com valor = editando

const rotulos = {
  "sem-estoque": "Sem estoque",
  "critico": "Estoque crítico",
  "normal": "Estoque normal"
};

// busca rápida de elementos pelo id
const $ = id => document.getElementById(id);

// ===== Persistência (localStorage) =====
function salvarProdutos() {
  localStorage.setItem(CHAVE, JSON.stringify(produtos));
}

function produtoValido(p) {
  return p && p.id && p.nome && p.categoria
    && p.quantidade >= 0 && p.minimo >= 0 && p.preco > 0;
}

function carregarProdutos() {
  try {
    const dados = JSON.parse(localStorage.getItem(CHAVE)) || [];
    const validos = dados.filter(produtoValido); // descarta registros inválidos
    if (validos.length < dados.length) {
      mostrarMensagem("Alguns registros inválidos foram ignorados.", "aviso");
    }
    return validos;
  } catch (erro) {
    mostrarMensagem("Dados salvos corrompidos. Começando do zero.", "erro");
    return [];
  }
}

// ===== Regras de negócio =====
function classificar(produto) {
  if (produto.quantidade === 0) return "sem-estoque";
  if (produto.quantidade <= produto.minimo) return "critico";
  return "normal";
}

function valorTotal(produto) {
  return produto.quantidade * produto.preco;
}

function nomeDuplicado(nome) {
  return produtos.some(p => p.nome.toLowerCase() === nome.toLowerCase() && p.id !== idEditando);
}

// Devolve o texto do erro, ou "" se estiver tudo certo
function validar(d) {
  if (d.nome === "" || d.categoria === "") 
    return "Preencha o nome e a categoria.";
  if (isNaN(d.quantidade) || isNaN(d.minimo) || isNaN(d.preco)) 
    return "Preencha quantidade, mínimo e preço.";
  if (d.quantidade < 0 || d.minimo < 0) 
    return "Quantidades não podem ser negativas.";
  if (!Number.isInteger(d.quantidade) || !Number.isInteger(d.minimo)) 
    return "Quantidades devem ser números inteiros.";
  if (d.preco <= 0) 
    return "O preço deve ser maior que zero.";
  if (nomeDuplicado(d.nome)) 
    return `Já existe um produto chamado "${d.nome}".`;
  return "";
}

// ===== Processamento =====
function produtosFiltrados() {
  const busca = $("busca").value.trim().toLowerCase();
  const categoria = $("filtro-categoria").value;
  const situacao = $("filtro-situacao").value;
  const ordem = $("ordenacao").value;

  return produtos
    .filter(p => p.nome.toLowerCase().includes(busca))
    .filter(p => categoria === "" || p.categoria === categoria)
    .filter(p => situacao === "" || classificar(p) === situacao)
    .sort((a, b) => {
      if (ordem === "quantidade") 
        return a.quantidade - b.quantidade;
      if (ordem === "preco") 
        return a.preco - b.preco;
      return a.nome.localeCompare(b.nome);
    });
}

// ===== Tela =====
const moeda = v => v.toLocaleString("pt-BR", { 
    style: "currency", currency: "BRL" 
});

// Impede que o texto digitado vire HTML
const escapar = t => t.replace(/[&<>"']/g, c => "&#" + c.charCodeAt(0) + ";");

function mostrarMensagem(texto, tipo = "sucesso") {
  const caixa = $("mensagem");
  caixa.textContent = texto;
  caixa.className = "mensagem " + tipo;
  caixa.hidden = false;
  setTimeout(() => { caixa.hidden = true; }, 4000);
}

function mostrarIndicadores() {
  $("ind-total").textContent = produtos.length;
  $("ind-sem").textContent = produtos.filter(p => classificar(p) === "sem-estoque").length;
  $("ind-critico").textContent = produtos.filter(p => classificar(p) === "critico").length;
  $("ind-valor").textContent = moeda(produtos.reduce((soma, p) => soma + valorTotal(p), 0));
}

function mostrarPrioritarios() {
  const cinco = [...produtos].sort((a, b) => a.quantidade - b.quantidade).slice(0, 5);
  $("lista-prioritarios").innerHTML = cinco.length === 0
    ? "<li>Nenhum produto cadastrado.</li>"
    : cinco.map(p => `<li>${escapar(p.nome)} <span>— ${p.quantidade} un.</span></li>`).join("");
}

function mostrarCategorias() {
  const categorias = [...new Set(produtos.map(p => p.categoria))].sort();
  const atual = $("filtro-categoria").value;
  const opcoes = categorias.map(c => `<option value="${escapar(c)}">${escapar(c)}</option>`).join("");

  $("filtro-categoria").innerHTML = '<option value="">Todas as categorias</option>' + opcoes;
  $("filtro-categoria").value = categorias.includes(atual) ? atual : "";
  $("lista-categorias").innerHTML = opcoes; // sugestões no campo do formulário
}

function mostrarTabela() {
  const lista = produtosFiltrados();

  $("corpo-tabela").innerHTML = lista.map(p => {
    const situacao = classificar(p);
    return `<tr>
      <td>${escapar(p.nome)}<small>${escapar(p.categoria)}</small></td>
      <td>${p.quantidade}</td>
      <td>${p.minimo}</td>
      <td>${moeda(p.preco)}</td>
      <td>${moeda(valorTotal(p))}</td>
      <td><span class="situacao ${situacao}">${rotulos[situacao]}</span></td>
      <td class="acoes">
        <button class="btn pequeno" data-acao="editar" data-id="${p.id}">Editar</button>
        <button class="btn pequeno perigo" data-acao="excluir" data-id="${p.id}">Excluir</button>
      </td>
    </tr>`;
  }).join("");

  // Lista vazia ou pesquisa sem resultados
  if (produtos.length === 0) {
    $("sem-resultados").textContent = "Nenhum produto cadastrado ainda.";
  } else {
    $("sem-resultados").textContent = "Nenhum produto encontrado com esses filtros.";
  }
  $("sem-resultados").hidden = lista.length > 0;
}

// Atualiza tudo que depende dos dados
function atualizarTela() {
  mostrarCategorias();
  mostrarTabela();
  mostrarIndicadores();
  mostrarPrioritarios();
}

// ===== Ações =====
function limparFormulario() {
  $("form-produto").reset();
  idEditando = null;
  $("titulo-form").textContent = "Novo produto";
  $("btn-salvar").textContent = "Cadastrar produto";
  $("btn-cancelar").hidden = true;
}

function editarProduto(id) {
  const produto = produtos.find(p => p.id === id);
  if (!produto) {
    mostrarMensagem("Produto não encontrado.", "erro");
    return atualizarTela();
  }
  idEditando = id;
  $("nome").value = produto.nome;
  $("categoria").value = produto.categoria;
  $("quantidade").value = produto.quantidade;
  $("minimo").value = produto.minimo;
  $("preco").value = produto.preco;
  $("titulo-form").textContent = "Editar produto";
  $("btn-salvar").textContent = "Salvar alterações";
  $("btn-cancelar").hidden = false;
}

function excluirProduto(id) {
  const produto = produtos.find(p => p.id === id);
  if (!produto) {
    mostrarMensagem("Produto não encontrado.", "erro");
    return atualizarTela();
  }
  if (!confirm(`Excluir "${produto.nome}"?`)) return;

  produtos = produtos.filter(p => p.id !== id);
  salvarProdutos();
  limparFormulario();
  atualizarTela();
  mostrarMensagem(`"${produto.nome}" excluído.`);
}

function salvarFormulario(evento) {
  evento.preventDefault();

  const dados = {
    nome: $("nome").value.trim(),
    categoria: $("categoria").value.trim(),
    quantidade: parseFloat($("quantidade").value),
    minimo: parseFloat($("minimo").value),
    preco: parseFloat($("preco").value)
  };

  const erro = validar(dados);
  if (erro) return mostrarMensagem(erro, "erro");

  if (idEditando) {
    const indice = produtos.findIndex(p => p.id === idEditando);
    if (indice === -1) {
      mostrarMensagem("Produto não encontrado.", "erro");
      limparFormulario();
      return atualizarTela();
    }
    produtos[indice] = { id: idEditando, ...dados };
    mostrarMensagem("Produto atualizado.");
  } else {
    produtos.push({ id: Date.now().toString(), ...dados });
    mostrarMensagem("Produto cadastrado.");
  }

  salvarProdutos();
  limparFormulario();
  atualizarTela();
}

// ===== Eventos =====
$("form-produto").addEventListener("submit", salvarFormulario);
$("btn-cancelar").addEventListener("click", limparFormulario);

// Um único listener na tabela atende todos os botões Editar/Excluir
$("corpo-tabela").addEventListener("click", evento => {
  const botao = evento.target.closest("button");
  if (!botao) return;
  if (botao.dataset.acao === "editar") editarProduto(botao.dataset.id);
  if (botao.dataset.acao === "excluir") excluirProduto(botao.dataset.id);
});

["busca", "filtro-categoria", "filtro-situacao", "ordenacao"].forEach(id => {
  $(id).addEventListener("input", mostrarTabela);
});

// ===== Início =====
produtos = carregarProdutos();
atualizarTela();