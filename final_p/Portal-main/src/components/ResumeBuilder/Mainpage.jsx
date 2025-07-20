import React from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../Student/Sidebar';

function Mainpage() {
  return (
    <div className='containers' style={{ display: 'flex' }}>
      <Sidebar />
      <div className="content-main" style={{ padding: '20px', flexGrow: 1 }}>
        <h1 style={{ color: '#2c3e50', marginBottom: '10px' }}>Resume Builder</h1>
        <p className="description" style={{ marginBottom: '20px', color: '#555' }}>
          Choose a template to select/customize your resume
        </p>

        <div className="template-container-res" style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
          <Link to="/template1" style={linkStyle}>
            <div style={templateStyle}>
              <img src="t1.png" alt="Template 1" style={imageStyle} />
              <p style={captionStyle}>Template 1</p>
            </div>
          </Link>

          <Link to="/template2" style={linkStyle}>
            <div style={templateStyle}>
              <img src="t2.png" alt="Template 2" style={imageStyle} />
              <p style={captionStyle}>Template 2</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

// CSS-in-JS style objects
const linkStyle = {
  textDecoration: 'none',
  color: 'inherit',
};

const templateStyle = {
  textAlign: 'center',
  padding: '15px',
  borderRadius: '10px',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  border: '1px solid #ccc',
  width: '250px',
  backgroundColor: '#fff',
  boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
};

const imageStyle = {
  width: '100%',
  height: 'auto',
  borderRadius: '8px',
};

const captionStyle = {
  marginTop: '10px',
  fontWeight: 'bold',
  color: '#333',
};

// Export component
export default Mainpage;
