// script_cursos.js

// --- Acessando os elementos do DOM ---
const modalCriar = document.getElementById('modalCriar');
const abrirModalCriarBtn = document.getElementById('abrirModal');
const fecharModalBtns = document.querySelectorAll('.close');
const listaCursos = document.getElementById('lista-cursos');

// Elementos do formulário de criação
const formCriarCurso = document.getElementById('formCriarCurso');
const nomeInputCriar = document.getElementById('nome_curso');
const valorInputCriar = document.getElementById('valor_curso');
const tipoCursoSelectCriar = document.getElementById('tipo_curso_id');
const duracaoAulaInputCriar = document.getElementById('duracao_aula');
const corInputCriar = document.getElementById('cor_curso');

// URLs da API
// URL atualizada para o endpoint de categorias de curso
const URL_GET_TIPOS = 'http://10.188.35.86:8024/arthur-pereira/api_sga/api/categorias-cursos'; 
const URL_GET_CURSOS = 'http://10.188.35.86:8024/arthur-pereira/api_sga/api/cursos';
const URL_POST_CURSO = 'http://10.188.35.86:8024/arthur-pereira/api_sga/api/cursos';
const URL_TOGGLE_STATUS = 'http://10.188.35.86:8024/arthur-pereira/api_sga/api/cursos/';

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
function safeParseFloat(val) {
    if (val === null || val === undefined || val === '') return null;
    const p = parseFloat(val);
    return Number.isNaN(p) ? null : p;
}

// --- Cria o HTML do card do curso ---
function criarCardCurso(curso) {
    const statusText = curso.status_curso == 1 ? 'Ativo' : 'Inativo';
    const statusClass = curso.status_curso == 1 ? 'ativo' : 'inativo';
    const statusIconClass = curso.status_curso == 1 ? 'bi-check-circle-fill' : 'bi-x-circle';
    const tipoCursoNome = curso.categoria_curso ? curso.categoria_curso.nome_categoria_curso : 'Não especificado';

    return `
        <div class="info_docente" data-id="${curso.id}">
            <div class="conteudo">
                <p class="nome">Nome: <b>${curso.nome_curso}</b></p>
                <p class="valor"><i class="bi bi-currency-dollar" style="margin-right: 5px;"></i>Valor: R$ ${curso.valor_curso}</p>
                <p class="tipo"><i class="bi bi-book-fill" style="margin-right: 5px;"></i>Tipo: ${tipoCursoNome}</p>
                <p class="duracao_aula"><i class="bi bi-alarm" style="margin-right: 5px;"></i>Duração da Aula: ${curso.duracao_aula}min</p>
                <p class="cor_curso"> <i class="bi bi-pencil-fill" style="margin-right: 5px;"></i>Cor do curso: ${curso.cor_curso}</p>
                <p class="status"><b><i class="bi bi-arrow-clockwise" id="status_para"></i></b>Status: ${statusText}</p>
            </div>
            <div class="funcoes_curso">
                <button class="status_docente ${statusClass}" data-id="${curso.id}" data-status="${curso.status_curso}">
                    <i class="bi ${statusIconClass}"></i>${statusText}
                </button>
            </div>
        </div>
    `;
}

// --- Carregar cursos ---
async function carregarCursos() {
    try {
        const response = await fetch(URL_GET_CURSOS, { headers: { 'Accept': 'application/json' } });
        if (!response.ok) throw new Error('Falha ao carregar os cursos.');
        const data = await response.json();
        listaCursos.innerHTML = '';
        const cursos = data.data || data;
        if (cursos && cursos.length > 0) {
            cursos.forEach(curso => {
                const cardHTML = criarCardCurso(curso);
                listaCursos.insertAdjacentHTML('beforeend', cardHTML);
            });
        } else {
            listaCursos.innerHTML = `<p style="text-align: center; color: #8C8C8C;">Nenhum curso encontrado.</p>`;
        }
    } catch (error) {
        console.error('Erro ao carregar cursos:', error);
        listaCursos.innerHTML = `<p style="text-align: center; color: #ff6666;">Erro ao carregar os cursos. Tente novamente mais tarde.</p>`;
    }
}

// --- Toggle status ---
async function toggleStatusCurso(cursoId) {
    try {
        const response = await fetch(`${URL_TOGGLE_STATUS}${cursoId}/toggle-status`, {
            method: 'POST',
            headers: { 'Accept': 'application/json' },
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Falha ao alternar o status do curso.');
        }
        await carregarCursos();
    } catch (error) {
        console.error('Erro ao alternar o status:', error);
        showError(error.message || 'Erro ao alterar o status do curso. Tente novamente.');
    }
}

// --- Modais ---
abrirModalCriarBtn.addEventListener('click', async () => {
    await carregarTiposCurso(tipoCursoSelectCriar);
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

// --- Criação de curso ---
formCriarCurso.addEventListener('submit', handleFormSubmitCriar);

async function handleFormSubmitCriar(event) {
    event.preventDefault();

    const payload = {
        nome_curso: nomeInputCriar.value.trim(),
        valor_curso: safeParseFloat(valorInputCriar.value),
        tipo_curso_id: safeParseInt(tipoCursoSelectCriar.value),
        duracao_aula: safeParseInt(duracaoAulaInputCriar.value),
        cor_curso: corInputCriar.value.trim(),
        status_curso: 1
    };
    
    // Validação básica dos campos
    if (!payload.nome_curso || !payload.valor_curso || !payload.tipo_curso_id || !payload.duracao_aula) {
        showError('Por favor, preencha todos os campos obrigatórios.');
        return;
    }
    
    try {
        const response = await fetch(URL_POST_CURSO, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(payload),
        });
        
        if (response.ok) {
            showSuccess('Curso criado com sucesso!');
            formCriarCurso.reset();
            modalCriar.style.display = 'none';
            carregarCursos();
        } else {
            const responseData = await response.json().catch(() => ({}));
            const errorMessage = responseData.message || 'Ocorreu um erro ao criar o curso.';
            showError(errorMessage);
        }
    } catch (error) {
        console.error(error);
        showError('Erro de rede ou falha na API. Verifique a conexão e tente novamente.');
    }
}

// --- Carrega tipos de curso para a select ---
async function carregarTiposCurso(selectElement) {
    try {
        const response = await fetch(URL_GET_TIPOS, { headers: { 'Accept': 'application/json' } });
        if (!response.ok) throw new Error('Falha ao carregar as categorias de curso.');
        const data = await response.json();

        selectElement.innerHTML = '<option value="">Selecione uma categoria</option>';
        const tipos = data.data || data;
        if (Array.isArray(tipos)) {
            tipos.forEach(tipo => {
                const option = document.createElement('option');
                option.value = tipo.id;
                option.textContent = tipo.nome_categoria_curso; // Altera aqui o campo de nome
                selectElement.appendChild(option);
            });
        }
    } catch (error) {
        console.error(error);
        selectElement.innerHTML = '<option value="">Erro ao carregar</option>';
    }
}

// --- Event delegation para botões da lista ---
listaCursos.addEventListener('click', async (event) => {
    const statusBtn = event.target.closest('.status_docente');

    if (statusBtn) {
        const cursoId = statusBtn.getAttribute('data-id');
        if (cursoId) toggleStatusCurso(cursoId);
    }
});

// --- Ao carregar a página ---
document.addEventListener('DOMContentLoaded', () => {
    carregarCursos();
});

// --- Menu lateral e pesquisa ---
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
        const cursosCards = document.querySelectorAll('.info_docente');
        cursosCards.forEach(card => {
            const nome = (card.querySelector('.nome b')?.textContent || '').toLowerCase();
            const tipoElement = card.querySelector('.tipo');
            const tipo = (tipoElement ? tipoElement.textContent : '').toLowerCase();
            const duracaoAula = (card.querySelector('.duracao_aula')?.textContent || '').toLowerCase();
            if (nome.includes(searchTerm) || tipo.includes(searchTerm) || duracaoAula.includes(searchTerm)) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    });
}