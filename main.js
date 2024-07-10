const API = "https://backoffice.app.cetreina.uerj.br/items/publicacoes";
let noticiasPorPagina = 9;

let paginacao = {
  page: 1,
  totalPages: 1,
  totalNoticias: 0,
  noticias: {},
};

document.addEventListener("DOMContentLoaded", async () => {
  carregarNoticiasDoLocalStorage();
  await inicializarPaginacao();
  if (paginacao.noticias[paginacao.page]) {
    atualizarInterface(paginacao.page);
  } else {
    carregarNoticias(1);
  }
});

async function inicializarPaginacao() {
  const resposta = await fetch(API);
  if (!resposta.ok) throw new Error("Falha ao buscar notícias");
  const data = await resposta.json();
  paginacao.totalNoticias = data.data.length;
  paginacao.totalPages = Math.ceil(paginacao.totalNoticias / noticiasPorPagina);
  atualizarDropdown(paginacao.totalPages);
}

async function carregarNoticias(pagina) {
  if (paginacao.noticias[pagina]) {
    atualizarInterface(pagina);
    return;
  }

  const resposta = await fetch(`${API}?page=${pagina}&limit=${noticiasPorPagina}`);
  if (!resposta.ok) throw new Error("Falha ao buscar notícias");
  const data = await resposta.json();
  paginacao.noticias[pagina] = data.data;
  salvarNoticiasNoLocalStorage();
  atualizarInterface(pagina);
}

function exibirNoticias(pagina) {
  const container = document.getElementById("newsContainer");
  container.innerHTML = "";
  const noticiasPagina = paginacao.noticias[pagina];

  noticiasPagina.forEach(noticia => {
    let cardHtml = `
      <div class="col-12 mb-4">
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title">${noticia.titulo}</h5>
            <p class="card-text">${noticia.resumo || "Saiba mais..."}</p>
            <button onclick="window.open('${noticia.link}', '_blank')" class="btn btn-primary">Saiba Mais...</button>
          </div>
        </div>
      </div>
    `;
    container.innerHTML += cardHtml;
  });
  container.style.display = "block";
  document.getElementById("carregando").style.display = "none";
}

function atualizarDropdown(totalPages) {
  const selector = document.getElementById('pageSelector');
  selector.innerHTML = '';
  for (let i = 1; i <= totalPages; i++) {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = `Página ${i}`;
    selector.appendChild(option);
  }
  selector.value = paginacao.page;
}

function atualizarInterface(pagina) {
  document.getElementById("carregando").style.display = "block";
  paginacao.page = parseInt(pagina);
  exibirNoticias(paginacao.page);
  document.getElementById('pageSelector').value = paginacao.page;
  document.getElementById("paginaAnterior").disabled = paginacao.page <= 1;
  document.getElementById("proximaPagina").disabled = paginacao.page >= paginacao.totalPages;
}

document.getElementById('pageSelector').addEventListener('change', function () {
  carregarNoticias(this.value);
});

document.getElementById("proximaPagina").addEventListener("click", () => {
  carregarNoticias(paginacao.page + 1);
});

document.getElementById("paginaAnterior").addEventListener("click", () => {
  carregarNoticias(paginacao.page - 1);
});

function definirQuantidade() {
  const radios = document.getElementsByName('quantidadeNoticias');
  radios.forEach(radio => {
    if (radio.checked) {
      noticiasPorPagina = parseInt(radio.value);
      paginacao.totalPages = Math.ceil(paginacao.totalNoticias / noticiasPorPagina);
      atualizarDropdown(paginacao.totalPages);
      carregarNoticias(1);
      document.getElementById("definido").style.display = "block"; 
      setTimeout(() => {
        document.getElementById("definido").style.display = "none"; 
      }, 2000);
    }
  });
}

function salvarNoticiasNoLocalStorage() {
  localStorage.setItem('paginacao', JSON.stringify(paginacao));
}

function carregarNoticiasDoLocalStorage() {
  const dadosSalvos = localStorage.getItem('paginacao');
  if (dadosSalvos) {
    paginacao = JSON.parse(dadosSalvos);
  }
}
