// Define the database schema
const schema = {
  // Define the applicants collection
  applicants: {
    id: "Number | String", // Unique identifier for the applicant
    name: "String", // Full name of the applicant
    email: "String", // Contact email
    appliedDate: "Date", // When the application was submitted
    portfolioUrl: "String", // URL to the applicant's portfolio
    socialLinks: { // Optional social media profiles
      github: "String",
      linkedin: "String",
      twitter: "String",
      behance: "String",
      dribbble: "String"
    },
    skills: ["String"], // Array of skills claimed by the applicant
    experience: "String", // Experience level (junior, mid, senior)
    aiScore: "Number", // Overall AI-generated score (0-100)
    status: "String", // Current status (pending, reviewing, approved, rejected)
    notes: "String", // Admin notes about this applicant
    reviewerId: "Number | String", // ID of admin who last reviewed this application
    reviewDate: "Date", // When the application was last reviewed
    tags: ["String"], // Optional tags for categorization
    createdAt: "Date", // Record creation timestamp
    updatedAt: "Date" // Record last update timestamp
  },

  // Define the analysis_results collection
  analysis_results: {
    id: "Number | String", // Unique identifier for the analysis
    applicantId: "Number | String", // Reference to the applicant
    timestamp: "Date", // When the analysis was performed
    technicalScore: "Number", // Score for technical skills (0-100)
    creativityScore: "Number", // Score for creativity (0-100)
    codeQualityScore: "Number", // Score for code quality (0-100)
    designScore: "Number", // Score for design skills (0-100)
    overallScore: "Number", // Weighted average of all scores (0-100)
    summary: "String", // AI-generated summary of the analysis
    details: [{ // Detailed breakdown of the analysis
      title: "String", // Section title (e.g., "Technical Assessment")
      content: "String" // Detailed content for this section
    }],
    codeAnalysis: [{ // Analysis of specific code samples
      language: "String", // Programming language
      quality: "Number", // Code quality score (0-100)
      complexity: "Number", // Code complexity score (0-100)
      maintainability: "Number", // Maintainability score (0-100)
      issues: ["String"], // Identified issues
      strengths: ["String"] // Identified strengths
    }],
    designAnalysis: { // Analysis of design aspects
      visualAppeal: "Number", // Visual appeal score (0-100)
      usability: "Number", // Usability score (0-100)
      accessibility: "Number", // Accessibility score (0-100)
      responsiveness: "Number", // Responsiveness score (0-100)
      strengths: ["String"], // Design strengths
      improvements: ["String"] // Areas for improvement
    },
    depth: "String", // Analysis depth (basic, standard, deep)
    version: "String", // Version of the AI model used
    createdAt: "Date", // Record creation timestamp
    processingTime: "Number" // Time taken to complete analysis (ms)
  },

  // Define the activity_logs collection
  activity_logs: {
    id: "Number | String", // Unique identifier for the activity
    timestamp: "Date", // When the activity occurred
    userId: "Number | String", // ID of the user who performed the action
    userName: "String", // Name of the user who performed the action
    action: "String", // Type of action (e.g., "update_status", "run_analysis")
    resource: "String", // Resource affected (e.g., "applicant", "settings")
    resourceId: "Number | String", // ID of the affected resource
    description: "String", // Human-readable description of the activity
    details: "Object", // Additional details specific to the action
    ipAddress: "String", // IP address of the user
    userAgent: "String" // User agent of the browser/client
  },

  // Define the system_settings collection
  system_settings: {
    id: "Number | String", // Unique identifier for settings record
    minThreshold: "Number", // Minimum approval threshold score (0-100)
    analysisDepth: "String", // Default analysis depth (basic, standard, deep)
    notifyNewApplicants: "Boolean", // Whether to email on new applicants
    notifyAnalysisComplete: "Boolean", // Whether to email when analysis completes
    apiKey: "String", // API key for external services
    apiEndpoint: "String", // API endpoint URL
    scoreWeights: { // Weights for different score components
      technical: "Number", // Weight for technical score (0-1)
      creativity: "Number", // Weight for creativity score (0-1)
      codeQuality: "Number", // Weight for code quality score (0-1)
      design: "Number" // Weight for design score (0-1)
    },
    retentionPolicy: { // Data retention settings
      applicantData: "Number", // Days to retain applicant data
      analysisResults: "Number", // Days to retain analysis results
      activityLogs: "Number" // Days to retain activity logs
    },
    updatedBy: "Number | String", // ID of user who last updated settings
    updatedAt: "Date" // When settings were last updated
  }
};

// Define the indexes for each collection
const indexes = {
  applicants: [
    { field: "id", unique: true }, // Primary key
    { field: "email", unique: true }, // Unique index
    { field: "status" }, // Index for filtering by status
    { field: "appliedDate" }, // Index for sorting by date
    { field: "aiScore" } // Index for sorting by score
  ],
  analysis_results: [
    { field: "id", unique: true }, // Primary key
    { field: "applicantId" }, // Index for finding analysis by applicant
    { field: "timestamp" }, // Index for sorting by date
    { field: "overallScore" } // Index for sorting by score
  ],
  activity_logs: [
    { field: "id", unique: true }, // Primary key
    { field: "timestamp" }, // Index for sorting by date
    { field: "userId" }, // Index for filtering by user
    { field: "action" }, // Index for filtering by action type
    { field: "resourceId" } // Index for filtering by resource
  ],
  system_settings: [
    { field: "id", unique: true } // Primary key
  ]
};

// Define the relationships between collections
const relationships = {
  applicants: {
    analysis_results: { type: "One-to-Many", field: "applicantId" }
  },
  activity_logs: {
    applicants: { type: "One-to-Many", field: "resourceId" }
  }
};

// Define the data integrity constraints
const constraints = {
  applicants: {
    email: { unique: true },
    status: { enum: ["pending", "reviewing", "approved", "rejected"] }
  },
  analysis_results: {
    technicalScore: { min: 0, max: 100 },
    creativityScore: { min: 0, max: 100 },
    codeQualityScore: { min: 0, max: 100 },
    designScore: { min: 0, max: 100 },
    overallScore: { min: 0, max: 100 }
  },
  system_settings: {
    scoreWeights: { sum: 1.0 }
  }
};