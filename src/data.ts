export type NavItem = {
  key: string;
  label: string;
  icon: string;
  indent?: boolean;
};

export type NavGroup = {
  title: string;
  items: NavItem[];
};

export const nav: NavGroup[] = [
  {
    title: "TA",
    items: [
      { key: "ta-apply", label: "Apply", icon: "apply" },
      { key: "ta-eligibility", label: "Eligibility\nand FAQs", icon: "info" }
    ]
  },
  {
    title: "Research",
    items: [
      { key: "research-about", label: "About", icon: "info" },
      { key: "research-projects", label: "Projects", icon: "search" }
    ]
  },
  {
    title: "Profile",
    items: [
      { key: "profile-about", label: "About", icon: "info" },
      { key: "profile-personal", label: "Personal\nInformation", icon: "user" },
      { key: "profile-links", label: "Links", icon: "link" },
      { key: "profile-courses", label: "Courses", icon: "book" },
      { key: "profile-major", label: "Major", icon: "grid" }
    ]
  }
];

export const icons: Record<string, string> = {
  house: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 12.5 12 5l8 7.5" />
      <path d="M6.5 11.8V19h11V11.8" />
    </svg>
  `,
  apply: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
      <path d="M5 21c0-4 3.1-7 7-7s7 3 7 7" />
    </svg>
  `,
  info: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M11 10h2v7h-2v-7Zm0-4h2v2h-2V6Zm1 16a10 10 0 1 0-0.001-20.001A10 10 0 0 0 12 22Z" />
    </svg>
  `,
  search: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M16.5 10.5a6 6 0 1 0-12 0 6 6 0 0 0 12 0Z" />
      <path d="M15.5 15.5 20 20" />
    </svg>
  `,
  user: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
      <path d="M5 21c0-3.5 3.1-6.5 7-6.5s7 3 7 6.5" />
      <path d="M13 17a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" />
    </svg>
  `,
  link: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M10 14l-2 2a3.5 3.5 0 0 1-5 0 3.5 3.5 0 0 1 0-5l3-3a3.5 3.5 0 0 1 5 0" />
      <path d="M14 10l2-2a3.5 3.5 0 0 1 5 0 3.5 3.5 0 0 1 0 5l-3 3a3.5 3.5 0 0 1-5 0" />
    </svg>
  `,
  book: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 3h12v18H6V3Z" />
      <path d="M9 8h6M9 11h4M9 14h5" />
    </svg>
  `,
  grid: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M10 3h4v3h-4V3Z" />
      <path d="M12 6v3" />
      <path d="M5 9h14" />
      <path d="M5 9v3M19 9v3" />
      <path d="M3 12h5v3H3v-3Z" />
      <path d="M16 12h5v3h-5v-3Z" />
    </svg>
  `,
  external: `
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M14 3h7v7h-2V6.4l-8.3 8.3-1.4-1.4L17.6 5H14V3Zm-8 4h6v2H6v9h9v-6h2v8H4V7h2Z" />
    </svg>
  `
};

export const majors = [
  "Computer Science",
  "Analytics",
  "Cybersecurity",
  "Human-Computer Interaction",
  "Computational Science and Engineering",
  "Electrical and Computer Engineering",
  "Robotics",
  "Bioinformatics",
  "Other (please specify)"
];

export const courses = [
  "COMP 1006 P - Collaborative Team Skills",
  "COMP 1012 P - Deep Learning & Generative AI Essentials",
  "COMP 1016 P - Computing at Scale - Design, Ops",
  "COMP 1017 P - Developing Mobile Apps Well - Being",
  "COMP 1018 P - Animal Communication & Behavior",
  "COMP 1020 - Introduction to LLM Inference Serving Systems",
  "COMP 1021 - Physical AI: Embodied Intelligence and Real-World Interaction",
  "CS 6035 - IIS - Introduction to Information Security",
  "CS 6150 - C4G - Computing for Good",
  "CS 6200 - GIOS - Introduction to Operating Systems (CS 8803 O02)",
  "CS 6210 - AOS - Advanced Operating Systems",
  "CS 6211 - SDCC - System Design for Cloud Computing (CS 8803 O12)",
  "CS 6238 - SCS - Secure Computer Systems",
  "CS 6250 - CN - Computer Networks",
  "CS 6260 - AC - Applied Cryptography",
  "CS 6261 - SIR - Security Incident Response (CS 8803 O22)",
  "CS 6262 - NETSEC - Network Security",
  "CS 6263 - CPSS - Intro to Cyber Physical Systems Security (CS 8803 O07)",
  "CS 6264 - SND - Information Security Lab - System and Network Defenses (CS 8803 O11)",
  "CS 6265 - Information Security Lab",
  "CS 6290 - HPCA - High Performance Computer Architecture",
  "CS 6291 - ESO - Embedded Systems Optimization (CS 8803 O04)",
  "CS 6300 - SDP - Software Development Process",
  "CS 6310 - SAD - Software Architecture and Design",
  "CS 6340 - SAT - Software Analysis",
  "CS 6400 - DBS - Database Systems Concepts and Design",
  "CS 6422 - DSI - Database System Implementation",
  "CS 6435 - DHE - Digital Health Equity (CS 8803 O16)",
  "CS 6440 - IHI - Intro to Health Informatics",
  "CS 6457 - VGD - Video Game Design",
  "CS 6460 - EDTECH - Educational Technology",
  "CS 6475 - CPSS - Computational Photography",
  "CS 6476 - CV - Computer Vision",
  "CS 6491 - CG - Foundations of Computer Graphics",
  "CS 6515 - GA - Intro to Graduate Algorithms (CS 8803 GA)",
  "CS 6601 - AI - Artificial Intelligence",
  "CS 6603 - AIES - AI, Ethics, and Society (CS 8803 O10)",
  "CS 6675 - AISA - Advanced Internet Systems and Applications",
  "CS 6727 - CP - Cybersecurity Practicum (ECE)",
  "CS 6747 - AMRE - Advanced Malware Analysis",
  "CS 6750 - HCI - Human-Computer Interaction",
  "CS 6795 - ICS - Introduction to Cognitive Science",
  "CS 7210 - DC - Distributed Computing",
  "CS 7280 - NETSCI - Network Science",
  "CS 7400 - QC - Quantum Computing (CS 8803 O13)",
  "CS 7470 - MUC - Mobile & Ubiquitous Computing",
  "CS 7496 - CA - Computer Animation",
  "CS 7632 - GAI - Game AI",
  "CS 7637 - KBAI - Knowledge-Based Artificial Intelligence - Cognitive Systems",
  "CS 7638 - RAIT, AI4R - Robotics: AI Techniques (CS 8803 O01)",
  "CS 7639 - CPDA - Cyber-Physical Design and Analysis (CS 8803 O09)",
  "CS 7641 - ML - Machine Learning",
  "CS 7642 - RL - Reinforcement Learning (CS 8803 O03)",
  "CS 7643 - DL - Deep Learning",
  "CS 7646 - ML4T - Machine Learning for Trading",
  "CS 7650 - NLP - Natural Language Processing",
  "CS 8001 OAA - Agentic AI Essentials (COMP 1007 P)",
  "CS 8001 OAI - AI Reading Group",
  "CS 8001 OAS - AI for Science",
  "CS 8001 OCH - Building Applications with ChatGPT",
  "CS 8001 OCS - Computing in Python (COMP 1001 P)",
  "CS 8001 ODA - Data Structures & Algorithms (COMP 1009 P)",
  "CS 8001 ODL - NVIDIA-Certified Fundamentals of Deep Learning Workshop",
  "CS 8001 ODM - Machine Learning & Data Science Tooling",
  "CS 8001 OED - CS Educators",
  "CS 8001 OEN - Entrepreneurship",
  "CS 8001 OFL - Federated Learning and Machine Learning Operations",
  "CS 8001 OFT - Futurism Reading Group (COMP 1022)",
  "CS 8001 OGE - Global Entrepreneurship—Launch",
  "CS 8001 OGV - GVU Brown Bag",
  "CS 8001 OHD - HCI Design, Justice-Oriented Design, and Critical Computing",
  "CS 8001 OIC - Introduction to C Programming (COMP 1010 P)",
  "CS 8001 OLM - Large Language Model (COMP 1011 P)",
  "CS 8001 OLP - The Language of Proofs (COMP 1008 P)",
  "CS 8001 OLS - Learning at Scale",
  "CS 8001 OMA - Multi-Agent Systems and Collaborative Intelligence",
  "CS 8001 OML - Machine Learning for Sensor-Based Human Activity Recognition: A Research Perspective (COMP 1019 P)",
  "CS 8001 ONC - Online Communities",
  "CS 8001 OOP - Object-Oriented Programming in Java (COMP 1013 P)",
  "CS 8001 OPC - CS in Popular Culture",
  "CS 8001 OPH - PhD Applicants",
  "CS 8001 ORI - Robotics and Human-Robot Interaction (COMP 1003 P)",
  "CS 8001 ORS - PhD Research Brown Bag",
  "CS 8001 ORW - Writing Research Workshop (COMP 1004 P)",
  "CS 8001 OSO - Computational Sociology",
  "CS 8001 OST - Social Media and Technology",
  "CS 8001 OTM - TinyML and Edge AI for Vision",
  "CS 8001 OUI - Designing and Building User Interfaces",
  "CS 8001 OUS - Usable Security",
  "CS 8001 OUX - UX Design Principles with a Focus on Virtual Reality",
  "CS 8001 OWN - Women in Tech",
  "CS 8001 OWS - Wearable Sensor-Based Analysis of Activities and Well-Being",
  "CS 8803 O08 - Compilers - Theory and Practice",
  "CS 8803 O15 - LAW - Introduction to Computer Law",
  "CS 8803 O17 - GE - Global Entrepreneurship",
  "CS 8803 O20 - QH - Quantum Hardware",
  "CS 8803 O21 - GPU - GPU Hardware and Software (CS 7295)",
  "CS 8803 O23 - MIRM - Modern Internet Research Methods",
  "CS 8803 O24 - I2R - Intro to Research",
  "CS 8803 O27 - Computer Graphics in the AI Era",
  "CS 8803 O29 - Health Sensing and Interventions",
  "CSE 6040 - CDA - Computing for Data Analysis",
  "CSE 6220 - IHPC - Intro to High-Performance Computing",
  "CSE 6242 - DVA - Data and Visual Analytics",
  "CSE 6250 - BD4H - Big Data for Health Informatics",
  "CSE 6742 - MSMG - Modeling, Simulation, and Military Gaming",
  "CSE 6748 - AAP - Applied Analytics Practicum (ISYE/MGT)",
  "CSE 8803 - ANLP - Applied Natural Language Processing",
  "ECE 6374 - CPEES - Cyber-Physical Electrical Energy Systems",
  "ECE 6770 - Introduction to Cyber-Physical Systems Security (ECE 8813)",
  "ECE 8843 - Side-Channels and Their Role in Cybersecurity",
  "INTA 6003 - EM - Empirical Methods",
  "INTA 6102 - IRT - International Relations Theory",
  "INTA 6103 - IS - International Security",
  "INTA 6131 - PSI - Pacific Security Issues",
  "INTA 6450 - DAS - Data Analytics & Security",
  "INTA 8803 TAS - TAS - Technology and Statecraft",
  "INTA 8803 USN - UNSADP - US National Security and Defense Policy",
  "INTA 8813 - GWMDP - Global WMD Policy",
  "INTA 8823 - GOC - Geopolitics of Cybersecurity (PUBP)",
  "INTA 8833 - ES - European Security",
  "ISYE 6402 - TSA - Time Series Analysis",
  "ISYE 6414 - RA - Regression Analysis",
  "ISYE 6420 - BAYES - Bayesian Statistics",
  "ISYE 6501 - IAM - Intro to Analytics Modeling",
  "ISYE 6525 - HDDA - Topics on High-Dimensional Data Analytics (ISYE 8803)",
  "ISYE 6644 - SIM - Simulation",
  "ISYE 6650 - PM - Probabilistic Models",
  "ISYE 6669 - DO - Deterministic Optimization",
  "ISYE 6740 - CDA - Computational Data Analysis",
  "ISYE 7406 - DMASL - Data Mining and Statistical Learning",
  "MGT 6059 - ET - Emerging Technologies",
  "MGT 6203 - DAIB - Data Analytics in Business",
  "MGT 6311 - DM - Digital Marketing",
  "MGT 6655 - BDPAV - Business Data Preparation and Visualization",
  "MGT 6727 - PFP - Privacy for Professionals",
  "MGT 8803 - BFFA - Business Fundamentals for Analytics (MGT 6201)",
  "MGT 8813 - FM - Financial Modeling",
  "MGT 8823 - DAFCI - Data Analysis for Continuous Improvement",
  "MGT 8833 - AOUD - Analysis of Unstructured Data (MGT 6033)",
  "PUBP 6501 - IPAM - Information Policy and Management",
  "PUBP 6502 - IACP - Information and Communications Policy",
  "PUBP 6725 - ISP - Information Security Policies",
  "PUBP 8813 - PPFTDW - Public Policy for the Digital World",
  "PUBP 8823 - GC - Geopolitics of Cybersecurity",
  "PUBP 8833 - ECM - Enterprise Cybersecurity Management"
];

