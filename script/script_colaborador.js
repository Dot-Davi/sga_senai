// --- Acessando os elementos do DOM
const modalCriar = document.getElementById('modalCriar');
const modalEditar = document.getElementById('modalEditar');
const abrirModalCriarBtn = document.getElementById('abrirModal');
const fecharModalBtns = document.querySelectorAll('.close');

// Elementos do formulário de criação
const nomeInputCriar = document.getElementById('addNome');
const especialidadeInputCriar = document.getElementById('addEspecialidade');
const corInputCriar = document.getElementById('cor_curso');
const statusRadiosCriar = document.querySelectorAll('input[name="status_ambiente"]');

// Elementos da lista de colaboradores
const listaColaboradores = document.getElementById('lista-colaboradores');

// Variavel de caminho simbolico da API
const API_BASE_URL = 'http://10.188.35.86:8024/arthur-pereira/api_sga/api/';

// URLs da API para colaboradores
const URL_GET_COLABORADORES = `${API_BASE_URL}colaboradores`;
const URL_POST_COLABORADOR = `${API_BASE_URL}colaboradores`;
const URL_PUT_COLABORADOR = `${API_BASE_URL}colaboradores/`;
const URL_TOGGLE_STATUS = `${API_BASE_URL}colaboradores/`;

// --- Função para criar o HTML do card a partir dos dados do colaborador ---
function criarCardColaborador(colaborador) {
    const statusText = colaborador.status === 1 ? 'Ativo' : 'Inativo';
    const statusClass = colaborador.status === 1 ? 'ativo' : 'inativo';
    const statusIconClass = colaborador.status === 1 ? 'bi-check-circle-fill' : 'bi-x-circle';

    return `
        <div class="conteudo_colaborador">
            <div class="info_colaborador" data-id="${colaborador.id}">
                <div class="conteudo">
                    <p class="nome">Nome: <b>${colaborador.nome_colaborador}</b></p>
                    <p class="especialidade"><b><i class="bi bi-briefcase-fill"></i></b>Especialidade: ${colaborador.especialidade_colaborador}</p>
                    <p class="status"><b><i class="bi bi-arrow-clockwise" id="status_para"></i></b>Status: ${statusText}</p>
                </div>
                <div class="funcoes">
                    <button class="editar_colaborador" data-id="${colaborador.id}"><i class="bi bi-pen-fill"></i>Editar </button>
                    <button class="status_colaborador ${statusClass}" data-id="${colaborador.id}" data-status="${colaborador.status}">
                        <i class="bi ${statusIconClass}"></i>${statusText}
                    </button>
                </div>
            </div>
        </div>
    `;
}

// --- Função para carregar todos os colaboradores da API e exibi-los ---
async function carregarColaboradores() {
    try {
        const response = await fetch(URL_GET_COLABORADORES, { headers: { 'Accept': 'application/json' } });
        if (!response.ok) throw new Error('Falha ao carregar os colaboradores.');
        const data = await response.json();

        listaColaboradores.innerHTML = '';

        const colaboradores = data.data || data;
        if (colaboradores.length > 0) {
            colaboradores.forEach(colaborador => {
                const cardHTML = criarCardColaborador(colaborador);
                listaColaboradores.insertAdjacentHTML('beforeend', cardHTML);
            });
        } else {
            listaColaboradores.innerHTML = `<p style="text-align: center; color: #8C8C8C;">Nenhum colaborador encontrado.</p>`;
        }
    } catch (error) {
        console.error('Erro ao carregar colaboradores:', error);
        listaColaboradores.innerHTML = `<p style="text-align: center; color: #ff6666;">Erro ao carregar os colaboradores. Tente novamente mais tarde.</p>`;
    }
}

// --- Função para alternar o status do colaborador ---
async function toggleStatusColaborador(colaboradorId) {
    try {
        const response = await fetch(`${URL_TOGGLE_STATUS}${colaboradorId}/toggle-status`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Falha ao alternar o status do colaborador.');
        }

        carregarColaboradores();
    } catch (error) {
        console.error('Erro ao alternar o status:', error);
        Swal.fire({
            title: "Erro!",
            text: error.message || 'Erro ao alterar o status do colaborador. Tente novamente.',
            icon: "error",
            confirmButtonText: "Ok"
        });
    }
}

// --- Funções do Modal de Criação ---
abrirModalCriarBtn.addEventListener('click', () => {
    modalCriar.style.display = 'block';
});

fecharModalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const modal = document.getElementById(btn.getAttribute('data-modal'));
        modal.style.display = 'none';
    });
});

window.addEventListener('click', (event) => {
    if (event.target == modalCriar) {
        modalCriar.style.display = 'none';
    }
    if (event.target == modalEditar) {
        modalEditar.style.display = 'none';
    }
});

const btnCriar = document.querySelector('#modalCriar .btn-criar');
if (btnCriar) {
    btnCriar.addEventListener('click', handleFormSubmit);
}

async function handleFormSubmit(event) {
    event.preventDefault();

    const statusColaborador = document.querySelector('input[name="status_ambiente"]:checked').value;
    const payload = {
        nome_colaborador: nomeInputCriar.value,
        especialidade_colaborador: especialidadeInputCriar.value,
        cor_colaborador: corInputCriar.value,
        status: parseInt(statusColaborador),
    };

    try {
        const response = await fetch(URL_POST_COLABORADOR, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (response.ok) {
            Swal.fire({
                title: "Sucesso!",
                text: "Colaborador criado com sucesso!",
                icon: "success",
                confirmButtonText: "Ok"
            });
            modalCriar.style.display = 'none';
            carregarColaboradores();
        } else {
            const responseData = await response.json();
            const errorMessage = responseData.message || 'Ocorreu um erro ao criar o colaborador.';
            Swal.fire({
                title: "Erro!",
                text: errorMessage,
                icon: "error",
                confirmButtonText: "Ok"
            });
        }
    } catch (error) {
        console.error(error);
        Swal.fire({
            title: "Erro de rede!",
            text: 'Erro de rede ou falha na API. Por favor, verifique a conexão e tente novamente.',
            icon: "error",
            confirmButtonText: "Ok"
        });
    }
}

// --- Adiciona o event listener na lista de colaboradores para capturar cliques nos botões ---
listaColaboradores.addEventListener('click', async (event) => {
    const statusBtn = event.target.closest('.status_colaborador');
    const editBtn = event.target.closest('.editar_colaborador');

    if (statusBtn) {
        const colaboradorId = statusBtn.getAttribute('data-id');
        toggleStatusColaborador(colaboradorId);
    }

    if (editBtn) {
        const colaboradorId = editBtn.getAttribute('data-id');
        // Você precisará criar a função abrirModalEditarColaborador, similar à do exemplo
        // abrirModalEditarColaborador(colaboradorId); 
        console.log(`Abrir modal de edição para o colaborador ID: ${colaboradorId}`);
    }
});

// Chamar a função para carregar os colaboradores ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    carregarColaboradores();
});