// ========== FIREBASE ==========
const firebaseConfig = {
  apiKey: "AIzaSyAajUAkMci4RsFxo8DGacD2egP6u3fffAY",
  authDomain: "descomplica3d-cb9cc.firebaseapp.com",
  projectId: "descomplica3d-cb9cc",
  storageBucket: "descomplica3d-cb9cc.firebasestorage.app",
  messagingSenderId: "154567352017",
  appId: "1:154567352017:web:4337ddf3fa08f003046ff0",
  measurementId: "G-B8P2FB4CY6"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Lista de produtos (carregada do Firestore)
let products = [];

// Carrega produtos do Firestore
async function loadProductsFromFirebase() {
  try {
    const snapshot = await db.collection("products").get();
    products = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || "",
        price: Number(data.price) || 0,
        category: data.category || "",
        image: data.image || "",
        description: data.description || "",
        type: data.type || "product",
        active: data.active !== false
      };
    }).filter(p => p.active);

    console.log("Produtos carregados do Firebase:", products.length, products);
  } catch (err) {
    console.error("Erro ao carregar produtos do Firebase:", err);
    products = [];
  }
}

// ========== CARRINHO ==========
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Garante type nos itens antigos do carrinho
cart = cart.map(item => {
  if (!item.type) {
    const p = products.find(pr => pr.id == item.id);
    item.type = p ? p.type : "product";
  }
  return item;
});

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function updateCartCount() {
  const count = cart.reduce((acc, item) => acc + item.quantity, 0);
  document.querySelectorAll("#cart-count").forEach(el => {
    el.textContent = count;
  });
}

function addToCart(id, quantity = 1) {
  const product = products.find(p => p.id == id);
  if (!product) {
    console.warn("Produto não encontrado:", id);
    showToast("Produto não encontrado");
    return;
  }

  const existing = cart.find(item => item.id == id);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ ...product, quantity });
  }

  saveCart();
  updateCartCount();
  showToast(product.name + " adicionado ao carrinho!");
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id != id);
  saveCart();
  updateCartCount();
  if (typeof renderCart === "function") renderCart();
  showToast("Item removido do carrinho");
}

function updateQuantity(id, delta) {
  const item = cart.find(i => i.id == id);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    removeFromCart(id);
    return;
  }

  saveCart();
  updateCartCount();
  if (typeof renderCart === "function") renderCart();
}

function setQuantity(id, qty) {
  const item = cart.find(i => i.id == id);
  if (!item) return;

  const num = parseInt(qty, 10);
  if (isNaN(num) || num <= 0) {
    removeFromCart(id);
    return;
  }

  item.quantity = num;
  saveCart();
  updateCartCount();
  if (typeof renderCart === "function") renderCart();
}

function getCartTotal() {
  return cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
}

function cartHasFiles() {
  return cart.some(item => item.type === "file");
}

function cartHasProducts() {
  return cart.some(item => item.type !== "file");
}

function clearCart() {
  if (cart.length === 0) return;
  if (!confirm("Deseja limpar todo o carrinho?")) return;
  cart = [];
  saveCart();
  updateCartCount();
  if (typeof renderCart === "function") renderCart();
  showToast("Carrinho limpo");
}

function formatPrice(value) {
  return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function showToast(message, duration = 2800) {
  const toast = document.createElement("div");
  toast.style.cssText = `
    position: fixed; bottom: 32px; left: 50%; transform: translateX(-50%);
    background: #10b981; color: white; padding: 14px 28px; border-radius: 9999px;
    font-weight: 600; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.4);
    z-index: 9999; display: flex; align-items: center; gap: 10px;
  `;
  toast.innerHTML = '<i class="fa-solid fa-check-circle"></i> ' + message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = "all 0.4s";
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 400);
  }, duration);
}

// Salva pedido no Firebase (opcional – use depois do pagamento)
async function saveOrderToFirebase(orderData) {
  try {
    const docRef = await db.collection("orders").add({
      ...orderData,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    console.log("Pedido salvo:", docRef.id);
    return docRef.id;
  } catch (err) {
    console.error("Erro ao salvar pedido:", err);
    return null;
  }
}

// Inicialização
document.addEventListener("DOMContentLoaded", async () => {
  await loadProductsFromFirebase();
  updateCartCount();

  if (typeof renderProductsPage === "function") {
    renderProductsPage();
  }
});