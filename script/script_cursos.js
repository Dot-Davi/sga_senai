document.addEventListener('DOMContentLoaded', () => {
    const menuBtn = document.getElementById('menu-btn');
    const sidebar = document.getElementById('sidebar');
    const conteudo = document.getElementById('conteudo-cadastro');
    const searchInput = document.getElementById('searchInput');
    let docenteCards = document.querySelectorAll('.info_docente');
    const originalNames = {};
    const modalCriar = document.getElementById('modalCriar');
    const abrirModalBtn = document.getElementById('abrirModal');
    const btnCriar = document.querySelector('.btn-criar');
    const modalEditar = document.getElementById('modalEditar');
    const editTipoInput = document.getElementById('editTipo'); 
    const editCargaHorariaInput = document.getElementById('editCargaHoraria');
    const editNomeInput = document.getElementById('editNome'); 
    const salvarEdicaoBtn = document.getElementById('salvarEdicao');
    let currentEditingCard = null;

    // Função para anexar os listeners aos botões
    function attachListenersToCards() {
        const editButtons = document.querySelectorAll('.editar_docente');
        const statusButtons = document.querySelectorAll('.status_docente');
        docenteCards = document.querySelectorAll('.info_docente');

        // Listener para o botão de edição
        editButtons.forEach(button => {
            button.onclick = () => {
                const card = button.closest('.info_docente');
                currentEditingCard = card;

                const nome = card.querySelector('.nome b').textContent.trim();
                const tipo = card.querySelector('.tipo').textContent.split(': ')[1].trim();
                const cargaHoraria = card.querySelector('.carga_horaria').textContent.split(': ')[1].trim();

                editNomeInput.value = nome;
                editTipoInput.value = tipo;
                editCargaHorariaInput.value = cargaHoraria;

                modalEditar.style.display = 'block';
            };
        });

        // Listener para o botão de status
        statusButtons.forEach(button => {
            button.onclick = () => {
                const statusTextElement = button.closest('.info_docente').querySelector('.status');
                
                if (button.classList.contains('inativo')) {
                    button.classList.remove('inativo');
                    button.classList.add('ativo');
                    button.innerHTML = '<i class="bi bi-check-circle-fill"></i>Ativo';
                    statusTextElement.innerHTML = `<b><i class="bi bi-arrow-clockwise"></i></b>Status: Ativo`;
                } else {
                    button.classList.remove('ativo');
                    button.classList.add('inativo');
                    button.innerHTML = '<i class="bi bi-x-circle"></i>Inativo';
                    statusTextElement.innerHTML = `<b><i class="bi bi-arrow-clockwise"></i></b>Status: Inativo`;
                }
            };
        });
    }

    // Anexa os listeners aos cards iniciais
    attachListenersToCards();

    docenteCards.forEach(card => {
        const nomeElement = card.querySelector('.nome b');
        originalNames[nomeElement.textContent.trim()] = nomeElement.textContent;
    });

    // --- Funcionalidade do Menu Lateral ---
    menuBtn.addEventListener('click', () => {
        menuBtn.classList.toggle('active');
        sidebar.classList.toggle('active');
        conteudo.classList.toggle('push');
    });

    // --- Funcionalidade de Pesquisa de Docentes com Realce ---
    searchInput.addEventListener('input', (event) => {
        const searchTerm = event.target.value.toLowerCase();
        docenteCards.forEach(card => {
            const nomeElement = card.querySelector('.nome b');
            const originalName = originalNames[nomeElement.textContent.trim()] || nomeElement.textContent;
            const nomeDocente = originalName.toLowerCase();

            nomeElement.innerHTML = originalName;

            if (searchTerm === '') {
                card.style.display = 'flex';
            } else if (nomeDocente.includes(searchTerm)) {
                const startIndex = nomeDocente.indexOf(searchTerm);
                const endIndex = startIndex + searchTerm.length;
                const antes = originalName.substring(0, startIndex);
                const durante = originalName.substring(startIndex, endIndex);
                const depois = originalName.substring(endIndex);

                nomeElement.innerHTML = `${antes}<span class="highlight">${durante}</span>${depois}`;
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    });

    // --- Funcionalidade do Modal de Criação ---
    abrirModalBtn.addEventListener('click', () => {
        modalCriar.style.display = 'block';
    });

    // --- Funcionalidade de Criar Novo Docente ---
    btnCriar.addEventListener('click', () => {
        const addNome = document.getElementById('addNome').value.trim();
        const addCargaHoraria = document.getElementById('addCargaHoraria').value.trim();
        const addTipo = document.getElementById('addTipo').value.trim();

        if (addNome === '' || addCargaHoraria === '' || addTipo === '') {
            console.error("Por favor, preencha todos os campos.");
            return;
        }

        // Cria o novo elemento HTML para o card
        const newCard = document.createElement('div');
        newCard.classList.add('info_docente');
        newCard.innerHTML = `
            <div class="conteudo">
                <p class="nome">Nome: <b>${addNome}</b></p>
                <p class="especialidade carga_horaria"> <b><i class="bi bi-stopwatch"></i></b>Carga Horária: ${addCargaHoraria}</p>
                <p class="tipo"> <b><i class="bi bi-pc-display-horizontal" style="margin-right: 5px;"></i></b>Tipo: ${addTipo}</p>
                <p class="status"><b><i class="bi bi-arrow-clockwise" id="status_para"></i></b>Status: Inativo</p>
            </div>
            <div class="funcoes_curso">
                <div class="buttons_curso">
                    <button class="editar_docente"><i class="bi bi-pen-fill"></i>Editar </button>
                    <button class="status_docente inativo"><i class="bi bi-x-circle"></i>Inativo</button>
                </div>
                <div class="buttons_curso">
                    <button class="horario"><i class="bi bi-x-circle"></i>Duração de aula: 55min</button>
                </div>
            </div>
        `;

        // Adiciona o novo card ao contêiner de docentes
        document.querySelector('.conteudo_docente').appendChild(newCard);

        // Adiciona o nome do novo card para a funcionalidade de pesquisa
        originalNames[addNome] = `Nome: <b>${addNome}</b>`;

        // Anexa os listeners aos novos botões criados
        attachListenersToCards();

        // Limpa os campos e fecha o modal
        document.getElementById('addNome').value = '';
        document.getElementById('addCargaHoraria').value = '';
        document.getElementById('addTipo').value = '';
        modalCriar.style.display = 'none';
    });

    // --- Funcionalidade do Modal de Edição ---
    salvarEdicaoBtn.addEventListener('click', () => {
        if (currentEditingCard) {
            const novoNome = editNomeInput.value;
            const novoTipo = editTipoInput.value;
            const novaCargaHoraria = editCargaHorariaInput.value;
            
            // Updates the course card with the new values
            currentEditingCard.querySelector('.nome b').textContent = novoNome;
            currentEditingCard.querySelector('.tipo').innerHTML = `<b><i class="bi bi-pc-display-horizontal" style="margin-right: 5px;"></i></b>Tipo: ${novoTipo}`;
            currentEditingCard.querySelector('.carga_horaria').innerHTML = `<b><i class="bi bi-stopwatch"></i></b>Carga Horária: ${novaCargaHoraria}`;
            
            modalEditar.style.display = 'none';
            currentEditingCard = null;
        }
    });

    // --- Fechar Modais ---
    document.querySelectorAll('.close').forEach(closeButton => {
        closeButton.addEventListener('click', () => {
            const modalId = closeButton.getAttribute('data-modal');
            document.getElementById(modalId).style.display = 'none';
        });
    });

    window.addEventListener('click', (event) => {
        if (event.target === modalCriar) {
            modalCriar.style.display = 'none';
        }
        if (event.target === modalEditar) {
            modalEditar.style.display = 'none';
        }
    });
});