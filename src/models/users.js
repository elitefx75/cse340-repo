import db from './db.js';
import bcrypt from 'bcrypt';

const getRoleIdByName = async (roleName) => {
    const query = `
        SELECT role_id
        FROM roles
        WHERE role_name = $1
    `;
    const result = await db.query(query, [roleName]);

    if (result.rows.length === 0) {
        throw new Error(`Role '${roleName}' not found in the roles table`);
    }

    return result.rows[0].role_id;
};

const createUser = async (name, email, passwordHash) => {
    const roleId = await getRoleIdByName('user');
    const query = `
        INSERT INTO users (name, email, password_hash, role_id)
        VALUES ($1, $2, $3, $4)
        RETURNING user_id
    `;
    const queryParams = [name, email, passwordHash, roleId];

    const result = await db.query(query, queryParams);

    if (result.rows.length === 0) {
        throw new Error('Failed to create user');
    }

    if (process.env.ENABLE_SQL_LOGGING === 'true') {
        console.log('Created new user with ID:', result.rows[0].user_id);
    }

    return result.rows[0].user_id;
};

const findUserByEmail = async (email) => {
    const query = `
        SELECT u.user_id, u.name, u.email, u.password_hash, COALESCE(r.role_name, 'user') AS role_name
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.role_id
        WHERE LOWER(u.email) = LOWER($1)
    `;
    const queryParams = [email];

    const result = await db.query(query, queryParams);

    if (result.rows.length === 0) {
        return null; // User not found
    }

    return result.rows[0];
};

const getAllUsers = async () => {
    const query = `
        SELECT u.user_id, u.name, u.email, COALESCE(r.role_name, 'user') AS role_name
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.role_id
        ORDER BY u.name ASC
    `;

    const result = await db.query(query);
    return result.rows;
};

const verifyPassword = async (password, passwordHash) => {
    return bcrypt.compare(password, passwordHash);
};

// Authenticate user
const authenticateUser = async (email, password) => {
    const user = await findUserByEmail(email);

    if (!user) {
        return null; // No user found
    }

    const isPasswordValid = await verifyPassword(password, user.password_hash);

    if (!isPasswordValid) {
        return null; // Invalid password
    }

    // Remove password_hash before returning user object
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
};
export { createUser, authenticateUser, getAllUsers, findUserByEmail };