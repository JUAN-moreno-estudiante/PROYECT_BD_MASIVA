import React, { useState, useEffect } from "react";
import "./Notas.css";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const API_BASE = "http://localhost:5000/api/estudiantes";
const API_DOCENTES = "http://localhost:5000/api/docentes";
const API_ASISTENCIAS = "http://localhost:5000/api/asistencias";

export default function Notas() {
  const [docentes, setDocentes] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [asistencias, setAsistencias] = useState([]);
  const [viewMode, setViewMode] = useState("general");
  const [studentId, setStudentId] = useState("");
  const [studentInfo, setStudentInfo] = useState(null);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    nombre_est: "",
    apellido_est: "",
    salon_est: "",
    id_docentes: ""
  });

 const [currentPage, setCurrentPage] = useState(1);
  const registrosPorPagina = 10;
  const totalPaginas = Math.ceil(allStudents.length / registrosPorPagina);
  useEffect(() => {
    fetch(API_DOCENTES).then(r => r.json()).then(setDocentes).catch(() => setDocentes([]));
    fetch(API_ASISTENCIAS).then(r => r.json()).then(setAsistencias).catch(() => setAsistencias([]));
    handleGeneral();
  }, []);

  const today = new Date().toISOString().slice(0, 10);

  const handleGeneral = async () => {
    try {
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error("Error al cargar estudiantes");
      const data = await res.json();
      setAllStudents(data);
      setViewMode("general");
      setError(null);
      resetForm();
      setStudentInfo(null);
    } catch (e) {
      setError(e.message);
    }
  };

  const handleExport = () => {
    const arr = allStudents.map(s => {
      const d = docentes.find(x => x.id_docentes === s.id_docentes);
      const a = asistencias.find(as => {
        const date = as.fecha.split('T')[0];
        return as.id_estudiante === s.id_estudiante && date === today;
      });
      return {
        ID: s.id_estudiante,
        Nombre: s.nombre_est,
        Apellido: s.apellido_est,
        Salón: s.salon_est,
        Docente: d ? `${d.nombre_doc} ${d.apellido_doc}` : "—",
        Asistencia: a ? a.estado : "—"
      };
    });
    const ws = XLSX.utils.json_to_sheet(arr);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Estudiantes");
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'estudiantes.xlsx');
  };

  const handleSearch = async () => {
    if (!studentId.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/${studentId}`);
      if (!res.ok) throw new Error("Estudiante no encontrado");
      const data = await res.json();
      setStudentInfo({
        id: data.id_estudiante,
        nombre: data.nombre_est,
        apellido: data.apellido_est,
        salon: data.salon_est,
        id_docentes: data.id_docentes,
        materias: data.notas || []
      });
      setFormData({
        nombre_est: data.nombre_est,
        apellido_est: data.apellido_est,
        salon_est: data.salon_est,
        id_docentes: data.id_docentes || ""
      });
      setError(null);
      setViewMode("detail");
    } catch (e) {
      setError(e.message);
      setStudentInfo(null);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const url = viewMode === "detail" && studentInfo
        ? `${API_BASE}/${studentInfo.id}`
        : API_BASE;
      const method = url.includes(studentInfo?.id) ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error("Operación fallida");
      await res.json();
      alert(method === 'POST' ? "Estudiante creado" : "Estudiante actualizado");
      handleGeneral();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleDelete = async () => {
    if (!studentInfo) return;
    if (!window.confirm("Eliminar este estudiante?")) return;
    try {
      const res = await fetch(`${API_BASE}/${studentInfo.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Error al eliminar");
      alert("Estudiante eliminado");
      handleGeneral();
    } catch (e) {
      alert(e.message);
    }
  };

  const resetForm = () => {
    setFormData({ nombre_est: '', apellido_est: '', salon_est: '', id_docentes: '' });
  };

return (
  <div className="estudiantes-panel">
    <h2>Gestión de Profesores</h2>
    <div className="actions-bar">
      <button onClick={handleExport} className="btn-export">📥 Excel</button>
      <input
        type="text"
        placeholder="ID del estudiante"
        value={studentId}
        onChange={e => setStudentId(e.target.value)}
      />
      <button onClick={handleSearch} className="btn-search" disabled={!studentId.trim()}>
        🔍 Buscar
      </button>
    </div>

    <div className="panel-negro">
      {(viewMode === 'general' || viewMode === 'detail') && (
        <div className="form-crud">
          <h2>Gestión de Estudiantes</h2>
          <h3>{viewMode === 'detail' ? 'Editar estudiante' : 'Crear nuevo estudiante'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                name="nombre_est"
                value={formData.nombre_est}
                onChange={e => setFormData({ ...formData, nombre_est: e.target.value })}
                placeholder="Nombre"
                required
              />
              <input
                name="apellido_est"
                value={formData.apellido_est}
                onChange={e => setFormData({ ...formData, apellido_est: e.target.value })}
                placeholder="Apellido"
                required
              />
            </div>
            <div className="form-group">
              <input
                name="salon_est"
                value={formData.salon_est}
                onChange={e => setFormData({ ...formData, salon_est: e.target.value })}
                placeholder="Salón"
                required
              />
            </div>
            <div className="form-group">
              <select
                name="id_docentes"
                value={formData.id_docentes}
                onChange={e => setFormData({ ...formData, id_docentes: e.target.value })}
                required
              >
                <option value="">-- Selecciona Docente --</option>
                {docentes.map(d => (
                  <option key={d.id_docentes} value={d.id_docentes}>
                    {d.nombre_doc} {d.apellido_doc}
                  </option>
                ))}
              </select>
            </div>
            <div className="crud-form-buttons">
              <button type="submit" className={viewMode === 'detail' ? 'btn-update' : 'btn-create'}>
                {viewMode === 'detail' ? '✏️ Actualizar' : '➕ Crear'}
              </button>
              {viewMode === 'detail' && (
                <button type="button" className="btn-cancel" onClick={handleDelete}>
                  ❌ Eliminar
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {viewMode === 'general' && (
        <table className="tabla-general">
          
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Salón</th>
              <th>Docente</th>
              <th>Asistencia</th>
            </tr>
          </thead>
          <tbody>
            {allStudents
              .slice((currentPage - 1) * registrosPorPagina, currentPage * registrosPorPagina)
              .map(s => {
                const d = docentes.find(x => x.id_docentes === s.id_docentes);
                const a = asistencias.find(x => x.id_estudiante === s.id_estudiante && x.fecha.split('T')[0] === today);
                return (
                  <tr key={s.id_estudiante}>
                    <td>{s.id_estudiante}</td>
                    <td>{s.nombre_est}</td>
                    <td>{s.apellido_est}</td>
                    <td>{s.salon_est}</td>
                    <td>{d ? `${d.nombre_doc} ${d.apellido_doc}` : '—'}</td>
                    <td>{a ? a.estado : '—'}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      )}
    </div>

    <div className="paginacion">
      <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
        Anterior
      </button>
      <span>Página {currentPage} de {totalPaginas}</span>
      <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPaginas))} disabled={currentPage === totalPaginas}>
        Siguiente
      </button>
    </div>
  </div>
);
}