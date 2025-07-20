import express from 'express';
import cors from 'cors';
import multer from 'multer';

const app = express();
const port = 3000;

app.use(express.json()); 
app.use(cors()); 


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Unique filename
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed.'));
    }
    cb(null, true);
  }
});




app.post('/applyJob', upload.single('resume'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  const { jobTitle, jobName } = req.body;
  const resume = req.file; // This is where the file is being saved by multer

  // Process the data (save to database, etc.)
  return res.json({ message: 'Application submitted successfully!' });
});







//The jobs posted by Recruiter
let jobPosts = []; 
app.post('/jobpost', (req, res) => {
  const jobData = req.body;

  jobData.id = Date.now(); // Unique ID 
  jobPosts.push(jobData);
  console.log("Jobdata : ",jobData)
  res.json({ jobData });
});



// Get/Display the jobs posted by recruiter
app.get('/getjobs', (req, res) => {
  console.log('GET /getjobs route hit');
  res.status(200).json(jobPosts); // Send the array as JSON
});


//The posted jobs rejected by Staff
app.post('/deletedjobs', (req, res) => {
  const job = req.body;
  DeletedJobModel.create(job)
    .then(() => res.status(201).send('Job stored in deleted jobs DB'))
    .catch((error) => {
      console.error('Error storing job in deleted jobs DB:', error);
      res.status(500).send('Failed to store job in deleted jobs DB');
    });
});


//Account created for individuals
let userdata = [];
app.post('/createAccount', (req, res) => {
  const Data = req.body;
  userdata.push(Data); 
  console.log(userdata);

  res.status(201).json({
    message: 'Account created successfully',
    Data,
  });
});




app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
