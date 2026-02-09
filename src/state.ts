export type CourseDetail = {
  year: string;
  term: "spring" | "summer" | "fall" | "";
  finished: boolean;
  grade: "P" | "S" | "F" | "U" | "";
};

export const state = {
  activeKey: "home",
  majorSelected: "",
  majorOtherText: "",
  majorSaved: false,
  majorEditing: false,
  majorError: false,
  lastSavedKey: "",
  lastSavedOtherText: "",
  coursesNone: false,
  coursesSelected: new Set<string>(),
  coursesTab: "selection" as "selection" | "details",
  openYearFor: null as string | null,
  courseDetails: {} as Record<string, CourseDetail>,
  linksSaved: false,
  linksEditing: true,
  linksData: {
    linkedin: "",
    github: "",
    gatech: "",
    personal: "",
    employer: "",
    projects: "",
    research: ""
  },
  linksSavedData: {
    linkedin: "",
    github: "",
    gatech: "",
    personal: "",
    employer: "",
    projects: "",
    research: ""
  },
  personalData: {
    firstName: "",
    preferredName: "",
    middleName: "",
    lastName: "",
    gtEmail: "",
    altEmail: "",
    gtUsername: "",
    gtId: ""
  },
  personalSavedData: {
    firstName: "",
    preferredName: "",
    middleName: "",
    lastName: "",
    gtEmail: "",
    altEmail: "",
    gtUsername: "",
    gtId: ""
  },
  personalSaved: false,
  personalEditing: true,
  personalErrors: {
    firstName: false,
    lastName: false,
    gtEmail: false,
    gtUsername: false,
    gtId: false,
    altEmail: false
  },
  personalTriedSave: false
  ,
  taApplied: false,
  currentResearchProjectId: null as number | null,
  researchApplied: {} as Record<number, boolean>,
  researchFilters: {
    tab: "all" as "all" | "applied" | "not_applied",
    instructor: "",
    title: "",
    description: "",
    skills: ""
  }
};

const storageKey = "buzzme.majorState";
const navKeyStorage = "buzzme.activeNavKey";
const coursesStorageKey = "buzzme.coursesState";
const linksStorageKey = "buzzme.linksState";
const taStorageKey = "buzzme.taState";
const researchStorageKey = "buzzme.researchState";
const personalStorageKey = "buzzme.personalState";

export const loadMajorState = () => {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) {
      return;
    }
    const parsed = JSON.parse(raw) as {
      majorSelected?: string;
      majorSaved?: boolean;
      majorOtherText?: string;
      lastSavedKey?: string;
      lastSavedOtherText?: string;
      majorEditing?: boolean;
    };
    if (typeof parsed.majorSelected === "string") {
      state.majorSelected = parsed.majorSelected;
    }
    if (typeof parsed.majorOtherText === "string") {
      state.majorOtherText = parsed.majorOtherText;
    }
    if (typeof parsed.lastSavedKey === "string") {
      state.lastSavedKey = parsed.lastSavedKey;
    }
    if (typeof parsed.lastSavedOtherText === "string") {
      state.lastSavedOtherText = parsed.lastSavedOtherText;
    }
    if (typeof parsed.majorSaved === "boolean") {
      state.majorSaved = parsed.majorSaved;
    }
    if (typeof parsed.majorEditing === "boolean") {
      state.majorEditing = parsed.majorEditing;
    }
  } catch {
    // Ignore storage errors.
  }
};

export const saveMajorState = () => {
  try {
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        majorSelected: state.majorSelected,
        majorSaved: state.majorSaved,
        majorEditing: state.majorEditing,
        majorOtherText: state.majorOtherText,
        lastSavedKey: state.lastSavedKey,
        lastSavedOtherText: state.lastSavedOtherText
      })
    );
  } catch {
    // Ignore storage errors.
  }
};

export const loadCoursesState = () => {
  try {
    const raw = localStorage.getItem(coursesStorageKey);
    if (!raw) {
      return;
    }
    const parsed = JSON.parse(raw) as {
      coursesNone?: boolean;
      coursesSelected?: string[];
      courseDetails?: Record<string, CourseDetail>;
      coursesTab?: "selection" | "details";
    };
    if (typeof parsed.coursesNone === "boolean") {
      state.coursesNone = parsed.coursesNone;
    }
    if (Array.isArray(parsed.coursesSelected)) {
      state.coursesSelected = new Set(parsed.coursesSelected);
    }
    if (parsed.courseDetails && typeof parsed.courseDetails === "object") {
      state.courseDetails = parsed.courseDetails;
    }
    if (parsed.coursesTab === "selection" || parsed.coursesTab === "details") {
      state.coursesTab = parsed.coursesTab;
    }
  } catch {
    // Ignore storage errors.
  }
};

export const saveCoursesState = () => {
  try {
    localStorage.setItem(
      coursesStorageKey,
      JSON.stringify({
        coursesNone: state.coursesNone,
        coursesSelected: Array.from(state.coursesSelected),
        courseDetails: state.courseDetails,
        coursesTab: state.coursesTab
      })
    );
  } catch {
    // Ignore storage errors.
  }
};

export const loadLinksState = () => {
  try {
    const raw = localStorage.getItem(linksStorageKey);
    if (!raw) {
      return;
    }
    const parsed = JSON.parse(raw) as {
      linksSaved?: boolean;
      linksEditing?: boolean;
      linksData?: typeof state.linksData;
      linksSavedData?: typeof state.linksSavedData;
    };
    if (typeof parsed.linksSaved === "boolean") {
      state.linksSaved = parsed.linksSaved;
    }
    if (typeof parsed.linksEditing === "boolean") {
      state.linksEditing = parsed.linksEditing;
    }
    if (parsed.linksData) {
      state.linksData = { ...state.linksData, ...parsed.linksData };
    }
    if (parsed.linksSavedData) {
      state.linksSavedData = { ...state.linksSavedData, ...parsed.linksSavedData };
    }
    if (typeof parsed.linksSaved === "boolean") {
      state.linksSaved = parsed.linksSaved;
    }
    if (typeof parsed.linksEditing === "boolean") {
      state.linksEditing = parsed.linksEditing;
    }
  } catch {
    // Ignore storage errors.
  }
};

export const saveLinksState = () => {
  try {
    localStorage.setItem(
      linksStorageKey,
      JSON.stringify({
        linksSaved: state.linksSaved,
        linksEditing: state.linksEditing,
        linksData: state.linksData,
        linksSavedData: state.linksSavedData
      })
    );
  } catch {
    // Ignore storage errors.
  }
};

export const loadTaState = () => {
  try {
    const raw = localStorage.getItem(taStorageKey);
    if (!raw) {
      return;
    }
    const parsed = JSON.parse(raw) as { taApplied?: boolean };
    if (typeof parsed.taApplied === "boolean") {
      state.taApplied = parsed.taApplied;
    }
  } catch {
    // Ignore storage errors.
  }
};

export const saveTaState = () => {
  try {
    localStorage.setItem(taStorageKey, JSON.stringify({ taApplied: state.taApplied }));
  } catch {
    // Ignore storage errors.
  }
};

export const loadResearchState = () => {
  try {
    const raw = localStorage.getItem(researchStorageKey);
    if (!raw) {
      return;
    }
    const parsed = JSON.parse(raw) as {
      researchApplied?: Record<number, boolean>;
      researchFilters?: typeof state.researchFilters;
    };
    if (parsed.researchApplied) {
      state.researchApplied = parsed.researchApplied;
    }
    if (parsed.researchFilters) {
      state.researchFilters = { ...state.researchFilters, ...parsed.researchFilters };
    }
  } catch {
    // Ignore storage errors.
  }
};

export const saveResearchState = () => {
  try {
    localStorage.setItem(
      researchStorageKey,
      JSON.stringify({
        researchApplied: state.researchApplied,
        researchFilters: state.researchFilters
      })
    );
  } catch {
    // Ignore storage errors.
  }
};

export const loadPersonalState = () => {
  try {
    const raw = localStorage.getItem(personalStorageKey);
    if (!raw) {
      return;
    }
    const parsed = JSON.parse(raw) as {
      personalSaved?: boolean;
      personalEditing?: boolean;
      personalData?: typeof state.personalData;
      personalSavedData?: typeof state.personalSavedData;
    };
    if (typeof parsed.personalSaved === "boolean") {
      state.personalSaved = parsed.personalSaved;
    }
    if (typeof parsed.personalEditing === "boolean") {
      state.personalEditing = parsed.personalEditing;
    }
    if (parsed.personalData) {
      state.personalData = { ...state.personalData, ...parsed.personalData };
    }
    if (parsed.personalSavedData) {
      state.personalSavedData = { ...state.personalSavedData, ...parsed.personalSavedData };
    }
  } catch {
    // Ignore storage errors.
  }
};

export const savePersonalState = () => {
  try {
    localStorage.setItem(
      personalStorageKey,
      JSON.stringify({
        personalSaved: state.personalSaved,
        personalEditing: state.personalEditing,
        personalData: state.personalData,
        personalSavedData: state.personalSavedData
      })
    );
  } catch {
    // Ignore storage errors.
  }
};

export const getActiveKeyFromPath = () => {
  const path = window.location.pathname.toLowerCase();
  if (path.startsWith("/research/about")) {
    return "research-about";
  }
  if (path.startsWith("/ta/about")) {
    return "ta-eligibility";
  }
  if (path === "/apply/" || path === "/apply") {
    return "ta-apply";
  }
  if (path.startsWith("/research/project/search")) {
    state.currentResearchProjectId = null;
    return "research-projects";
  }
  if (path.startsWith("/profile/identification/")) {
    const rest = path.replace("/profile/identification/", "").trim();
    if (rest === "edit") {
      state.personalEditing = true;
    }
    return "profile-personal";
  }
  if (path.startsWith("/research/project/")) {
    const parts = path.split("/").filter(Boolean);
    const idPart = parts[2];
    const id = Number(idPart);
    if (!Number.isNaN(id)) {
      state.currentResearchProjectId = id;
      return "research-project-detail";
    }
  }
  if (path.startsWith("/profile/")) {
    const rest = path.replace("/profile/", "").trim();
    if (!rest) {
      return "";
    }
    if (rest.endsWith("/edit")) {
      const slug = rest.replace("/edit", "");
      if (slug) {
        if (slug === "major") {
          state.majorEditing = true;
        }
        if (slug === "links") {
          state.linksEditing = true;
        }
        return `profile-${slug}`;
      }
    }
    return `profile-${rest}`;
  }
  return "";
};

export const updatePathForKey = (key: string) => {
  if (key === "research-about") {
    window.history.pushState({}, "", "/research/about/");
    return;
  }
  if (key === "ta-eligibility") {
    window.history.pushState({}, "", "/ta/about");
    return;
  }
  if (key === "ta-apply") {
    window.history.pushState({}, "", "/apply/");
    return;
  }
  if (key === "research-projects") {
    window.history.pushState({}, "", "/research/project/search/");
    return;
  }
  if (key === "research-project-detail" && state.currentResearchProjectId) {
    window.history.pushState({}, "", `/research/project/${state.currentResearchProjectId}/`);
    return;
  }
  if (key.startsWith("profile-")) {
    const slug = key.replace("profile-", "");
    if (slug === "personal") {
      if (state.personalEditing) {
        window.history.pushState({}, "", "/profile/identification/edit");
        return;
      }
      window.history.pushState({}, "", "/profile/identification/");
      return;
    }
    if (slug === "major" && state.majorEditing) {
      window.history.pushState({}, "", `/profile/${slug}/edit`);
      return;
    }
    if (slug === "links" && state.linksEditing) {
      window.history.pushState({}, "", `/profile/${slug}/edit`);
      return;
    }
    window.history.pushState({}, "", `/profile/${slug}`);
    return;
  }
  window.history.pushState({}, "", "/");
};

export const loadActiveKey = () => {
  const fromPath = getActiveKeyFromPath();
  if (fromPath) {
    state.activeKey = fromPath;
    return;
  }
  const stored = localStorage.getItem(navKeyStorage);
  if (stored) {
    state.activeKey = stored;
  }
};

export const saveActiveKey = () => {
  localStorage.setItem(navKeyStorage, state.activeKey);
  updatePathForKey(state.activeKey);
};

export const normalizeMajorOnLeave = () => {
  if (state.activeKey !== "profile-major" && !state.majorSaved) {
    const savedKey = state.lastSavedKey || state.majorSelected;
    if (savedKey && savedKey.trim()) {
      state.majorSaved = true;
      state.majorEditing = false;
      state.majorSelected = savedKey;
      state.majorOtherText = state.lastSavedOtherText || state.majorOtherText;
      saveMajorState();
    }
  }
};

export const hasSavedLinksData = () => {
  const values = [
    state.linksSavedData.linkedin,
    state.linksSavedData.github,
    state.linksSavedData.gatech,
    state.linksSavedData.personal,
    state.linksSavedData.employer,
    state.linksSavedData.projects,
    state.linksSavedData.research
  ];
  return values.some((value) => value.trim().length > 0);
};
