import bcrypt from 'bcrypt';
import {
    createUser,
    authenticateUser,
    getAllUsers,
    findUserByEmail
} from '../models/users.js';

const showUserRegistrationForm = (req, res) => {
    res.render('register', { title: 'Register' });
};

const processUserRegistrationForm = async (req, res) => {
    const { name, email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();
    const normalizedName = name?.trim();

    if (!normalizedName || !normalizedEmail || !password) {
        req.flash('error', 'Please complete all registration fields.');
        return res.redirect('/register');
    }

    try {
        const existingUser = await findUserByEmail(normalizedEmail);
        if (existingUser) {
            req.flash('error', 'That email is already registered. Please log in or choose another email.');
            return res.redirect('/register');
        }

        // Hash the password before storing it
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        await createUser(normalizedName, normalizedEmail, passwordHash);

        req.flash('success', 'Registration successful! Please log in.');
        return res.redirect('/login');
    } catch (error) {
        console.error('Error registering user:', error.message, error.stack);
        const message = error.code === '23505'
            ? 'That email is already registered. Please log in.'
            : error.message.includes('Role')
                ? 'Default user role is missing. Please ensure the roles table is seeded and retry.'
                : 'An error occurred during registration. Please try again.';
        req.flash('error', message);
        res.redirect('/register');
    }
};

const showLoginForm = (req, res) => {
    res.render('login', { title: 'Login' });
};

const processLoginForm = async (req, res) => {
    const { email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !password) {
        req.flash('error', 'Please enter both email and password.');
        return res.redirect('/login');
    }

    try {
        const user = await authenticateUser(normalizedEmail, password);
        if (user) {
            // Store user info in session
            req.session.user = user;
            req.flash('success', 'Login successful!');

            if (res.locals.NODE_ENV === 'development') {
                console.log('User logged in:', user);
            }

            return res.redirect('/dashboard');
        }

        req.flash('error', 'Invalid email or password.');
        res.redirect('/login');
    } catch (error) {
        console.error('Error during login:', error.message, error.stack);
        req.flash('error', 'An error occurred during login. Please try again.');
        res.redirect('/login');
    }
};

const processLogout = async (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
        }
        res.redirect('/login');
    });
};

const requireLogin = (req, res, next) => {
    if (!req.session || !req.session.user) {
        req.flash('error', 'You must be logged in to access that page.');
        return res.redirect('/login');
    }
    next();
};

const requireRole = (role) => {
    return (req, res, next) => {
        if (!req.session || !req.session.user) {
            req.flash('error', 'You must be logged in to access this page.');
            return res.redirect('/login');
        }

        if (req.session.user.role_name !== role) {
            req.flash('error', 'You do not have permission to access this page.');
            return res.redirect('/dashboard');
        }

        next();
    };
};

const showDashboard = (req, res) => {
    const user = req.session.user;
    res.render('dashboard', {
        title: 'Dashboard',
        name: user.name,
        email: user.email,
        role: user.role_name
    });
};

const showUsersPage = async (req, res) => {
    try {
        const users = await getAllUsers();
        res.render('users', {
            title: 'Users',
            users
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        req.flash('error', 'Unable to load users at this time.');
        res.redirect('/dashboard');
    }
};

export {
    showUserRegistrationForm,
    processUserRegistrationForm,
    showLoginForm,
    processLoginForm,
    processLogout,
    showDashboard,
    showUsersPage,
    requireLogin,
    requireRole
};
