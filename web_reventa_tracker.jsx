import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { motion } from "framer-motion";

export default function ReventaTracker() {
  const [productos, setProductos] = useState([]);
  const [tab, setTab] = useState("panel");
  const [editing, setEditing] = useState(null);

  const emptyForm = { nombre: "", precioCompra: "", precioVenta: "", valorVenta: "", fecha: "", fechaVenta: "", notas: "" };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    const saved = localStorage.getItem("productosReventa");
    if (saved) setProductos(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("productosReventa", JSON.stringify(productos));
  }, [productos]);

  const saveProducto = () => {
    if (!form.nombre || !form.precioCompra) return;

    if (editing) {
      setProductos(productos.map(p => p.id === editing ? { ...p, ...form, vendido: !!form.precioVenta } : p));
      setEditing(null);
    } else {
      setProductos([...productos, { ...form, id: Date.now(), vendido: !!form.precioVenta }]);
    }
    setForm(emptyForm);
  };

  const editProducto = (p) => {
    setEditing(p.id);
    setForm({ nombre: p.nombre, precioCompra: p.precioCompra, precioVenta: p.precioVenta, valorVenta: p.valorVenta || "", fecha: p.fecha, fechaVenta: p.fechaVenta || "", notas: p.notas });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const invertido = productos.reduce((acc, p) => acc + parseFloat(p.precioCompra), 0);
  const vendidos = productos.filter(p => p.vendido).length;
  const beneficioTotal = productos.reduce((acc, p) => acc + ((parseFloat(p.precioVenta) || 0) - parseFloat(p.precioCompra)), 0);
  const stock = productos.filter(p => !p.vendido).length;
  const valorSinVender = productos.filter(p => !p.vendido).reduce((acc, p) => acc + parseFloat(p.valorVenta || 0), 0);

  const masBeneficio = productos.length ? [...productos].sort((a, b) => ((b.precioVenta || 0) - b.precioCompra) - ((a.precioVenta || 0) - a.precioCompra))[0] : null;

  const renderTabla = (lista, incluirPorcentaje = false) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Producto</TableHead>
          <TableHead>Fecha compra</TableHead>
          <TableHead>Precio compra</TableHead>
          <TableHead>Precio venta</TableHead>
          <TableHead>Fecha venta</TableHead>
          <TableHead>Vendido</TableHead>
          <TableHead>Beneficio</TableHead>
          {incluirPorcentaje && <TableHead>% Beneficio</TableHead>}
          <TableHead>Notas</TableHead>
          <TableHead>Editar</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {lista.map(p => {
          const compra = parseFloat(p.precioCompra);
          const venta = parseFloat(p.precioVenta) || 0;
          const beneficio = venta - compra;
          let porcentaje;

          if (!p.vendido) porcentaje = ((-compra / compra) * 100).toFixed(1);
          else porcentaje = ((beneficio / compra) * 100).toFixed(1);

          const vendidoStyle = p.vendido ? { backgroundColor: '#d4edda' } : {};

          return (
            <TableRow key={p.id} style={vendidoStyle}>
              <TableCell>{p.nombre}</TableCell>
              <TableCell>{p.fecha || "-"}</TableCell>
              <TableCell>€ {p.precioCompra}</TableCell>
              <TableCell>{p.precioVenta ? `€ ${p.precioVenta}` : "-"}</TableCell>
              <TableCell>{p.fechaVenta || "-"}</TableCell>
              <TableCell>{p.vendido ? "Sí" : "No"}</TableCell>
              <TableCell>{beneficio} €</TableCell>
              {incluirPorcentaje && <TableCell>{porcentaje}%</TableCell>}
              <TableCell>{p.notas || "-"}</TableCell>
              <TableCell><Button onClick={() => editProducto(p)}>Editar</Button></TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-3xl font-bold text-center">
        Seguimiento de Reventa
      </motion.h1>

      <div className="flex gap-4 justify-center">
        <Button onClick={() => setTab("panel")}>Panel</Button>
        <Button onClick={() => setTab("productos")}>Mis Productos</Button>
        <Button onClick={() => setTab("estadisticas")}>Estadísticas</Button>
      </div>

      {tab === "panel" && (
      <Card className="rounded-2xl shadow p-4">
        <CardContent className="grid grid-cols-1 md:grid-cols-7 gap-4">
          <Input placeholder="Producto" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />
          <Input placeholder="Precio compra" type="number" value={form.precioCompra} onChange={e => setForm({ ...form, precioCompra: e.target.value })} />
          <Input placeholder="Precio venta (opcional)" type="number" value={form.precioVenta} onChange={e => setForm({ ...form, precioVenta: e.target.value })} />
          <Input placeholder="Valor venta" type="number" value={form.valorVenta} onChange={e => setForm({ ...form, valorVenta: e.target.value })} />
          <Input placeholder="Fecha compra" type="date" value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })} />
          <Input placeholder="Fecha venta" type="date" value={form.fechaVenta} onChange={e => setForm({ ...form, fechaVenta: e.target.value })} />
          <Input placeholder="Notas" value={form.notas} onChange={e => setForm({ ...form, notas: e.target.value })} />

          <Button className="w-full md:col-span-7" onClick={saveProducto}>{editing ? "Guardar cambios" : "Añadir"}</Button>
        </CardContent>
      </Card>
      )}

      {tab === "panel" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card className="p-4"><h2 className="text-xl font-semibold">Invertido</h2><p className="text-2xl font-bold">€ {invertido.toFixed(2)}</p></Card>
            <Card className="p-4"><h2 className="text-xl font-semibold">Vendidos</h2><p className="text-2xl font-bold">{vendidos}</p></Card>
            <Card className="p-4"><h2 className="text-xl font-semibold">Beneficio total</h2><p className="text-2xl font-bold">€ {beneficioTotal.toFixed(2)}</p></Card>
            <Card className="p-4"><h2 className="text-xl font-semibold">Stock</h2><p className="text-2xl font-bold">{stock}</p></Card>
            <Card className="p-4"><h2 className="text-xl font-semibold">Valor sin vender</h2><p className="text-2xl font-bold">€ {valorSinVender.toFixed(2)}</p></Card>
          </div>

          <Card className="rounded-2xl shadow p-4 mt-4">{renderTabla(productos)}</Card>
        </>
      )}

      {tab === "productos" && (
        <Card className="rounded-2xl shadow p-4">{renderTabla(productos, true)}</Card>
      )}

      {tab === "estadisticas" && (
        <div className="space-y-4">
          <Card className="p-4"><h2 className="text-xl font-semibold">Producto con más beneficio</h2><p>{masBeneficio ? masBeneficio.nombre : "-"}</p></Card>

          <Card className="p-4">
            <h2 className="text-xl font-semibold">Velocidad de venta</h2>
            {productos.filter(p => p.vendido && p.fecha && p.fechaVenta).length > 0 ? (() => {
              const vendidos = productos.filter(p => p.vendido && p.fecha && p.fechaVenta).map(p => {
                const dias = Math.ceil((new Date(p.fechaVenta) - new Date(p.fecha)) / (1000*60*60*24));
                return { ...p, dias };
              });
              const masRapido = vendidos.reduce((a,b) => a.dias < b.dias ? a : b);
              const masLento = vendidos.reduce((a,b) => a.dias > b.dias ? a : b);
              return (
                <>
                  <p><strong>Producto más rápido en venderse:</strong> {masRapido.nombre} ({masRapido.dias} días)</p>
                  <p><strong>Producto más lento en venderse:</strong> {masLento.nombre} ({masLento.dias} días)</p>
                </>
              );
            })() : <p>No hay productos vendidos con fechas registradas</p>}
          </Card>
        </div>
      )}
    </div>
  );
}
