/**
 * API Service for Centural Creators Admin Panel
 * Handles all API requests to the backend
 */
 
class ApiService {
    constructor() {
        this.baseUrl = 'https://api.centrural.com/v1'; // Would be configurable in production
        this.apiKey = null;
        this.defaultHeaders = {
            'Content-Type': 'application/json'
        };
    }

    /**
     * Initialize the API service with authentication
     * @param {string} apiKey - The API key for authentication
     */
    init(apiKey) {
        this.apiKey = apiKey;
        this.defaultHeaders['Authorization'] = `Bearer ${apiKey}`;
        console.log('API Service initialized');
    }

    /**
     * Make a request to the API
     * @param {string} endpoint - The API endpoint
     * @param {string} method - The HTTP method
     * @param {Object} data - The request payload
     * @returns {Promise} - The response promise
     */
    async request(endpoint, method = 'GET', data = null) {
        if (!this.apiKey) {
            throw new Error('API Service not initialized with API key');
        }

        const url = `${this.baseUrl}${endpoint}`;
        const options = {
            method,
            headers: this.defaultHeaders,
            credentials: 'include'
        };

        if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'API request failed');
            }
            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Applicant Management Methods

    /**
     * Get all applicants with optional filters
     * @param {Object} filters - Filter parameters
     * @returns {Promise<Array>} - List of applicants
     */
    async getApplicants(filters = {}) {
        const queryParams = new URLSearchParams(filters).toString();
        const endpoint = `/applicants${queryParams ? '?' + queryParams : ''}`;
        return this.request(endpoint);
    }

    /**
     * Get a specific applicant by ID
     * @param {number} id - The applicant ID
     * @returns {Promise<Object>} - The applicant data
     */
    async getApplicant(id) {
        return this.request(`/applicants/${id}`);
    }

    /**
     * Update an applicant's status
     * @param {number} id - The applicant ID
     * @param {string} status - The new status
     * @returns {Promise<Object>} - The updated applicant
     */
    async updateApplicantStatus(id, status) {
        return this.request(`/applicants/${id}/status`, 'PATCH', { status });
    }

    /**
     * Add notes to an applicant
     * @param {number} id - The applicant ID
     * @param {string} notes - The notes to add
     * @returns {Promise<Object>} - The updated applicant
     */
    async updateApplicantNotes(id, notes) {
        return this.request(`/applicants/${id}/notes`, 'PATCH', { notes });
    }

    // AI Analysis Methods

    /**
     * Run AI analysis on an applicant's portfolio
     * @param {number} applicantId - The applicant ID
     * @param {Object} options - Analysis options
     * @returns {Promise<Object>} - The analysis results
     */
    async runAnalysis(applicantId, options = {}) {
        return this.request(`/analysis/run`, 'POST', {
            applicantId,
            depth: options.depth || 'standard',
            aspectsToAnalyze: options.aspects || ['technical', 'creativity', 'codeQuality', 'design']
        });
    }

    /**
     * Get analysis results for an applicant
     * @param {number} applicantId - The applicant ID
     * @returns {Promise<Object>} - The analysis results
     */
    async getAnalysisResults(applicantId) {
        return this.request(`/analysis/results/${applicantId}`);
    }

    // Dashboard Statistics Methods

    /**
     * Get dashboard statistics
     * @param {Object} options - Options for statistics
     * @returns {Promise<Object>} - The dashboard statistics
     */
    async getDashboardStats(options = {}) {
        return this.request('/stats/dashboard', 'GET');
    }

    /**
     * Get application trend data for charts
     * @param {string} period - The time period (week, month, year)
     * @returns {Promise<Object>} - The trend data
     */
    async getApplicationTrends(period = 'month') {
        return this.request(`/stats/trends?period=${period}`);
    }

    // Activity Methods

    /**
     * Get recent activity logs
     * @param {number} limit - Number of records to return
     * @returns {Promise<Array>} - The activity logs
     */
    async getRecentActivity(limit = 10) {
        return this.request(`/activity?limit=${limit}`);
    }

    // Settings Methods

    /**
     * Get system settings
     * @returns {Promise<Object>} - The system settings
     */
    async getSettings() {
        return this.request('/settings');
    }

    /**
     * Update system settings
     * @param {Object} settings - The settings to update
     * @returns {Promise<Object>} - The updated settings
     */
    async updateSettings(settings) {
        return this.request('/settings', 'PATCH', settings);
    }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;