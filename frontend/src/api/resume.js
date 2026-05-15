const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const optimizeResumeUpload = async (file, jobDescription, includeCoverLetter = false) => {
    const formData = new FormData();
    formData.append('resume', file);
    if (jobDescription) formData.append('jobDescription', jobDescription);
    formData.append('include_cover_letter', String(includeCoverLetter));

    const response = await fetch(`${API_BASE_URL}/api/optimize-resume/upload`, {
        method: 'POST',
        headers: getAuthHeaders(), // Don't set Content-Type for FormData, browser does it
        body: formData
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Optimization failed');
    return data;
};

export const getResultsHistory = async () => {
    const response = await fetch(`${API_BASE_URL}/api/results`, {
        headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch history');
    return data.data;
};

export const getResultById = async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/results/${id}`, {
        headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch result');
    return data.data;
};
