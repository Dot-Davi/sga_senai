// script_cursos.js

// --- Acessando os elementos do DOM ---
const modalCriar = document.getElementById('modalCriar');
const modalEditar = document.getElementById('modalEditar');
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
const corQuadrado = document.getElementById('cor-quadrado');

// Elementos do formulário de edição (Adicionados para futura implementação)
const formEditarCurso = document.getElementById('formEditarCurso');
const editIdCurso = document.getElementById('edit_id_curso');
const editNomeCurso = document.getElementById('edit_nome_curso');
const editValorCurso = document.getElementById('edit_valor_curso');
const editTipoCurso = document.getElementById('edit_tipo_curso_id');
const editDuracaoAula = document.getElementById('edit_duracao_aula');
const editCorCurso = document.getElementById('edit_cor_curso');
const editCorQuadrado = document.getElementById('edit-cor-quadrado');

// URLs da API
const URL_BASE = 'http://10.188.35.86:8024/arthur-pereira/api_sga/api/';
const URL_GET_TIPOS = `${URL_BASE}categorias-cursos`;
const URL_GET_CURSOS = `${URL_BASE}cursos`;
const URL_POST_CURSO = `${URL_BASE}cursos`;
const URL_TOGGLE_STATUS = `${URL_BASE}cursos/`;
const URL_PUT_CURSO = `${URL_BASE}cursos/`;

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
// Esta função foi alterada para combinar com a imagem.
function criarCardCurso(curso) {
    const statusText = curso.status_curso == 1 ? 'Ativo' : 'Inativo';
    const statusClass = curso.status_curso == 1 ? 'ativo' : 'inativo';
    const statusIconClass = curso.status_curso == 1 ? 'bi-check-circle-fill' : 'bi-x-circle';
    const tipoCursoNome = curso.categoria_curso ? curso.categoria_curso.nome_categoria_curso : 'Não especificado';

    return `
        <div class="info_docente" data-id="${curso.id}">
            <div class="conteudo">
                <p class="nome">Nome: <b>${curso.nome_curso}</b></p>
                <p class="duracao"><i class="bi bi-clock-history"></i> Carga Horária: ${curso.duracao_aula}h</p>
                <p class="tipo"><i class="bi bi-pc-display"></i>Tipo: ${tipoCursoNome}</p>
                <p class="status"><i class="bi bi-gear-fill"></i>Status: ${statusText}</p>
            </div>
            <div class="funcoes_curso">
                <button class="editar_curso" data-id="${curso.id}"><i class="bi bi-pen-fill"></i> Editar</button>
                <button class="status_docente ${statusClass}" data-id="${curso.id}" data-status="${curso.status_curso}">
                    <i class="bi ${statusIconClass}"></i> ${statusText}
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
    if (event.target == modalEditar) modalEditar.style.display = 'none';
});

// --- Criação de curso ---
formCriarCurso.addEventListener('submit', handleFormSubmitCriar);

async function handleFormSubmitCriar(event) {
    event.preventDefault();

    const payload = {
        nome_curso: nomeInputCriar.value.trim(),
        tipo_curso_id: safeParseInt(tipoCursoSelectCriar.value),
        duracao_aula: safeParseInt(duracaoAulaInputCriar.value),
        // Removidos 'valor_curso' e 'cor_curso' conforme a imagem.
        status_curso: 1
    };
    
    if (!payload.nome_curso || !payload.tipo_curso_id || !payload.duracao_aula) {
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

// --- Edição de curso ---
async function carregarDadosParaEdicao(cursoId) {
    try {
        const response = await fetch(`${URL_GET_CURSOS}/${cursoId}`, { headers: { 'Accept': 'application/json' } });
        if (!response.ok) throw new Error('Falha ao carregar dados do curso para edição.');
        const data = await response.json();
        const curso = data.data || data;

        // Preenche os campos do formulário de edição
        editIdCurso.value = curso.id;
        editNomeCurso.value = curso.nome_curso;
        editTipoCurso.value = curso.tipo_curso_id;
        editDuracaoAula.value = curso.duracao_aula;
        // Campos 'valor_curso' e 'cor_curso' removidos da edição
    } catch (error) {
        console.error('Erro ao carregar dados para edição:', error);
        showError('Erro ao carregar dados para edição. Tente novamente.');
    }
}

async function abrirModalEditar(cursoId) {
    await carregarTiposCurso(editTipoCurso);
    await carregarDadosParaEdicao(cursoId);
    modalEditar.style.display = 'block';
}

if (formEditarCurso) {
    formEditarCurso.addEventListener('submit', handleEditFormSubmit);
}

async function handleEditFormSubmit(event) {
    event.preventDefault();

    const cursoId = editIdCurso.value;
    const payload = {};

    if (editNomeCurso.value) payload.nome_curso = editNomeCurso.value;
    if (editTipoCurso.value) payload.tipo_curso_id = safeParseInt(editTipoCurso.value);
    if (editDuracaoAula.value) payload.duracao_aula = safeParseInt(editDuracaoAula.value);
    
    try {
        const response = await fetch(`${URL_PUT_CURSO}${cursoId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(payload),
        });
        const responseData = await response.json();

        if (response.ok) {
            showSuccess('Curso editado com sucesso!');
            modalEditar.style.display = 'none';
            carregarCursos();
        } else {
            const errorMessage = responseData.message || 'Ocorreu um erro ao editar o curso.';
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
                option.textContent = tipo.nome_categoria_curso;
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
    const editBtn = event.target.closest('.editar_curso');

    if (statusBtn) {
        const cursoId = statusBtn.getAttribute('data-id');
        if (cursoId) toggleStatusCurso(cursoId);
    }
    
    if (editBtn) {
        const cursoId = editBtn.getAttribute('data-id');
        abrirModalEditar(cursoId);
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

// --- Código para o input de cor e o quadrado visual no modal de criação ---
if (corInputCriar && corQuadrado) {
    // Ao carregar o modal, sincroniza a cor inicial do quadrado com o valor do input
    abrirModalCriarBtn.addEventListener('click', () => {
        corQuadrado.style.backgroundColor = corInputCriar.value;
    });

    // Quando o usuário muda a cor no input, atualiza o quadrado
    corInputCriar.addEventListener('input', (event) => {
        const corHex = event.target.value;
        corQuadrado.style.backgroundColor = corHex;
    });

    // Torna o quadrado clicável para abrir o seletor de cor
    corQuadrado.addEventListener('click', () => {
        corInputCriar.click();
    });
}

// --- Código para o input de cor e o quadrado visual no modal de edição ---
if (editCorCurso && editCorQuadrado) {
    editCorCurso.addEventListener('input', (event) => {
        const corHex = event.target.value;
        editCorQuadrado.style.backgroundColor = corHex;
    });
    
    editCorQuadrado.addEventListener('click', () => {
        editCorCurso.click();
    });
}