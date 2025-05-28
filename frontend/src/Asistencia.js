import React, { useState, useEffect, Fragment } from 'react';
import './Asistencia.css';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const API_ASISTENCIAS = 'http://localhost:5000/api/asistencia';

export default function AsistenciasCRUD() {
  const [asistencias, setAsistencias] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [studentId, setStudentId] = useState('');
  const [form, setForm] = useState({
    id_asistencia: null,
    id_estudiante: '',
    fecha: '',
    estado: 'Presente'
  });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const registrosPorPagina = 10;
  const totalPaginas = Math.ceil(filtered.length / registrosPorPagina);
  const inicio = (currentPage - 1) * registrosPorPagina;
  const paginados = filtered.slice(inicio, inicio + registrosPorPagina);

  useEffect(() => { fetchAll(); }, []);
  useEffect(() => { handleFilter(); }, [selectedDate, studentId, asistencias]);

  const fetchAll = async () => {
    try {
      const res = await fetch(API_ASISTENCIAS);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setAsistencias(data);
      setFiltered(data);
    } catch {
      setError('No se pudo cargar asistencias');
    }
  };

  const handleFilter = () => {
    let tmp = [...asistencias];
    if (selectedDate) tmp = tmp.filter(a => a.fecha.startsWith(selectedDate));
    if (studentId) tmp = tmp.filter(a => a.id_estudiante === Number(studentId));
    setFiltered(tmp);
    setCurrentPage(1);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const { id_asistencia, id_estudiante, fecha, estado } = form;
      const method = id_asistencia ? 'PUT' : 'POST';
      const url = id_asistencia
        ? `${API_ASISTENCIAS}/${id_asistencia}`
        : API_ASISTENCIAS;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_estudiante, fecha, estado })
      });
      if (!res.ok) throw new Error();
      await fetchAll();
      resetForm();
    } catch {
      setError('Error al guardar asistencia');
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('¿Eliminar asistencia?')) return;
    try {
      await fetch(`${API_ASISTENCIAS}/${id}`, { method: 'DELETE' });
      await fetchAll();
    } catch {
      setError('Error al eliminar asistencia');
    }
  };

  const handleEditClick = a => {
    setForm({
      id_asistencia: a.id_asistencia,
      id_estudiante: a.id_estudiante,
      fecha: a.fecha.slice(0, 10),
      estado: a.estado
    });
    setEditingId(editingId === a.id_asistencia ? null : a.id_asistencia);
  };

  const handleExport = () => {
    const data = asistencias.map(a => ({
      ID: a.id_asistencia,
      Estudiante: a.estudiante,
      Fecha: a.fecha,
      Salón: a.salon,
      Docente: a.docente,
      Estado: a.estado
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Asistencias');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'asistencias.xlsx');
  };

  const resetForm = () => {
    setForm({ id_asistencia: null, id_estudiante: '', fecha: '', estado: 'Presente' });
    setEditingId(null);
    setError(null);
  };

  return (
    <div className="asistencias-crud">
      <h2>Registro de Asistencias</h2>
      {error && <p className="error">{error}</p>}

      <form className="form-asistencia" onSubmit={handleSubmit}>
        <input
          type="number"
          placeholder="ID Estudiante"
          value={form.id_estudiante}
          onChange={e => setForm({ ...form, id_estudiante: e.target.value })}
          required
        />
        <input
          type="date"
          value={form.fecha}
          onChange={e => setForm({ ...form, fecha: e.target.value })}
          required
        />
        <select
          value={form.estado}
          onChange={e => setForm({ ...form, estado: e.target.value })}
        >
          <option>Presente</option>
          <option>Ausente</option>
          <option>Tarde</option>
        </select>
        <button type="submit" className="btn-action">
          {form.id_asistencia ? '✏️ Actualizar' : '➕ Crear'}
        </button>
      </form>

      <div className="filtros">
        <input
          type="date"
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
        />
        <input
          type="number"
          placeholder="Filtrar ID Estudiante"
          value={studentId}
          onChange={e => setStudentId(e.target.value)}
        />
      </div>

      <div className="actions-bar">
        <button onClick={handleExport} className="btn-action btn-export">
          📥 Excel
        </button>
      </div>

      <table className="tabla-asistencias">
        <thead>
          <tr>
            <th>ID</th>
            <th>Estudiante</th>
            <th>Fecha</th>
            <th>Salón</th>
            <th>Docente</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {paginados.map(a => (
            <Fragment key={a.id_asistencia}>
              <tr>
                <td>{a.id_asistencia}</td>
                <td>{a.estudiante}</td>
                <td>{new Date(a.fecha).toLocaleDateString()}</td>
                <td>{a.salon}</td>
                <td>{a.docente}</td>
                <td>{a.estado}</td>
                <td>
                  <button onClick={() => handleEditClick(a)}>✏️</button>
                  <button onClick={() => handleDelete(a.id_asistencia)}>🗑️</button>
                </td>
              </tr>
              {editingId === a.id_asistencia && (
                <tr className="edit-panel-row">
                  <td colSpan="7">
                    <form className="edit-panel" onSubmit={handleSubmit}>
                      <input
                        type="number"
                        value={form.id_estudiante}
                        onChange={e => setForm({ ...form, id_estudiante: e.target.value })}
                      />
                      <input
                        type="date"
                        value={form.fecha}
                        onChange={e => setForm({ ...form, fecha: e.target.value })}
                      />
                      <select
                        value={form.estado}
                        onChange={e => setForm({ ...form, estado: e.target.value })}
                      >
                        <option>Presente</option>
                        <option>Ausente</option>
                        <option>Tarde</option>
                      </select>
                      <button type="submit" className="btn-action btn-update">✅ Actualizar</button>
                      <button type="button" className="btn-action btn-cancel" onClick={resetForm}>✖️ Cancelar</button>
                    </form>
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>

      {/* Paginación */}
      <div className="pagination">
        <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>⬅️</button>
        <span>Página {currentPage} de {totalPaginas}</span>
        <button disabled={currentPage === totalPaginas} onClick={() => setCurrentPage(p => p + 1)}>➡️</button>
      </div>
    </div>
  );
}
