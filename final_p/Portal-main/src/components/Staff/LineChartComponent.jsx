// src/components/LineChartComponent.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  Title, Tooltip, Legend,
  LineElement, PointElement,
  CategoryScale, LinearScale, Filler
} from 'chart.js';

ChartJS.register(
  Title, Tooltip, Legend,
  LineElement, PointElement,
  CategoryScale, LinearScale, Filler
);

const API = 'http://localhost:5000/student_analysis';

export default function LineChartComponent() {
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });

  /* ───────────────────────────────────────────────────── */
  /*  1.  Normalise whatever shape the API gives us        */
  /* ───────────────────────────────────────────────────── */
  const normalise = raw => {
    // If it’s already shape A, just return it.
    if (raw.months && Array.isArray(raw.months)) {
      return {
        labels         : raw.months           ?? [],
        totalStudents  : raw.total_students   ?? [],
        studentsHired  : raw.students_hired   ?? [],
        recruiters     : raw.recruiters       ?? []
      };
    }

    // Otherwise assume shape B (array of objects).
    if (Array.isArray(raw)) {
      const labels        = [];
      const totalStudents = [];
      const studentsHired = [];
      const recruiters    = [];

      raw.forEach(r => {
        labels.push(r.month ?? r.label ?? '');
        totalStudents .push(r.total_students ?? r.total ?? 0);
        studentsHired .push(r.students_hired ?? r.hired ?? 0);
        recruiters    .push(r.recruiters     ?? r.recruiter_count ?? 0);
      });

      return { labels, totalStudents, studentsHired, recruiters };
    }

    // Fallback – empty data
    return { labels: [], totalStudents: [], studentsHired: [], recruiters: [] };
  };

  /* ───────────────────────────────────────────────────── */
  /*  2.  Fetch once (or poll if you like)                 */
  /* ───────────────────────────────────────────────────── */
  const fetchAnalysisData = useCallback(async () => {
    try {
      const res = await fetch(API, {
        method : 'POST',
        headers: { 'Content-Type':'application/json' },
        body   : JSON.stringify({ period:'year' })
      });
      if (!res.ok) throw new Error(`/student_analysis ${res.status}`);

      const raw   = await res.json();          // may be shape A or B
      const data  = normalise(raw);            // always gives {labels,…}

      setChartData({
        labels  : data.labels,
        datasets: [
          {
            label           : 'Total Students',
            data            : data.totalStudents,
            borderColor     : '#3B82F6',
            backgroundColor : 'rgba(59,130,246,0.2)',
            tension         : 0.3,
            fill            : true
          },
          {
            label           : 'Students Hired',
            data            : data.studentsHired,
            borderColor     : '#10B981',
            backgroundColor : 'rgba(16,185,129,0.2)',
            tension         : 0.3,
            fill            : true
          },
          {
            label           : 'Recruiters',
            data            : data.recruiters,
            borderColor     : '#F97316',
            backgroundColor : 'rgba(249,115,22,0.2)',
            tension         : 0.3,
            fill            : true
          }
        ]
      });
    } catch (err) {
      console.error('Error fetching student_analysis:', err);
    }
  }, []);

  useEffect(() => { fetchAnalysisData(); }, [fetchAnalysisData]);

  /* ───────────────────────────────────────────────────── */
  /*  3.  Chart JS options                                 */
  /* ───────────────────────────────────────────────────── */
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid:   { color:'#e5e7eb' },
        title:  { display:true, text:'Month' }
      },
      y: {
        beginAtZero: true,
        grid:   { color:'#e5e7eb' },
        title:  { display:true, text:'Count' }
      }
    },
    plugins: {
      legend : { position:'bottom' },
      tooltip: { mode:'index', intersect:false }
    }
  };

  /* ───────────────────────────────────────────────────── */
  /*  4.  Render                                           */
  /* ───────────────────────────────────────────────────── */
  return (
    <div className="analysis-box">
      <h3>Student Analysis</h3>

      <div
        className="chart-placeholder"
        style={{ height:'var(--chart-height, 400px)' }}   /* easy override */
      >
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}
