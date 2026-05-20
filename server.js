import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import { testConnection } from './src/models/db.js';
import { getAllOrganizations } from './src/models/organizations.js';
import { getAllProjects } from './src/models/projects.js';
import { getAllCategories } from './src/models/categories.js';

const NODE_ENV = process.env.NODE_ENV?.toLowerCase() || 'production';

const PORT = process.env.PORT || 4000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.set('view engine', 'ejs');

// Tell Express where to find your templates
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'src/views'));

// Middleware to log all incoming requests
app.use((req, res, next) => {
    if (NODE_ENV === 'development') {
        console.log(`${req.method} ${req.url}`);
    }
    next(); // Pass control to the next middleware or route
});

app.get('/', async (req, res) => {
    const title = 'Home';
    res.render('home', { title });
});


app.get('/projects', async (req, res) => {
    try {
        const projects = (await getAllProjects()) ?? [];
        const title = 'Service Projects';

        console.log('projects:', projects);

        // Send response so the request completes
        res.render('projects', { title, projects });
    } catch (err) {
        console.error('Failed to fetch projects:', err);
        res.status(500).send('Error fetching projects');
    }
});


app.get('/categories', async (req, res) => {
    // const title = 'Project Categories';

    const categories = await getAllCategories();
        const title = 'Service Project Categories';
        
        // Render the page with the data
        res.render('categories', { title, categories });

    // res.render('categories', { title, categories });
    res.render('categories', { title,  });
});




app.get('/organizations', async (req, res) => {
    const organizations = await getAllOrganizations();

    const title = 'Our Partner Organizations';

    console.log('organizations:', organizations);
    res.render('organizations', { title, organizations });
});


app.listen(PORT, async () => {
    try {
        await testConnection();
        console.log(`Server is running at http://127.0.0.1:${PORT}`);
        console.log(`Environment: ${NODE_ENV}`);
    } catch (error) {
        console.error('Error connecting to the database:', error);
    }
});