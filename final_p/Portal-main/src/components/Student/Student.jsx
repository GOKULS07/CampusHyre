import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import './Style.css';
import Placementcount from '../Attendance/Placementcount';
import AttendanceChart from '../Attendance/AttendanceChart';
import DailyScoresChart from '../Attendance/DailyScoresChart';

const Student = () => {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recruiterFeedbacks, setRecruiterFeedbacks] = useState([]);
  const [staffFeedbacks, setStaffFeedbacks] = useState([]);
  const [feedbackError, setFeedbackError] = useState(null);

  
  useEffect(() => {
    const email = sessionStorage.getItem("email");

    if (!email) {
      setError("Email not found in local storage");
      setLoading(false);
      return;
    }

    const fetchStudentData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/get_student_by_email?email=${email}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch student data: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        console.log("Student data:", data); // Log the response to inspect its structure
        
        if (data && data.student) {
          setStudentData(data.student);
        } else {
          setStudentData(data);  // Fallback logic if no "student" key
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching student data:", error);
        setError(`Failed to fetch student data: ${error.message}`);
        setLoading(false);
      }
    };

    fetchStudentData();
  }, []);

  // Fetch feedback data
  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const email = sessionStorage.getItem('email');
        if (!email) {
          console.error('No email found in local storage');
          setFeedbackError("Email not found in local storage");
          return;
        }

        const response = await fetch(`http://localhost:5000/feedback_fetch?email=${email}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch feedback: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Feedback data:", data); // Log the feedback data

        if (!Array.isArray(data)) {
          console.warn("Feedback data is not an array:", data);
          if (data && data.message) {
            setRecruiterFeedbacks([]);
            setStaffFeedbacks([]);
            return;
          }
          throw new Error("Invalid feedback data format");
        }

        const recruiterFeedbacks = data.filter(feedback => feedback.company && feedback.role);
        const staffFeedbacks = data.filter(feedback => !feedback.company && !feedback.role);
        setRecruiterFeedbacks(recruiterFeedbacks);
        setStaffFeedbacks(staffFeedbacks);
      } catch (error) {
        console.error('Error fetching feedbacks:', error);
        // setFeedbackError(`Failed to fetch feedback data: ${error.message}`);
      }
    };

    fetchFeedbacks();
  }, []);

  if (error) {
    return (
      <div className="error-container">
        <h2>Error Loading Student Data</h2>
        <p>{error}</p>
        <p>Please check your database connection and try again.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading-container">
        <h2>Loading student data...</h2>
        <p>Please wait while we fetch your information.</p>
      </div>
    );
  }

  return (
    <div className='containers'>
      <Sidebar />
      <div className="student-board">
        <h1>Welcome back 👋🏻</h1>
        <div className="container">
          <div className="subcontainer">
            <h2>Profile</h2>
            <div className="student-info">
              <div>
                <img src="/bg.jpeg" alt="Student Pic" className="student-pic" />
              </div>
              <div className="student-details-personal">
                <h4>{studentData.name}</h4>
                <p>{studentData.roll_number || studentData.rollno}</p>
                <p>{studentData.email}</p>
              </div>
            </div>

            <div className="additional-details">
              <div className="batch">
                <h4>Batch</h4>
                <p>{studentData.batch}</p>
              </div>
              <div className="year">
                <h4>Year</h4>
                <p>{studentData.year}</p>
              </div>
              <div className="depart">
                <h4>Department</h4>
                <p>{studentData.department}</p>
              </div>
            </div>
          </div>

          <div className="subcontainer">
            <AttendanceChart studentData={studentData} />
          </div>

          <div className="subcontainer">
            <Placementcount studentData={studentData} />
          </div>
        </div>

        <div className="second-container">
          <div className="box">
            <h4>CGPA</h4>
            <p>{studentData.cgpa}</p>
          </div>
          <div className="box">
            <h4>Arrear</h4>
            <p>{studentData.arrear}</p>
          </div>
          <div className="box">
            <h4>Placement FA %</h4>
            <p> {
              studentData.placement_fa !== undefined 
                ? studentData.placement_fa 
                : (studentData.placement && studentData.placement[0] 
                  ? studentData.placement[0].fa 
                  : "N/A")
            }</p>
          </div>
          <div className="box">
            <h4>Full Stack Point</h4>
            <p> {
              studentData.fullstackpoint !== undefined 
                ? `${studentData.fullstackpoint} (Rank ${studentData.rank || "N/A"})` 
                : (studentData.placement && studentData.placement[0] 
                  ? `${studentData.placement[0].fullstackpoint} (Rank ${studentData.placement[0].rank || "N/A"})` 
                  : "N/A")
            }</p>
          </div>
        </div>

        <div className="third-container">
          <h3>Feedbacks Received</h3>
          
          <div className="feedback-section">
            <h4>Overall Feedback</h4>
            {feedbackError ? (
              <div className="feedback-error">
                <p>Unable to load feedback: {feedbackError}</p>
                <p>Please check your database connection and try again.</p>
              </div>
            ) : (
              <div className="feedback-list">
                {recruiterFeedbacks.length === 0 ? (
                  <p>No recruiter feedback available</p>
                ) : (
                  recruiterFeedbacks.map((feedback, index) => (
                    <div key={index} className="feedback-item">
                      <p>{feedback.feedback}</p>
                      <p><span>{feedback.company} - {feedback.role}</span></p> 
                    </div>
                  ))
                )}
                {/* {staffFeedbacks.length === 0 ? (
                  <p>No staff feedback available</p>
                ) : (
                  staffFeedbacks.map((feedback, index) => (
                    <div key={index} className="feedback-item">
                      <p>{feedback.feedback}</p>
                      <p><span>Placement Faculty</span></p>
                    </div>
                  ))
                )} */}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Student;
