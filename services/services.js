// services/jobService.js
import axios from 'axios';
import Job from '../models/jobsmodel.js';
import { generateFromGemini } from './geminiClient.js';

const RAPIDAPI_URL = 'https://linkedin-job-search-api.p.rapidapi.com/active-jb-24h';
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || '182a0fa362msh9c5069e300c6028p1f684bjsne2476680809a';
const RAPIDAPI_HOST = 'linkedin-job-search-api.p.rapidapi.com';

// Fetch jobs from RapidAPI
export const fetchJobsFromAPI = async (titleFilter = 'data science', locationFilter = 'india') => {
  try {
    const options = {
      method: 'GET',
      url: RAPIDAPI_URL,
      params: {
        limit: '5',
        offset: '0',
        title_filter: `"${titleFilter}"`,
        location_filter: `"${locationFilter}"`
      },
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': RAPIDAPI_HOST
      }
    };

    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    console.error('Error fetching jobs from RapidAPI:', error);
    throw new Error('Failed to fetch jobs from RapidAPI');
  }
};
const manualJobMapping = (apiJob) => {
  const employmentType = apiJob.employment_type?.[0] || 'FULL_TIME';
  const seniority = apiJob.seniority || 'Mid-Senior level';
  
  // Extract apply link from various possible fields
  const extractApplyLink = (job) => {
    return job.url || 
           job.orgLink || 
           job.applyUrl || 
           job.apply_link || 
           job.applicationUrl || 
           job.application_url || 
           job.linkedinUrl || 
           job.linkedin_url ||
           job.externalUrl ||
           job.external_url ||
           job.jobUrl ||
           job.job_url ||
           `https://www.linkedin.com/jobs/view/${job.id}` || // Fallback LinkedIn URL
           '';
  };
  
  return {
    title: apiJob.title || 'No title provided',
    description: apiJob.linkedin_org_description || 
                `${apiJob.organization || 'Company'} is hiring for ${apiJob.title || 'a position'}` || 
                'No description provided',
    location: apiJob.locations_derived?.[0] || 
             apiJob.cities_derived?.[0] || 
             apiJob.countries_derived?.[0] ||
             'Remote',
    type: mapEmploymentType(employmentType),
    minsalaryrange: apiJob.salary_raw?.value?.minValue || 50000, // Default minimum
    maxsalaryrange: apiJob.salary_raw?.value?.maxValue || 100000, // Default maximum
    requiredexperience: mapSeniority(seniority),
    requireddegree: [],
    company: apiJob.organization || 'Unknown company',
    shifts: 'Day', // Default to Day shift
    requiredskills: extractSkills(apiJob),
    applyLink: extractApplyLink(apiJob),
    url: apiJob.url || '',
    remote: apiJob.remote_derived || false,
    postedDate: apiJob.date_posted ? new Date(apiJob.date_posted) : new Date(),
    source: 'linkedin'
  };
};
// Process and normalize job data with Gemini AI
export const processJobWithAI = async (apiJob) => {
  try {
    const prompt = `Convert this LinkedIn job to standardized format with all required fields: ${JSON.stringify(apiJob)}. 
    Required fields: title, description, location, type (Full Time/Part Time/Internship), 
    minsalaryrange (number), maxsalaryrange (number), requiredexperience (text), 
    company (text), shifts (Day/Night/Both), applyLink (string).
    
    For applyLink, look for these fields in order: url, orgLink, applyUrl, apply_link, applicationUrl, 
    application_url, linkedinUrl, linkedin_url, externalUrl, external_url, jobUrl, job_url.
    If none found, use: "https://www.linkedin.com/jobs/view/[job_id]" or empty string.
    
    Return only valid JSON.`;
    
    const aiResponse = await generateFromGemini(prompt);
    
    if (!aiResponse) {
      return manualJobMapping(apiJob);
    }

    // Clean the response
    let cleanedResponse = aiResponse.replace(/^```(json)?/, '').replace(/```$/, '').trim();
    
    try {
      const parsedJob = JSON.parse(cleanedResponse);
      
      // Validate required fields (make applyLink optional for AI response)
      const requiredFields = ['title', 'description', 'location', 'type', 
                            'minsalaryrange', 'maxsalaryrange', 'requiredexperience', 
                            'company', 'shifts'];
      
      for (const field of requiredFields) {
        if (!parsedJob[field]) {
          console.warn(`AI response missing ${field}, falling back to manual mapping`);
          return manualJobMapping(apiJob);
        }
      }
      
      // Ensure applyLink is present (fallback to manual mapping if missing)
      if (!parsedJob.applyLink) {
        const manualMapped = manualJobMapping(apiJob);
        parsedJob.applyLink = manualMapped.applyLink;
      }
      
      return parsedJob;
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      return manualJobMapping(apiJob);
    }
  } catch (error) {
    console.error('Error in processJobWithAI:', error);
    return manualJobMapping(apiJob);
  }
};

// Save processed job to database


// Main function to fetch, process, and store jobs
export const fetchProcessAndStoreJobs = async (userId = null) => {
  try {
    const apiJobs = await fetchJobsFromAPI();
    const results = [];

    for (const apiJob of apiJobs) {
      try {
        // First try manual mapping as fallback
        let processedJob = manualJobMapping(apiJob);
        
        // Then try AI processing if needed
        try {
          const aiProcessed = await processJobWithAI(apiJob);
          processedJob = { ...processedJob, ...aiProcessed };
        } catch (aiError) {
          console.warn('AI processing failed, using manual mapping:', aiError);
        }

        const { job, isNew } = await saveJobToDB(processedJob, userId);
        results.push({ job, isNew, success: true });
      } catch (jobError) {
        console.error(`Error processing job ${apiJob.id || 'unknown'}:`, jobError);
        results.push({ 
          job: apiJob, 
          isNew: false, 
          success: false, 
          error: jobError.message 
        });
      }
    }

    return results;
  } catch (error) {
    console.error('Error in fetchProcessAndStoreJobs:', error);
    throw error;
  }
};



// Helper functions
const mapEmploymentType = (type) => {
  if (!type) return 'Full Time';
  const mapping = {
    'FULL_TIME': 'Full Time',
    'PART_TIME': 'Part Time',
    'CONTRACTOR': 'Contract',
    'INTERN': 'Internship',
    'TEMPORARY': 'Contract'
  };
  return mapping[type.toUpperCase()] || 'Full Time';
};

const mapSeniority = (seniority) => {
  if (!seniority) return '2-5 years';
  const mapping = {
    'INTERNSHIP': '0 years',
    'ENTRY_LEVEL': '0-2 years',
    'ASSOCIATE': '1-3 years',
    'MID_SENIOR': '3-5 years',
    'SENIOR': '5+ years',
    'DIRECTOR': '10+ years',
    'EXECUTIVE': '15+ years'
  };
  return mapping[seniority.toUpperCase().replace(/\s+/g, '_')] || '2-5 years';
};

const extractSkills = (job) => {
  const skills = [];
  if (job.title?.includes('Java')) skills.push('Java');
  if (job.title?.includes('React')) skills.push('React');
  if (job.linkedin_org_specialties) {
    skills.push(...job.linkedin_org_specialties.filter(s => s && s.length < 20));
  }
  return Array.from(new Set(skills)).slice(0, 5); // Return unique skills, max 5
};

// Update your saveJobToDB function
export const saveJobToDB = async (jobData, userId = null) => {
  try {
    // Ensure all required fields are present
    const requiredFields = ['title', 'description', 'location', 'type', 
                          'minsalaryrange', 'maxsalaryrange', 'requiredexperience', 
                          'company', 'shifts', 'applyLink'];
    
    for (const field of requiredFields) {
      if (!jobData[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Check for existing job
    const existingJob = await Job.findOne({
      title: jobData.title,
      company: jobData.company,
      location: jobData.location
    });

    if (existingJob) {
      return { job: existingJob, isNew: false };
    }

    // Create new job with all required fields
    const newJob = new Job({
      title: jobData.title,
      description: jobData.description,
      location: jobData.location,
      type: jobData.type,
      minsalaryrange: jobData.minsalaryrange,
      maxsalaryrange: jobData.maxsalaryrange,
      requiredexperience: jobData.requiredexperience,
      requireddegree: jobData.requireddegree || [],
      company: jobData.company,
      shifts: jobData.shifts,
      requiredskills: jobData.requiredskills || [],
      applyLink: jobData.applyLink,
      userid: userId,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await newJob.save();
    return { job: newJob, isNew: true };
  } catch (error) {
    console.error('Error saving job to DB:', error);
    throw error;
  }
};