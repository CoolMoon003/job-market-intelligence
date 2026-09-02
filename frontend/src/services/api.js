import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const analyzeCareer = async (resumeFile, targetRoles) => {
  const formData = new FormData();
  formData.append("file", resumeFile);
  formData.append("target_roles", targetRoles);

  const response = await api.post("/analyze-career", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};
export const getJobAnalysis = async (jobId, skills) => {
  const response = await api.post(`/job-analysis/${jobId}`, {
    skills: skills,
  });

  return response.data;
};
export const getStats = async () => {
  const response = await api.get("/stats");
  return response.data;
};

export const getRecentJobs = async () => {
  const response = await api.get("/jobs?page=1&size=5");
  return response.data;
};
export const getTopSkills = async () => {
  const response = await api.get("/stats/skills");
  return response.data;
};
export const getCompanyDistribution = async () => {
  const res = await api.get("/stats/company-distribution");
  return res.data;
};
export const getLocations = async () => {
  const response = await api.get("/stats/locations");
  return response.data;
};

export const getCountries = async () => {
  const response = await api.get("/stats/countries");
  return response.data;
};

export const getStates = async (country) => {
  const response = await api.get(`/stats/states/${country}`);
  return response.data;
};

// Cities directly under a country (no state) - for countries like
// United States, United Kingdom, Japan, Singapore that don't have
// meaningful state-level data.
export const getCitiesByCountry = async (country) => {
  const response = await api.get(`/stats/cities/${country}`);
  return response.data;
};

// Cities under a specific state (India flow: country + state -> cities)
export const getCities = async (country, state) => {
  const response = await api.get(`/stats/cities/${country}/${state}`);
  return response.data;
};

// Powers the navbar search bar
export const searchJobs = async (query) => {
  const response = await api.get("/jobs/search", {
    params: { q: query, limit: 8 },
  });
  return response.data;
};

// Actual job listings filtered by location/company/source (not just counts)
export const getJobsByLocation = async (country, state, page = 1, size = 20) => {
  const response = await api.get("/jobs/by-location", {
    params: { country, state: state || undefined, page, size },
  });
  return response.data;
};

export const getJobsByCompany = async (company, page = 1, size = 20) => {
  const response = await api.get("/jobs/by-company", {
    params: { company, page, size },
  });
  return response.data;
};

export const getJobsBySource = async (source, page = 1, size = 20) => {
  const response = await api.get("/jobs/by-source", {
    params: { source, page, size },
  });
  return response.data;
};

// Admin scraper controls. `endpoint` must match the backend route segment
// exactly (note: Amazon is capitalized on the backend - /admin/update-jobs/Amazon)
export const runScraperUpdate = async (endpoint) => {
  const response = await api.post(`/admin/update-jobs/${endpoint}`);
  return response.data;
};

export const runAllScrapers = async () => {
  const response = await api.post(`/admin/update-jobs/all`);
  return response.data;
};

export default api;