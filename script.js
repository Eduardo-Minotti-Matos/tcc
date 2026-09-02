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
        images: Array.isArray(data.images) ? data.images : (data.image ? [data.image] : []),
        model: data.model || data.modelUrl || "",
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

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function updateCartCount() {
  const count = cart.reduce((acc, item) => acc + item.quantity, 0);
  document.querySelectorAll("#cart-count").forEach(el => {
    el.textContent = count;
  });
}

async function addToCart(id, quantity = 1) {
  if (!products.length) {
    await loadProductsFromFirebase();
  }

  let product = products.find(p => String(p.id) === String(id));

  if (!product) {
    try {
      const doc = await db.collection("products").doc(String(id)).get();
      if (doc.exists) {
        const data = doc.data();
        product = {
          id: doc.id,
          name: data.name || "",
          price: Number(data.price) || 0,
          category: data.category || "",
          image: data.image || "",
          images: Array.isArray(data.images) ? data.images : (data.image ? [data.image] : []),
          model: data.model || data.modelUrl || "",
          description: data.description || "",
          type: data.type || "product",
          active: data.active !== false
        };
      }
    } catch (e) {
      console.error(e);
    }
  }

  if (!product) {
    console.warn("Produto não encontrado. ID usado:", id);
    console.warn("IDs carregados:", products.map(p => p.id));
    showToast("Produto não encontrado");
    return;
  }

  const existing = cart.find(item => String(item.id) === String(id));
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
  cart = cart.filter(item => String(item.id) !== String(id));
  saveCart();
  updateCartCount();
  if (typeof renderCart === "function") renderCart();
  showToast("Item removido do carrinho");
}

function updateQuantity(id, delta) {
  const item = cart.find(i => String(i.id) === String(id));
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
  const item = cart.find(i => String(i.id) === String(id));
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

// Renderiza cards de produtos físicos (type === "product")
function renderProductsPage() {
  const grid = document.getElementById("products-grid");
  if (!grid) return;

  const list = products.filter(p => p.type === "product");

  if (!list.length) {
    grid.innerHTML = '<p class="text-zinc-500 col-span-full">Nenhum produto encontrado no Firebase.</p>';
    return;
  }

  grid.innerHTML = list.map(p => {
    const img = p.image
      ? (p.image.startsWith("http") || p.image.startsWith("../") ? p.image : "../" + p.image)
      : "https://picsum.photos/400";
    return `
      <div class="bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800 hover:border-purple-500/40 transition">
        <img src="${img}" class="w-full h-64 object-cover" alt="${p.name}"
             onerror="this.src='https://picsum.photos/400'">
        <div class="p-6">
          <h3 class="font-semibold text-lg">${p.name}</h3>
          <p class="text-purple-400 text-2xl font-bold mt-2">${formatPrice(p.price)}</p>
          <div class="flex gap-3 mt-6">
            <button onclick="addToCart('${p.id}')"
              class="flex-1 bg-purple-500 hover:bg-purple-600 py-4 rounded-3xl text-sm font-semibold">
              ADICIONAR
            </button>
            <a href="detalhe.html?id=${p.id}"
              class="flex-1 border border-white/30 hover:bg-white/10 py-4 rounded-3xl text-sm font-semibold text-center">
              DETALHES
            </a>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

// Renderiza cards de arquivos digitais (type === "file")
function renderArquivosPage() {
  const grid = document.getElementById("arquivos-grid");
  if (!grid) return;

  const list = products.filter(p => p.type === "file");

  if (!list.length) {
    grid.innerHTML = '<p class="text-zinc-500 col-span-full">Nenhum arquivo encontrado no Firebase.</p>';
    return;
  }

  grid.innerHTML = list.map(p => {
    const img = p.image
      ? (p.image.startsWith("http") || p.image.startsWith("../") ? p.image : "../" + p.image)
      : "https://picsum.photos/400";
    return `
      <div class="bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800 hover:border-purple-500/40 transition">
        <div class="relative">
          <img src="${img}" class="w-full h-64 object-cover" alt="${p.name}"
               onerror="this.src='https://picsum.photos/400'">
          <span class="absolute top-3 left-3 bg-purple-600/90 text-xs font-semibold px-3 py-1 rounded-full">Arquivo digital</span>
        </div>
        <div class="p-6">
          <h3 class="font-semibold text-lg">${p.name}</h3>
          <p class="text-zinc-500 text-sm mt-1">STL • Pronto para impressão</p>
          <p class="text-purple-400 text-2xl font-bold mt-2">${formatPrice(p.price)}</p>
          <div class="flex gap-3 mt-6">
            <button onclick="addToCart('${p.id}')"
              class="flex-1 bg-purple-500 hover:bg-purple-600 py-4 rounded-3xl text-sm font-semibold">
              ADICIONAR
            </button>
            <a href="detalhe.html?id=${p.id}"
              class="flex-1 border border-white/30 hover:bg-white/10 py-4 rounded-3xl text-sm font-semibold text-center">
              DETALHES
            </a>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

// Inicialização
document.addEventListener("DOMContentLoaded", async () => {
  await loadProductsFromFirebase();
  updateCartCount();

  if (typeof renderProductsPage === "function") renderProductsPage();
  if (typeof renderArquivosPage === "function") renderArquivosPage();
});
