// Dados dos produtos (compartilhados entre todas as páginas)
// type: "product" = físico (envio postal) | "file" = arquivo digital (envio por e-mail)
const products = [
  // Produtos físicos (estátuas decorativas)
  { id: 1, name: "Elefante Estatua Decorativa", price: 24.90, category: "Decoração", image: "imagens/elefante1.jpeg", description: "Miniatura de elefante em estilo low-poly, com design geométrico e aparência moderna, ideal para decoração.", type: "product" },
  { id: 2, name: "Girafa Estatua Decorativa", price: 24.90, category: "Decoração", image: "imagens/girafa1.jpeg", description: "Girafa decorativa em estilo low-poly, com formas angulares e visual elegante, perfeita para dar um toque divertido ao ambiente.", type: "product" },
  { id: 3, name: "Rinoceronte Estatua Decorativa", price: 24.90, category: "Decoração", image: "imagens/rino1.jpeg", description: "Rinoceronte decorativo com acabamento low-poly e formas robustas, combinando um visual moderno e imponente.", type: "product" },
  { id: 4, name: "Leao Estatua Decorativa", price: 24.90, category: "Decoração", image: "imagens/leao1.jpeg", description: "Leão em estilo low-poly, com juba marcante e design geométrico, trazendo personalidade e presença para a decoração.", type: "product" },
  { id: 5, name: "Javali Estatua Decorativa", price: 24.90, category: "Decoração", image: "imagens/javali1.jpeg", description: "Javali em estilo low-poly, com detalhes geométricos e aparência marcante, uma peça diferenciada para decoração.", type: "product" },
  { id: 6, name: "Cheeta Estatua Decorativa", price: 24.90, category: "Decoração", image: "imagens/chetaa1.png", description: "Miniatura de cheetah em estilo low-poly, com formas geométricas e pose elegante, perfeita para uma decoração moderna e marcante.", type: "product" },
  { id: 7, name: "Hipopotamo Estatua Decorativa", price: 24.90, category: "Decoração", image: "imagens/hipo1.png", description: "Hipopótamo em estilo low-poly, com formas robustas e visual divertido, uma peça decorativa moderna e cheia de personalidade.", type: "product" },
  { id: 8, name: "Gazela Estatua Decorativa", price: 24.90, category: "Decoração", image: "imagens/gazela1.png", description: "Gazela decorativa em estilo low-poly, com design delicado e formas angulares, ideal para trazer um toque de elegância e natureza ao ambiente.", type: "product" },

  // Arquivos digitais (modelos 3D para download / envio por e-mail)
  { id: 9, name: "Porta-lápis T-REX de dinossauro", price: 89.90, category: "Arquivos 3D", image: "imagens/dino1.png", description: "Arquivo STL do porta-lápis T-REX. Modelo pronto para impressão 3D, com encaixes precisos e visual divertido.", type: "file" },
  { id: 10, name: "Estátua gato bocejando", price: 89.90, category: "Arquivos 3D", image: "imagens/gato1.png", description: "Arquivo STL da estátua de gato bocejando. Design detalhado e pose expressiva, ideal para impressão em resina ou FDM.", type: "file" },
  { id: 11, name: "Carrinho de brinquedo", price: 89.90, category: "Arquivos 3D", image: "imagens/carrinho3d.jpg", description: "Arquivo STL de carrinho de brinquedo. Modelo low-poly com rodas móveis (opcional), perfeito para impressão e montagem.", type: "file" },
  { id: 12, name: "Suporte para fone de ouvido", price: 49.90, category: "Arquivos 3D", image: "imagens/dino1.png", description: "Arquivo STL de suporte ergonômico para fone de ouvido. Design minimalista e estável.", type: "file" },
  { id: 13, name: "Organizador de mesa hexagonal", price: 59.90, category: "Arquivos 3D", image: "imagens/gato1.png", description: "Arquivo STL de organizador modular hexagonal. Ideal para canetas, clips e pequenos objetos.", type: "file" },
  { id: 14, name: "Vaso geométrico low-poly", price: 69.90, category: "Arquivos 3D", image: "imagens/carrinho3d.jpg", description: "Arquivo STL de vaso decorativo low-poly. Formas angulares modernas para plantas pequenas ou suculentas.", type: "file" },
  { id: 15, name: "Chaveiro personalizado (kit)", price: 29.90, category: "Arquivos 3D", image: "imagens/dino1.png", description: "Pacote de arquivos STL com vários designs de chaveiros. Inclui argolas e modelos variados.", type: "file" },
  { id: 16, name: "Miniatura dragão articulado", price: 99.90, category: "Arquivos 3D", image: "imagens/gato1.png", description: "Arquivo STL de dragão articulado (flexi). Impressão sem suporte, movimentos realistas.", type: "file" }
];

// Carrega carrinho do localStorage
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Garante que itens antigos do carrinho tenham o campo type
cart = cart.map(item => {
  if (!item.type) {
    const p = products.find(pr => pr.id === item.id);
    item.type = p ? p.type : 'product';
  }
  return item;
});

// Salva carrinho
function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

// Atualiza contador no ícone do carrinho
function updateCartCount() {
  const count = cart.reduce((acc, item) => acc + item.quantity, 0);
  document.querySelectorAll('#cart-count').forEach(el => {
    el.textContent = count;
  });
}

// Adiciona item ao carrinho
function addToCart(id, quantity = 1) {
  const product = products.find(p => p.id === id);
  if (!product) return;

  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ ...product, quantity });
  }

  saveCart();
  updateCartCount();
  showToast(`${product.name} adicionado ao carrinho!`);
}

// Remove item do carrinho
function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  saveCart();
  updateCartCount();
  if (typeof renderCart === 'function') renderCart();
  showToast('Item removido do carrinho');
}

// Altera quantidade de um item
function updateQuantity(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    removeFromCart(id);
    return;
  }

  saveCart();
  updateCartCount();
  if (typeof renderCart === 'function') renderCart();
}

// Define quantidade diretamente
function setQuantity(id, qty) {
  const item = cart.find(i => i.id === id);
  if (!item) return;

  const num = parseInt(qty, 10);
  if (isNaN(num) || num <= 0) {
    removeFromCart(id);
    return;
  }

  item.quantity = num;
  saveCart();
  updateCartCount();
  if (typeof renderCart === 'function') renderCart();
}

// Calcula total do carrinho
function getCartTotal() {
  return cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
}

// Verifica se o carrinho contém arquivos digitais
function cartHasFiles() {
  return cart.some(item => item.type === 'file');
}

// Verifica se o carrinho contém produtos físicos
function cartHasProducts() {
  return cart.some(item => item.type !== 'file');
}

// Limpa o carrinho
function clearCart() {
  if (cart.length === 0) return;
  if (!confirm('Deseja limpar todo o carrinho?')) return;
  cart = [];
  saveCart();
  updateCartCount();
  if (typeof renderCart === 'function') renderCart();
  showToast('Carrinho limpo');
}

// Formata preço em Real
function formatPrice(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Notificação flutuante
function showToast(message, duration = 2800) {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed; bottom: 32px; left: 50%; transform: translateX(-50%);
    background: #10b981; color: white; padding: 14px 28px; border-radius: 9999px;
    font-weight: 600; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.4);
    z-index: 9999; display: flex; align-items: center; gap: 10px;
  `;
  toast.innerHTML = `<i class="fa-solid fa-check-circle"></i> ${message}`;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'all 0.4s';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 400);
  }, duration);
}

// Inicialização comum a todas as páginas
document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();
});