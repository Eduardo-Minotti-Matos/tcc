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
const auth = firebase.auth();

let products = [];
let currentUser = null;
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let cartSyncReady = false; // evita gravar no meio do carregamento do login

// ---------- AUTH ----------
function syncLocalUser(user, profile) {
  if (!user) {
    currentUser = null;
    localStorage.removeItem("user");
    return null;
  }
  currentUser = {
    uid: user.uid,
    email: user.email || "",
    name: (profile && profile.name) || user.displayName || (user.email ? user.email.split("@")[0] : "Usuário")
  };
  localStorage.setItem("user", JSON.stringify(currentUser));
  return currentUser;
}

async function fetchUserProfile(uid) {
  try {
    const doc = await db.collection("users").doc(uid).get();
    return doc.exists ? doc.data() : null;
  } catch (e) {
    console.warn("Perfil não carregado:", e);
    return null;
  }
}

async function registerUser(name, email, password) {
  const cred = await auth.createUserWithEmailAndPassword(email, password);
  await cred.user.updateProfile({ displayName: name });

  // Carrinho local atual sobe para a conta nova
  const cartToSave = sanitizeCartForFirestore(cart);

  await db.collection("users").doc(cred.user.uid).set({
    name: name,
    email: email,
    cart: cartToSave,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });

  syncLocalUser(cred.user, { name, email });
  cartSyncReady = true;
  return currentUser;
}

async function loginUser(email, password) {
  const cred = await auth.signInWithEmailAndPassword(email, password);
  const profile = await fetchUserProfile(cred.user.uid);
  syncLocalUser(cred.user, profile);
  await loadCartForUser(cred.user.uid, profile);
  cartSyncReady = true;
  return currentUser;
}

async function logoutUser() {
  // Opcional: grava o carrinho atual antes de sair
  if (currentUser && cartSyncReady) {
    try {
      await persistCartToFirebase();
    } catch (e) {
      console.warn(e);
    }
  }
  await auth.signOut();
  syncLocalUser(null);
  cartSyncReady = false;
  // Mantém o carrinho local para visitante (não limpa)
}

function initAuthListener(onChange) {
  auth.onAuthStateChanged(async (user) => {
    if (user) {
      const profile = await fetchUserProfile(user.uid);
      syncLocalUser(user, profile);
      await loadCartForUser(user.uid, profile);
      cartSyncReady = true;
    } else {
      syncLocalUser(null);
      cartSyncReady = false;
      // Carrinho continua o do localStorage (modo visitante)
      cart = JSON.parse(localStorage.getItem("cart")) || [];
    }
    if (typeof onChange === "function") onChange(currentUser);
    if (typeof updateUserNav === "function") updateUserNav();
    updateCartCount();
    if (typeof renderCart === "function") renderCart();
  });
}

function authErrorMessage(err) {
  const code = (err && err.code) || "";
  const map = {
    "auth/email-already-in-use": "Este e-mail já está cadastrado.",
    "auth/invalid-email": "E-mail inválido.",
    "auth/weak-password": "A senha deve ter no mínimo 6 caracteres.",
    "auth/user-not-found": "Conta não encontrada. Cadastre-se primeiro.",
    "auth/wrong-password": "Senha incorreta.",
    "auth/invalid-credential": "E-mail ou senha incorretos.",
    "auth/too-many-requests": "Muitas tentativas. Tente novamente mais tarde.",
    "auth/network-request-failed": "Falha de rede. Verifique sua conexão."
  };
  return map[code] || (err && err.message) || "Erro ao autenticar.";
}

// ---------- CARRINHO POR CONTA ----------
function sanitizeCartForFirestore(list) {
  return (list || []).map((item) => ({
    id: String(item.id),
    name: item.name || "",
    price: Number(item.price) || 0,
    quantity: Number(item.quantity) || 1,
    type: item.type || "product",
    image: item.image || "",
    category: item.category || ""
  }));
}

/** Carrega carrinho da conta; se a conta estiver vazia e houver itens locais, sobe os locais */
async function loadCartForUser(uid, profile) {
  try {
    let data = profile;
    if (!data) {
      const doc = await db.collection("users").doc(uid).get();
      data = doc.exists ? doc.data() : null;
    }

    const remote = Array.isArray(data && data.cart) ? data.cart : [];
    const local = JSON.parse(localStorage.getItem("cart")) || [];

    if (remote.length > 0) {
      // Conta tem carrinho salvo → usa o da conta
      cart = remote.map((item) => ({
        id: String(item.id),
        name: item.name || "",
        price: Number(item.price) || 0,
        quantity: Number(item.quantity) || 1,
        type: item.type || "product",
        image: item.image || "",
        category: item.category || ""
      }));
    } else if (local.length > 0) {
      // Conta vazia, mas navegador tem itens → salva na conta
      cart = local;
      await db.collection("users").doc(uid).set(
        { cart: sanitizeCartForFirestore(cart) },
        { merge: true }
      );
    } else {
      cart = [];
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
    if (typeof renderCart === "function") renderCart();
  } catch (e) {
    console.error("Erro ao carregar carrinho da conta:", e);
  }
}

async function persistCartToFirebase() {
  if (!currentUser || !currentUser.uid) return;
  await db.collection("users").doc(currentUser.uid).set(
    {
      cart: sanitizeCartForFirestore(cart),
      cartUpdatedAt: firebase.firestore.FieldValue.serverTimestamp()
    },
    { merge: true }
  );
}

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
  // Sincroniza com a conta se estiver logado
  if (currentUser && cartSyncReady) {
    persistCartToFirebase().catch((e) => console.warn("Sync carrinho:", e));
  }
}

function updateCartCount() {
  const count = cart.reduce((acc, item) => acc + item.quantity, 0);
  document.querySelectorAll("#cart-count").forEach((el) => {
    el.textContent = count;
  });
}

async function addToCart(id, quantity = 1) {
  if (!products.length) {
    await loadProductsFromFirebase();
  }

  let product = products.find((p) => String(p.id) === String(id));

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
          images: Array.isArray(data.images) ? data.images : data.image ? [data.image] : [],
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
    showToast("Produto não encontrado");
    return;
  }

  const existing = cart.find((item) => String(item.id) === String(id));
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity,
      type: product.type || "product",
      image: product.image || "",
      category: product.category || ""
    });
  }

  saveCart();
  updateCartCount();
  showToast(product.name + " adicionado ao carrinho!");
}

function removeFromCart(id) {
  cart = cart.filter((item) => String(item.id) !== String(id));
  saveCart();
  updateCartCount();
  if (typeof renderCart === "function") renderCart();
  showToast("Item removido do carrinho");
}

function updateQuantity(id, delta) {
  const item = cart.find((i) => String(i.id) === String(id));
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
  const item = cart.find((i) => String(i.id) === String(id));
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
  return cart.some((item) => item.type === "file");
}

function cartHasProducts() {
  return cart.some((item) => item.type !== "file");
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
      userId: currentUser ? currentUser.uid : null,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    console.log("Pedido salvo:", docRef.id);
    return docRef.id;
  } catch (err) {
    console.error("Erro ao salvar pedido:", err);
    return null;
  }
}

// ---------- PRODUTOS ----------
async function loadProductsFromFirebase() {
  try {
    const snapshot = await db.collection("products").get();
    products = snapshot.docs
      .map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || "",
          price: Number(data.price) || 0,
          category: data.category || "",
          image: data.image || "",
          images: Array.isArray(data.images) ? data.images : data.image ? [data.image] : [],
          model: data.model || data.modelUrl || "",
          description: data.description || "",
          type: data.type || "product",
          active: data.active !== false
        };
      })
      .filter((p) => p.active);

    console.log("Produtos carregados do Firebase:", products.length, products);
  } catch (err) {
    console.error("Erro ao carregar produtos do Firebase:", err);
    products = [];
  }
}

function renderProductsPage() {
  const grid = document.getElementById("products-grid");
  if (!grid) return;

  const list = products.filter((p) => p.type === "product");

  if (!list.length) {
    grid.innerHTML = '<p class="text-zinc-500 col-span-full">Nenhum produto encontrado no Firebase.</p>';
    return;
  }

  grid.innerHTML = list
    .map((p) => {
      const img = p.image
        ? p.image.startsWith("http") || p.image.startsWith("../")
          ? p.image
          : "../" + p.image
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
    })
    .join("");
}

function renderArquivosPage() {
  const grid = document.getElementById("arquivos-grid");
  if (!grid) return;

  const list = products.filter((p) => p.type === "file");

  if (!list.length) {
    grid.innerHTML = '<p class="text-zinc-500 col-span-full">Nenhum arquivo encontrado no Firebase.</p>';
    return;
  }

  grid.innerHTML = list
    .map((p) => {
      const img = p.image
        ? p.image.startsWith("http") || p.image.startsWith("../")
          ? p.image
          : "../" + p.image
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
    })
    .join("");
}

// Inicialização
document.addEventListener("DOMContentLoaded", async () => {
  initAuthListener();
  await loadProductsFromFirebase();
  updateCartCount();

  if (typeof renderProductsPage === "function") renderProductsPage();
  if (typeof renderArquivosPage === "function") renderArquivosPage();
});
