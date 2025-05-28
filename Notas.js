import React, { useState } from "react";
import "./Notas.css";
import"./index.js";
export default function Notas() {
  const [studentId, setStudentId] = useState("");
  const [studentInfo, setStudentInfo] = useState(null);

  const handleSearch = () => {
    // TODO: aquí vas a llamar tu API, p.ej.:
    // fetch(`/api/notas/${studentId}`)
    //   .then(res => res.json())
    //   .then(data => setStudentInfo(data))
    //
    // Por ahora simulamos:
    setStudentInfo({
      id: studentId,
      nombre: "Juan Pérez",
      grado: "10°",
      promedio: "4.7",
      materias: [
        { nombre: "Matemáticas", nota: "4.8" },
        { nombre: "Lengua", nota: "4.5" },
      ],
    });
  };

  return (
    <div className="notas-contenido">
      <div className="campo-busqueda">
        <input
          type="text"
          placeholder="ID del estudiante"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
        />
        <button onClick={handleSearch} disabled={!studentId.trim()}>
          🔍 Buscar
        </button>
      </div>

      {studentInfo && (
        <div className="student-info">
          <h2>Datos del Estudiante</h2>
          <label><strong>ID:</strong> {studentInfo.id}</label>
          <label><strong>Nombre:</strong> {studentInfo.nombre}</label>
          <label><strong>Grado:</strong> {studentInfo.grado}</label>
          <label><strong>Promedio:</strong> {studentInfo.promedio}</label>

          <h3>Materias</h3>
          <ul>
            {studentInfo.materias.map((m, i) => (
              <li key={i}>
                {m.nombre}: {m.nota}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
