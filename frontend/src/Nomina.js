import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Nomina.css";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const API_DOCENTES = "http://localhost:5000/api/docentes";
const API_PAGOS = "http://localhost:5000/api/pagos";

export default function ProfesoresCRUD() {
  const [profesores, setProfesores] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [searchId, setSearchId] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    nombre_doc: "",
    apellido_doc: "",
    asignatura_doc: "",
    salon_doc: "",
    pago_doc: false,
    email_doc: ""
  });

  const [currentPage, setCurrentPage] = useState(1);
  const registrosPorPagina = 10;
  const totalPaginas = Math.ceil(profesores.length / registrosPorPagina);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [dRes, pRes] = await Promise.all([
        axios.get(API_DOCENTES),
        axios.get(API_PAGOS)
      ]);
      setProfesores(dRes.data);
      setPagos(pRes.data);
    } catch (err) {
      console.error(err);
      alert("Error cargando datos");
    }
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API_DOCENTES}/${editingId}`, form);
        alert("Docente actualizado");
      } else {
        await axios.post(API_DOCENTES, form);
        alert("Docente creado");
      }
      await fetchData();
      resetForm();
    } catch (err) {
      console.error(err);
      alert("Error en operación");
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("¿Eliminar este docente?")) return;
    try {
      await axios.delete(`${API_DOCENTES}/${id}`);
      alert("Docente eliminado");
      await fetchData();
      resetForm();
    } catch (err) {
      console.error(err);
      alert("Error al eliminar");
    }
  }

  async function handleSearch() {
    if (!searchId.trim()) return;
    try {
      const res = await axios.get(`${API_DOCENTES}/${searchId}`);
      const d = res.data;
      setEditingId(d.id_docentes);
      setForm({
        nombre_doc: d.nombre_doc,
        apellido_doc: d.apellido_doc,
        asignatura_doc: d.asignatura_doc,
        salon_doc: d.salon_doc,
        pago_doc: d.pago_doc,
        email_doc: d.email_doc
      });
    } catch (err) {
      console.error(err);
      alert("Docente no encontrado");
      resetForm();
    }
  }

  function resetForm() {
    setEditingId(null);
    setForm({
      nombre_doc: "",
      apellido_doc: "",
      asignatura_doc: "",
      salon_doc: "",
      pago_doc: false,
      email_doc: ""
    });
    setSearchId("");
  }

  function handleExport() {
    const data = profesores.map(d => ({
      ID: d.id_docentes,
      Nombre: d.nombre_doc,
      Apellido: d.apellido_doc,
      Asignatura: d.asignatura_doc,
      Salon: d.salon_doc,
      Pago_al_dia: d.pago_doc ? "Sí" : "No",
      Email: d.email_doc
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Profesores");
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([wbout], { type: "application/octet-stream" }), "profesores.xlsx");
  }

  const indexInicio = (currentPage - 1) * registrosPorPagina;
  const docentesPagina = profesores.slice(indexInicio, indexInicio + registrosPorPagina);

  return (
    <div className="profesor-wrapper">
      <div className="profesores-panel">
        <h2>Gestión de Profesores</h2>

        <div className="actions-bar">
          <button onClick={handleExport} className="btn-export">📥 Excel</button>
          <input
            type="text"
            placeholder="ID del docente"
            value={searchId}
            onChange={e => setSearchId(e.target.value)} />
          <button onClick={handleSearch} className="btn-search" disabled={!searchId.trim()}>🔍 Buscar</button>
        </div>

        <div className="panel-negro">
          <div className="form-crud">
            <h3>{editingId ? "✏️ Editar docente" : "➕ Crear nuevo docente"}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <input name="nombre_doc" value={form.nombre_doc} onChange={handleChange} placeholder="Nombre" required />
                <input name="apellido_doc" value={form.apellido_doc} onChange={handleChange} placeholder="Apellido" required />
              </div>
              <div className="form-group">
                <input name="asignatura_doc" value={form.asignatura_doc} onChange={handleChange} placeholder="Asignatura" required />
                <input name="salon_doc" type="number" value={form.salon_doc} onChange={handleChange} placeholder="Salón" required />
              </div>
              <div className="form-group checkbox">
                <label>
                  <input name="pago_doc" type="checkbox" checked={form.pago_doc} onChange={handleChange} /> Pago al día
                </label>
              </div>
              <div className="form-group">
                <input name="email_doc" type="email" value={form.email_doc} onChange={handleChange} placeholder="Email" required />
              </div>
              <div className="crud-form-buttons">
                <button type="submit" className="btn btn-create">{editingId ? "✏️ Actualizar" : "➕ Crear"}</button>
                {editingId && (
                  <button type="button" className="btn btn-cancel" onClick={() => handleDelete(editingId)}>❌ Eliminar</button>
                )}
              </div>
            </form>
          </div>

          <table className="tabla-general">
            <thead>
              <tr>
                <th>ID</th><th>Nombre</th><th>Apellido</th><th>Asignatura</th>
                <th>Salón</th><th>Pago al día</th><th>Email</th>
              </tr>
            </thead>
            <tbody>
              {docentesPagina.map(d => (
                <tr key={d.id_docentes}>
                  <td>{d.id_docentes}</td>
                  <td>{d.nombre_doc}</td>
                  <td>{d.apellido_doc}</td>
                  <td>{d.asignatura_doc}</td>
                  <td>{d.salon_doc}</td>
                  <td>{d.pago_doc ? '✓' : '✗'}</td>
                  <td>{d.email_doc}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="paginacion">
            <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>Anterior</button>
            <span>Página {currentPage} de {totalPaginas}</span>
            <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPaginas))} disabled={currentPage === totalPaginas}>Siguiente</button>
          </div>
        </div>
      </div>
    </div>
  );
}
