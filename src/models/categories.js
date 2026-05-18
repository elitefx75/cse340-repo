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