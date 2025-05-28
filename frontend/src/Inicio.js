import React from "react"
import PieChart from "./components/PieChart"
import "./Inicio.css"

export default function Inicio() {
  const charts = [
    { title: 'SEGUIMIENTOS', props: { table: 'seguimientos', groupBy: 'estado', aggregate: 'count' } },
    { title: 'ASISTENCIA',  props: { table: 'asistencias',  groupBy: 'estado', aggregate: 'count' } },
    { title: 'PAGOS',        props: { table: 'pagos',        groupBy: 'estado', aggregate: 'sum', valueCol: 'monto' } },
    { title: 'INSCRIPCIONES', props: { table: 'registros',    groupBy: 'tip_lead', aggregate: 'count' } }
  ];

  return (
    <main className="inicio-contenido">
      <h2 className="dashboard-title">DASHBOARD GENERAL</h2>
      <section className="graficos-grid">
        {charts.map(({ title, props }) => (
          <div key={title} className="grafico-card">
            <h3>{title}</h3>
            <div className="grafico-chart">
              <PieChart {...props} />
            </div>
          </div>
        ))}
      </section>
    </main>
  )
}
