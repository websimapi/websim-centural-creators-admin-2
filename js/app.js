import { createApp } from 'vue';
import apiService from './api-service.js';
import databaseService from './database-service.js';
import aiAnalysisService from './ai-analysis-service.js';

// Initialize the Vue application
const app = createApp({
  data() {
    return {
      currentView: 'dashboard',
      user: {
        id: 1,
        name: '@api',
        role: 'admin'
      },
      stats: {
        totalApplicants: 0,
        pendingReview: 0,
        approved: 0,
        rejected: 0
      },
      recentActivity: [],
      applicants: [],
      filters: {
        search: '',
        status: '',
        sortBy: 'date'
      },
      currentPage: 1,
      itemsPerPage: 10,
      selectedApplicant: null,
      selectedApplicantForAnalysis: '',
      analysisInProgress: false,
      analysisResults: null,
      settings: {
        minThreshold: 75,
        analysisDepth: 'standard',
        notifyNewApplicants: true,
        notifyAnalysisComplete: true,
        apiKey: 'sk_test_centural_creators_api_key',
        apiEndpoint: 'https://api.centrural.com/v1/'
      },
      isLoading: true,
      error: null
    }
  },
  computed: {
    filteredApplicants() {
      let filtered = [...this.applicants];

      // Apply search filter
      if (this.filters.search) {
        const searchLower = this.filters.search.toLowerCase();
        filtered = filtered.filter(app => 
          app.name.toLowerCase().includes(searchLower) || 
          app.email.toLowerCase().includes(searchLower)
        );
      }

      // Apply status filter
      if (this.filters.status) {
        filtered = filtered.filter(app => app.status === this.filters.status);
      }

      // Apply sorting
      if (this.filters.sortBy === 'date') {
        filtered.sort((a, b) => new Date(b.appliedDate) - new Date(a.appliedDate));
      } else if (this.filters.sortBy === 'name') {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
      } else if (this.filters.sortBy === 'score') {
        filtered.sort((a, b) => b.aiScore - a.aiScore);
      }

      return filtered;
    },
    totalPages() {
      return Math.ceil(this.filteredApplicants.length / this.itemsPerPage);
    },
    paginatedApplicants() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredApplicants.slice(start, end);
    }
  },
  methods: {
    async initializeServices() {
      try {
        this.isLoading = true;

        // Initialize the database service
        await databaseService.init();
        console.log('Database service initialized');

        // Initialize the API service with API key from settings
        apiService.init(this.settings.apiKey);

        // Initialize the AI Analysis service
        await aiAnalysisService.init();

        // Load initial data
        await this.loadData();

        this.isLoading = false;
      } catch (error) {
        console.error('Failed to initialize services:', error);
        this.error = 'Failed to initialize the application. Please refresh and try again.';
        this.isLoading = false;
      }
    },

    async loadData() {
      try {
        // Load applicants
        this.applicants = await databaseService.getAll(databaseService.collections.applicants);

        // Load stats
        this.stats = await databaseService.getDashboardStats();

        // Load recent activity
        this.recentActivity = await databaseService.getAll(databaseService.collections.activity);

        // Load settings
        const settingsData = await databaseService.getAll(databaseService.collections.settings);
        if (settingsData && settingsData.length > 0) {
          this.settings = { ...this.settings, ...settingsData[0] };
        }

        // Initialize charts after data is loaded
        this.$nextTick(() => {
          this.initCharts();
        });
      } catch (error) {
        console.error('Failed to load data:', error);
        this.error = 'Failed to load data. Please refresh and try again.';
      }
    },

    async refreshData() {
      // Reload data when needed (e.g., after operations)
      await this.loadData();
    },

    logout() {
      // In a real app, this would call an authentication service
      alert('Logout functionality would be implemented here');
    },

    formatDate(dateString) {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(date);
    },

    formatTime(dateString) {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    },

    getScoreClass(score) {
      if (score >= 80) return 'high';
      if (score >= 60) return 'medium';
      return 'low';
    },

    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },

    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },

    async viewApplicant(id) {
      try {
        // Get applicant details
        const applicant = await databaseService.getById(databaseService.collections.applicants, id);
        this.selectedApplicant = applicant;
      } catch (error) {
        console.error('Failed to load applicant details:', error);
        alert('Failed to load applicant details. Please try again.');
      }
    },

    async updateApplicantStatus() {
      if (!this.selectedApplicant) return;

      try {
        // Update applicant status in database
        await databaseService.update(
          databaseService.collections.applicants, 
          this.selectedApplicant.id, 
          { status: this.selectedApplicant.status }
        );

        // Log activity
        await databaseService.logActivity({
          description: `${this.selectedApplicant.name} application status changed to ${this.selectedApplicant.status} by ${this.user.name}`
        });

        // Refresh data
        await this.refreshData();

        // Close modal
        this.selectedApplicant = null;

        alert('Applicant status updated successfully');
      } catch (error) {
        console.error('Failed to update applicant status:', error);
        alert('Failed to update status. Please try again.');
      }
    },

    async saveNotes() {
      if (!this.selectedApplicant) return;

      try {
        // Update applicant notes in database
        await databaseService.update(
          databaseService.collections.applicants, 
          this.selectedApplicant.id, 
          { notes: this.selectedApplicant.notes }
        );

        // Log activity
        await databaseService.logActivity({
          description: `Notes updated for ${this.selectedApplicant.name} by ${this.user.name}`
        });

        alert('Notes saved successfully');
      } catch (error) {
        console.error('Failed to save notes:', error);
        alert('Failed to save notes. Please try again.');
      }
    },

    async runAnalysis() {
      if (!this.selectedApplicantForAnalysis) return;

      try {
        this.analysisInProgress = true;
        this.analysisResults = null;

        // Get the applicant data
        const applicant = await databaseService.getById(
          databaseService.collections.applicants, 
          this.selectedApplicantForAnalysis
        );

        // Run AI analysis
        const analysisResults = await aiAnalysisService.analyzePortfolio(applicant, {
          depth: this.settings.analysisDepth
        });

        // Log activity
        await databaseService.logActivity({
          description: `AI analysis completed for ${applicant.name} by ${this.user.name}`
        });

        // Update applicant with new AI score
        await databaseService.update(
          databaseService.collections.applicants, 
          applicant.id, 
          { aiScore: analysisResults.overallScore }
        );

        // Refresh data
        await this.refreshData();

        // Show results
        this.analysisResults = analysisResults;
        this.analysisInProgress = false;
      } catch (error) {
        console.error('Failed to run analysis:', error);
        alert('Failed to complete analysis. Please try again.');
        this.analysisInProgress = false;
      }
    },

    viewFullAnalysis(applicantId) {
      this.currentView = 'analysis';
      this.selectedApplicantForAnalysis = applicantId;
      this.runAnalysis();
    },

    getApplicantName(id) {
      const applicant = this.applicants.find(a => a.id == id);
      return applicant ? applicant.name : '';
    },

    async saveSettings() {
      try {
        // Save settings to database
        await databaseService.update(
          databaseService.collections.settings, 
          1, // Assuming a single settings document with ID 1
          this.settings
        );

        // Update API service with new API key if changed
        apiService.init(this.settings.apiKey);

        // Log activity
        await databaseService.logActivity({
          description: `System settings updated by ${this.user.name}`
        });

        alert('Settings saved successfully');
      } catch (error) {
        console.error('Failed to save settings:', error);
        alert('Failed to save settings. Please try again.');
      }
    },

    initCharts() {
      // Import Chart.js dynamically
      import('chart.js').then((ChartModule) => {
        const Chart = ChartModule.default;

        // Applications Over Time Chart
        const appCtx = document.getElementById('applicationsChart');
        if (appCtx) {
          const appChart = new Chart(appCtx.getContext('2d'), {
            type: 'line',
            data: {
              labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
              datasets: [{
                label: 'Applications',
                data: [12, 19, 25, 16, 31, 24],
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                tension: 0.4,
                fill: true
              }]
            },
            options: {
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: false
                }
              }
            }
          });
        }

        // Approval Rate Chart
        const rateCtx = document.getElementById('approvalRateChart');
        if (rateCtx) {
          const rateChart = new Chart(rateCtx.getContext('2d'), {
            type: 'doughnut',
            data: {
              labels: ['Approved', 'Rejected', 'Pending/Reviewing'],
              datasets: [{
                data: [
                  this.stats.approved || 0,
                  this.stats.rejected || 0,
                  (this.stats.pendingReview || 0) + (this.stats.reviewing || 0)
                ],
                backgroundColor: [
                  'rgba(46, 204, 113, 0.8)',
                  'rgba(231, 76, 60, 0.8)',
                  'rgba(52, 152, 219, 0.8)'
                ],
                borderWidth: 0
              }]
            },
            options: {
              responsive: true,
              plugins: {
                legend: {
                  position: 'right',
                }
              }
            }
          });
        }
      }).catch(error => {
        console.error('Failed to load Chart.js', error);
      });
    }
  },
  async mounted() {
    // Initialize services and load data when the component is mounted
    await this.initializeServices();
  }
});

// Mount the app
app.mount('#app');