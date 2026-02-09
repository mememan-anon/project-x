import { createClient } from "@supabase/supabase-js";
import { state } from "./state";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

const isSupabaseReady = () => Boolean(supabaseUrl && supabaseAnonKey);
const getSupabaseConfig = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }
  return { supabaseUrl, supabaseAnonKey };
};

export const supabase = isSupabaseReady()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false }
    })
  : null;

const userIdStorageKey = "buzzme.userId";

export const getUserId = () => {
  const existing = localStorage.getItem(userIdStorageKey);
  if (existing) {
    return existing;
  }
  const fresh = crypto.randomUUID();
  localStorage.setItem(userIdStorageKey, fresh);
  return fresh;
};

const safeExec = async <T>(fn: () => PromiseLike<T>) => {
  try {
    return await fn();
  } catch (error) {
    console.warn("Supabase error:", error);
    return null;
  }
};

export const loadSupabaseState = async () => {
  if (!supabase) {
    return false;
  }
  const userId = getUserId();
  let hasData = false;

  const [profileRes, linksRes, majorRes, taRes, coursesRes, projectRes] = await Promise.all([
    safeExec(() => supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle()),
    safeExec(() => supabase.from("links").select("*").eq("user_id", userId).maybeSingle()),
    safeExec(() => supabase.from("majors").select("*").eq("user_id", userId).maybeSingle()),
    safeExec(() => supabase.from("ta_applications").select("*").eq("user_id", userId).maybeSingle()),
    safeExec(() => supabase.from("courses").select("*").eq("user_id", userId)),
    safeExec(() => supabase.from("project_applications").select("*").eq("user_id", userId))
  ]);

  const profile = profileRes?.data;
  if (profile) {
    hasData = true;
    state.personalSavedData = {
      firstName: profile.first_name ?? "",
      preferredName: profile.preferred_name ?? "",
      middleName: profile.middle_name ?? "",
      lastName: profile.last_name ?? "",
      gtEmail: profile.gt_email ?? "",
      altEmail: profile.alt_email ?? "",
      gtUsername: profile.gt_username ?? "",
      gtId: profile.gt_id ?? ""
    };
    state.personalData = { ...state.personalSavedData };
    state.personalSaved = true;
  }

  const links = linksRes?.data;
  if (links) {
    hasData = true;
    state.linksSavedData = {
      linkedin: links.linkedin ?? "",
      github: links.github ?? "",
      gatech: links.gatech ?? "",
      personal: links.personal ?? "",
      employer: links.employer ?? "",
      projects: links.projects ?? "",
      research: links.research ?? ""
    };
    state.linksData = { ...state.linksSavedData };
    state.linksSaved = true;
  }

  const major = majorRes?.data;
  if (major) {
    hasData = true;
    state.majorSelected = major.selected_major ?? "";
    state.majorOtherText = major.other_text ?? "";
    state.lastSavedKey = major.selected_major ?? "";
    state.lastSavedOtherText = major.other_text ?? "";
    state.majorSaved = true;
  }

  const ta = taRes?.data;
  if (ta) {
    hasData = true;
    state.taApplied = !!ta.applied;
  }

  const courses = coursesRes?.data;
  if (Array.isArray(courses)) {
    if (courses.length) {
      hasData = true;
    }
    const selected = new Set<string>();
    const details: typeof state.courseDetails = {};
    let hasNone = false;

    courses.forEach((row) => {
      const courseCode = String(row.course_code || "").trim();
      if (!courseCode) {
        return;
      }
      if (courseCode === "__NONE__") {
        hasNone = !!row.selected;
        return;
      }
      if (row.selected) {
        selected.add(courseCode);
      }
      details[courseCode] = {
        year: row.year ?? "",
        term: row.term ?? "",
        finished: !!row.finished,
        grade: row.grade ?? ""
      };
    });

    state.coursesSelected = selected;
    state.courseDetails = details;
    state.coursesNone = hasNone;
  }

  const projectApps = projectRes?.data;
  if (Array.isArray(projectApps)) {
    if (projectApps.length) {
      hasData = true;
    }
    const applied: Record<number, boolean> = {};
    projectApps.forEach((row) => {
      if (row.project_id != null) {
        applied[Number(row.project_id)] = !!row.applied;
      }
    });
    state.researchApplied = applied;
  }

  return hasData;
};

export const persistPersonalState = async () => {
  if (!supabase) {
    return;
  }
  const userId = getUserId();
  await safeExec(() =>
    supabase
      .from("profiles")
      .upsert(
        {
          user_id: userId,
          first_name: state.personalSavedData.firstName,
          preferred_name: state.personalSavedData.preferredName,
          middle_name: state.personalSavedData.middleName,
          last_name: state.personalSavedData.lastName,
          gt_email: state.personalSavedData.gtEmail,
          alt_email: state.personalSavedData.altEmail,
          gt_username: state.personalSavedData.gtUsername,
          gt_id: state.personalSavedData.gtId
        },
        { onConflict: "user_id" }
      )
  );
};

export const persistLinksState = async () => {
  if (!supabase) {
    return;
  }
  const userId = getUserId();
  await safeExec(() =>
    supabase
      .from("links")
      .upsert(
        {
          user_id: userId,
          linkedin: state.linksSavedData.linkedin,
          github: state.linksSavedData.github,
          gatech: state.linksSavedData.gatech,
          personal: state.linksSavedData.personal,
          employer: state.linksSavedData.employer,
          projects: state.linksSavedData.projects,
          research: state.linksSavedData.research
        },
        { onConflict: "user_id" }
      )
  );
};

export const persistMajorState = async () => {
  if (!supabase) {
    return;
  }
  const userId = getUserId();
  await safeExec(() =>
    supabase
      .from("majors")
      .upsert(
        {
          user_id: userId,
          selected_major: state.majorSelected,
          other_text: state.majorOtherText
        },
        { onConflict: "user_id" }
      )
  );
};

export const persistCoursesState = async () => {
  if (!supabase) {
    return;
  }
  const userId = getUserId();

  await safeExec(() => supabase.from("courses").delete().eq("user_id", userId));

  const rows = Array.from(state.coursesSelected).map((course) => {
    const detail = state.courseDetails[course] ?? {
      year: "",
      term: "",
      finished: false,
      grade: ""
    };
    return {
      user_id: userId,
      course_code: course,
      selected: true,
      year: detail.year || null,
      term: detail.term || null,
      finished: detail.finished,
      grade: detail.grade || null
    };
  });

  if (state.coursesNone) {
    rows.push({
      user_id: userId,
      course_code: "__NONE__",
      selected: true,
      year: null,
      term: null,
      finished: false,
      grade: null
    });
  }

  if (rows.length) {
    await safeExec(() => supabase.from("courses").insert(rows));
  }
};

export const persistTaState = async () => {
  if (!supabase) {
    return;
  }
  const userId = getUserId();
  await safeExec(() =>
    supabase
      .from("ta_applications")
      .upsert(
        {
          user_id: userId,
          applied: state.taApplied
        },
        { onConflict: "user_id" }
      )
  );
};

export const persistProjectApplications = async () => {
  if (!supabase) {
    return;
  }
  const userId = getUserId();
  await safeExec(() => supabase.from("project_applications").delete().eq("user_id", userId));

  const rows = Object.entries(state.researchApplied)
    .filter(([, applied]) => applied)
    .map(([projectId]) => ({
      user_id: userId,
      project_id: Number(projectId),
      applied: true
    }));

  if (rows.length) {
    await safeExec(() => supabase.from("project_applications").insert(rows));
  }
};

export const logProjectClick = async (projectId: number, linkType: string) => {
  if (!supabase) {
    return;
  }
  const userId = getUserId();
  await safeExec(() =>
    supabase.from("project_detail_clicks").insert({
      user_id: userId,
      project_id: projectId,
      link_type: linkType
    })
  );
};

export const logPageView = async (pageKey: string, urlPath: string, userAgent: string) => {
  if (!supabase) {
    return;
  }
  const config = getSupabaseConfig();
  if (!config) {
    return;
  }
  const userId = getUserId();
  const functionUrl = `${config.supabaseUrl}/functions/v1/log_page_view`;
  const payload = {
    user_id: userId,
    page_key: pageKey,
    url_path: urlPath,
    user_agent: userAgent
  };

  try {
    const res = await fetch(functionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: config.supabaseAnonKey,
        Authorization: `Bearer ${config.supabaseAnonKey}`
      },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      return;
    }
  } catch {
    // fall through to direct insert
  }

  await safeExec(() =>
    supabase.from("page_views").insert({
      user_id: userId,
      page_key: pageKey,
      url_path: urlPath,
      user_agent: userAgent
    })
  );
};
