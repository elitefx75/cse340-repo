import db from './db.js'; // Use your existing db connection

export const getAllCategories = async () => {
  const query = 'SELECT * FROM category ORDER BY category_name ASC';
  try {
    const result = await db.query(query);
    return result.rows;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
};

export const getCategoryById = async (categoryId) => {
  const query = `
    SELECT category_id,
           category_name,
           category_description,
           category_image
    FROM category
    WHERE category_id = $1;
  `;
  const result = await db.query(query, [categoryId]);
  return result.rows[0];
};

export const getCategoriesByProjectId = async (projectId) => {
  const query = `
    SELECT c.category_id,
           c.category_name
    FROM category c
    JOIN project_category pc
      ON c.category_id = pc.category_id
    WHERE pc.project_id = $1
    ORDER BY c.category_name;
  `;
  const result = await db.query(query, [projectId]);
  return result.rows;
};

export const getProjectsByCategoryId = async (categoryId) => {
  const query = `
    SELECT p.project_id,
           p.organization_id,
           p.title,
           p.description,
           p.location,
           p.date,
           o.name AS organization_name
    FROM project p
    JOIN public.organization o
      ON p.organization_id = o.organization_id
    JOIN project_category pc
      ON p.project_id = pc.project_id
    WHERE pc.category_id = $1
    ORDER BY p.date;
  `;
  const result = await db.query(query, [categoryId]);
  return result.rows;
};

export const createCategory = async (categoryName) => {
  const query = `
    INSERT INTO category (category_name, category_description, category_image)
    VALUES ($1, $2, $3)
    RETURNING category_id;
  `;
  const queryParams = [
    categoryName,
    'Category created through the application.',
    'community.jpg'
  ];

  const result = await db.query(query, queryParams);
  if (result.rows.length === 0) {
    throw new Error('Failed to create category');
  }

  if (process.env.ENABLE_SQL_LOGGING === 'true') {
    console.log('Created new category with ID:', result.rows[0].category_id);
  }

  return result.rows[0].category_id;
};

export const updateCategory = async (categoryId, categoryName) => {
  const query = `
    UPDATE category
    SET category_name = $1
    WHERE category_id = $2
    RETURNING category_id;
  `;
  const queryParams = [categoryName, categoryId];
  const result = await db.query(query, queryParams);

  if (result.rows.length === 0) {
    throw new Error('Category not found');
  }

  if (process.env.ENABLE_SQL_LOGGING === 'true') {
    console.log('Updated category with ID:', categoryId);
  }

  return result.rows[0].category_id;
};

// Helper: assign one category to a project
const assignCategoryToProject = async (categoryId, projectId) => {
  const query = `
    INSERT INTO project_category (category_id, project_id)
    VALUES ($1, $2);
  `;
  await db.query(query, [categoryId, projectId]);
};

// Update all category assignments for a project
export const updateCategoryAssignments = async (projectId, categoryIds) => {
  // First, remove existing category assignments for the project
  const deleteQuery = `
    DELETE FROM project_category
    WHERE project_id = $1;
  `;
  await db.query(deleteQuery, [projectId]);

  // Next, add the new category assignments
  for (const categoryId of categoryIds) {
    await assignCategoryToProject(categoryId, projectId);
  }
};
