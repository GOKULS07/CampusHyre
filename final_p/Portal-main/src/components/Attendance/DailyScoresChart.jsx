import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const DailyScoresChart = ({ studentData }) => {
  if (!studentData || !studentData.dailyScores || studentData.dailyScores.length === 0) {
    return <p style={styles.error}>No score data available.</p>;
  }

  const labels = studentData.dailyScores.map(score => score.day);
  const scores = studentData.dailyScores.map(score => score.score);

  const data = {
    labels,
    datasets: [
      {
        label: 'Daily Score',
        data: scores,
        backgroundColor: '#42a5f5',
        borderColor: '#1e88e5',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: '#333',
          font: { size: 12 },
        },
      },
      x: {
        ticks: {
          color: '#333',
          font: { size: 12 },
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>Daily Scores</h3>
      <div style={styles.chartContainer}>
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

const styles = {
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3674B5',
    marginBottom: 12,
  },
  chartContainer: {
    flex: 1,
    position: 'relative',
    height: '200px',
  },
  error: {
    padding: '10px',
    color: 'red',
    textAlign: 'center',
  },
};

export default DailyScoresChart;
