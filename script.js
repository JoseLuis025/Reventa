let productos = JSON.parse(localStorage.getItem("productos") || "[]");

function guardar() {
  localStorage.setItem("productos", JSON.stringify(productos));
}

function cargarTabla() {
  const tbody = document.querySelector("#tablaProductos tbody");
  if (!tbody) return;

  tbody.innerHTML = "";
  productos.forEach(p => {
    const tr = document.createElement("tr");
    if (p.vendido === "sí") tr.style.background = "#b6f5b6";

    tr.innerHTML = `
      <td>${p.producto}</td>
      <td>${p.precioCompra}</td>
      <td>${p.precioVenta || "-"}</td>
      <td>${p.fecha || "-"}</td>
      <td>${p.vendido || "no"}</td>
      <td>${p.notas || ""}</td>
    `;
    tbody.appendChild(tr);
  });
}

const form = document.querySelector("#addForm");
if (form) {
  form.addEventListener("submit", e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));

    productos.push({
      producto: data.producto,
      precioCompra: data.precioCompra,
      valorVenta: data.valorVenta,
      precioVenta: "",
      fecha: data.fecha,
      vendido: "no",
      notas: data.notas
    });

    guardar();
    form.reset();
    alert("Producto añadido");
  });
}

cargarTabla();
