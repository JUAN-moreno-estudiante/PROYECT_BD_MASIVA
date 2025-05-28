// --- Frontend: Seguimientos.js (React) ---
import React, { useState, useEffect } from 'react';
import './seguimientos.css';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const API_SEGUIMIENTOS = 'http://localhost:5000/api/seguimientos';
const API_REGISTROS = 'http://localhost:5000/api/registros';

const motivosFijos = [
  '1RA LLAMADA',
  '2DA LLAMADA',
  '3RA LLAMADA',
  'ENVIO DE WHATSAPP',
  'CANCELACIÓN DE REGISTRO'
];

const estadosFijos = [
  'EN SEGUIMIENTO',
  'CERRADO',
  'PENDIENTE',
  'FINALIZADO'
];

export default function Seguimientos() {
  const [busqueda, setBusqueda] = useState('');
  const [registro, setRegistro] = useState(null);
  const [seguimientos, setSeguimientos] = useState([]);
  const [nuevo, setNuevo] = useState({ fecha: '', hora: '', motivo: '', notas: '', estado: 'EN SEGUIMIENTO' });
  const [pagina, setPagina] = useState(1);
  const porPagina = 10;
  const [registrosTodos, setRegistrosTodos] = useState([]);
  const [mostrarRegistros, setMostrarRegistros] = useState(false);
  const [paginaReg, setPaginaReg] = useState(1);
  const porPaginaReg = 10;

  useEffect(() => {
    mostrarTodos();
  }, []);

  const buscarRegistro = async () => {
    try {
      const res = await fetch(`${API_REGISTROS}/cel/${busqueda}`);
      const data = await res.json();

      if (!data || !data.id_reg) {
        alert('No se encontró el registro.');
        setRegistro(null);
        setSeguimientos([]);
        return;
      }

      setRegistro(data);
      setMostrarRegistros(false);

      const segRes = await fetch(`${API_SEGUIMIENTOS}/registro/${data.id_reg}`);
      const segData = await segRes.json();
      setSeguimientos(Array.isArray(segData) ? segData : []);
    } catch (error) {
      console.error('Error al buscar el registro:', error);
      alert('Error al buscar el registro.');
    }
  };

  const mostrarTodos = async () => {
    try {
      const res = await fetch(`${API_SEGUIMIENTOS}/joinRegistros`);
      const data = await res.json();
      setSeguimientos(Array.isArray(data) ? data : []);
      setRegistro(null);
      setMostrarRegistros(false);
    } catch (error) {
      console.error('Error al mostrar todos:', error);
    }
  };

  const mostrarTablaRegistros = async () => {
    try {
      const res = await fetch(API_REGISTROS);
      const data = await res.json();
      setRegistrosTodos(Array.isArray(data) ? data : []);
      setMostrarRegistros(true);
      setRegistro(null);
    } catch (err) {
      console.error('Error al cargar registros:', err);
    }
  };

  const descargarRegistrosExcel = () => {
    const data = registrosTodos.map(r => ({
      ID: r.id_reg,
      Nombre: r.nombre_reg,
      Apellido: r.apellido_reg,
      Celular: r.cel_reg,
      Medio: r.medio_reg,
      Fecha: r.fecha_reg
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Registros');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'registros.xlsx');
  };

  const descargarExcel = () => {
    const data = seguimientos.map(s => ({
      Fecha: s.fecha,
      Hora: s.hora,
      Motivo: s.motivo,
      Estado: s.estado,
      Notas: s.notas,
      Medio: s.medio_reg || '',
      Registro: s.id_reg || ''
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Seguimientos');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'seguimientos.xlsx');
  };

  const eliminarSeguimiento = async (id_seg) => {
    if (!window.confirm('¿Estás seguro de eliminar este seguimiento?')) return;
    try {
      const res = await fetch(`${API_SEGUIMIENTOS}/${id_seg}`, { method: 'DELETE' });
      if (res.ok) {
        setSeguimientos(seguimientos.filter(s => s.id_seg !== id_seg));
      }
    } catch (error) {
      console.error('Error al eliminar seguimiento:', error);
    }
  };

  const agregarSeguimiento = async () => {
    if (!registro || !registro.id_reg) {
      alert('Debes buscar y seleccionar un registro antes de agregar un seguimiento');
      return;
    }

    try {
      const res = await fetch(API_SEGUIMIENTOS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...nuevo, id_reg: registro.id_reg, id_usuario: 1 })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error);
      }

      const segRes = await fetch(`${API_SEGUIMIENTOS}/registro/${registro.id_reg}`);
      const segData = await segRes.json();
      setSeguimientos(Array.isArray(segData) ? segData : []);
      setNuevo({ fecha: '', hora: '', motivo: '', notas: '', estado: 'EN SEGUIMIENTO' });
    } catch (error) {
      console.error('Error al agregar seguimiento:', error);
      alert('No se pudo agregar el seguimiento');
    }
  };

  const paginados = seguimientos.slice((pagina - 1) * porPagina, pagina * porPagina);
  const paginadosRegistros = registrosTodos.slice((paginaReg - 1) * porPaginaReg, paginaReg * porPaginaReg);

  return (
    <div className="seguimiento-container">
      <div className="barra-busqueda">
        <input
          type="text"
          placeholder="Buscar por celular"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
        <div className="grupo-botones">
          <button className="btn btn-search" onClick={buscarRegistro}>Buscar</button>
          <button className="btn btn-export" onClick={descargarExcel}>📅 Excel</button>
          <button className="btn btn-update" onClick={mostrarTablaRegistros}>📋 Registros</button>
          <button className="btn btn-export" onClick={descargarRegistrosExcel}>⬇️ Excel Registros</button>
        </div>
      </div>

      {mostrarRegistros && (
        <div className="tabla-seguimientos">
          <h4>Todos los registros</h4>
          <table className="tabla-estilizada">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Celular</th>
                <th>Medio</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {paginadosRegistros.map(r => (
                <tr key={r.id_reg}>
                  <td>{r.id_reg}</td>
                  <td>{r.nombre_reg}</td>
                  <td>{r.apellido_reg}</td>
                  <td>{r.cel_reg}</td>
                  <td>{r.medio_reg}</td>
                  <td>{new Date(r.fecha_reg).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="paginacion">
            <button className="btn btn-search" onClick={() => setPaginaReg(p => Math.max(p - 1, 1))} disabled={paginaReg === 1}>⏪</button>
            <span>Página {paginaReg} de {Math.ceil(registrosTodos.length / porPaginaReg)}</span>
            <button className="btn btn-search" onClick={() => setPaginaReg(p => (p * porPaginaReg < registrosTodos.length ? p + 1 : p))} disabled={paginaReg * porPaginaReg >= registrosTodos.length}>⏩</button>
          </div>
        </div>
      )}

      {registro && (
        <>
          <div className="panel-datos">
            <h4>Datos del Registro</h4>
            <p>{registro.nombre_reg} {registro.apellido_reg}</p>
            <p>{registro.medio_reg}</p>
          </div>

          <div className="panel-nuevo">
            <h4>Agregar seguimiento</h4>
            <input type="date" value={nuevo.fecha} onChange={e => setNuevo({ ...nuevo, fecha: e.target.value })} />
            <input type="time" value={nuevo.hora} onChange={e => setNuevo({ ...nuevo, hora: e.target.value })} />
            <select value={nuevo.motivo} onChange={e => setNuevo({ ...nuevo, motivo: e.target.value })}>
              <option value="">-- Selecciona un motivo --</option>
              {motivosFijos.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <select value={nuevo.estado} onChange={e => setNuevo({ ...nuevo, estado: e.target.value })}>
              <option value="">-- Selecciona estado --</option>
              {estadosFijos.map(est => <option key={est} value={est}>{est}</option>)}
            </select>
            <textarea placeholder="Observaciones" value={nuevo.notas} onChange={e => setNuevo({ ...nuevo, notas: e.target.value })}></textarea>
            <button className="btn btn-create" onClick={agregarSeguimiento}>Agregar</button>
          </div>

          <div className="tabla-seguimientos">
            <h4>Seguimientos del registro</h4>
            <table className="tabla-estilizada">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Motivo</th>
                  <th>Estado</th>
                  <th>Notas</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {seguimientos.map(s => (
                  <tr key={s.id_seg}>
                    <td>{s.id_seg}</td>
                    <td>{new Date(s.fecha).toLocaleDateString()}</td>
                    <td>{s.hora}</td>
                    <td>{s.motivo}</td>
                    <td>{s.estado}</td>
                    <td>{s.notas}</td>
                    <td><button className="btn btn-delete" onClick={() => eliminarSeguimiento(s.id_seg)}>🗑️</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {!registro && !mostrarRegistros && (
        <div className="tabla-seguimientos">
          <h4>Todos los seguimientos</h4>
          <table className="tabla-estilizada">
            <thead>
              <tr>
                <th>ID</th>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Motivo</th>
                <th>Estado</th>
                <th>Notas</th>
                <th>ID Registro</th>
                <th>Medio</th>
              </tr>
            </thead>
            <tbody>
              {paginados.map(s => (
                <tr key={s.id_seg}>
                  <td>{s.id_seg}</td>
                  <td>{new Date(s.fecha).toLocaleDateString()}</td>
                  <td>{s.hora}</td>
                  <td>{s.motivo}</td>
                  <td>{s.estado}</td>
                  <td>{s.notas}</td>
                  <td>{s.id_reg}</td>
                  <td>{s.medio_reg}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="paginacion">
            <button className="btn btn-search" onClick={() => setPagina(p => Math.max(p - 1, 1))} disabled={pagina === 1}>⏪</button>
            <span>Página {pagina} de {Math.ceil(seguimientos.length / porPagina)}</span>
            <button className="btn btn-search" onClick={() => setPagina(p => (p * porPagina < seguimientos.length ? p + 1 : p))}>⏩</button>
          </div>
        </div>
      )}
    </div>
  );
}
