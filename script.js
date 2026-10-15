// FERRELECTRICOS J.G.D — catálogo, carrito y validación de formulario
"use strict";

const products = [
  { id: 1, name: "Taladro percutor", category: "Herramientas", description: "Herramienta versátil para trabajos de perforación.", price: 189900, icon: "🔩" },
  { id: 2, name: "Juego de destornilladores", category: "Herramientas", description: "Set práctico para reparaciones y mantenimiento.", price: 45900, icon: "🪛" },
  { id: 3, name: "Pinza universal", category: "Herramientas", description: "Agarre firme para trabajos de instalación.", price: 28900, icon: "🗜️" },
  { id: 4, name: "Cinta aislante", category: "Eléctricos", description: "Complemento para trabajos eléctricos básicos.", price: 4900, icon: "🧵" },
  { id: 5, name: "Cable eléctrico", category: "Eléctricos", description: "Cable para instalaciones según especificación requerida.", price: 3500, icon: "〰️" },
  { id: 6, name: "Bombillo LED", category: "Eléctricos", description: "Iluminación de bajo consumo para el hogar.", price: 8900, icon: "💡" },
  { id: 7, name: "Guantes de protección", category: "Seguridad", description: "Protección para tareas de mantenimiento.", price: 15900, icon: "🧤" },
  { id: 8, name: "Gafas de seguridad", category: "Seguridad", description: "Protección ocular para trabajos generales.", price: 12900, icon: "🥽" }
];

const cart = new Map();
const productGrid = document.querySelector("#productGrid");
const searchInput = document.querySelector("#productSearch");
const categoryFilter = document.querySelector("#categoryFilter");
const resultsMessage = document.querySelector("#resultsMessage");
const cartCount = document.querySelector("#cartCount");
const cartItems = document.querySelector("#cartItems");
const cartTotal = document.querySelector("#cartTotal");

function formatCurrency(value) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0
  }).format(value);
}

function renderProducts() {
  const query = searchInput.value.trim().toLocaleLowerCase("es");
  const category = categoryFilter.value;
  const filtered = products.filter((product) => {
    const matchesQuery = `${product.name} ${product.description} ${product.category}`
      .toLocaleLowerCase("es").includes(query);
    const matchesCategory = category === "todos" || product.category === category;
    return matchesQuery && matchesCategory;
  });

  productGrid.replaceChildren();
  if (filtered.length === 0) {
    const empty = document.createElement("p");
    empty.className = "no-results";
    empty.textContent = "No encontramos productos con esos criterios. Prueba otra búsqueda.";
    productGrid.append(empty);
  } else {
    filtered.forEach((product) => {
      const article = document.createElement("article");
      article.className = "product-card";

      const visual = document.createElement("div");
      visual.className = "product-visual";
      visual.setAttribute("aria-hidden", "true");
      visual.textContent = product.icon;

      const category = document.createElement("span");
      category.className = "product-category";
      category.textContent = product.category;
      visual.append(category);

      const info = document.createElement("div");
      info.className = "product-info";
      const title = document.createElement("h3");
      title.textContent = product.name;
      const description = document.createElement("p");
      description.textContent = product.description;
      const bottom = document.createElement("div");
      bottom.className = "product-bottom";
      const price = document.createElement("span");
      price.className = "product-price";
      price.textContent = formatCurrency(product.price);
      const addButton = document.createElement("button");
      addButton.className = "add-button";
      addButton.type = "button";
      addButton.textContent = "Agregar +";
      addButton.setAttribute("aria-label", `Agregar ${product.name} al carrito`);
      addButton.addEventListener("click", () => addToCart(product.id));
      bottom.append(price, addButton);
      info.append(title, description, bottom);
      article.append(visual, info);
      productGrid.append(article);
    });
  }
  resultsMessage.textContent = `Se ${filtered.length === 1 ? "muestra" : "muestran"} ${filtered.length} ${filtered.length === 1 ? "producto" : "productos"}.`;
}

function addToCart(productId) {
  cart.set(productId, (cart.get(productId) || 0) + 1);
  renderCart();
  const product = products.find((item) => item.id === productId);
  resultsMessage.textContent = `${product.name} se agregó al carrito.`;
}

function changeQuantity(productId, amount) {
  const nextQuantity = (cart.get(productId) || 0) + amount;
  if (nextQuantity <= 0) cart.delete(productId);
  else cart.set(productId, nextQuantity);
  renderCart();
}

function renderCart() {
  cartItems.replaceChildren();
  let quantityTotal = 0;
  let priceTotal = 0;

  if (cart.size === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-cart";
    empty.textContent = "Tu carrito está vacío. Explora el catálogo para agregar productos.";
    cartItems.append(empty);
  } else {
    cart.forEach((quantity, productId) => {
      const product = products.find((item) => item.id === productId);
      quantityTotal += quantity;
      priceTotal += product.price * quantity;

      const row = document.createElement("div");
      row.className = "cart-item";
      const info = document.createElement("div");
      info.className = "cart-item-info";
      const name = document.createElement("strong");
      name.textContent = product.name;
      const detail = document.createElement("small");
      detail.textContent = `${formatCurrency(product.price)} por unidad`;
      info.append(name, detail);

      const controls = document.createElement("div");
      controls.className = "quantity-controls";
      const decrease = document.createElement("button");
      decrease.type = "button";
      decrease.textContent = "−";
      decrease.setAttribute("aria-label", `Quitar una unidad de ${product.name}`);
      decrease.addEventListener("click", () => changeQuantity(productId, -1));
      const count = document.createElement("span");
      count.textContent = String(quantity);
      count.setAttribute("aria-label", `Cantidad: ${quantity}`);
      const increase = document.createElement("button");
      increase.type = "button";
      increase.textContent = "+";
      increase.setAttribute("aria-label", `Agregar una unidad de ${product.name}`);
      increase.addEventListener("click", () => changeQuantity(productId, 1));
      controls.append(decrease, count, increase);
      row.append(info, controls);
      cartItems.append(row);
    });
  }

  cartCount.textContent = String(quantityTotal);
  cartCount.setAttribute("aria-label", `${quantityTotal} ${quantityTotal === 1 ? "producto" : "productos"} en el carrito`);
  cartTotal.textContent = formatCurrency(priceTotal);
}

document.querySelector("#clearCart").addEventListener("click", () => {
  cart.clear();
  renderCart();
});

searchInput.addEventListener("input", renderProducts);
categoryFilter.addEventListener("change", renderProducts);

// Menú móvil accesible
const menuToggle = document.querySelector("#menuToggle");
const mainNav = document.querySelector("#mainNav");
menuToggle.addEventListener("click", () => {
  const isOpen = mainNav.classList.toggle("is-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.querySelector(".sr-only").textContent = isOpen ? "Cerrar menú" : "Abrir menú";
});
mainNav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    mainNav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.querySelector(".sr-only").textContent = "Abrir menú";
  });
});

// Validación propia para mostrar mensajes específicos y accesibles.
const contactForm = document.querySelector("#contactForm");
const formStatus = document.querySelector("#formStatus");
const fields = {
  fullName: { error: "nameError", validate: (value) => value.trim().length >= 3, message: "Escribe tu nombre completo (mínimo 3 caracteres)." },
  email: { error: "emailError", validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim()), message: "Ingresa un correo válido, por ejemplo nombre@correo.com." },
  phone: { error: "phoneError", validate: (value) => /^[+\d\s()-]{7,20}$/.test(value.trim()) && value.replace(/\D/g, "").length >= 7, message: "Ingresa un teléfono válido con al menos 7 dígitos." },
  reason: { error: "reasonError", validate: (value) => value !== "", message: "Selecciona el motivo de contacto." },
  message: { error: "messageError", validate: (value) => value.trim().length >= 10, message: "Escribe un mensaje de al menos 10 caracteres." }
};

function validateField(name) {
  const input = contactForm.elements[name];
  const config = fields[name];
  const valid = config.validate(input.value);
  input.setAttribute("aria-invalid", String(!valid));
  document.getElementById(config.error).textContent = valid ? "" : config.message;
  return valid;
}

Object.keys(fields).forEach((name) => {
  const input = contactForm.elements[name];
  input.addEventListener("blur", () => validateField(name));
  input.addEventListener("input", () => {
    if (input.hasAttribute("aria-invalid")) validateField(name);
    formStatus.textContent = "";
    formStatus.className = "form-status";
  });
});

contactForm.elements.privacy.addEventListener("change", () => {
  const valid = contactForm.elements.privacy.checked;
  contactForm.elements.privacy.setAttribute("aria-invalid", String(!valid));
  document.querySelector("#privacyError").textContent = valid ? "" : "Debes aceptar esta autorización para continuar.";
});

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const validations = Object.keys(fields).map(validateField);
  const privacyValid = contactForm.elements.privacy.checked;
  contactForm.elements.privacy.setAttribute("aria-invalid", String(!privacyValid));
  document.querySelector("#privacyError").textContent = privacyValid ? "" : "Debes aceptar esta autorización para continuar.";

  if (validations.every(Boolean) && privacyValid) {
    const name = contactForm.elements.fullName.value.trim();
    formStatus.textContent = `¡Gracias, ${name}! Los datos pasaron la validación del navegador. En esta versión de demostración no se envían a un servidor.`;
    formStatus.className = "form-status success";
    contactForm.reset();
    Object.keys(fields).forEach((fieldName) => {
      contactForm.elements[fieldName].removeAttribute("aria-invalid");
      document.getElementById(fields[fieldName].error).textContent = "";
    });
    contactForm.elements.privacy.removeAttribute("aria-invalid");
    document.querySelector("#privacyError").textContent = "";
  } else {
    formStatus.textContent = "Revisa los campos marcados y corrige la información antes de continuar.";
    formStatus.className = "form-status error";
    const firstInvalid = contactForm.querySelector('[aria-invalid="true"]');
    if (firstInvalid) firstInvalid.focus();
  }
});

document.querySelector("#currentYear").textContent = String(new Date().getFullYear());
renderProducts();
renderCart();
