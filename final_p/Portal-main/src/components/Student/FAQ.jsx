import React, { useState, useEffect } from 'react';
import './Style.css';
import Sidebar from './Sidebar';

const FAQ = () => {
  // State to manage which question is expanded
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [faqs, setFaqs] = useState([]);  // State to hold FAQ data
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null);  // Error state

  // Fetch FAQ data from the backend
  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const response = await fetch('http://localhost:5000/faqs');  // Make sure this URL is correct
        if (!response.ok) {
          throw new Error('Failed to fetch FAQs');
        }
        const data = await response.json();
        setFaqs(data);  // Update state with the fetched FAQ data
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchFaqs();
  }, []);

  // Toggle function to show or hide the answer
  const toggleAnswer = (index) => {
    if (expandedIndex === index) {
      setExpandedIndex(null);  // Collapse if clicked again
    } else {
      setExpandedIndex(index); // Expand the clicked one
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="containers">
      <Sidebar />
      <div className="faq-container">
        <h1>FAQs</h1>
        <div className="faq-cards">
          {faqs.map((faq, index) => (
            <div className="faq-card" key={index}>
              <div className="faq-question" onClick={() => toggleAnswer(index)}>
                <span>{faq.question}</span>
                <span className="faq-toggle-icon">{expandedIndex === index ? '-' : '+'}</span>
              </div>
              {expandedIndex === index && <div className="faq-answer">{faq.answer}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQ;
