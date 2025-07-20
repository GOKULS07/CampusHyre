import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, ArcElement);

/* ------------------------------------------------------------------ */
/* Configuration – feel free to move these to a constants file        */
/* ------------------------------------------------------------------ */
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const COLORS = {
  present : '#16D5A8',
  absent  : '#B44E94',
};

/* ------------------------------------------------------------------ */
/* React component                                                    */
/* ------------------------------------------------------------------ */
const AttendanceChart = () => {
  const [data,   setData]   = useState(null);
  const [error,  setError]  = useState(null);
  const [loading, setLoading] = useState(true);

  /* fetch once on mount */
  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        const email = sessionStorage.getItem('email');
        if (!email) throw new Error('No email found in sessionStorage');

        const res = await fetch(`${API_BASE}/attendance`, {
          method : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body   : JSON.stringify({ email }),
          signal : controller.signal,
        });

        if (!res.ok) throw new Error(`Server responded ${res.status}`);

        const json = await res.json();
        setData({
          present: Number(json.presentDays || 0),
          total  : Number(json.totalDays   || 0),
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error(err);
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    })();

    /* clean‑up fetch on unmount */
    return () => controller.abort();
  }, []);

  /* ───── Render states ───── */
  if (loading) return <p style={styles.loading}>Loading…</p>;
  if (error)   return <p style={styles.error}>Error: {error}</p>;
  if (!data)   return null; // should never happen

  const { present, total } = data;
  const presentPct = total ? (present / total) * 100 : 0;
  const absentPct  = 100 - presentPct;

  /* chart.js dataset */
  const chartData = {
    labels  : ['Present', 'Absent'],
    datasets: [{
      data           : [presentPct, absentPct],
      backgroundColor: [COLORS.present, COLORS.absent],
      borderColor    : [COLORS.present, COLORS.absent],
      borderWidth    : 1,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    cutout: '70%',          // donut hole
    plugins : { legend: { display: false } },
  };

  /* ───── UI ───── */
  return (
    <div style={styles.card}>
      <h3 style={styles.title}>Attendance %</h3>

      <div style={styles.chartWrap}>
        <Pie data={chartData} options={options} />
        {/* overlay percentage in the middle */}
        <span style={styles.percentage}>{presentPct.toFixed(1)}%</span>
      </div>

      <div style={styles.legend}>
        <LegendDot color={COLORS.present} label="Present" />
        <LegendDot color={COLORS.absent}  label="Absent"  />
      </div>
    </div>
  );
};

/* ---------- small legend component ---------- */
const LegendDot = ({ color, label }) => (
  <div style={styles.legendItem}>
    <span style={{ ...styles.dot, backgroundColor: color }} />
    <span>{label}</span>
  </div>
);

/* ------------------------------------------------------------------ */
/* Inline styles (could be CSS/Sass instead)                          */
/* ------------------------------------------------------------------ */
const styles = {
  card: {
    width           : '100%',
    height          : '100%',
    padding         : 16,
    backgroundColor : '#fff',
    borderRadius    : 12,
    boxShadow       : '0 2px 8px rgba(0,0,0,0.05)',
    display         : 'flex',
    flexDirection   : 'column',
    justifyContent  : 'space-between',
  },
  title: {
    margin  : 0,
    color   : '#3674B5',
    fontSize: 18,
    fontWeight: 600,
  },
  chartWrap: {
    position: 'relative',
    height  : 160,
    margin  : '0 auto',
  },
  percentage: {
    position : 'absolute',
    top      : '50%',
    left     : '50%',
    transform: 'translate(-50%, -50%)',
    fontSize : 18,
    fontWeight: 600,
    color    : '#333',
  },
  legend: {
    display       : 'flex',
    justifyContent: 'center',
    gap           : 24,
    marginTop     : 8,
    fontSize      : 13,
    fontWeight    : 500,
  },
  legendItem: { display: 'flex', alignItems: 'center', gap: 6 },
  dot: {
    width        : 12,
    height       : 12,
    borderRadius : '50%',
    display      : 'inline-block',
  },
  loading: { textAlign: 'center', padding: 20, color: '#666' },
  error  : { textAlign: 'center', padding: 20, color: '#e00', fontWeight: 600 },
};

export default AttendanceChart;
