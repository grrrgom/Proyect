const productos=[
{id:1,nombre:"Taladro eléctrico profesional",categoria:"Herramientas",precio:249900,precioAnterior:299900,imagen:"img/taladro.jpg",descuento:15,rating:5},
{id:2,nombre:"Cable eléctrico 100 metros",categoria:"Material eléctrico",precio:189900,precioAnterior:null,imagen:"img/cable.jpg",descuento:0,rating:4},
{id:3,nombre:"Juego de llaves profesionales",categoria:"Ferretería",precio:129900,precioAnterior:159900,imagen:"img/llaves.jpg",descuento:20,rating:5},
{id:4,nombre:"Casco de seguridad industrial",categoria:"Seguridad",precio:49900,precioAnterior:null,imagen:"img/casco.jpg",descuento:0,rating:5}
];

let carrito=JSON.parse(localStorage.getItem("carrito"))||[];
let favoritos=JSON.parse(localStorage.getItem("favoritos"))||[];
let ultimoPedido=JSON.parse(localStorage.getItem("ultimoPedido"))||null;

const $=s=>document.querySelector(s);
const $$=s=>document.querySelectorAll(s);
const money=n=>new Intl.NumberFormat("es-CO",{style:"currency",currency:"COP",maximumFractionDigits:0}).format(n);

function guardar(){localStorage.setItem("carrito",JSON.stringify(carrito));localStorage.setItem("favoritos",JSON.stringify(favoritos));}
function subtotal(){return carrito.reduce((s,p)=>s+p.precio*p.cantidad,0)}
function envio(){const s=subtotal();return s===0?0:s>=300000?0:15000}
function total(){return subtotal()+envio()}

function toast(msg){
 const box=$("#notification"),el=document.createElement("div");
 el.className="toast";el.textContent="✓ "+msg;box.appendChild(el);
 setTimeout(()=>el.remove(),2800);
}

function renderProductos(lista=productos){
 const cont=$("#products");cont.innerHTML="";
 if(!lista.length){cont.innerHTML='<div class="empty">No se encontraron productos.</div>';return}
 lista.forEach(p=>{
  const stars="★".repeat(p.rating)+"☆".repeat(5-p.rating);
  const card=document.createElement("article");card.className="product";
  card.innerHTML=`<div class="product-image" style="background-image:url('${p.imagen}')">${p.descuento?`<span class="discount">-${p.descuento}%</span>`:""}<button class="favorite">${favoritos.includes(p.id)?"♥":"♡"}</button></div>
  <div class="product-info"><span class="product-category">${p.categoria}</span><h3>${p.nombre}</h3><div class="stars">${stars}</div><div class="price">${money(p.precio)} ${p.precioAnterior?`<span class="old-price">${money(p.precioAnterior)}</span>`:""}</div><button class="add-cart">🛒 Agregar al carrito</button></div>`;
  card.querySelector(".add-cart").onclick=()=>agregar(p.id);
  card.querySelector(".favorite").onclick=e=>favorito(p.id,e.currentTarget);
  cont.appendChild(card);
 });
}

function agregar(id){
 const p=productos.find(x=>x.id===id),e=carrito.find(x=>x.id===id);
 e?e.cantidad++:carrito.push({...p,cantidad:1});
 guardar();renderCarrito();contador();toast(`${p.nombre} fue agregado al carrito`);
}

function quitar(id){
 carrito=carrito.filter(p=>p.id!==id);guardar();renderCarrito();contador();
}
function cantidad(id,cambio){
 const p=carrito.find(x=>x.id===id);if(!p)return;p.cantidad+=cambio;
 if(p.cantidad<=0)return quitar(id);
 guardar();renderCarrito();contador();
}

function renderCarrito(){
 const c=$("#cart");
 if(!carrito.length){c.innerHTML='<div class="empty"><div class="empty-icon">🛒</div><h2>Tu carrito está vacío</h2><p>Agrega productos para comenzar tu compra.</p></div>';return}
 c.innerHTML=carrito.map(p=>`<div class="cart-item"><div class="cart-image" style="background-image:url('${p.imagen}')"></div><div><h3>${p.nombre}</h3><p>${money(p.precio)}</p></div><div class="quantity"><button onclick="cantidad(${p.id},-1)">−</button><strong>${p.cantidad}</strong><button onclick="cantidad(${p.id},1)">+</button></div><button onclick="quitar(${p.id})" style="border:0;background:none;color:#c00;font-size:18px">🗑️</button></div>`).join("")+
 `<div class="cart-total"><p>Subtotal: <strong>${money(subtotal())}</strong></p><p>Envío: <strong>${envio()?"$15.000":"GRATIS"}</strong></p><h2>Total: ${money(total())}</h2><button class="btn btn-primary" onclick="pedido()">Proceder al pago</button></div>`;
}
function contador(){$("#cartCount").textContent=carrito.reduce((s,p)=>s+p.cantidad,0)}

function favorito(id,btn){
 if(favoritos.includes(id)){favoritos=favoritos.filter(x=>x!==id);btn.textContent="♡";toast("Producto eliminado de favoritos")}
 else{favoritos.push(id);btn.textContent="♥";toast("Producto agregado a favoritos")}
 guardar();
}

function buscar(){
 const q=$("#searchInput").value.toLowerCase().trim();
 renderProductos(productos.filter(p=>p.nombre.toLowerCase().includes(q)||p.categoria.toLowerCase().includes(q)));
 $("#productsSection").scrollIntoView({behavior:"smooth"});
}

function pedido(){
 if(!carrito.length)return toast("Tu carrito está vacío");
 const numero="JG-"+Math.floor(10000+Math.random()*90000);
 ultimoPedido={numero,fecha:new Date().toLocaleDateString("es-CO"),productos:[...carrito],subtotal:subtotal(),envio:envio(),total:total(),estado:"Pedido recibido",paso:0};
 localStorage.setItem("ultimoPedido",JSON.stringify(ultimoPedido));
 carrito=[];guardar();renderCarrito();contador();renderPedido();
 toast(`Pedido ${numero} creado correctamente`);
 $("#ordersSection").scrollIntoView({behavior:"smooth"});
}

function renderPedido(){
 const c=$("#orders");
 if(!ultimoPedido){c.innerHTML='<div class="empty"><div class="empty-icon">📦</div><h2>No tienes pedidos recientes</h2><p>Cuando realices una compra aparecerá aquí.</p></div>';return}
 const estados=["Pedido recibido","Preparando","En camino","Entregado"];
 c.innerHTML=`<div class="order-header"><div><span class="order-number">Pedido #${ultimoPedido.numero}</span><p>Realizado el ${ultimoPedido.fecha}</p></div><span class="status">${estados[ultimoPedido.paso]}</span></div>
 <div class="order-info"><div><strong>Productos</strong><p>${ultimoPedido.productos.reduce((s,p)=>s+p.cantidad,0)} productos</p></div><div><strong>Total</strong><p>${money(ultimoPedido.total)}</p></div><div><strong>Método de pago</strong><p>Pago en línea</p></div><div><strong>Entrega estimada</strong><p>2-3 días hábiles</p></div></div>
 <h3>Seguimiento del pedido</h3><div class="tracking">${estados.map((e,i)=>`<div class="step ${i<=ultimoPedido.paso?"active":""}"><div class="step-circle">${i<=ultimoPedido.paso?"✓":i+1}</div><strong>${e}</strong><small>${i===ultimoPedido.paso?"Actual":" "}</small></div>`).join("")}</div>
 <button class="btn btn-primary" onclick="avanzarPedido()">Actualizar seguimiento</button>`;
}

function avanzarPedido(){
 if(!ultimoPedido)return;
 if(ultimoPedido.paso<3)ultimoPedido.paso++;
 else return toast("El pedido ya fue entregado");
 ultimoPedido.estado=["Pedido recibido","Preparando","En camino","Entregado"][ultimoPedido.paso];
 localStorage.setItem("ultimoPedido",JSON.stringify(ultimoPedido));renderPedido();toast(`Estado actualizado: ${ultimoPedido.estado}`);
}

$("#searchBtn").onclick=buscar;
$("#searchInput").addEventListener("keydown",e=>{if(e.key==="Enter")buscar()});
$("#viewProducts").onclick=()=>$("#productsSection").scrollIntoView({behavior:"smooth"});
$("#viewOffers").onclick=()=>{renderProductos(productos.filter(p=>p.descuento>0));$("#productsSection").scrollIntoView({behavior:"smooth"});};
$("#showAll").onclick=e=>{e.preventDefault();renderProductos();$("#productsSection").scrollIntoView({behavior:"smooth"})};
$("#allCategories").onclick=e=>{e.preventDefault();renderProductos();$("#productsSection").scrollIntoView({behavior:"smooth"})};
$("#cartBtn").onclick=()=>$("#cartSection").scrollIntoView({behavior:"smooth"});
$("#ordersBtn").onclick=()=>$("#ordersSection").scrollIntoView({behavior:"smooth"});
$("#contactBtn").onclick=()=>toast("Mensaje enviado. Te contactaremos pronto.");

$$(".category").forEach(c=>c.onclick=()=>{renderProductos(productos.filter(p=>p.categoria===c.dataset.category));$("#productsSection").scrollIntoView({behavior:"smooth"})});

renderProductos();renderCarrito();renderPedido();contador();
