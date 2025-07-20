import React, { useState } from "react";
import "./ResumeBuilder.css";
import { FaGithub, FaLinkedin, FaPhoneAlt } from "react-icons/fa";
import { MdEmail, MdLocationOn } from "react-icons/md";
import { TbBrandLeetcode } from "react-icons/tb";
import html2pdf from 'html2pdf.js';
import { useNavigate } from 'react-router-dom';


const TempleateNew = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("SHONA S");
  const [contact, setContact] = useState("+91 9894931446");
  const [email, setEmail] = useState("shona.ad21@bitsathy.ac.in");
  const [address, setAddress] = useState("Namakkal, TamilNadu");
  const [branch, setbranch] = useState("B.Tech Artificial intelligence & Data Science");
  const [github, setGithub] = useState("example.co");
  const [linkedin, setLinkedin] = useState("example.co");
  const [leetcode, setleetcode] = useState("example.co");
  const [summary, setSummary] = useState("Kurukshetra is an international techno-management fest that holds UNESCO patronage. The battle here is more interesting because it involves brains instead of swords. Its Cyclotron logo symbolizes the celebration of the indomitable spirit of engineering and innovation.");
  const [events, setEvents] = useState("");
  const [education, setEducation] = useState([{ title: "Bannari Amman Institute of Technology", description: "B.Tech Artificial Intelligence and Data Science CGPA - 8.74", startDate: "2022-11-04", endDate: "2024-11-04" }]);
  const [projectList, setProjectList] = useState([{ title: "Handwritten Text Recognition App for old Documents", description: "Build a Handwritten Text Recognition System using TensorFlow.Developed a distinct decoder model to extract the text. Developed a user interface Web app with user friendly functionalities" }]);
  const [achievementList, setAchievementList] = useState([{ title: "Winner - INFOCRUISE'22", description: "Kongu Engineering College, Erode   - APRIL 2022" }]);
  const [internshipList, setInternshipList] = useState([{ title: "HyperVerge ", description: "Worked as an Integration Engineer Intern,  managing 20+ client accounts and delivering KYC solutions. Provided technical support and resolved integration-related queries, ensuring seamless implementation and client satisfaction ", startDate: "2023/08/07", endDate: "2023/09/07" }]);
  const [volunteerList, setVolunteerList] = useState([{ title: "Machine Learning Workshop Coordinator ", description: " Conducted extensive machine learning workshops for 400+ students, delivering in-depth instruction on diverse ML basics and techniques." }]);
  const [coCurricularList, setCoCurricularList] = useState([{ title: "Product :  Development of Person Identification Using Deepface ", description: "AI Product Development Lab           |   MAY 2023" }]);



  const handleAddEducation = () => setEducation([...education, { title: "", description: "", startDate: "", endDate: "" }]);
  const handleDelete = (index, setEducation, education) => {
    if (education.length === 1) {
      const confirmDelete = window.confirm("Are you sure you want to delete the last Education?");
      if (!confirmDelete) return;
    }
    const updatedEducation = education.filter((item, idx) => idx !== index); // Remove item by index
    setEducation(updatedEducation); 
  };


  // Handle adding a project
  const handleAddProject = () => setProjectList([...projectList, { title: "", description: "" }]);
  const handleDeleteProject = (index) => {
    if (projectList.length === 1) {
      // Show confirmation if it's the last project
      const confirmDelete = window.confirm("Are you sure you want to delete the last Project?");
      if (!confirmDelete) return;
    }
    const updatedProjects = projectList.filter((_, i) => i !== index);
    setProjectList(updatedProjects);
  };


  // Handle adding an achievement
  const handleAddAchievement = () => setAchievementList([...achievementList, { title: "", description: "" }]);
  const handleDeleteAchievement = (index) => {
    if (achievementList.length === 1) {
      // Show confirmation if it's the last project
      const confirmDelete = window.confirm("Are you sure you want to delete the last Achievement?");
      if (!confirmDelete) return;
    }
    const updatedAchievements = achievementList.filter((_, i) => i !== index);
    setAchievementList(updatedAchievements);
  };



  // Handle adding an internship
  const handleAddInternship = () => setInternshipList([...internshipList, { title: "", description: "", startDate: "", endDate: "" }]);
  const handleDeleteInternship = (index) => {
    if (internshipList.length === 1) {
      // Show confirmation if it's the last project
      const confirmDelete = window.confirm("Are you sure you want to delete the last Internship?");
      if (!confirmDelete) return;
    }
    const updatedInternships = internshipList.filter((_, i) => i !== index);
    setInternshipList(updatedInternships);
  };


  // Handle adding a volunteer activity
  const handleAddVolunteer = () => setVolunteerList([...volunteerList, { title: "", description: "" }]);
  const handleDeleteVolunteer = (index) => {
    if (volunteerList.length === 1) {
      // Show confirmation if it's the last project
      const confirmDelete = window.confirm("Are you sure you want to delete the last Volunteer list?");
      if (!confirmDelete) return;
    }
    const updatedVolunteer = volunteerList.filter((_, i) => i !== index);
    setVolunteerList(updatedVolunteer);
  };


  // Handle adding a co-curricular activity
  const handleAddCoCurricular = () => setCoCurricularList([...coCurricularList, { title: "", description: "" }]);
  const handleDeleteCoCurricular = (index) => {
    if (coCurricularList.length === 1) {
      // Show confirmation if it's the last project
      const confirmDelete = window.confirm("Are you sure you want to delete the last CoCurricular list?");
      if (!confirmDelete) return;
    }
    const updatedCoCurricular = coCurricularList.filter((_, i) => i !== index);
    setCoCurricularList(updatedCoCurricular);
  };

  const [skills, setSkills] = useState("");
  const [interest, setInterest] = useState("");
  const [certification, setCertification] = useState("");
  const [tools, setTools] = useState("");
  const [hobbies, setHobbies] = useState("");

  // Lists for the added items

  const [skillList, setSkillList] = useState(["C++", "Python", "React", "Javascript", "MongoDB"]);
  const [interestList, setInterestList] = useState(["Web Designing", "Crafting", "Binge watching"]);
  const [eventList, setEventList] = useState(["Participated in BITHACKS 2023, presented our Handwritten Text Recognition Application Organized by BIT College", "Participated in BITHACKS 2023, presented our Handwritten Text Recognition Application Organized by BIT College"]);
  const [certificationList, setCertificationList] = useState(["Fundamentals of Deep Learning for Computer Vision , NVIDIA",]);
  const [toolsList, setToolsList] = useState(["VS Code", "Figma", "Postman", "MongoDB Compass"]);
  const [hobbiesList, setHobbiesList] = useState(["Journaling", "Developing Websites", "Binge Watching"]);


  //Add items bulletpts
  const handleAddItem = (item, setter, listSetter) => {
    if (item.trim() !== "") {
      listSetter((prevList) => [...prevList, item]); // Add item to list
      setter(""); // Clear input field
    }
  };


  //Delete items bulletpts
  const handleDeleteItem = (index, listSetter) => {
    listSetter((prevList) => prevList.filter((_, i) => i !== index));
  };

  // Function to format date as a word
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };



  // Download PDF
  const downloadPDF = () => {
    const resume = document.getElementById("resume-preview");

    const options = {
      filename: "resume.pdf",
      image: { type: "png", quality: 1 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] } // Prevents content from breaking awkwardly
    };

    html2pdf().from(resume).set(options).save();
  };
  const clearResume = () => {
  if (window.confirm("Are you sure you want to clear your resume data?")) {
    localStorage.removeItem("resumeData");  // if you store anything in localStorage
    window.location.reload();               // refreshes the page
  }
};

  return (
    <div className="whole-container">
      <button className="back-arrow-button" onClick={() => navigate(-1)}>   ᐸ <span>Back</span></button>

      <h1 className="main-top-heading">Resume Builder</h1>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
  <button onClick={clearResume} className="delete-button">Clear Resume</button>
</div>

      {/* <Listcustom/> */}
      <div className="container-side-pages">
        <div className="form-section">
          <div className="heading">
            <br />
            <label className="input-label">Personal Details</label>
            <div className="input-group-detail">

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field-name"
                placeholder="Name"
              />
              <input
                type="text"
                value={branch}
                onChange={(e) => setbranch(e.target.value)}
                className="input-field"
                placeholder="Branch"
              />
            </div>

            <div className="input-group-detail">
              <div className="nextone">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="Email"
                />
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="input-field"
                  placeholder="Contact Number"
                />

                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="input-field"
                  placeholder="Address"
                />
              </div>
              <div className="link-section">
                <input
                  type="url"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  className="input-field"
                  placeholder="Github Link"
                />

                <input
                  type="url"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  className="input-field"
                  placeholder="Linkedin Link"
                />
                <input
                  type="url"
                  value={leetcode}
                  onChange={(e) => setleetcode(e.target.value)}
                  className="input-field"
                  placeholder="Leetcode Link"
                />
              </div>
            </div>
          </div>
          <br />

          <div className="input-group">
            <label className="input-label">Career Objective</label>
            <textarea
              type="text"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="input-field"
            />
          </div>
          <div className="input-group">
            <label className="input-label">Education</label>

            {education.map((edu, index) => (
              <div key={index}>
                <input
                  type="text"
                  value={edu.title}
                  onChange={(e) => {
                    const updatedEducation = [...education];
                    updatedEducation[index].title = e.target.value;
                    setEducation(updatedEducation);
                  }}
                  className="input-field"
                  placeholder="College"
                />
                <input
                  type="text"
                  value={edu.description}
                  onChange={(e) => {
                    const updatedEducation = [...education];
                    updatedEducation[index].description = e.target.value;
                    setEducation(updatedEducation);
                  }}
                  className="input-field"
                  placeholder="Grade"
                />
                <div className="date-section">
                  <input
                    type="date"
                    value={edu.startDate}
                    onChange={(e) => {
                      const updatedEducation = [...education];
                      updatedEducation[index].startDate = e.target.value;
                      setEducation(updatedEducation);
                    }}
                    className="input-field"
                  />
                  <input
                    type="date"
                    value={edu.endDate}
                    onChange={(e) => {
                      const updatedEducation = [...education];
                      updatedEducation[index].endDate = e.target.value;
                      setEducation(updatedEducation);
                    }}
                    className="input-field"
                  />
                </div>

                <div className="buttons-under-colmns">
                  <button onClick={handleAddEducation}>Add </button>
                  <button onClick={() => handleDelete(index, setEducation, education)} className="delete-button">Delete</button>
                </div>

              </div>
            ))}

          </div>

          <div className="input-group-add">
            <label className="input-label">Skills</label>

            <div className="side-add-btn">

              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                className="input-field"
                placeholder="Add skills"
              />
              <button onClick={() => handleAddItem(skills, setSkills, setSkillList)}>
                Add
              </button>
            </div>
            <ul>
              {skillList.map((skill, index) => (
                <li key={index}>{skill}{" "}
                  <button onClick={() => handleDeleteItem(index, setSkillList)} className="delete-button">Delete</button>
                </li>
              ))}
            </ul>


            <label className="input-label">Area of Interest</label>
            <div className="side-add-btn">
              <input
                type="text"
                value={interest}
                onChange={(e) => setInterest(e.target.value)}
                className="input-field"
                placeholder="Add values"
              />
              <button onClick={() => handleAddItem(interest, setInterest, setInterestList)}>
                Add
              </button>
            </div>
            <ul>
              {interestList.map((interest, index) => (
                <li key={index}>{interest}{" "}
                  <button onClick={() => handleDeleteItem(index, setInterestList)} className="delete-button">Delete</button>

                </li>
              ))}
            </ul>
          </div>

          {/* Projects Section */}
          <div className="input-group">
            <label className="input-label">Projects</label>
            {projectList.map((project, index) => (
              <div key={index}>
                <input
                  type="text"
                  value={project.title}
                  onChange={(e) => {
                    const updatedProjects = [...projectList];
                    updatedProjects[index].title = e.target.value;
                    setProjectList(updatedProjects);
                  }}
                  className="input-field"
                  placeholder="Project Title"
                />
                <input
                  type="text"
                  value={project.description}
                  onChange={(e) => {
                    const updatedProjects = [...projectList];
                    updatedProjects[index].description = e.target.value;
                    setProjectList(updatedProjects);
                  }}
                  className="input-field"
                  placeholder="Project Description"
                />
                <div className="buttons-under-colmns">
                  <button onClick={handleAddProject}>Add </button>
                  <button onClick={() => handleDeleteProject(index)} className="delete-button">Delete</button>

                </div>
              </div>
            ))}
          </div>


          {/* Achievements Section */}
          <div className="input-group">
            <label className="input-label">Achievements</label>
            {achievementList.map((achievement, index) => (
              <div key={index}>
                <input
                  type="text"
                  value={achievement.title}
                  onChange={(e) => {
                    const updatedAchievements = [...achievementList];
                    updatedAchievements[index].title = e.target.value;
                    setAchievementList(updatedAchievements);
                  }}
                  className="input-field"
                  placeholder="Achievement Title"
                />
                <input
                  type="text"
                  value={achievement.description}
                  onChange={(e) => {
                    const updatedAchievements = [...achievementList];
                    updatedAchievements[index].description = e.target.value;
                    setAchievementList(updatedAchievements);
                  }}
                  className="input-field"
                  placeholder="Achievement Description"
                />

                <div className="buttons-under-colmns">
                  <button onClick={handleAddAchievement}>Add </button>
                  <button onClick={() => handleDeleteAchievement(index)} className="delete-button">Delete</button>
                </div>

              </div>
            ))}
          </div>

          {/* Internships Section */}
          <div className="input-group">
            <label className="input-label">Internships</label>
            {internshipList.map((internship, index) => (
              <div key={index}>
                <input
                  type="text"
                  value={internship.title}
                  onChange={(e) => {
                    const updatedInternships = [...internshipList];
                    updatedInternships[index].title = e.target.value;
                    setInternshipList(updatedInternships);
                  }}
                  className="input-field"
                  placeholder="Internship Title"
                />
                <input
                  type="text"
                  value={internship.description}
                  onChange={(e) => {
                    const updatedInternships = [...internshipList];
                    updatedInternships[index].description = e.target.value;
                    setInternshipList(updatedInternships);
                  }}
                  className="input-field"
                  placeholder="Internship Description"
                />
                <div className="date-section">
                  <input
                    type="date"
                    value={internship.startDate}
                    onChange={(e) => {
                      const updatedInternships = [...internshipList];
                      updatedInternships[index].startDate = e.target.value;
                      setInternshipList(updatedInternships);
                    }}
                    className="input-field"
                  />
                  <input
                    type="date"
                    value={internship.endDate}
                    onChange={(e) => {
                      const updatedInternships = [...internshipList];
                      updatedInternships[index].endDate = e.target.value;
                      setInternshipList(updatedInternships);
                    }}
                    className="input-field"
                  />
                </div>
                <div className="buttons-under-colmns">
                  <button onClick={handleAddInternship}>Add </button>

                  <button onClick={() => handleDeleteInternship(index)} className="delete-button">Delete</button>

                </div>
              </div>
            ))}
          </div>
          <div className="input-group-add">
            <label className="input-label">Event Participation</label>
            <div className="side-add-btn">

              <input
                type="text"
                value={events}
                onChange={(e) => setEvents(e.target.value)}
                className="input-field"
                placeholder="Event Participation"
              />
              <button onClick={() => handleAddItem(events, setEvents, setEventList)}>
                Add
              </button>
            </div>
            <ul>
              {eventList.map((events, index) => (
                <li key={index}>{events}{" "}
                  <button onClick={() => handleDeleteItem(index, setEventList)} className="delete-button">Delete</button>
                </li>
              ))}
            </ul>

          </div>
          {/* Volunteer Activities Section */}
          <div className="input-group">
            <label className="input-label">Volunteer Activities</label>
            {volunteerList.map((volunteer, index) => (
              <div key={index}>
                <input
                  type="text"
                  value={volunteer.title}
                  onChange={(e) => {
                    const updatedVolunteer = [...volunteerList];
                    updatedVolunteer[index].title = e.target.value;
                    setVolunteerList(updatedVolunteer);
                  }}
                  className="input-field"
                  placeholder="Volunteer Title"
                />
                <input
                  type="text"
                  value={volunteer.description}
                  onChange={(e) => {
                    const updatedVolunteer = [...volunteerList];
                    updatedVolunteer[index].description = e.target.value;
                    setVolunteerList(updatedVolunteer);
                  }}
                  className="input-field"
                  placeholder="Volunteer Description"
                />

                <div className="buttons-under-colmns">
                  <button onClick={handleAddVolunteer}>Add </button>
                  <button onClick={() => handleDeleteVolunteer(index)} className="delete-button">Delete</button>
                </div>

              </div>
            ))}
          </div>


          {/* Co-Curricular Activities Section */}
          <div className="input-group">
            <label className="input-label">Co-Curricular Activities</label>
            {coCurricularList.map((coCurricular, index) => (
              <div key={index}>
                <input
                  type="text"
                  value={coCurricular.title}
                  onChange={(e) => {
                    const updatedCoCurricular = [...coCurricularList];
                    updatedCoCurricular[index].title = e.target.value;
                    setCoCurricularList(updatedCoCurricular);
                  }}
                  className="input-field"
                  placeholder="Co-Curricular Title"
                />
                <input
                  type="text"
                  value={coCurricular.description}
                  onChange={(e) => {
                    const updatedCoCurricular = [...coCurricularList];
                    updatedCoCurricular[index].description = e.target.value;
                    setCoCurricularList(updatedCoCurricular);
                  }}
                  className="input-field"
                  placeholder="Co-Curricular Description"
                />

                <div className="buttons-under-colmns">
                  <button onClick={handleAddCoCurricular}>Add </button>
                  <button onClick={() => handleDeleteCoCurricular(index)} className="delete-button">Delete</button>
                </div>

              </div>
            ))}
          </div>

          <div className="input-group-add">
            <label className="input-label">Certifications</label>
            <div className="side-add-btn">
              <input
                type="text"
                value={certification}
                onChange={(e) => setCertification(e.target.value)}
                className="input-field"
                placeholder="Certificate"
              />
              <button onClick={() => handleAddItem(certification, setCertification, setCertificationList)}>
                Add
              </button>
            </div>
            <ul>
              {certificationList.map((cert, index) => (
                <li key={index}>{cert} {" "}
                  <button onClick={() => handleDeleteItem(index, setCertificationList)} className="delete-button">Delete</button>
                </li>
              ))}
            </ul>
          </div>

          <div className="input-group-add">
            <label className="input-label">Tools</label>
            <div className="side-add-btn">
              <input
                type="text"
                value={tools}
                onChange={(e) => setTools(e.target.value)}
                className="input-field"
                placeholder="Tools Used"
              />
              <button onClick={() => handleAddItem(tools, setTools, setToolsList)}>
                Add
              </button>
            </div>
            <ul>
              {toolsList.map((tool, index) => (
                <li key={index}>{tool}{" "}
                  <button onClick={() => handleDeleteItem(index, setToolsList)} className="delete-button">Delete</button>

                </li>
              ))}
            </ul>
          </div>

          <div className="input-group-add">
            <label className="input-label">Hobbies</label>
            <div className="side-add-btn">
              <input
                type="text"
                value={hobbies}
                onChange={(e) => setHobbies(e.target.value)}
                className="input-field"
                placeholder="Hobbies"
              />
              <button onClick={() => handleAddItem(hobbies, setHobbies, setHobbiesList)}>
                Add
              </button>
            </div>
            <ul>
              {hobbiesList.map((hobby, index) => (
                <li key={index}>{hobby}{" "}
                  <button onClick={() => handleDeleteItem(index, setHobbiesList)} className="delete-button">Delete</button>
                </li>
              ))}
            </ul>
          </div>

          <button onClick={downloadPDF} className="download-button">
            Download PDF
          </button>
        </div>

        <div className="resume-preview" id="resume-preview">
          <div className="heading-preview1">
            <h1 className="resume-name-newone">{name}</h1>
            <p className="resume-name-branch">{branch}</p>

            <p className="resume-contact1">
              <MdEmail className="contact-icon" />{email}
              <FaPhoneAlt className="contact-icon" />{contact}
              <MdLocationOn className="contact-icon" />{address}
              <FaGithub className="contact-icon" /><a href={github} className="resume-link1">GitHub</a>
              <FaLinkedin className="contact-icon" /><a href={linkedin} className="resume-link1"> LinkedIn</a>
              <TbBrandLeetcode className="contact-icon" /><a href={leetcode} className="resume-link1"> Leetcode</a>

            </p>
          </div>

          <div className="section-grid-template">
            <div>
              <h3 className="section-title-new underline ">CAREER OBJECTIVE</h3>
              <p>{summary}</p>

              <h3 className="section-title-new underline">Education</h3>
              {education.map((edu, index) => (
                <div key={index}>
                  <h4 className="sideheading-title">{edu.title}</h4>
                  <p>{edu.description} : From {formatDate(edu.startDate)} to {formatDate(edu.endDate)}</p>

                </div>
              ))}

              <h3 className="section-title-new underline">Skills</h3>
              <p><strong>Tech Skills: </strong>{skillList.join(", ")}</p>
              <p><strong>Area of Interest: </strong>{interestList.join(", ")}</p>
              <p><strong>Tools: </strong>{toolsList.join(", ")}</p>
              <p><strong>Hobbies: </strong>{hobbiesList.join(", ")}</p>

              <h3 className="section-title-new underline">Event Participation</h3>
              <ul>
                {eventList.map((events, index) => (
                  <li key={index}>{events}</li>
                ))}
              </ul>

            </div>

            <div>
              <h3 className="section-title-new underline">Projects</h3>
              {projectList.map((project, index) => (
                <div key={index}>
                  <h4 className="sideheading-title">{project.title}</h4>
                  <p>{project.description}</p>
                </div>
              ))}

              <h3 className="section-title-new underline">Achievements</h3>
              {achievementList.map((achievement, index) => (
                <div key={index}>
                  <h4 className="sideheading-title">{achievement.title}</h4>
                  <p>{achievement.description}</p>
                </div>
              ))}

              <h3 className="section-title-new underline">Internship</h3>
              {internshipList.map((internship, index) => (
                <div key={index}>
                  <h4 className="sideheading-title">{internship.title}</h4>
                  <p>{internship.description}</p>
                  <p>- From {formatDate(internship.startDate)} to {formatDate(internship.endDate)}</p>
                </div>
              ))}
            </div>

            <hr className="divider" />

            <div>
              <h3 className="section-title-new underline">Volunteer Activity</h3>
              {volunteerList.map((volunteer, index) => (
                <div key={index}>
                  <h4 className="sideheading-title">{volunteer.title}</h4>
                  <p>{volunteer.description}</p>
                </div>
              ))}

              <h3 className="section-title-new underline">Co-Curricular Activities</h3>
              {coCurricularList.map((coCurricular, index) => (
                <div key={index}>
                  <p>{coCurricular.description}</p>
                </div>
              ))}
            </div>

            <div>
              <h3 className="section-title-new underline">Certifications</h3>
              <ul>
                {certificationList.map((cert, index) => (
                  <li key={index}>{cert}</li>
                ))}
              </ul>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default TempleateNew;
