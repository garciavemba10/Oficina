// CONTACTOS: preencher no fim. Deixar "" enquanto não estiver definido.
const CONFIG = {
    whatsapp: "", // fica para o fim
    telefone: "+244 935 982 776",
    mapa: "https://www.google.com/maps/search/?api=1&query=Gamek+Morro+Bento+Luanda",
};

const $ = (selector) => document.querySelector(selector);

let toastTimer;
function aviso(texto) {
    const toast = $("#toast");
    toast.textContent = texto;
    ($("dialog[open]") || document.body).appendChild(toast);
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 5000);
}

function abrir(url) {
    window.open(url, "_blank", "noopener");
}

function enviarWhatsApp(mensagem) {
    if (!CONFIG.whatsapp) {
        aviso("O WhatsApp da oficina será activado em breve.");
        return;
    }
    abrir(`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(mensagem)}`);
}

// Menu no telemóvel
const toggle = $(".menu-toggle");
const menu = $("#menu");
function mostrarMenu(aberto) {
    menu.classList.toggle("is-open", aberto);
    toggle.setAttribute("aria-expanded", aberto);
    toggle.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
}
toggle.addEventListener("click", () => mostrarMenu(!menu.classList.contains("is-open")));
menu.addEventListener("click", (e) => { if (e.target.closest("a")) mostrarMenu(false); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") mostrarMenu(false); });

// Botões de contacto
document.querySelectorAll("[data-whatsapp]").forEach((botao) => {
    botao.addEventListener("click", (e) => {
        e.preventDefault();
        enviarWhatsApp(botao.dataset.whatsapp);
    });
});
$("[data-call]").addEventListener("click", (e) => {
    e.preventDefault();
    if (CONFIG.telefone) location.href = `tel:${CONFIG.telefone}`;
    else aviso("O número de telefone será disponibilizado em breve.");
});
$("[data-map]").addEventListener("click", (e) => {
    e.preventDefault();
    if (CONFIG.mapa) abrir(CONFIG.mapa);
    else aviso("A localização da oficina será disponibilizada em breve.");
});

if (CONFIG.whatsapp) $("#c-whatsapp").textContent = `+${CONFIG.whatsapp}`;

// Check-up
const caixas = [...document.querySelectorAll('input[name="check"]')];
const botaoTudo = $("#check-all");
function actualizarContagem() {
    const total = caixas.filter((c) => c.checked).length;
    $("#check-count").textContent = `${total} ${total === 1 ? "item seleccionado" : "itens seleccionados"}`;
    botaoTudo.textContent = total === caixas.length ? "Limpar selecção" : "Seleccionar tudo";
}
caixas.forEach((c) => c.addEventListener("change", actualizarContagem));
botaoTudo.addEventListener("click", () => {
    const marcar = !caixas.every((c) => c.checked);
    caixas.forEach((c) => (c.checked = marcar));
    actualizarContagem();
});
$("#checkup-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const itens = caixas.filter((c) => c.checked).map((c) => `• ${c.value}`);
    if (!itens.length) {
        aviso("Marque pelo menos um item para o check-up.");
        return;
    }
    enviarWhatsApp(`Olá! Gostaria de agendar um check-up:\n${itens.join("\n")}`);
});

// Pré-visualização da fotografia
const foto = $("#foto");
const preview = $("#preview");
foto.addEventListener("change", () => {
    if (preview.src) URL.revokeObjectURL(preview.src);
    const ficheiro = foto.files[0];
    preview.hidden = !ficheiro;
    if (ficheiro) preview.src = URL.createObjectURL(ficheiro);
});

// Pedido de avaliação
$("#quote-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const dados = new FormData(e.target);
    const campos = {
        nome: "Nome", telefone: "Telefone", marca: "Marca", modelo: "Modelo",
        ano: "Ano", km: "Quilometragem", servico: "Serviço", descricao: "Problema",
    };
    const linhas = Object.entries(campos)
        .map(([chave, rotulo]) => [rotulo, dados.get(chave).trim()])
        .filter(([, valor]) => valor)
        .map(([rotulo, valor]) => `${rotulo}: ${valor}`);
    if (foto.files.length) linhas.push("(Vou anexar a fotografia da avaria nesta conversa.)");
    enviarWhatsApp(`Olá! Gostaria de solicitar uma avaliação.\n\n${linhas.join("\n")}`);
});

$("#year").textContent = new Date().getFullYear();
// Janela flutuante do pedido de avaliação
const modal = $("#avaliacao");

function abrirModal() {
    if (!modal.open) modal.showModal();
}
function fecharModal() {
    modal.classList.add("is-closing");
}

document.querySelectorAll('a[href="#avaliacao"]').forEach((link) => {
    link.addEventListener("click", (e) => {
        e.preventDefault();
        abrirModal();
    });
});
$(".modal__close").addEventListener("click", fecharModal);
// clique fora da janela
let premiuFora = false;
modal.addEventListener("pointerdown", (e) => (premiuFora = e.target === modal));
modal.addEventListener("click", (e) => {
    if (premiuFora && e.target === modal) fecharModal();
});
// tecla Esc
modal.addEventListener("cancel", (e) => {
    e.preventDefault();
    fecharModal();
});
// fecha só depois de a animação de saída terminar
modal.addEventListener("animationend", (e) => {
    if (e.target === modal && modal.classList.contains("is-closing")) modal.close();
});
modal.addEventListener("close", () => modal.classList.remove("is-closing"));


// Pre-loader: fica pelo menos 2 segundos e no máximo 4
const preloader = $("#preloader");
const esconderPreloader = () => preloader.classList.add("is-hidden");
window.addEventListener("load", () => {
    setTimeout(esconderPreloader, Math.max(0, 2000 - performance.now()));
});
setTimeout(esconderPreloader, 4000);