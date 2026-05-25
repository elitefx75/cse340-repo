import db from './db.js';

// Get all projects with organization names
const getAllProjects = async () => {
  const query = `
    SELECT p.project_id,
           p.organization_id,
           p.title,
           p.description,
           p.location,
           p.date,
           o.name AS organization_name
    FROM public.project p
    JOIN public.organization o
      ON p.organization_id = o.organization_id
    ORDER BY o.name, p.date;
  `;
  const result = await db.query(query);
  return result.rows;
};

// Get projects by organization ID
const getProjectsByOrganizationId = async (organizationId) => {
  const query = `
    SELECT project_id,
           organization_id,
           title,
           description,
           location,
           date
    FROM public.project
    WHERE organization_id = $1
    ORDER BY date;
  `;
  const result = await db.query(query, [organizationId]);
  return result.rows;
};

// Get upcoming projects (next N projects)
const getUpcomingProjects = async (number_of_projects) => {
  const query = `
    SELECT p.project_id,
           p.title,
           p.description,
           p.date,
           p.location,
           o.organization_id,
           o.name AS organization_name
    FROM public.project p
    JOIN public.organization o
      ON p.organization_id = o.organization_id
    WHERE p.date >= CURRENT_DATE
    ORDER BY p.date ASC
    LIMIT $1;
  `;
  const result = await db.query(query, [number_of_projects]);
  return result.rows;
};

// Get details for a single project by ID
const getProjectDetails = async (id) => {
  const query = `
    SELECT p.project_id,
           p.title,
           p.description,
           p.date,
           p.location,
           o.organization_id,
           o.name AS organization_name
    FROM public.project p
    JOIN public.organization o
      ON p.organization_id = o.organization_id
    WHERE p.project_id = $1;
  `;
  const result = await db.query(query, [id]);
  return result.rows[0]; // return single project object
};

// Export all model functions
export {
  getAllProjects,
  getProjectsByOrganizationId,
  getUpcomingProjects,
  getProjectDetails
};
