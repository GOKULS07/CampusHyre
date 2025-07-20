import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
} from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const Placementcount = () => {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const email = sessionStorage.getItem('email');
      if (!email) {
        setError('Email not found in session');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`http://localhost:5000/studentjob?email=${encodeURIComponent(email)}`);
        if (!res.ok) throw new Error('Server Error');
        const json = await res.json();
        setStudentData(json);
      } catch (err) {
        setError(err.message || 'Error fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div style={styles.loading}>Loading analytics…</div>;
  if (error) return <div style={styles.error}>Error: {error}</div>;
  if (!studentData?.jobApplicationAnalytics) return <div style={styles.error}>No analytics available.</div>;

  const { appliedJobs = 0, rejectedJobs = 0 } = studentData.jobApplicationAnalytics;

  const chartData = {
    labels: ['Applied Jobs', 'Rejected Jobs'],
    datasets: [
      {
        label: 'Applications',
        data: [appliedJobs, rejectedJobs],
        backgroundColor: ['#3674B5', '#FF4C4C'],
        borderRadius: 6,
        barThickness: 30,
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
          stepSize: 1,
          color: '#333'
        }
      },
      x: {
        ticks: { color: '#333' }
      }
    }
  };

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>Job Application Analytics</h3>
      <div style={styles.chartContainer}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

/* --------------------------- STYLES --------------------------- */
const styles = {
  card: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3674B5',
    marginBottom: 16,
  },
  chartContainer: {
    height: '240px',
  },
  loading: {
    textAlign: 'center',
    color: '#666',
    padding: '20px',
  },
  error: {
    textAlign: 'center',
    color: '#e00',
    fontWeight: 'bold',
    padding: '20px',
  }
};

export default Placementcount;
