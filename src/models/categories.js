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