import express from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import url from 'url';
import axios from 'axios';

const app = express();
const port = 3000;

// Enable CORS
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Upload folder setup
const uploadsDir = './uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const FLASK_API = 'http://localhost:5000'; // Replace with Flask backend base URL

// ---------------- Apply Job ----------------
app.post('/applyJob', upload.single('resume'), async (req, res) => {
  try {
    const formData = new FormData();
    for (const [key, value] of Object.entries(req.body)) {
      formData.append(key, value);
    }
    formData.append('resume', fs.createReadStream(req.file.path));

    const response = await axios.post(`${FLASK_API}/submitJob`, formData, {
      headers: formData.getHeaders(),
    });

    res.status(200).json(response.data);
  } catch (err) {
    console.error('Error submitting job:', err.message);
    res.status(500).json({ error: 'Job application failed' });
  }
});

// ---------------- Get All Applications ----------------
app.get('/getStudentApplications', async (req, res) => {
  try {
    const response = await axios.get(`${FLASK_API}/getApplications`);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// ---------------- Post New Job ----------------
app.post('/jobpost', async (req, res) => {
  try {
    const response = await axios.post(`${FLASK_API}/createJob`, req.body);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to post job' });
  }
});

// ---------------- Get All Jobs ----------------
app.get('/getjobs', async (req, res) => {
  try {
    const response = await axios.get(`${FLASK_API}/getAllJobs`);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// ---------------- Create Account ----------------
app.post('/createAccount', async (req, res) => {
  try {
    const response = await axios.post(`${FLASK_API}/register`, req.body);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create account' });
  }
});

// ---------------- Update Job ----------------
app.put('/update-job/:job_id', async (req, res) => {
  try {
    const response = await axios.put(`${FLASK_API}/updateJob/${req.params.job_id}`, req.body);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update job' });
  }
});

// ---------------- Delete Job ----------------
app.delete('/delete-job/:job_id', async (req, res) => {
  try {
    const response = await axios.delete(`${FLASK_API}/deleteJob/${req.params.job_id}`);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete job' });
  }
});

// ---------------- Submit Feedback ----------------
app.post('/feedbackSubmit', async (req, res) => {
  try {
    const response = await axios.post(`${FLASK_API}/submitFeedback`, req.body);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

// ---------------- Approve Application ----------------
app.post('/approveApplication', async (req, res) => {
  try {
    const response = await axios.post(`${FLASK_API}/approveApplication`, req.body);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Approval failed' });
  }
});

// ---------------- Start Server ----------------
app.listen(port, () => {
  console.log(`Frontend server running at http://localhost:${port}`);
});
