// script_ambiente3.js - Versão Sem Lógica de Edição

// --- Acessando os elementos do DOM ---
const modalCriar = document.getElementById('modalCriar');
const abrirModalCriarBtn = document.getElementById('abrirModal');
const fecharModalBtns = document.querySelectorAll('.close');
const listaAmbientes = document.getElementById('lista-ambientes');

// Elementos do formulário de criação
const formCriar = modalCriar.querySelector('form');
const nomeInputCriar = modalCriar.querySelector('#nome_ambiente');
const capacidadeInputCriar = modalCriar.querySelector('#capacidade_ambiente');
const numInputCriar = modalCriar.querySelector('#num_ambiente');
const tipoAmbienteSelectCriar = modalCriar.querySelector('#tipo_ambiente_id');

// URLs da API
const URL_GET_TIPOS = 'http://10.188.35.86:8024/arthur-pereira/api_sga/api/tipos-ambientes';
const URL_GET_AMBIENTES = 'http://10.188.35.86:8024/arthur-pereira/api_sga/api/ambientes';
const URL_POST_AMBIENTE = 'http://10.188.35.86:8024/arthur-pereira/api_sga/api/ambientes';
const URL_TOGGLE_STATUS = 'http://10.188.35.86:8024/arthur-pereira/api_sga/api/ambientes/';

// ---------- Helpers ----------
function showSuccess(msg) {
    Swal.fire({ title: "Sucesso!", text: msg, icon: "success", confirmButtonText: "Ok" });
}
function showError(msg) {
    Swal.fire({ title: "Erro!", text: msg, icon: "error", confirmButtonText: "Ok" });
}
function safeParseInt(val) {
    if (val === null || val === undefined || val === '') return null;
    const p = parseInt(val);
    return Number.isNaN(p) ? null : p;
}

// --- Cria o HTML do card ---
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
                <button class="status_docente ${statusClass}" data-id="${ambiente.id}" data-status="${ambiente.status_ambiente}">
                    <i class="bi ${statusIconClass}"></i>${statusText}
                </button>
            </div>
        </div>
    `;
}

// --- Carregar ambientes ---
async function carregarAmbientes() {
    try {
        const response = await fetch(URL_GET_AMBIENTES, { headers: { 'Accept': 'application/json' } });
        if (!response.ok) throw new Error('Falha ao carregar os ambientes.');
        const data = await response.json();
        listaAmbientes.innerHTML = '';
        const ambientes = data.data || data;
        if (ambientes && ambientes.length > 0) {
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

// --- Toggle status ---
async function toggleStatusAmbiente(ambienteId) {
    try {
        const response = await fetch(`${URL_TOGGLE_STATUS}${ambienteId}/toggle-status`, {
            method: 'POST',
            headers: { 'Accept': 'application/json' },
        });
        if (!response.ok) {
            const errorData = await response.json().catch(()=>({}));
            throw new Error(errorData.message || 'Falha ao alternar o status do ambiente.');
        }
        await carregarAmbientes();
    } catch (error) {
        console.error('Erro ao alternar o status:', error);
        showError(error.message || 'Erro ao alterar o status do ambiente. Tente novamente.');
    }
}

// --- Modais ---
abrirModalCriarBtn.addEventListener('click', async () => {
    await carregarTiposAmbiente(tipoAmbienteSelectCriar);
    modalCriar.style.display = 'block';
});

fecharModalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const modal = document.getElementById(btn.getAttribute('data-modal'));
        if (modal) modal.style.display = 'none';
    });
});

window.addEventListener('click', (event) => {
    if (event.target == modalCriar) modalCriar.style.display = 'none';
});

// --- Criação de ambiente ---
formCriar.addEventListener('submit', handleFormSubmitCriar);

async function handleFormSubmitCriar(event) {
    event.preventDefault();
    const selectedStatus = document.querySelector('input[name="status_ambiente_criar"]:checked');
    const statusAmbiente = selectedStatus ? selectedStatus.value : '1';
    const payload = {
        nome_ambiente: nomeInputCriar.value.trim(),
        num_ambiente: numInputCriar.value || null,
        capacidade_ambiente: safeParseInt(capacidadeInputCriar.value),
        tipo_ambiente_id: safeParseInt(tipoAmbienteSelectCriar.value),
        status_ambiente: safeParseInt(statusAmbiente)
    };

    try {
        const response = await fetch(URL_POST_AMBIENTE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (response.ok) {
            showSuccess('Ambiente criado com sucesso!');
            formCriar.reset();
            modalCriar.style.display = 'none';
            carregarAmbientes();
        } else {
            const responseData = await response.json().catch(()=>({}));
            const errorMessage = responseData.message || 'Ocorreu um erro ao criar o ambiente.';
            showError(errorMessage);
        }
    } catch (error) {
        console.error(error);
        showError('Erro de rede ou falha na API. Verifique a conexão e tente novamente.');
    }
}

// --- Carrega tipos para uma select ---
async function carregarTiposAmbiente(selectElement, selectedId = null) {
    try {
        const response = await fetch(URL_GET_TIPOS, { headers: { 'Accept': 'application/json' } });
        if (!response.ok) throw new Error('Falha ao carregar os tipos de ambiente.');
        const data = await response.json();

        selectElement.innerHTML = '<option value="">Selecione um tipo</option>';
        const tipos = data.data || data;
        if (Array.isArray(tipos)) {
            tipos.forEach(tipo => {
                const option = document.createElement('option');
                option.value = tipo.id;
                option.textContent = tipo.nome_tipo_ambiente;
                if (selectedId && tipo.id === selectedId) {
                    option.selected = true;
                }
                selectElement.appendChild(option);
            });
        }
    } catch (error) {
        console.error(error);
        selectElement.innerHTML = '<option value="">Erro ao carregar</option>';
    }
}

// --- Event delegation para botões da lista ---
listaAmbientes.addEventListener('click', async (event) => {
    const statusBtn = event.target.closest('.status_docente');

    if (statusBtn) {
        const ambienteId = statusBtn.getAttribute('data-id');
        if (ambienteId) toggleStatusAmbiente(ambienteId);
    }
});

// --- Ao carregar a página ---
document.addEventListener('DOMContentLoaded', () => {
    carregarAmbientes();
});

// --- Menu lateral e pesquisa (mantidos) ---
const menuBtn = document.getElementById('menu-btn');
const sidebar = document.getElementById('sidebar');
const mainContent = document.querySelector('main');
if (menuBtn) {
    menuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('active');
        menuBtn.classList.toggle('active');
        mainContent.classList.toggle('push');
    });
}

const searchInput = document.getElementById('searchInput');
if (searchInput) {
    searchInput.addEventListener('keyup', () => {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const ambientesCards = document.querySelectorAll('.info_docente');
        ambientesCards.forEach(card => {
            const nome = (card.querySelector('.nome b')?.textContent || '').toLowerCase();
            const tipoElement = card.querySelector('.tipo');
            const tipo = (tipoElement ? tipoElement.textContent : '').toLowerCase();
            const capacidade = (card.querySelector('.capacidade')?.textContent || '').toLowerCase();
            if (nome.includes(searchTerm) || tipo.includes(searchTerm) || capacidade.includes(searchTerm)) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    });
}