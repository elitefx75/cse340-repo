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

const addVolunteerToProject = async (userId, projectId) => {
  const query = `
    INSERT INTO project_volunteer (project_id, user_id)
    VALUES ($1, $2)
    ON CONFLICT DO NOTHING;
  `;
  await db.query(query, [projectId, userId]);
};

const removeVolunteerFromProject = async (userId, projectId) => {
  const query = `
    DELETE FROM project_volunteer
    WHERE project_id = $1
      AND user_id = $2;
  `;
  await db.query(query, [projectId, userId]);
};

const getVolunteeredProjectsByUserId = async (userId) => {
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
    JOIN project_volunteer pv
      ON p.project_id = pv.project_id
    WHERE pv.user_id = $1
    ORDER BY p.date;
  `;

  try {
    const result = await db.query(query, [userId]);
    return result.rows;
  } catch (error) {
    if (error.code === '42P01') {
      console.error('Volunteer table not found:', error.message);
      return [];
    }
    throw error;
  }
};

const isUserVolunteeringForProject = async (userId, projectId) => {
  const query = `
    SELECT EXISTS(
      SELECT 1
      FROM project_volunteer
      WHERE user_id = $1
        AND project_id = $2
    ) AS is_volunteering;
  `;

  try {
    const result = await db.query(query, [userId, projectId]);
    return result.rows[0]?.is_volunteering || false;
  } catch (error) {
    if (error.code === '42P01') {
      console.error('Volunteer table not found:', error.message);
      return false;
    }
    throw error;
  }
};

const createProject = async (title, description, location, date, organizationId) => {
  const query = `
      INSERT INTO project (title, description, location, date, organization_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING project_id;
    `;

  const queryParams = [title, description, location, date, organizationId];
  const result = await db.query(query, queryParams);

  if (result.rows.length === 0) {
    throw new Error('Failed to create project');
  }

  if (process.env.ENABLE_SQL_LOGGING === 'true') {
    console.log('Created new project with ID:', result.rows[0].project_id);
  }

  return result.rows[0].project_id;
};

const updateProject = async (projectId, title, description, location, date, organizationId) => {
  const query = `
      UPDATE project
      SET title = $1,
          description = $2,
          location = $3,
          date = $4,
          organization_id = $5
      WHERE project_id = $6
      RETURNING project_id;
    `;

  const queryParams = [title, description, location, date, organizationId, projectId];
  const result = await db.query(query, queryParams);

  if (result.rows.length === 0) {
    throw new Error('Project not found');
  }

  if (process.env.ENABLE_SQL_LOGGING === 'true') {
    console.log('Updated project with ID:', projectId);
  }

  return result.rows[0].project_id;
};

// Export all model functions
export {
  getAllProjects,
  getProjectsByOrganizationId,
  getUpcomingProjects,
  getProjectDetails,
  addVolunteerToProject,
  removeVolunteerFromProject,
  getVolunteeredProjectsByUserId,
  isUserVolunteeringForProject,
  createProject,
  updateProject,
};
