// Dados dos produtos (compartilhados entre todas as páginas)
const products = [
  { id: 1, name: "Elefante Estatua Decorativa", price: 89.90, category: "Suportes", image: "imagens/dino1.png", description: "Material: PLA premium • Tamanho: 16,5 x 16 x 13 cm • Compatível com a maioria das impressoras FDM." },
  { id: 2, name: "Girafa Estatua Decorativa",     price: 89.90, category: "Filamentos", image: "https://picsum.photos/id/102/800/800",  description: "Acabamento fosco perfeito • Ideal para peças que serão pintadas ou protótipos visuais." },
  { id: 3, name: "Rinoceronte Estatua Decorativa", price: 119.90, category: "Filamentos", image: "https://picsum.photos/id/201/800/800", description: "Alta resistência mecânica e química • Transparência excelente • 1.75 mm" },
  { id: 4, name: "Leao Estatua Decorativa",  price: 1499.00, category: "Impressoras", image: "https://picsum.photos/id/29/800/800",  description: "Creality oficial • Nivelamento automático CR-Touch • Tela colorida touch • Volume 220×220×250 mm" },
  { id: 5, name: "Javali Estatua Decorativa",    price: 199.90, category: "Resinas",    image: "https://picsum.photos/id/160/800/800", description: "Alta precisão e detalhes finos • Baixo odor • Compatível com impressoras LCD/DLP 405 nm" },
  { id: 6, name: "Cheeta Estatua Decorativa", price: 49.90,  category: "Acessórios", image: "https://picsum.photos/id/180/800/800", description: "Bicos de latão MK8 padrão • Ótima durabilidade para PLA, PETG e ABS" },
  { id: 7, name: "Hipopotomo Estatua Decorativa",         price: 129.90, category: "Acessórios", image: "https://picsum.photos/id/201/800/800", description: "Adesão excelente sem cola • Textura dupla-face • Compatível Ender 3 / CR-10" },
  { id: 8, name: "Gazela Estatua Decorativa",      price: 109.90, category: "Filamentos", image: "https://picsum.photos/id/251/800/800", description: "Resistente a impactos e temperaturas mais altas • Ideal para peças funcionais" }
];

// Carrega carrinho do localStorage
let cart = JSON.parse(localStorage.getItem('cart')) || [];

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