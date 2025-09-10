// Acessando os elementos do DOM
const modalCriar = document.getElementById('modalCriar');
const modalEditar = document.getElementById('modalEditar');
const abrirModalCriarBtn = document.getElementById('abrirModal');
const fecharModalBtns = document.querySelectorAll('.close');

// Elementos do formulário de criação
const formCriar = modalCriar.querySelector('form');
const nomeInputCriar = modalCriar.querySelector('#nome_ambiente');
const capacidadeInputCriar = modalCriar.querySelector('#capacidade_ambiente');
const numInputCriar = modalCriar.querySelector('#num_ambiente');
const tipoAmbienteSelectCriar = modalCriar.querySelector('#tipo_ambiente_id');
const statusRadiosCriar = modalCriar.querySelectorAll('input[name="status_ambiente"]');

// Elementos do formulário de edição
const formEditar = document.getElementById('editarAmbienteForm');
const editIdInput = document.getElementById('edit_ambiente_id');
const editNomeInput = document.getElementById('edit_nome_ambiente');
const editCapacidadeInput = document.getElementById('edit_capacidade_ambiente');
const editNumInput = document.getElementById('edit_num_ambiente');
const editTipoSelect = document.getElementById('edit_tipo_ambiente_id');
const editStatusRadios = document.querySelectorAll('input[name="edit_status_ambiente"]');

// Elementos da lista de ambientes
const listaAmbientes = document.getElementById('lista-ambientes');

// URLs da API
const URL_GET_TIPOS = 'http://10.188.35.86:8024/arthur-pereira/api_sga/api/tipos-ambientes';
const URL_GET_AMBIENTES = 'http://10.188.35.86:8024/arthur-pereira/api_sga/api/ambientes';
const URL_POST_AMBIENTE = 'http://10.188.35.86:8024/arthur-pereira/api_sga/api/ambientes';
const URL_TOGGLE_STATUS = 'http://10.188.35.86:8024/arthur-pereira/api_sga/api/ambientes/';
const URL_PUT_AMBIENTE = 'http://10.188.35.86:8024/arthur-pereira/api_sga/api/ambientes/';

// --- Função para criar o HTML do card a partir dos dados do ambiente ---
function criarCardAmbiente(ambiente) {
    const statusText = ambiente.status_ambiente == 1 ? 'Ativo' : 'Inativo';
    const statusClass = ambiente.status_ambiente == 1 ? 'ativo' : 'inativo';
    const statusIconClass = ambiente.status_ambiente == 1 ? 'bi-check-circle-fill' : 'bi-x-circle';

    const tipoAmbienteNome = ambiente.tipo_ambiente ? ambiente.tipo_ambiente.nome_tipo_ambiente : 'Não especificado';

    return `
        <div class="info_docente" data-id="${ambiente.id}">
            <div class="conteudo">
                <p class="nome">Nome: <b>${ambiente.nome_ambiente}</b></p>
                <p class="tipo"><i class="bi bi-geo-alt-fill" style="margin-right: 5px;"></i>Tipo: ${tipoAmbienteNome}</p>
                <p class="capacidade"><i class="bi bi-people-fill" style="margin-right: 5px;"></i>Capacidade: ${ambiente.capacidade_ambiente} pessoas</p>
                <p class="status"><b><i class="bi bi-arrow-clockwise" id="status_para"></i></b>Status: ${statusText}</p>
            </div>
            <div class="funcoes">
                <button class="editar_docente" data-id="${ambiente.id}"><i class="bi bi-pen-fill"></i>Editar </button>
                <button class="status_docente ${statusClass}" data-id="${ambiente.id}" data-status="${ambiente.status_ambiente}">
                    <i class="bi ${statusIconClass}"></i>${statusText}
                </button>
            </div>
        </div>
    `;
}

// --- Função para carregar todos os ambientes da API e exibi-los ---
async function carregarAmbientes() {
    try {
        const response = await fetch(URL_GET_AMBIENTES, { headers: { 'Accept': 'application/json' } });
        if (!response.ok) throw new Error('Falha ao carregar os ambientes.');
        const data = await response.json();

        listaAmbientes.innerHTML = '';

        const ambientes = data.data || data;
        if (ambientes.length > 0) {
            ambientes.forEach(ambiente => {
                const cardHTML = criarCardAmbiente(ambiente);
                listaAmbientes.insertAdjacentHTML('beforeend', cardHTML);
            });
        } else {
            listaAmbientes.innerHTML = `<p style="text-align: center; color: #8C8C8C;">Nenhum ambiente encontrado.</p>`;
        }
    } catch (error) {
        console.error('Erro ao carregar ambientes:', error);
        listaAmbientes.innerHTML = `<p style="text-align: center; color: #ff6666;">Erro ao carregar os ambientes. Tente novamente mais tarde.</p>`;
    }
}

// --- Função para alternar o status do ambiente ---
async function toggleStatusAmbiente(ambienteId) {
    try {
        const response = await fetch(`${URL_TOGGLE_STATUS}${ambienteId}/toggle-status`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Falha ao alternar o status do ambiente.');
        }

        // Recarrega todos os ambientes para garantir que a interface esteja sincronizada com a API
        carregarAmbientes();
    } catch (error) {
        console.error('Erro ao alternar o status:', error);
        Swal.fire({
            title: "Erro!",
            text: error.message || 'Erro ao alterar o status do ambiente. Tente novamente.',
            icon: "error",
            confirmButtonText: "Ok"
        });
    }
}

// --- Funções do Modal ---
abrirModalCriarBtn.addEventListener('click', async () => {
    await carregarTiposAmbiente(tipoAmbienteSelectCriar);
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


// --- Funções do Formulário de Criação ---
const btnCriar = document.getElementById('btnCriar');
if (btnCriar) {
    btnCriar.addEventListener('click', handleFormSubmit);
}

async function handleFormSubmit(event) {
    event.preventDefault();

    const statusAmbiente = document.querySelector('input[name="status_ambiente"]:checked').value;
    const payload = {
        nome_ambiente: nomeInputCriar.value,
        num_ambiente: numInputCriar.value || null,
        capacidade_ambiente: parseInt(capacidadeInputCriar.value),
        tipo_ambiente_id: parseInt(tipoAmbienteSelectCriar.value),
        status_ambiente: parseInt(statusAmbiente),
    };

    try {
        const response = await fetch(URL_POST_AMBIENTE, {
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
                text: "Ambiente criado com sucesso!",
                icon: "success",
                confirmButtonText: "Ok"
            });
            formCriar.reset();
            modalCriar.style.display = 'none';
            carregarAmbientes();
        } else {
            const responseData = await response.json();
            const errorMessage = responseData.message || 'Ocorreu um erro ao criar o ambiente.';
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

// --- Funções do Modal de Edição ---
async function carregarDadosParaEdicao(ambienteId) {
    try {
        const response = await fetch(`${URL_GET_AMBIENTES}/${ambienteId}`, { headers: { 'Accept': 'application/json' } });
        if (!response.ok) throw new Error('Falha ao carregar dados do ambiente para edição.');
        const data = await response.json();
        const ambiente = data.data || data;

        editIdInput.value = ambiente.id;
        editNomeInput.value = ambiente.nome_ambiente;
        editCapacidadeInput.value = ambiente.capacidade_ambiente;
        editNumInput.value = ambiente.num_ambiente;
        editTipoSelect.value = ambiente.tipo_ambiente_id;

        editStatusRadios.forEach(radio => {
            if (parseInt(radio.value) === ambiente.status_ambiente) {
                radio.checked = true;
            }
        });

    } catch (error) {
        console.error('Erro ao carregar dados para edição:', error);
        alert('Erro ao carregar dados para edição. Tente novamente.');
    }
}

async function abrirModalEditar(ambienteId) {
    await carregarTiposAmbiente(editTipoSelect);
    await carregarDadosParaEdicao(ambienteId);
    modalEditar.style.display = 'block';
}

if (formEditar) {
    formEditar.addEventListener('submit', handleEditFormSubmit);
}

async function handleEditFormSubmit(event) {
    event.preventDefault();

    const ambienteId = editIdInput.value;
    const statusAmbiente = document.querySelector('input[name="edit_status_ambiente"]:checked').value;

    const payload = {
        nome_ambiente: editNomeInput.value,
        num_ambiente: editNumInput.value || null,
        capacidade_ambiente: parseInt(editCapacidadeInput.value),
        tipo_ambiente_id: parseInt(editTipoSelect.value),
        status_ambiente: parseInt(statusAmbiente),
    };

    try {
        const response = await fetch(`${URL_PUT_AMBIENTE}${ambienteId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(payload),
        });
        const responseData = await response.json();

        if (response.ok) {
            Swal.fire({
                title: "Sucesso!",
                text: "Ambiente editado com sucesso!",
                icon: "success",
                confirmButtonText: "Ok"
            });
            modalEditar.style.display = 'none';
            carregarAmbientes();
        } else {
            const errorMessage = responseData.message || 'Ocorreu um erro ao editar o ambiente.';
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

async function carregarTiposAmbiente(selectElement) {
    try {
        const response = await fetch(URL_GET_TIPOS, { headers: { 'Accept': 'application/json' } });
        if (!response.ok) throw new Error('Falha ao carregar os tipos de ambiente.');
        const data = await response.json();

        selectElement.innerHTML = '<option value="">Selecione um tipo</option>';
        const tipos = data.data || data;

        tipos.forEach(tipo => {
            const option = document.createElement('option');
            option.value = tipo.id;
            option.textContent = tipo.nome_tipo_ambiente;
            selectElement.appendChild(option);
        });
    } catch (error) {
        console.error(error);
        selectElement.innerHTML = '<option value="">Erro ao carregar</option>';
    }
}

// --- Adiciona o event listener na lista de ambientes para capturar cliques nos botões ---
listaAmbientes.addEventListener('click', async (event) => {
    const statusBtn = event.target.closest('.status_docente');
    const editBtn = event.target.closest('.editar_docente');

    if (statusBtn) {
        const ambienteId = statusBtn.getAttribute('data-id');
        toggleStatusAmbiente(ambienteId);
    }

    if (editBtn) {
        const ambienteId = editBtn.getAttribute('data-id');
        abrirModalEditar(ambienteId);
    }
});

// Chamar a função para carregar os ambientes ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    carregarAmbientes();
});

// --- Funcionalidade do menu lateral ---
const menuBtn = document.getElementById('menu-btn');
const sidebar = document.getElementById('sidebar');
const mainContent = document.querySelector('main');

menuBtn.addEventListener('click', () => {
    sidebar.classList.toggle('active');
    menuBtn.classList.toggle('active');
    mainContent.classList.toggle('push');
});

// --- Funcionalidade de pesquisa ---
const searchInput = document.getElementById('searchInput');

searchInput.addEventListener('keyup', () => {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const ambientesCards = document.querySelectorAll('.info_docente');

    ambientesCards.forEach(card => {
        const nome = card.querySelector('.nome b').textContent.toLowerCase();
        const tipoElement = card.querySelector('.tipo');
        const tipo = tipoElement ? tipoElement.textContent.toLowerCase() : '';
        const capacidade = card.querySelector('.capacidade').textContent.toLowerCase();

        if (nome.includes(searchTerm) || tipo.includes(searchTerm) || capacidade.includes(searchTerm)) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
});