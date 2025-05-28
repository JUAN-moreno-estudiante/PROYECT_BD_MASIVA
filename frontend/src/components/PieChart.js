// src/components/PieChart.js
import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Pie } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title
} from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend, Title)

export default function PieChart({
  table,
  groupBy,
  aggregate = 'count',  // 'count' o 'sum'
  valueCol            // requerido si aggregate === 'sum'
}) {
  const [labels, setLabels] = useState([])
  const [dataSet, setDataSet] = useState([])

  useEffect(() => {
    async function fetchData() {
      // 1) Consulta a Supabase
      const { data, error } = await supabase
        .from(table)
        .select(`${groupBy}${aggregate === 'sum' ? `, ${valueCol}` : ''}`)

      // 2) Manejo de errores
      if (error) {
        console.error('❌ Error fetching data from', table, error)
        return
      }

      // 3) Aquí ves los datos crudos en consola
      console.log('▶️ Datos crudos de', table, data)

      // 4) Agrupar en JS
      const map = {}
      data.forEach(row => {
        const key = row[groupBy] ?? '–– vacío ––'
        const val = aggregate === 'sum'
          ? Number(row[valueCol]) || 0
          : 1
        map[key] = (map[key] || 0) + val
      })

      setLabels(Object.keys(map))
      setDataSet(Object.values(map))
    }

    fetchData()
  }, [table, groupBy, aggregate, valueCol])

  const chartData = {
    labels,
    datasets: [
      {
        label: aggregate === 'sum'
          ? `Suma de ${valueCol}`
          : 'Conteo',
        data: dataSet,
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56',
          '#4BC0C0', '#9966FF', '#FF9F40'
        ]
      }
    ]
  }

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: `${table} → ${aggregate === 'sum' ? `suma(${valueCol})` : 'conteo'} por ${groupBy}`
      },
      legend: { position: 'bottom' }
    }
  }

  return <Pie data={chartData} options={options} />
}
