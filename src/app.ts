import { courses, icons, majors, nav } from "./data";
import {
  CourseDetail,
  getActiveKeyFromPath,
  hasSavedLinksData,
  loadActiveKey,
  loadCoursesState,
  loadLinksState,
  loadTaState,
  loadPersonalState,
  loadResearchState,
  loadMajorState,
  normalizeMajorOnLeave,
  saveActiveKey,
  saveCoursesState,
  saveLinksState,
  saveResearchState,
  saveTaState,
  savePersonalState,
  saveMajorState,
  state,
  updatePathForKey
} from "./state";
import {
  loadSupabaseState,
  persistCoursesState,
  persistLinksState,
  persistMajorState,
  persistPersonalState,
  persistProjectApplications,
  persistTaState,
  logPageView,
  logProjectClick
} from "./supabase";

let lastPageViewKey = "";

const toExternalUrl = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return "#";
  }
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
};

const renderNav = (activeKey: string) =>
  nav
    .map(
      (group, index) => `
        <div class="nav-group" data-index="${index}">
          <button class="nav-title" type="button">${group.title}</button>
          <ul class="nav-list">
            ${group.items
              .map((item) => {
                const isActive =
                  item.key === activeKey ||
                  (activeKey === "research-project-detail" && item.key === "research-projects");
                return `
                  <li class="nav-item ${isActive ? "is-active" : ""}" data-key="${item.key}">
                    <span class="nav-icon">${icons[item.icon]}</span>
                    <span class="nav-text">${item.label.replace("\n", "<br />")}</span>
                  </li>
                `;
              })
              .join("")}
          </ul>
        </div>
      `
    )
    .join("");

const renderMajorContent = () => {
  const effectiveSavedKey = state.lastSavedKey || state.majorSelected;
  const effectiveSavedOther = state.lastSavedOtherText || state.majorOtherText;
  const hasSelection = Boolean(effectiveSavedKey && effectiveSavedKey.trim());
  const selectedMajorLabel =
    effectiveSavedKey === "Other (please specify)" && effectiveSavedOther.trim()
      ? effectiveSavedOther.trim()
      : effectiveSavedKey;

  if (state.majorSaved && hasSelection && !state.majorEditing) {
    return `
      <section class="major-card">
        <h2>User Academic Major</h2>
        <p>Selected Georgia Tech Master's degree major:
          <span class="major-pill ${selectedMajorLabel.trim().split(/\s+/).length >= 3 ? "is-long" : ""}">
            ${selectedMajorLabel}
          </span>
        </p>
        <button class="major-edit" type="button">Edit Major</button>
      </section>
    `;
  }

  return `
    <section class="major-card">
      <h2>User Academic Major</h2>
      <p>Select your Georgia Tech Master's degree major:</p>
      <div class="major-options">
        ${majors
          .map(
            (major) => `
              <button class="major-option ${major === state.majorSelected ? "is-selected" : ""}" type="button" data-major="${major}">
                ${major}
              </button>
            `
          )
          .join("")}
      </div>
      ${
        state.majorSelected === "Other (please specify)"
          ? `
            <div class="major-other">
              <label>Major</label>
              <input type="text" placeholder="e.g. basket weaving" value="${state.majorOtherText}" />
            </div>
            ${state.majorError ? `<p class="major-error">This field is required when "Other" is selected.</p>` : ""}
          `
          : ""
      }
      <button class="major-save" type="button">Save</button>
    </section>
  `;
};

const renderCoursesContent = () => {
  if (state.coursesNone && state.coursesTab === "details") {
    state.coursesTab = "selection";
  }

  const selectedCourses = courses.filter((course) => state.coursesSelected.has(course));

  return `
      <section class="courses-card">
        <h2>Courses you've registered for or completed</h2>
        <div class="courses-tabs">
          <button class="courses-tab ${state.coursesTab === "selection" ? "is-active" : ""}" type="button" data-tab="selection">Selection</button>
          <button class="courses-tab ${state.coursesTab === "details" ? "is-active" : ""} ${state.coursesNone ? "is-disabled" : ""}" type="button" data-tab="details" ${state.coursesNone ? "disabled" : ""}>Details</button>
        </div>
        ${
          state.coursesTab === "selection"
            ? `
              <div class="courses-panel ${state.coursesNone ? "is-disabled" : ""}">
                <label class="course-row">
                  <input type="checkbox" class="course-check course-none" ${state.coursesNone ? "checked" : ""} />
                  <span>I have not taken any of these courses.</span>
                </label>
                <div class="course-list">
                  ${courses
                    .map((course) => {
                      const checked = state.coursesSelected.has(course);
                      return `
                        <label class="course-row">
                          <input type="checkbox" class="course-check" data-course="${course}" ${checked ? "checked" : ""} ${state.coursesNone ? "disabled" : ""} />
                          <span>${course}</span>
                        </label>
                      `;
                    })
                    .join("")}
                </div>
              </div>
            `
            : `
              <div class="courses-panel">
                <div class="details-table">
                  <div class="details-head">
                    <div>Course</div>
                    <div>Year</div>
                    <div>Term</div>
                    <div>Finished?</div>
                    <div>Grade</div>
                  </div>
                  <div class="details-body">
                    ${
                      selectedCourses.length === 0
                        ? `<div class="details-empty">Select a course in the Selection tab to edit details.</div>`
                        : selectedCourses
                            .map((course) => {
                              const detail: CourseDetail = state.courseDetails[course] || {
                                year: "",
                                term: "",
                                finished: false,
                                grade: ""
                              };
                              return `
                                <div class="details-row" data-course="${course}">
                                  <div class="details-course">${course}</div>
                                  <div class="year-select ${state.openYearFor === course ? "is-open" : ""}" data-course="${course}">
                                    <button class="year-button" type="button">
                                      <span>${detail.year || "Year"}</span>
                                      <span class="year-caret"></span>
                                    </button>
                                    <div class="year-menu">
                                      ${["year", ...Array.from({ length: 13 }, (_, i) => String(2014 + i))]
                                        .map((year) => {
                                          const label = year === "year" ? "Year" : year;
                                          return `<button class="year-option ${detail.year === year ? "is-active" : ""}" data-year="${year}" type="button">${label}</button>`;
                                        })
                                        .join("")}
                                    </div>
                                  </div>
                                  <div class="details-term">
                                    <button class="term-pill ${detail.term === "spring" ? "is-spring" : ""}" data-term="spring" type="button">spring</button>
                                    <button class="term-pill ${detail.term === "summer" ? "is-summer" : ""}" data-term="summer" type="button">summer</button>
                                    <button class="term-pill ${detail.term === "fall" ? "is-fall" : ""}" data-term="fall" type="button">fall</button>
                                  </div>
                                  <div>
                                    <input type="checkbox" class="details-finished" ${detail.finished ? "checked" : ""} />
                                  </div>
                                  <div class="details-grade">
                                    ${
                                      detail.finished
                                        ? ["P", "S", "F", "U"]
                                            .map(
                                              (grade) =>
                                                `<button class="grade-pill ${detail.grade === grade ? "is-grade" : ""}" data-grade="${grade}" type="button">${grade}</button>`
                                            )
                                            .join("")
                                        : ""
                                    }
                                  </div>
                                </div>
                              `;
                            })
                            .join("")
                    }
                  </div>
                </div>
              </div>
            `
        }
      </section>
    `;
};

const renderProfileAbout = () => `
  <section class="about-card">
    <h2>About Me</h2>
    <p>You can click on the sections below to provide:</p>
    <ul>
      <li>Basic personal information</li>
      <li>Links to your websites and projects</li>
      <li>A list of OMS courses you have taken or are currently taking (including semesters taken and grades received)</li>
      <li>Your M.S. major</li>
    </ul>
    <p>
      Fields marked with an asterisk (*) are required. Some unmarked fields may also be required
      for TA or research project applications. You will not be able to submit those applications
      unless the relevant profile information is completed.
    </p>
  </section>
`;

const renderResearchAbout = () => `
  <section class="research-card">
    <h2>About Research Projects</h2>
    <p>
      Each research project listed here on BuzzMe is intended to be offered as a course section for
      CS 8903 - Special Problems. The course section will be hosted for 3 credits and the faculty
      instructor will be the Instructor listed under the project unless otherwise specified.
      CS8903 is intended to represent approximately 150 hours of work, the same as other 3-credit
      hour classes. The nature of the work will depend on the project so please read the individual
      project descriptions carefully. 8903s are letter graded and contribute towards your GPA.
      An 8903 is not considered foundational but can count toward your free elective credit.
      (It can't replace required specialization classes, but it can be one of your 4-5 free elective
      classes. It does not count as a non-CS/CSE class, so you'd still be able to take two non-CS/CSE
      classes in addition to a CS8903.) You may not count more than 3 credits of 8903 towards your degree.
    </p>
    <p>
      The information you have provided in the questions for the form and information given in the
      Profile section will be available for faculty to use to make decisions. Acceptance into an 8903
      is at the instructor's discretion - do not attempt to enroll without instructor's permission.
      Do not build your next semester plan on the assumption you will be accepted into any 8903 - You
      should have a class identified for next semester, enroll in that now, and if selected, you will
      drop that later to make room for the 8903.
    </p>
    <p>
      While we host many opportunities each semester, we strongly recommend applying only to the small
      number of projects listed here that greatly match both your interests and your background. You
      have the ability to submit and edit the forms up until 11:59:59PM EST on December 14th where a
      copy of all forms will be given to faculty to evaluate. The BuzzMe and OMSCS staff currently have
      no insight into the timetable or decision-making process of faculty selecting students for their
      8903s and thus cannot give application status information at any point. Alumni are able to apply
      to 8903s though you need to secure your non degree seeking student status (possibly by reapplying
      for admission here <a class="inline-link" href="https://registrar.gatech.edu/current-students/readmission" target="_blank" rel="noreferrer">here <i class="fa-solid fa-arrow-up-right-from-square"></i></a>)
      well in advance of the semester you wish to take the 8903s. If you already do not have NDS status,
      please have that secured before applying here.
    </p>
    <div class="research-alert">
      Spring 2026 research project applications are closed. We will open Summer 2026 applications later this term.
    </div>
  </section>
`;

const researchProjects = [
  {
    id: 1,
    instructor: "Vijay Madisetti",
    title: "AI Agents and Applications - Theory, Applications, and Testing",
    createdAt: "Dec. 5, 2025, 1:19 p.m."
  },
  {
    id: 2,
    instructor: "Brian Magerko",
    title: "LuminAI",
    createdAt: "Dec. 5, 2025, 1:19 p.m."
  },
  {
    id: 3,
    instructor: "Qirun Zhang (qrzhang@gatech.edu)",
    title: "Generative Equality Saturation for Compiler Testing",
    createdAt: "Dec. 5, 2025, 1:19 p.m."
  },
  {
    id: 4,
    instructor: "Chuhong Yuan",
    title: "Dynamic P-D Disaggregation Switching",
    createdAt: "Dec. 5, 2025, 1:19 p.m."
  },
  {
    id: 19,
    instructor: "Prof. Richard Vuduc",
    title: "AI Datacenter Flexibility and the Energy Grid",
    createdAt: "Dec. 5, 2025, 1:19 p.m."
  },
  {
    id: 5,
    instructor: "Chuhong Yuan",
    title: "Dynamic Scaling Models Between Different Precisions During Memory Spikes",
    createdAt: "Dec. 5, 2025, 1:19 p.m."
  },
  {
    id: 6,
    instructor: "Rosa I. Arriaga",
    title: "Designing for Continuity: Understanding Cross-Device UX & Adaptation",
    createdAt: "Dec. 5, 2025, 1:19 p.m."
  },
  {
    id: 7,
    instructor: "Rosa I. Arriaga",
    title: "Understanding the Collective Sense-Making on Crisis in Online Communities at Different Scales",
    createdAt: "Dec. 5, 2025, 1:19 p.m."
  },
  {
    id: 8,
    instructor: "Rosa I. Arriaga",
    title: "Beyond Notifications: Using AI to Enhance Just-in-Time Adaptive Interventions (JITAIs)",
    createdAt: "Dec. 5, 2025, 1:19 p.m."
  },
  {
    id: 9,
    instructor: "Spencer Rugaber",
    title: "Computational Astronomy",
    createdAt: "Dec. 5, 2025, 1:19 p.m."
  },
  {
    id: 20,
    instructor: "Prof. Richard Vuduc",
    title: "An Information Theoretic Performance Framework for Computation - Compilers, AI, and Emulation",
    createdAt: "Dec. 5, 2025, 1:19 p.m."
  },
  {
    id: 10,
    instructor: "Brian Magerko",
    title: "Sound Clouds / Resonant Spaces",
    createdAt: "Dec. 5, 2025, 1:19 p.m."
  },
  {
    id: 11,
    instructor: "Brian Magerko",
    title: "Neuroscience Studies of Creativity to Inform Co-creative AI Tools",
    createdAt: "Dec. 5, 2025, 1:19 p.m."
  },
  {
    id: 12,
    instructor: "Dr. Betsy DiSalvo",
    title: "Understanding Hiring Amid AI Transformation",
    createdAt: "Dec. 5, 2025, 1:19 p.m."
  },
  {
    id: 13,
    instructor: "Rosa I. Arriaga",
    title: "MoodLoop: Developing a Mobile System to Unpack the Complexity in Self-Reported Subjective Data",
    createdAt: "Dec. 5, 2025, 1:19 p.m."
  },
  {
    id: 14,
    instructor: "Rosa I. Arriaga",
    title: "Trackya: Facilitating Individuals’ Sensemaking about Sedentary Behavior via Contextualized Data",
    createdAt: "Dec. 5, 2025, 1:19 p.m."
  },
  {
    id: 15,
    instructor: "Bo Zhu",
    title: "Generative AI for Computer Graphics",
    createdAt: "Dec. 5, 2025, 1:19 p.m."
  },
  {
    id: 16,
    instructor: "Russ Clark",
    title: "Coastal Climate Solutions",
    createdAt: "Dec. 5, 2025, 1:19 p.m."
  },
  {
    id: 17,
    instructor: "Ada Gavrilovska Habl",
    title: "Design and Implementation of Emerging Memory Technologies (CXL/CCM) Emulation with QEMU",
    createdAt: "Dec. 5, 2025, 1:19 p.m."
  },
  {
    id: 18,
    instructor: "Prof. Richard Vuduc",
    title: "Power/Performance Optimization of GPU-GPU Interconnects",
    createdAt: "Dec. 5, 2025, 1:19 p.m."
  },
  {
    id: 24,
    instructor: "Dr. Ben Freeman",
    title: "Behavior Analysis of Hume's Leaf Warbler from Camera Traps",
    createdAt: "Dec. 5, 2025, 1:19 p.m."
  },
  {
    id: 22,
    instructor: "Dr. Anind Dey",
    title: "AI for Mental Health Sensing",
    createdAt: "Dec. 5, 2025, 1:19 p.m."
  },
  {
    id: 23,
    instructor: "Dr. Anind Dey",
    title: "Knowledge Traceability (KT) for Research Operations",
    createdAt: "Dec. 5, 2025, 1:19 p.m."
  },
  {
    id: 27,
    instructor: "Dr. Supratik Mukhopadhyay",
    title: "Advanced Generative Models for 3D Biological Shape Completion",
    createdAt: "Dec. 5, 2025, 1:19 p.m."
  },
  {
    id: 28,
    instructor: "Dr. Supratik Mukhopadhyay",
    title: "Kernel (Out-of-Distribution Detection Tool?)",
    createdAt: "Dec. 5, 2025, 1:19 p.m."
  },
  {
    id: 29,
    instructor: "Dr. Arthur Porto",
    title: "Photogrammetry for Museum Specimens",
    createdAt: "Dec. 5, 2025, 1:19 p.m."
  },
  {
    id: 30,
    instructor: "Dr. Marco Postiglione",
    title: "Black-Box Interpretability of Large Language Models",
    createdAt: "Dec. 5, 2025, 1:19 p.m."
  },
  {
    id: 33,
    instructor: "Dr. Katherine Wolcott",
    title: "Using 3D generative AI to explore lizard spinal columns (fossils and modern)",
    createdAt: "Dec. 5, 2025, 1:19 p.m."
  },
  {
    id: 34,
    instructor: "Jeffrey Young",
    title: "Analyzing AI and HPC Workloads with Spatter",
    createdAt: "Dec. 5, 2025, 1:19 p.m."
  },
  {
    id: 35,
    instructor: "Jeffrey Young",
    title: "AI Inference Analysis with Next-Generation Hardware Accelerators",
    createdAt: "Dec. 5, 2025, 1:19 p.m."
  },
  {
    id: 36,
    instructor: "Jessica Roberts",
    title: "Accessible Online Whiteboarding",
    createdAt: "Dec. 5, 2025, 1:19 p.m."
  },
  {
    id: 37,
    instructor: "Prof. Thomas Ploetz",
    title: "Wearables-based Biomarker for Influenza Prediction through Personalized Self-Supervised Modeling on",
    createdAt: "Dec. 5, 2025, 1:19 p.m."
  },
  {
    id: 38,
    instructor: "Prof. Thomas Ploetz",
    title: "Layout-Agnostic and Multimodal Human Activity Recognition in Smart Homes by Enhancing TDOST Beyond A",
    createdAt: "Dec. 5, 2025, 1:19 p.m."
  },
  {
    id: 39,
    instructor: "Prof. Thomas Ploetz",
    title: "Towards Explainable Human Activity Recognition in Smart Homes under Multimodal Sensing Setups",
    createdAt: "Dec. 5, 2025, 1:19 p.m."
  },
  {
    id: 40,
    instructor: "Prof. Thomas Ploetz",
    title: "Exploring the Possibilities of Intent Recognition using Wearables",
    createdAt: "Dec. 5, 2025, 1:19 p.m."
  },
  {
    id: 41,
    instructor: "Ada Gavrilovska Habl",
    title: "Space Computing",
    createdAt: "Dec. 5, 2025, 1:19 p.m."
  },
  {
    id: 42,
    instructor: "Nick Lytle",
    title: "GTEDM Machine Learning Operations Engineering",
    createdAt: "Dec. 5, 2025, 1:19 p.m."
  },
  {
    id: 43,
    instructor: "Nick Lytle",
    title: "GTEDM Streamlined Exploratory Data Analysis Tool for edX Research",
    createdAt: "Dec. 5, 2025, 1:19 p.m."
  },
  {
    id: 44,
    instructor: "Nick Lytle",
    title: "GTEDM Course Clickstream Analysis SLM",
    createdAt: "Dec. 5, 2025, 1:19 p.m."
  },
  {
    id: 45,
    instructor: "Nick Lytle",
    title: "GTEDM Client-side Federated Machine Learning Execution",
    createdAt: "Dec. 5, 2025, 1:19 p.m."
  },
  {
    id: 46,
    instructor: "Nick Lytle",
    title: "GTEDM Cross-modality Student Engagement Research",
    createdAt: "Dec. 5, 2025, 1:19 p.m."
  },
  {
    id: 47,
    instructor: "Nick Lytle",
    title: "GTEDM Research Showcase Website Design",
    createdAt: "Dec. 5, 2025, 1:19 p.m."
  },
  {
    id: 25,
    instructor: "Dr. Heru Handika",
    title: "Natural History Museum Digital Catalog (NAHPU)",
    createdAt: "Dec. 5, 2025, 1:19 p.m."
  },
  {
    id: 32,
    instructor: "Dr. James Stroud",
    title: "R Package Development for Evolutionary Analysis",
    createdAt: "Dec. 5, 2025, 1:19 p.m."
  },
  {
    id: 48,
    instructor: "Thad Starner",
    title: "Multi-Modal Dataset \"SyncAnthing\" Application",
    createdAt: "Dec. 5, 2025, 6:48 p.m."
  },
  {
    id: 49,
    instructor: "Thad Starner",
    title: "Democratized Animal Activity and Behavior Data Collection and Analysis",
    createdAt: "Dec. 5, 2025, 6:49 p.m."
  },
  {
    id: 50,
    instructor: "Thad Starner",
    title: "AGILE: Agility Innovations Leveraging Electronics",
    createdAt: "Dec. 6, 2025, 1:06 p.m."
  },
  {
    id: 21,
    instructor: "Jeffery Cannon",
    title: "Terrestrial LiDAR Vegetation Analysis",
    createdAt: "Dec. 5, 2025, 1:19 p.m."
  },
  {
    id: 26,
    instructor: "Dr. Jenny McGuire",
    title: "Detection of Wildlife from camera traps at Stone Mountain",
    createdAt: "Dec. 5, 2025, 1:19 p.m."
  },
  {
    id: 31,
    instructor: "Dr. James Stroud",
    title: "Automation of Lizard Landmark Analysis",
    createdAt: "Dec. 5, 2025, 1:19 p.m."
  },
  {
    id: 51,
    instructor: "Maria Konte",
    title: "The Internet Resilience Lab - Interdisciplinary Proj on Internet Disruptions & Geopolitical Crisis",
    createdAt: "Dec. 8, 2025, 4:07 p.m."
  },
  {
    id: 52,
    instructor: "Maria Konte",
    title: "OMSCS Course Navigator-AI Agent and Platform Engineering Thread",
    createdAt: "Dec. 8, 2025, 4:08 p.m."
  },
  {
    id: 53,
    instructor: "Maria Konte",
    title: "OMSCS Course Navigator-Predictive Analytics Thread",
    createdAt: "Dec. 8, 2025, 4:08 p.m."
  },
  {
    id: 54,
    instructor: "Maria Konte",
    title: "OMSCS Course Navigator - UX Engineering + Dashboards Thread",
    createdAt: "Dec. 8, 2025, 4:09 p.m."
  },
  {
    id: 55,
    instructor: "Maria Konte",
    title: "The Internet Resilience Lab - Azure Infrastructure and GIS Vis. Thread",
    createdAt: "Dec. 8, 2025, 4:10 p.m."
  },
  {
    id: 56,
    instructor: "Saman Zonouz",
    title: "Hacking Reality: Securing the Machines That Run Our World",
    createdAt: "Dec. 8, 2025, 9:24 p.m."
  }
];

const researchProjectDetails: Record<
  number,
  { description: string; skills: string; applyLink?: string; applyText?: string }
> = {
  1: {
    description:
      "You will learn to write a world class journal paper on AI Agents and Generative AI models in 12 weeks. We will identify a suitable research topic and application area that fits your skills and experience and we will deliver a world class result as a paper. We will use the latest Nvidia GPUs and latest models for training, inferences, and reasoning.",
    skills:
      "You should have used large language models in your work and have good programming skills."
  },
  2: {
    description:
      "The LuminAI project has been iteratively designed and developed for over a decade. It is an AI that \"learns how to dance by dancing with people\" and bootstraps how it recognizes and reasons about the human body through a knowledge representation based on dance movement theory. The work spans creative AI, interactive systems, and embodied learning.",
    skills: "Unity and/or machine learning."
  },
  6: {
    description:
      "In the health informatics ecosystem, users rarely stick to one screen size. This project studies experience transfer across devices and how a user’s mental model adapts as they switch between interfaces with different interaction constraints.",
    skills:
      "UX/UI design, qualitative/quantitative analysis, user study design, literature review."
  },
  15: {
    description:
      "This project focuses on generative methods for computer graphics with an emphasis on learning flow-based representations that capture complex geometries and dynamics such as fluid motion and deformable body dynamics. The goal is to develop a generative model that produces physically consistent trajectories while preserving controllability and stability.",
    skills:
      "Computer graphics fundamentals, machine learning, Python, and computational physics or animation."
  },
  30: {
    description:
      "Thank you for your interest in joining the Human-Augmented Analytics group. Please refrain from contacting faculty regarding your application. Read the full description as faculty may host multiple projects in a given semester.",
    skills:
      "Machine learning and deep learning (Python, PyTorch/TensorFlow), explainable AI (XAI) methods, statistics, and software development with Git.",
    applyLink: "https://gatech.co1.qualtrics.com/jfe/form/SV_cZVxsfQ6xBKVkTI",
    applyText: "Click Link Here"
  }
};

const renderResearchProjects = () => `
  <section class="projects-layout">
    <div class="projects-table-card">
      <div class="projects-header">Research Projects</div>
      <div class="projects-table">
        <div class="projects-row projects-head">
          <div>Applied?</div>
          <div>ID</div>
          <div>Instructor</div>
          <div>Title</div>
          <div>Created At</div>
          <div>Details</div>
        </div>
        ${[...researchProjects]
          .sort((a, b) => a.id - b.id)
          .filter((project) => {
            const applied = state.researchApplied[project.id] === true;
            if (state.researchFilters.tab === "applied" && !applied) {
              return false;
            }
            if (state.researchFilters.tab === "not_applied" && applied) {
              return false;
            }
            if (
              state.researchFilters.instructor &&
              !project.instructor
                .toLowerCase()
                .includes(state.researchFilters.instructor.toLowerCase())
            ) {
              return false;
            }
            if (
              state.researchFilters.title &&
              !project.title.toLowerCase().includes(state.researchFilters.title.toLowerCase())
            ) {
              return false;
            }
            if (
              state.researchFilters.description &&
              !buildProjectDetail(project)
                .description.toLowerCase()
                .includes(state.researchFilters.description.toLowerCase())
            ) {
              return false;
            }
            if (
              state.researchFilters.skills &&
              !buildProjectDetail(project)
                .skills.toLowerCase()
                .includes(state.researchFilters.skills.toLowerCase())
            ) {
              return false;
            }
            return true;
          })
          .map(
            (project) => `
            <div class="projects-row">
              <div></div>
              <div>${project.id}</div>
              <div>${project.instructor}</div>
              <div>${project.title}</div>
              <div>${project.createdAt}</div>
              <div><a class="projects-link" href="/research/project/${project.id}/">See details!</a></div>
            </div>
          `
          )
          .join("")}
      </div>
    </div>
    <aside class="projects-filters">
      <div class="filters-title">Filters</div>
      <div class="filters-group">
        <div class="filters-label">Projects:</div>
        <div class="filters-tabs">
          <button class="filters-tab ${state.researchFilters.tab === "all" ? "is-active" : ""}" data-tab="all" type="button">All</button>
          <button class="filters-tab ${state.researchFilters.tab === "applied" ? "is-active" : ""}" data-tab="applied" type="button">Applied to</button>
          <button class="filters-tab ${state.researchFilters.tab === "not_applied" ? "is-active" : ""}" data-tab="not_applied" type="button">Not applied to</button>
        </div>
      </div>
      <div class="filters-group">
        <label>Instructor</label>
        <input type="text" class="filter-input" data-filter="instructor" value="${state.researchFilters.instructor}" />
      </div>
      <div class="filters-group">
        <label>Title</label>
        <input type="text" class="filter-input" data-filter="title" value="${state.researchFilters.title}" />
      </div>
      <div class="filters-group">
        <label>Description (fuzzy match)</label>
        <input type="text" class="filter-input" data-filter="description" value="${state.researchFilters.description}" />
      </div>
      <div class="filters-group">
        <label>Skills (fuzzy match)</label>
        <input type="text" class="filter-input" data-filter="skills" value="${state.researchFilters.skills}" />
      </div>
      <button class="filters-button" type="button"><i class="fa-solid fa-filter"></i> Filter</button>
    </aside>
  </section>
`;

const buildProjectDetail = (project: { id: number; title: string; instructor: string }) =>
  researchProjectDetails[project.id] || {
    description: `This project explores ${project.title}. You will work with ${project.instructor} to define a focused research question, implement a prototype or analysis pipeline, and communicate results in a short report or poster.`,
    skills:
      "Programming (Python), data analysis, reading research papers, and collaborative communication."
  };

const renderResearchProjectDetail = () => {
  const projectId = state.currentResearchProjectId ?? 1;
  const project =
    researchProjects.find((item) => item.id === projectId) || researchProjects[0];
  const detail = buildProjectDetail(project);

  return `
    <section class="project-detail-card">
      <h2>${project.title}</h2>
      <div class="project-instructor">
        <span>Instructor:</span>
        <span class="project-instructor-name">${project.instructor}</span>
      </div>
      <div class="project-section">
        <div class="project-section-title">Description</div>
        <div class="project-section-body">
          ${detail.description}
          ${
            detail.applyLink
              ? `<div class="project-apply-link">
                  Use the below link to apply (DO NOT USE THE FORM BELOW)
                  <a href="${detail.applyLink}" target="_blank" rel="noreferrer">${detail.applyText ?? "Apply Here"}</a>
                </div>`
              : ""
          }
        </div>
      </div>
      <div class="project-section">
        <div class="project-section-title">Recommended Skills</div>
        <div class="project-section-body">${detail.skills}</div>
      </div>
    </section>
    <section class="project-apply-card">
      <h3>Apply Here</h3>
      <p>We are no longer accepting applications for this project.</p>
    </section>
  `;
};

const renderTaApply = () => {
  const personalReady =
    state.personalSaved &&
    !!state.personalSavedData.firstName &&
    !!state.personalSavedData.lastName &&
    !!state.personalSavedData.gtEmail &&
    !!state.personalSavedData.gtUsername &&
    !!state.personalSavedData.gtId;
  const linksReady =
    state.linksSaved &&
    Object.values(state.linksSavedData).some((value) => value.trim().length > 0);
  const coursesReady = state.coursesSelected.size > 0;
  const isComplete = personalReady && linksReady && coursesReady;

  if (isComplete) {
    return `
      <section class="ta-apply-card">
        <h2>Apply to be a TA</h2>
        <p><strong>Reminder:</strong> Check and update any information in your profile before submitting your TA application.</p>
        <p class="ta-apply-callout">You do NOT have any submitted TA applications.</p>
        <div class="ta-apply-divider">
          <span>Now accepting applications</span>
        </div>
        <div class="ta-apply-cta">
          ${
            state.taApplied
              ? `<div class="ta-apply-success">Application submitted successfully.</div>`
              : `<button class="ta-apply-button" type="button">
                  Apply to be a TA for
                  <span class="ta-apply-pill">summer 2026</span>
                </button>`
          }
        </div>
        <div class="ta-deadlines">
          <div class="ta-deadlines-title">
            <span>Deadlines</span>
          </div>
          <div class="ta-deadlines-grid">
            <div>
              <div>OMSCS<br/>Student</div>
              <div class="ta-date">February<br/>12, 2026</div>
              <div>11:59<br/>pm AoE</div>
            </div>
            <div>
              <div>OMSCS<br/>Alumni</div>
              <div class="ta-date">February<br/>12, 2026</div>
              <div>11:59<br/>pm AoE</div>
            </div>
            <div>
              <div>Cybersecurity/Analytics</div>
              <div class="ta-date">February 18, 2026</div>
              <div>11:59 pm AoE</div>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  return `
    <section class="ta-apply-card">
      <h2>Apply to be a TA</h2>
      <p><strong>Reminder:</strong> Check and update any information in your profile before submitting your TA application.</p>
      <p class="ta-apply-callout">You do NOT have any submitted TA applications.</p>
      <div class="ta-warning">
        <span class="ta-warning-label">Warning</span>
        <div>
          <p>You have not completed all of the “Profile” sections yet. You must fill out all required information in these sections before applying to be a TA.</p>
          <p>The following sections are incomplete:</p>
          <p>- Courses</p>
        </div>
      </div>
      <div class="ta-apply-divider">
        <span>Now accepting applications</span>
      </div>
    </section>
  `;
};

const renderTaEligibility = () => `
  <section class="ta-eligibility-card">
    <h2>About Teaching Assistant (TA) Applications</h2>
    <a
      class="ta-eligibility-link"
      href="https://gtvault-my.sharepoint.com/:w:/g/personal/aduncan9_gatech_edu/EbtrDTYkT6dMh3yKtLZAq0QBtz9qPypaKDLDhBVe2_vY0Q?e=8U0gYD"
      target="_blank"
      rel="noreferrer"
    >
      TA Eligibility and FAQs
      <i class="fa-solid fa-arrow-up-right-from-square"></i>
    </a>
  </section>
`;

const renderPersonalContent = () => {
  if (!state.personalEditing) {
    return `
      <section class="personal-card personal-view">
        <h2>User Identification Information</h2>
        <div class="personal-view-list">
          <div class="personal-view-row">
            <span>First Name*</span>
            <span class="personal-view-divider"></span>
            <span class="personal-value">${state.personalSavedData.firstName}</span>
          </div>
          <div class="personal-view-row">
            <span>Preferred Name</span>
            <span class="personal-view-divider"></span>
            <span class="personal-value">${state.personalSavedData.preferredName || ""}</span>
          </div>
          <div class="personal-view-row">
            <span>Middle Name</span>
            <span class="personal-view-divider"></span>
            <span class="personal-value">${state.personalSavedData.middleName || ""}</span>
          </div>
          <div class="personal-view-row">
            <span>Last Name*</span>
            <span class="personal-view-divider"></span>
            <span class="personal-value">${state.personalSavedData.lastName}</span>
          </div>
          <div class="personal-view-row">
            <span>Gt Email*</span>
            <span class="personal-view-divider"></span>
            <span class="personal-value">${state.personalSavedData.gtEmail}</span>
          </div>
          <div class="personal-view-row">
            <span>Alt Email</span>
            <span class="personal-view-divider"></span>
            <span class="personal-value">${state.personalSavedData.altEmail || ""}</span>
          </div>
          <div class="personal-view-row">
            <span>Gt Username*</span>
            <span class="personal-view-divider"></span>
            <span class="personal-value">${state.personalSavedData.gtUsername}</span>
          </div>
          <div class="personal-view-row">
            <span>Gt Id*</span>
            <span class="personal-view-divider"></span>
            <span class="personal-value">${state.personalSavedData.gtId}</span>
          </div>
        </div>
        <button class="personal-edit" type="button"><i class="fa-regular fa-pen-to-square"></i> Edit</button>
      </section>
    `;
  }

  const firstNameFilled = !!state.personalData.firstName.trim();
  const lastNameFilled = !!state.personalData.lastName.trim();
  const gtUsernameFilled = !!state.personalData.gtUsername.trim();
  const gtEmailFilled = /^[^@\s]+@gatech\.edu$/i.test(state.personalData.gtEmail.trim());
  const altEmailValue = state.personalData.altEmail.trim();
  const altEmailFilled = !altEmailValue || /^[^@\s]+@[^@\s]+\.[^@\s]+$/i.test(altEmailValue);
  const gtIdFilled = /^\d{9}$/.test(state.personalData.gtId.trim());

  return `
  <section class="personal-card">
    <h2>User Identification Information [Editing]</h2>
    <div class="personal-fields">
      <div class="personal-row ${firstNameFilled ? "is-filled" : ""} ${state.personalTriedSave && state.personalErrors.firstName ? "is-error" : ""}">
        <span class="personal-label">First Name*</span>
        <span class="personal-divider"></span>
        <input type="text" data-field="firstName" placeholder="First" value="${state.personalData.firstName}" />
      </div>
      <p class="personal-error ${state.personalTriedSave && state.personalErrors.firstName ? "" : "is-hidden"}">
        Please fill out this field.
      </p>
      <div class="personal-row ${state.personalData.preferredName.trim() ? "is-filled" : ""} ${state.personalTriedSave ? "is-ok" : ""}">
        <span class="personal-label">Preferred Name</span>
        <span class="personal-divider"></span>
        <input type="text" data-field="preferredName" placeholder="" value="${state.personalData.preferredName}" />
      </div>
      <div class="personal-row ${state.personalData.middleName.trim() ? "is-filled" : ""} ${state.personalTriedSave ? "is-ok" : ""}">
        <span class="personal-label">Middle Name</span>
        <span class="personal-divider"></span>
        <input type="text" data-field="middleName" placeholder="" value="${state.personalData.middleName}" />
      </div>
      <div class="personal-row ${lastNameFilled ? "is-filled" : ""} ${state.personalTriedSave && state.personalErrors.lastName ? "is-error" : ""}">
        <span class="personal-label">Last Name*</span>
        <span class="personal-divider"></span>
        <input type="text" data-field="lastName" placeholder="Last" value="${state.personalData.lastName}" />
      </div>
      <p class="personal-error ${state.personalTriedSave && state.personalErrors.lastName ? "" : "is-hidden"}">
        Please fill out this field.
      </p>
      <div class="personal-row ${gtEmailFilled ? "is-filled" : ""} ${state.personalTriedSave && state.personalErrors.gtEmail ? "is-error" : ""}">
        <span class="personal-label">GT Email*</span>
        <span class="personal-divider"></span>
        <input type="text" data-field="gtEmail" placeholder="something@gatech.edu" value="${state.personalData.gtEmail}" />
      </div>
      <p class="personal-hint">Must end with gatech.edu</p>
      <p class="personal-error ${state.personalTriedSave && state.personalErrors.gtEmail ? "" : "is-hidden"}">
        Invalid Input: Enter valid email that ends with gatech.edu
      </p>
      <div class="personal-row ${altEmailFilled && altEmailValue ? "is-filled" : ""} ${state.personalTriedSave && state.personalErrors.altEmail ? "is-error" : state.personalTriedSave ? "is-ok" : ""}">
        <span class="personal-label">Alt Email</span>
        <span class="personal-divider"></span>
        <input type="text" data-field="altEmail" placeholder="something-else@anywhere.com" value="${state.personalData.altEmail}" />
      </div>
      <p class="personal-error ${state.personalTriedSave && state.personalErrors.altEmail ? "" : "is-hidden"}">
        Invalid Input: Enter valid email address
      </p>
      <p class="personal-note">
        Although this is optional, we strongly encourage you to provide an alternate email address,
        especially if you are applying to be a TA.
      </p>
      <div class="personal-row ${gtUsernameFilled ? "is-filled" : ""} ${state.personalTriedSave && state.personalErrors.gtUsername ? "is-error" : ""}">
        <span class="personal-label">GT Username*</span>
        <span class="personal-divider"></span>
        <input type="text" data-field="gtUsername" placeholder="" value="${state.personalData.gtUsername}" />
      </div>
      <p class="personal-error ${state.personalTriedSave && state.personalErrors.gtUsername ? "" : "is-hidden"}">
        Please fill out this field.
      </p>
      <p class="personal-hint">(e.g., djoyner3, daj3, gth815k)</p>
      <div class="personal-row ${gtIdFilled ? "is-filled" : ""} ${state.personalTriedSave && state.personalErrors.gtId ? "is-error" : ""}">
        <span class="personal-label">GT Id*</span>
        <span class="personal-divider"></span>
        <input type="text" data-field="gtId" placeholder="90XXXXXXX" value="${state.personalData.gtId}" />
      </div>
      <p class="personal-note">
        Your GTID is a 9-digit number that begins with "90" (e.g., 901234567). If needed you can
        look up your GTID here: <a class="inline-link" href="https://registrar.gatech.edu/info/gtid-lookup" target="_blank" rel="noreferrer">GTID Lookup <i class="fa-solid fa-arrow-up-right-from-square"></i></a>
      </p>
      <p class="personal-error ${state.personalTriedSave && state.personalErrors.gtId ? "" : "is-hidden"}">
        Invalid Input: Enter valid GTID (9 digits)
      </p>
    </div>
    <div class="personal-actions ${state.personalSaved ? "has-cancel" : "single"}">
      <button class="personal-save" type="button"><i class="fa-regular fa-floppy-disk"></i> Save</button>
      ${
        state.personalSaved
          ? `<button class="personal-cancel" type="button"><i class="fa-regular fa-square-xmark"></i> Cancel Edit</button>`
          : ""
      }
    </div>
  </section>
`;
};

const renderLinksContent = () => {
  const data = state.linksEditing ? state.linksData : state.linksSavedData;
  const title = state.linksEditing ? "User Links Information [Editing]" : "User Links Information";
  if (!state.linksEditing) {
    return `
      <section class="links-card">
        <h2>${title}</h2>
        <div class="links-fields links-view">
          <div class="links-row">
            <span class="links-icon"><i class="fa-brands fa-linkedin-in"></i></span>
            <span class="links-prefix">linkedin.com/in/</span>
            ${
              data.linkedin
                ? `<a class="links-link" href="${toExternalUrl(data.linkedin)}" target="_blank" rel="noreferrer">
                    ${data.linkedin}<i class="fa-solid fa-arrow-up-right-from-square"></i>
                   </a>`
                : `<span class="links-empty">&nbsp;</span>`
            }
          </div>
          <div class="links-row">
            <span class="links-icon"><i class="fa-brands fa-github"></i></span>
            <span class="links-prefix">github.com/</span>
            ${
              data.github
                ? `<a class="links-link" href="${toExternalUrl(data.github)}" target="_blank" rel="noreferrer">
                    ${data.github}<i class="fa-solid fa-arrow-up-right-from-square"></i>
                   </a>`
                : `<span class="links-empty">&nbsp;</span>`
            }
          </div>
          <div class="links-row">
            <span class="links-icon gt"><i class="fa-brands fa-github"></i></span>
            <span class="links-prefix">github.gatech.edu/</span>
            ${
              data.gatech
                ? `<a class="links-link" href="${toExternalUrl(data.gatech)}" target="_blank" rel="noreferrer">
                    ${data.gatech}<i class="fa-solid fa-arrow-up-right-from-square"></i>
                   </a>`
                : `<span class="links-empty">&nbsp;</span>`
            }
          </div>
          <div class="links-row">
            <span class="links-icon"><i class="fa-solid fa-link"></i></span>
            <span class="links-prefix">Personal Site</span>
            ${
              data.personal
                ? `<a class="links-link" href="${toExternalUrl(data.personal)}" target="_blank" rel="noreferrer">
                    ${data.personal}<i class="fa-solid fa-arrow-up-right-from-square"></i>
                   </a>`
                : `<span class="links-empty">&nbsp;</span>`
            }
          </div>
          <div class="links-row">
            <span class="links-icon"><i class="fa-solid fa-link"></i></span>
            <span class="links-prefix">Employer Site</span>
            ${
              data.employer
                ? `<a class="links-link" href="${toExternalUrl(data.employer)}" target="_blank" rel="noreferrer">
                    ${data.employer}<i class="fa-solid fa-arrow-up-right-from-square"></i>
                   </a>`
                : `<span class="links-empty">&nbsp;</span>`
            }
          </div>
          <div class="links-row">
            <span class="links-icon"><i class="fa-solid fa-link"></i></span>
            <span class="links-prefix">Projects</span>
            ${
              data.projects
                ? `<a class="links-link" href="${toExternalUrl(data.projects)}" target="_blank" rel="noreferrer">
                    ${data.projects}<i class="fa-solid fa-arrow-up-right-from-square"></i>
                   </a>`
                : `<span class="links-empty">&nbsp;</span>`
            }
          </div>
          <div class="links-row">
            <span class="links-icon"><i class="fa-solid fa-link"></i></span>
            <span class="links-prefix">Research</span>
            ${
              data.research
                ? `<a class="links-link" href="${toExternalUrl(data.research)}" target="_blank" rel="noreferrer">
                    ${data.research}<i class="fa-solid fa-arrow-up-right-from-square"></i>
                   </a>`
                : `<span class="links-empty">&nbsp;</span>`
            }
          </div>
        </div>
        <div class="links-actions">
          <button class="links-edit" type="button"><i class="fa-regular fa-pen-to-square"></i> Edit</button>
        </div>
      </section>
    `;
  }

  return `
    <section class="links-card">
      <h2>${title}</h2>
      <div class="links-fields">
        <div class="links-row">
          <span class="links-icon"><i class="fa-brands fa-linkedin-in"></i></span>
          <span class="links-prefix">linkedin.com/in/</span>
          <input type="text" data-field="linkedin" value="${data.linkedin}" placeholder="your-name-or-custom-string" />
        </div>
        <div class="links-row">
          <span class="links-icon"><i class="fa-brands fa-github"></i></span>
          <span class="links-prefix">github.com/</span>
          <input type="text" data-field="github" value="${data.github}" placeholder="your-github-name" />
        </div>
        <div class="links-row">
          <span class="links-icon gt"><i class="fa-brands fa-github"></i></span>
          <span class="links-prefix">github.gatech.edu/</span>
          <input type="text" data-field="gatech" value="${data.gatech}" placeholder="your-gt-github-name" />
        </div>
        <div class="links-row">
          <span class="links-icon"><i class="fa-solid fa-link"></i></span>
          <span class="links-prefix">Personal Site</span>
          <input type="text" data-field="personal" value="${data.personal}" placeholder="" />
        </div>
        <div class="links-row">
          <span class="links-icon"><i class="fa-solid fa-link"></i></span>
          <span class="links-prefix">Employer Site</span>
          <input type="text" data-field="employer" value="${data.employer}" placeholder="" />
        </div>
        <div class="links-row">
          <span class="links-icon"><i class="fa-solid fa-link"></i></span>
          <span class="links-prefix">Projects</span>
          <input type="text" data-field="projects" value="${data.projects}" placeholder="URL demonstrating your projects" />
        </div>
        <div class="links-row">
          <span class="links-icon"><i class="fa-solid fa-link"></i></span>
          <span class="links-prefix">Research</span>
          <input type="text" data-field="research" value="${data.research}" placeholder="URL demonstrating your research (i.e. C" />
        </div>
      </div>
      <div class="links-actions">
        <button class="links-save" type="button"><i class="fa-regular fa-floppy-disk"></i> Save</button>
        ${state.linksSaved ? `<button class="links-cancel" type="button"><i class="fa-regular fa-square-xmark"></i> Cancel Edit</button>` : ""}
      </div>
    </section>
  `;
};

const renderApp = (isLoggedOut: boolean) => {
  if (!isLoggedOut) {
    const pageKey =
      state.activeKey === "research-project-detail" && state.currentResearchProjectId
        ? `${state.activeKey}:${state.currentResearchProjectId}`
        : state.activeKey;
    if (pageKey && lastPageViewKey !== pageKey) {
      lastPageViewKey = pageKey;
      void logPageView(pageKey, window.location.pathname, navigator.userAgent);
    }
  } else {
    lastPageViewKey = "";
  }
  const app = document.querySelector<HTMLDivElement>("#app");
  if (!app) {
    return;
  }

  if (!isLoggedOut && state.activeKey === "profile-links") {
    const hasSaved = hasSavedLinksData();
    const isEditPath = window.location.pathname.toLowerCase().includes("/profile/links/edit");
    if (!hasSaved) {
      state.linksEditing = true;
      state.linksSaved = false;
    } else if (!isEditPath) {
      state.linksEditing = false;
      state.linksSaved = true;
    } else {
      state.linksEditing = true;
      state.linksSaved = true;
    }
  }
  if (!isLoggedOut && state.activeKey === "profile-personal") {
    const hasSaved =
      !!state.personalSavedData.firstName ||
      !!state.personalSavedData.lastName ||
      !!state.personalSavedData.gtEmail ||
      !!state.personalSavedData.gtUsername ||
      !!state.personalSavedData.gtId;
    const isEditPath = window.location.pathname.toLowerCase().includes("/profile/identification/edit");
    if (!hasSaved) {
      state.personalEditing = true;
      state.personalSaved = false;
    } else if (!isEditPath) {
      state.personalEditing = false;
      state.personalSaved = true;
    } else {
      state.personalEditing = true;
      state.personalSaved = true;
      state.personalData = { ...state.personalSavedData };
    }
  }

  const mainContent = isLoggedOut
    ? `
      <div class="layout">
        <aside class="sidebar sidebar-empty"></aside>
        <main class="content content-centered">
          <section class="login-card">
            <h2>Login Options</h2>
            <p>If you are affiliated with GT login here:</p>
            <button class="gt-login" type="button">GT Login</button>
          </section>
        </main>
      </div>
    `
    : `
      <div class="layout">
        <aside class="sidebar">
          ${renderNav(state.activeKey)}
        </aside>

        <main class="content">
          ${
            state.activeKey === "profile-major"
              ? renderMajorContent()
              : state.activeKey === "profile-courses"
              ? renderCoursesContent()
              : state.activeKey === "ta-apply"
              ? renderTaApply()
              : state.activeKey === "ta-eligibility"
              ? renderTaEligibility()
              : state.activeKey === "profile-about"
              ? renderProfileAbout()
              : state.activeKey === "research-about"
              ? renderResearchAbout()
              : state.activeKey === "research-projects"
              ? renderResearchProjects()
              : state.activeKey === "research-project-detail"
              ? renderResearchProjectDetail()
              : state.activeKey === "profile-links"
              ? renderLinksContent()
              : state.activeKey === "profile-personal"
              ? renderPersonalContent()
              : `
                <section class="card">
                  <h1>Welcome</h1>
                  <div class="card-body">
                    <p>Welcome to BuzzMe - the OMSCS Profile System!</p>
                    <p>
                      There are 3 main things you can do on BuzzMe: apply to be a TA, apply to research projects, and update your profile information; click "About"
                      under each section to learn more about that section.
                    </p>
                    <p>
                      If this is your first time logging in, please start by filling out the Profile pages. If you'd like to apply to be a TA, click "Apply" under the
                      TA section. If you're interested in participating in a research project, click "Projects" under the Research section to find and apply to projects.
                    </p>
                    <p>
                      If you have questions, need support, or want to provide feedback about BuzzMe, then email us:
                      <a href="mailto:buzzme@gatech.edu" class="inline-link">
                        buzzme@gatech.edu
                        <span class="inline-icon">${icons.external}</span>
                      </a>.
                    </p>
                    <p class="fine-print">
                      *The information collected through BuzzMe is confidential and will only be shared with those staff and faculty who are involved in the selection and
                      hiring processes. This information will not be shared with third parties.*
                    </p>
                    <a href="https://policylibrary.gatech.edu/legal/personal-information-privacy-policy" class="policy-link" target="_blank">
                      GT Privacy Policy
                      <span class="inline-icon">${icons.external}</span>
                    </a>
                  </div>
                </section>
              `
          }
        </main>
      </div>
    `;

  const userBlock = isLoggedOut
    ? ""
    : `
          <div class="user" data-tooltip="Standard user">
            <span class="user-icon">${icons.user}</span>
            <span class="user-email">eluk7@gatech.edu</span>
          </div>
          <span class="divider"></span>
    `;

  app.innerHTML = `
    <div class="page">
      <header class="topbar">
        <a class="brand" href="#">
          <span class="brand-icon">${icons.house}</span>
          <span class="brand-text">BuzzMe - The OMSCS Profile System</span>
        </a>
        <div class="topbar-actions">
          <span class="divider"></span>
          ${userBlock}
          <button class="logout" type="button">
            <span class="logout-text">GT Log Out</span>
          </button>
        </div>
      </header>
      ${mainContent}
    </div>
  `;

  const logoutButton = app.querySelector<HTMLButtonElement>(".logout");
  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      window.history.pushState({}, "", "/logout");
      renderApp(true);
    });
  }

  const gtLoginButton = app.querySelector<HTMLButtonElement>(".gt-login");
  if (gtLoginButton) {
    gtLoginButton.addEventListener("click", () => {
      state.activeKey = "home";
      window.history.pushState({}, "", "/");
      saveActiveKey();
      renderApp(false);
    });
  }

  const brandLink = app.querySelector<HTMLAnchorElement>(".brand");
  if (brandLink) {
    brandLink.addEventListener("click", (event) => {
      event.preventDefault();
      state.activeKey = "home";
      state.coursesTab = "selection";
      saveCoursesState();
      normalizeMajorOnLeave();
      saveActiveKey();
      renderApp(false);
    });
  }

  const navTitles = app.querySelectorAll<HTMLButtonElement>(".nav-title");
  navTitles.forEach((title) => {
    title.addEventListener("click", () => {
      const group = title.closest<HTMLElement>(".nav-group");
      if (group) {
        group.classList.toggle("is-collapsed");
      }
    });
  });

  const navItems = app.querySelectorAll<HTMLLIElement>(".nav-item");
  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      const key = item.dataset.key;
      if (!key) {
        return;
      }
      state.activeKey = key;
      if (state.activeKey === "research-projects") {
        state.currentResearchProjectId = null;
      }
      if (state.activeKey === "profile-links") {
        const hasSaved = hasSavedLinksData();
        if (hasSaved) {
          state.linksEditing = false;
          state.linksSaved = true;
        } else {
          state.linksEditing = true;
          state.linksSaved = false;
        }
      }
      if (state.activeKey === "profile-personal") {
        const hasSaved =
          !!state.personalSavedData.firstName ||
          !!state.personalSavedData.lastName ||
          !!state.personalSavedData.gtEmail ||
          !!state.personalSavedData.gtUsername ||
          !!state.personalSavedData.gtId;
        if (hasSaved) {
          state.personalEditing = false;
          state.personalSaved = true;
        } else {
          state.personalEditing = true;
          state.personalSaved = false;
        }
      }
      if (state.activeKey !== "profile-courses") {
        state.coursesTab = "selection";
        saveCoursesState();
      }
      saveActiveKey();
      normalizeMajorOnLeave();
      renderApp(false);
    });
  });

  const majorButtons = app.querySelectorAll<HTMLButtonElement>(".major-option");
  majorButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const value = button.dataset.major;
      if (!value) {
        return;
      }
      state.majorSelected = value;
      state.majorError = false;
      renderApp(false);
    });
  });

  const majorSave = app.querySelector<HTMLButtonElement>(".major-save");
  if (majorSave) {
    majorSave.addEventListener("click", () => {
      if (state.majorSelected === "Other (please specify)" && !state.majorOtherText.trim()) {
        state.majorError = true;
        renderApp(false);
        return;
      }
      state.lastSavedKey = state.majorSelected;
      state.lastSavedOtherText = state.majorOtherText;
      state.majorSaved = true;
      state.majorEditing = false;
      updatePathForKey("profile-major");
      saveMajorState();
      void persistMajorState();
      state.majorError = false;
      renderApp(false);
    });
  }

  const majorEdit = app.querySelector<HTMLButtonElement>(".major-edit");
  if (majorEdit) {
    majorEdit.addEventListener("click", () => {
      state.majorEditing = true;
      state.majorError = false;
      updatePathForKey("profile-major");
      saveMajorState();
      renderApp(false);
    });
  }

  const majorOtherInput = app.querySelector<HTMLInputElement>(".major-other input");
  if (majorOtherInput) {
    majorOtherInput.addEventListener("input", () => {
      state.majorOtherText = majorOtherInput.value;
      if (state.majorOtherText.trim()) {
        state.majorError = false;
      }
      saveMajorState();
    });
  }

  const isValidEmail = (value: string) =>
    /^[^@\s]+@[^@\s]+\.[^@\s]+$/i.test(value.trim());

  const isValidGatechEmail = (value: string) =>
    /^[^@\s]+@gatech\.edu$/i.test(value.trim());

  const isValidGtid = (value: string) => /^\d{9}$/.test(value.trim());

  const updatePersonalError = (field: keyof typeof state.personalData, value: string) => {
    const trimmed = value.trim();
    if (field === "firstName") {
      state.personalErrors.firstName = !trimmed;
    } else if (field === "lastName") {
      state.personalErrors.lastName = !trimmed;
    } else if (field === "gtUsername") {
      state.personalErrors.gtUsername = !trimmed;
    } else if (field === "gtEmail") {
      state.personalErrors.gtEmail = !isValidGatechEmail(trimmed);
    } else if (field === "altEmail") {
      state.personalErrors.altEmail = trimmed ? !isValidEmail(trimmed) : false;
    } else if (field === "gtId") {
      state.personalErrors.gtId = !isValidGtid(trimmed);
    }
  };

  const clearPersonalErrorIfValid = (field: keyof typeof state.personalData, value: string) => {
    const trimmed = value.trim();
    if (field === "firstName" && trimmed) {
      state.personalErrors.firstName = false;
    } else if (field === "lastName" && trimmed) {
      state.personalErrors.lastName = false;
    } else if (field === "gtUsername" && trimmed) {
      state.personalErrors.gtUsername = false;
    } else if (field === "gtEmail" && isValidGatechEmail(trimmed)) {
      state.personalErrors.gtEmail = false;
    } else if (field === "altEmail" && (!trimmed || isValidEmail(trimmed))) {
      state.personalErrors.altEmail = false;
    } else if (field === "gtId" && isValidGtid(trimmed)) {
      state.personalErrors.gtId = false;
    }
  };

  const personalInputs = app.querySelectorAll<HTMLInputElement>(".personal-fields input");
  personalInputs.forEach((input) => {
    input.addEventListener("focus", () => {
      input.closest(".personal-row")?.classList.add("is-active");
    });
    input.addEventListener("blur", () => {
      const row = input.closest(".personal-row");
      row?.classList.remove("is-active");
      row?.classList.toggle("is-filled", !!input.value.trim());
      const field = input.dataset.field as keyof typeof state.personalData | undefined;
      if (!field) {
        return;
      }
      const before = { ...state.personalErrors };
      updatePersonalError(field, input.value);
      row?.classList.toggle(
        "is-error",
        field === "firstName"
          ? state.personalErrors.firstName
          : field === "lastName"
          ? state.personalErrors.lastName
          : field === "gtUsername"
          ? state.personalErrors.gtUsername
          : field === "gtEmail"
          ? state.personalErrors.gtEmail
          : field === "gtId"
          ? state.personalErrors.gtId
          : field === "altEmail"
          ? state.personalErrors.altEmail
          : false
      );
      if (
        before.firstName !== state.personalErrors.firstName ||
        before.lastName !== state.personalErrors.lastName ||
        before.gtUsername !== state.personalErrors.gtUsername ||
        before.gtEmail !== state.personalErrors.gtEmail ||
        before.gtId !== state.personalErrors.gtId ||
        before.altEmail !== state.personalErrors.altEmail
      ) {
        state.personalTriedSave = true;
        renderApp(false);
      }
    });
    input.addEventListener("input", () => {
      const field = input.dataset.field as keyof typeof state.personalData | undefined;
      if (!field) {
        return;
      }
      state.personalData[field] = input.value;
      savePersonalState();
      input.closest(".personal-row")?.classList.toggle("is-filled", !!input.value.trim());
      if (!state.personalTriedSave) {
        return;
      }
      const before = { ...state.personalErrors };
      clearPersonalErrorIfValid(field, input.value);
      const row = input.closest<HTMLElement>(".personal-row");
      if (field === "firstName") {
        row?.classList.toggle("is-error", state.personalErrors.firstName);
      }
      if (field === "lastName") {
        row?.classList.toggle("is-error", state.personalErrors.lastName);
      }
      if (field === "gtUsername") {
        row?.classList.toggle("is-error", state.personalErrors.gtUsername);
      }
      if (field === "gtEmail") {
        row?.classList.toggle("is-error", state.personalErrors.gtEmail);
      }
      if (field === "gtId") {
        row?.classList.toggle("is-error", state.personalErrors.gtId);
      }
      if (field === "altEmail") {
        row?.classList.toggle("is-error", state.personalErrors.altEmail);
      }
      if (field === "preferredName" || field === "middleName" || field === "altEmail") {
        row?.classList.toggle("is-ok", state.personalTriedSave);
      }
      if (
        before.gtEmail !== state.personalErrors.gtEmail ||
        before.gtId !== state.personalErrors.gtId ||
        before.altEmail !== state.personalErrors.altEmail
      ) {
        renderApp(false);
      }
    });
  });

  const personalSave = app.querySelector<HTMLButtonElement>(".personal-save");
  if (personalSave) {
    personalSave.addEventListener("click", () => {
      state.personalTriedSave = true;
      updatePersonalError("firstName", state.personalData.firstName);
      updatePersonalError("lastName", state.personalData.lastName);
      updatePersonalError("gtUsername", state.personalData.gtUsername);
      updatePersonalError("gtEmail", state.personalData.gtEmail);
      updatePersonalError("altEmail", state.personalData.altEmail);
      updatePersonalError("gtId", state.personalData.gtId);

      const hasError = Object.values(state.personalErrors).some(Boolean);
      if (hasError) {
        renderApp(false);
        return;
      }

      state.personalTriedSave = false;
      state.personalSaved = true;
      state.personalEditing = false;
      state.personalSavedData = { ...state.personalData };
      state.personalErrors = {
        firstName: false,
        lastName: false,
        gtEmail: false,
        gtUsername: false,
        gtId: false,
        altEmail: false
      };
      savePersonalState();
      void persistPersonalState();
      updatePathForKey("profile-personal");
      renderApp(false);
    });
  }

  const personalCancel = app.querySelector<HTMLButtonElement>(".personal-cancel");
  if (personalCancel) {
    personalCancel.addEventListener("click", () => {
      state.personalData = { ...state.personalSavedData };
      state.personalEditing = false;
      state.personalSaved = true;
      state.personalTriedSave = false;
      state.personalErrors = {
        firstName: false,
        lastName: false,
        gtEmail: false,
        gtUsername: false,
        gtId: false,
        altEmail: false
      };
      savePersonalState();
      updatePathForKey("profile-personal");
      renderApp(false);
    });
  }

  const personalEdit = app.querySelector<HTMLButtonElement>(".personal-edit");
  if (personalEdit) {
    personalEdit.addEventListener("click", () => {
      state.personalEditing = true;
      state.personalSaved = true;
      state.personalData = { ...state.personalSavedData };
      savePersonalState();
      updatePathForKey("profile-personal");
      renderApp(false);
    });
  }

  const taApplyButton = app.querySelector<HTMLButtonElement>(".ta-apply-button");
  if (taApplyButton) {
    taApplyButton.addEventListener("click", () => {
      state.taApplied = true;
      saveTaState();
      void persistTaState();
      renderApp(false);
    });
  }

  const projectLinks = app.querySelectorAll<HTMLAnchorElement>(".projects-link");
  projectLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const href = link.getAttribute("href") || "";
      const match = href.match(/\/research\/project\/(\d+)\//);
      if (match) {
        state.currentResearchProjectId = Number(match[1]);
      }
      if (state.currentResearchProjectId) {
        void logProjectClick(state.currentResearchProjectId, "details_link");
      }
      state.activeKey = "research-project-detail";
      window.history.pushState({}, "", href || "/research/project/1/");
      renderApp(false);
    });
  });

  const projectApplyLinks = app.querySelectorAll<HTMLAnchorElement>(".project-apply-link a");
  projectApplyLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (state.currentResearchProjectId) {
        void logProjectClick(state.currentResearchProjectId, "apply_link");
      }
    });
  });

  const filterTabs = app.querySelectorAll<HTMLButtonElement>(".filters-tab");
  filterTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const value = tab.dataset.tab as "all" | "applied" | "not_applied" | undefined;
      if (!value) {
        return;
      }
      state.researchFilters.tab = value;
      saveResearchState();
      renderApp(false);
    });
  });

  const filterInputs = app.querySelectorAll<HTMLInputElement>(".filter-input");
  filterInputs.forEach((input) => {
    input.addEventListener("input", () => {
      const key = input.dataset.filter as
        | "instructor"
        | "title"
        | "description"
        | "skills"
        | undefined;
      if (!key) {
        return;
      }
      state.researchFilters[key] = input.value;
      saveResearchState();
      renderApp(false);
    });
  });


  const linksInputs = app.querySelectorAll<HTMLInputElement>(".links-fields input");
  linksInputs.forEach((input) => {
    input.addEventListener("focus", () => {
      input.closest(".links-row")?.classList.add("is-active");
    });
    input.addEventListener("blur", () => {
      input.closest(".links-row")?.classList.remove("is-active");
    });
    input.addEventListener("input", () => {
      const field = input.dataset.field as keyof typeof state.linksData | undefined;
      if (!field) {
        return;
      }
      state.linksData[field] = input.value;
      saveLinksState();
      if (input.value.trim()) {
        input.closest(".links-row")?.classList.add("is-filled");
      } else {
        input.closest(".links-row")?.classList.remove("is-filled");
      }
    });
    if (input.value.trim()) {
      input.closest(".links-row")?.classList.add("is-filled");
    }
  });

  const noneCheck = app.querySelector<HTMLInputElement>(".course-none");
  if (noneCheck) {
      noneCheck.addEventListener("change", () => {
        state.coursesNone = noneCheck.checked;
        if (state.coursesNone) {
          state.coursesSelected.clear();
          state.coursesTab = "selection";
        }
        saveCoursesState();
        void persistCoursesState();
        renderApp(false);
      });
    }

  const courseChecks = app.querySelectorAll<HTMLInputElement>(".course-check[data-course]");
  courseChecks.forEach((input) => {
    input.addEventListener("change", () => {
      const course = input.dataset.course;
      if (!course) {
        return;
      }
      if (input.checked) {
        state.coursesSelected.add(course);
        if (!state.courseDetails[course]) {
          state.courseDetails[course] = {
            year: "",
            term: "",
            finished: false,
            grade: ""
          };
        }
        } else {
          state.coursesSelected.delete(course);
          delete state.courseDetails[course];
        }
        saveCoursesState();
        void persistCoursesState();
      });
    });

  const tabButtons = app.querySelectorAll<HTMLButtonElement>(".courses-tab");
  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const next = button.dataset.tab as "selection" | "details" | undefined;
      if (!next) {
        return;
      }
      if (next === "details" && state.coursesNone) {
        return;
      }
      state.coursesTab = next;
      saveCoursesState();
      renderApp(false);
    });
  });

  const detailsRows = app.querySelectorAll<HTMLDivElement>(".details-row");
  detailsRows.forEach((row) => {
    const course = row.dataset.course;
    if (!course) {
      return;
    }

    const yearSelect = row.querySelector<HTMLDivElement>(".year-select");
    if (yearSelect) {
      const yearButton = yearSelect.querySelector<HTMLButtonElement>(".year-button");
      if (yearButton) {
        yearButton.addEventListener("click", () => {
          state.openYearFor = state.openYearFor === course ? null : course;
          renderApp(false);
        });
      }

      const yearOptions = yearSelect.querySelectorAll<HTMLButtonElement>(".year-option");
        yearOptions.forEach((option) => {
          option.addEventListener("click", () => {
            const value = option.dataset.year ?? "";
            state.courseDetails[course] = {
              ...state.courseDetails[course],
              year: value === "year" ? "" : value
            };
            state.openYearFor = null;
            saveCoursesState();
            void persistCoursesState();
            renderApp(false);
          });
        });
    }

    const termButtons = row.querySelectorAll<HTMLButtonElement>(".term-pill");
    termButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const term = btn.dataset.term as "spring" | "summer" | "fall" | undefined;
        if (!term) {
          return;
        }
        state.courseDetails[course] = {
          ...state.courseDetails[course],
          term
        };
        saveCoursesState();
        void persistCoursesState();
        renderApp(false);
      });
    });

    const finished = row.querySelector<HTMLInputElement>(".details-finished");
    if (finished) {
      finished.addEventListener("change", () => {
        state.courseDetails[course] = {
          ...state.courseDetails[course],
          finished: finished.checked,
          grade: finished.checked ? state.courseDetails[course].grade : ""
        };
        saveCoursesState();
        void persistCoursesState();
        renderApp(false);
      });
    }

    const gradeButtons = row.querySelectorAll<HTMLButtonElement>(".grade-pill");
    gradeButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const grade = btn.dataset.grade as "P" | "S" | "F" | "U" | undefined;
        if (!grade) {
          return;
        }
        state.courseDetails[course] = {
          ...state.courseDetails[course],
          grade
        };
        saveCoursesState();
        void persistCoursesState();
        renderApp(false);
      });
    });
  });

  const linksSave = app.querySelector<HTMLButtonElement>(".links-save");
  if (linksSave) {
    linksSave.addEventListener("click", () => {
      state.linksSavedData = { ...state.linksData };
      state.linksSaved = true;
      state.linksEditing = false;
      saveLinksState();
      void persistLinksState();
      updatePathForKey("profile-links");
      renderApp(false);
    });
  }

  const linksCancel = app.querySelector<HTMLButtonElement>(".links-cancel");
  if (linksCancel) {
    linksCancel.addEventListener("click", () => {
      state.linksData = { ...state.linksSavedData };
      state.linksSaved = true;
      state.linksEditing = false;
      saveLinksState();
      updatePathForKey("profile-links");
      renderApp(false);
    });
  }

  const linksEdit = app.querySelector<HTMLButtonElement>(".links-edit");
  if (linksEdit) {
    linksEdit.addEventListener("click", () => {
      state.linksEditing = true;
      state.linksSaved = true;
      saveLinksState();
      updatePathForKey("profile-links");
      renderApp(false);
    });
  }

  app.onclick = (event) => {
    const target = event.target as HTMLElement | null;
    if (!target) {
      return;
    }
    if (!target.closest(".year-select")) {
      if (state.openYearFor) {
        state.openYearFor = null;
        renderApp(false);
      }
    }
  };
};

export const initApp = () => {
  loadMajorState();
  loadCoursesState();
  loadLinksState();
  loadTaState();
  loadPersonalState();
  loadResearchState();
  loadActiveKey();
  const syncEditModesForRoute = () => {
    if (state.activeKey === "profile-links") {
      const hasSaved = hasSavedLinksData();
      const isEditPath = window.location.pathname.toLowerCase().includes("/profile/links/edit");
      if (!hasSaved) {
        state.linksEditing = true;
        state.linksSaved = false;
      } else if (!isEditPath) {
        state.linksEditing = false;
        state.linksSaved = true;
      } else {
        state.linksEditing = true;
        state.linksSaved = true;
      }
      saveLinksState();
    }
    if (state.activeKey === "profile-personal") {
      const hasSaved =
        !!state.personalSavedData.firstName ||
        !!state.personalSavedData.lastName ||
        !!state.personalSavedData.gtEmail ||
        !!state.personalSavedData.gtUsername ||
        !!state.personalSavedData.gtId;
      const isEditPath = window.location.pathname.toLowerCase().includes("/profile/identification/edit");
      if (!hasSaved) {
        state.personalEditing = true;
        state.personalSaved = false;
      } else if (!isEditPath) {
        state.personalEditing = false;
        state.personalSaved = true;
      } else {
        state.personalEditing = true;
        state.personalSaved = true;
        state.personalData = { ...state.personalSavedData };
      }
      savePersonalState();
    }
    if (state.activeKey !== "profile-courses") {
      state.coursesTab = "selection";
      saveCoursesState();
    }
    normalizeMajorOnLeave();
  };

  renderApp(false);

  loadSupabaseState().then((hasData) => {
    if (hasData) {
      saveMajorState();
      saveCoursesState();
      saveLinksState();
      savePersonalState();
      saveTaState();
      saveResearchState();
      syncEditModesForRoute();
      renderApp(false);
    }
  });

  window.addEventListener("popstate", () => {
    const fromPath = getActiveKeyFromPath();
    if (fromPath) {
      state.activeKey = fromPath;
    } else {
      state.activeKey = localStorage.getItem("buzzme.activeNavKey") || "home";
    }
    syncEditModesForRoute();
    renderApp(false);
  });
};
