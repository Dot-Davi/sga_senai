// script_ambiente3.js - versão corrigida para o botão "Salvar" do modal de edição

// --- Acessando os elementos do DOM ---
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

// Lista de ambientes
const listaAmbientes = document.getElementById('lista-ambientes');

// URLs da API
const URL_GET_TIPOS = 'http://10.188.35.86:8024/arthur-pereira/api_sga/api/tipos-ambientes';
const URL_GET_AMBIENTES = 'http://10.188.35.86:8024/arthur-pereira/api_sga/api/ambientes';
const URL_POST_AMBIENTE = 'http://10.188.35.86:8024/arthur-pereira/api_sga/api/ambientes';
const URL_TOGGLE_STATUS = 'http://10.188.35.86:8024/arthur-pereira/api_sga/api/ambientes/';
const URL_PUT_AMBIENTE = 'http://10.188.35.86:8024/arthur-pereira/api_sga/api/ambientes/';

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
                <button class="editar_docente" data-id="${ambiente.id}"><i class="bi bi-pen-fill"></i>Editar </button>
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
    if (event.target == modalEditar) modalEditar.style.display = 'none';
});

// --- Criação de ambiente ---
const btnCriar = document.getElementById('btnCriar');
if (btnCriar) btnCriar.addEventListener('click', handleFormSubmit);

async function handleFormSubmit(event) {
    event.preventDefault();
    const selectedStatus = document.querySelector('input[name="status_ambiente"]:checked');
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

// --- Carregar dados para edição ---
async function carregarDadosParaEdicao(ambienteId) {
    try {
        const response = await fetch(`${URL_GET_AMBIENTES}/${ambienteId}`, { headers: { 'Accept': 'application/json' } });
        if (!response.ok) throw new Error('Falha ao carregar dados do ambiente para edição.');
        const data = await response.json();
        const ambiente = data.data || data;

        editIdInput.value = ambiente.id;
        editNomeInput.value = ambiente.nome_ambiente || '';
        editCapacidadeInput.value = ambiente.capacidade_ambiente || '';
        editNumInput.value = ambiente.num_ambiente || '';

        const tipoId = ambiente.tipo_ambiente_id;
        if (tipoId != null) {
            let option = editTipoSelect.querySelector(`option[value="${tipoId}"]`);
            if (!option) {
                option = document.createElement('option');
                option.value = tipoId;
                option.textContent = ambiente.tipo_ambiente ? ambiente.tipo_ambiente.nome_tipo_ambiente : `Tipo ${tipoId}`;
                editTipoSelect.appendChild(option);
            }
            editTipoSelect.value = tipoId;
        } else {
            editTipoSelect.value = '';
        }
    } catch (error) {
        console.error('Erro ao carregar dados para edição:', error);
        showError('Erro ao carregar dados para edição. Tente novamente.');
    }
}

async function abrirModalEditar(ambienteId) {
    await carregarTiposAmbiente(editTipoSelect).catch(()=>{ /* ignora */ });
    await carregarDadosParaEdicao(ambienteId);
    modalEditar.style.display = 'block';
}

// --- Envio do formulário de edição (corrigido e robusto) ---
if (formEditar) {
    formEditar.addEventListener('submit', handleEditFormSubmit);
}

async function handleEditFormSubmit(event) {
    event.preventDefault();

    const submitBtn = formEditar.querySelector('button[type="submit"]') || formEditar.querySelector('.btn-salvar');

    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.dataset.originalText = submitBtn.textContent;
        submitBtn.textContent = 'Salvando...';
    }

    const ambienteId = editIdInput.value;
    if (!ambienteId) {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = submitBtn.dataset.originalText || 'Salvar'; }
        return showError('ID do ambiente não encontrado. Reabra o modal e tente novamente.');
    }

    // A API foi alterada para não exigir o status na edição, então o payload agora
    // contém apenas os dados editáveis do formulário.
    const payload = {
        nome_ambiente: String(editNomeInput.value || '').trim(),
        num_ambiente: editNumInput.value || null,
        capacidade_ambiente: safeParseInt(editCapacidadeInput.value),
        tipo_ambiente_id: safeParseInt(editTipoSelect.value)
    };

    try {
        const response = await fetch(`${URL_PUT_AMBIENTE}${ambienteId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(payload),
        });

        const responseData = await response.json().catch(()=>({}));

        if (response.ok) {
            showSuccess('Ambiente editado com sucesso!');
            modalEditar.style.display = 'none';
            await carregarAmbientes();
        } else {
            const errorMessage = responseData.message || 'Ocorreu um erro ao editar o ambiente.';
            showError(errorMessage);
        }
    } catch (error) {
        console.error('Erro ao enviar PUT:', error);
        showError('Erro de rede ou falha na API. Verifique a conexão e tente novamente.');
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = submitBtn.dataset.originalText || 'Salvar';
        }
    }
}

// --- Carrega tipos para uma select ---
async function carregarTiposAmbiente(selectElement) {
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
    const editBtn = event.target.closest('.editar_docente');

    if (statusBtn) {
        const ambienteId = statusBtn.getAttribute('data-id');
        if (ambienteId) toggleStatusAmbiente(ambienteId);
    }

    if (editBtn) {
        const ambienteId = editBtn.getAttribute('data-id');
        if (ambienteId) abrirModalEditar(ambienteId);
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