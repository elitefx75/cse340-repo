import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import { getAllOrganizations } from './src/models/organizations.js';
import { testConnection } from './src/models/db.js';


const NODE_ENV = process.env.NODE_ENV?.toLowerCase() || 'production';

const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.set('view engine', 'ejs');

// Tell Express where to find your templates
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'src/views'));

app.get('/', async (req, res) => {
    const title = 'Home';
    res.render('home', { title });
});


app.get('/projects', async (req, res) => {
    const title = 'Service Projects';
    res.render('projects', { title });
});


app.get('/categories', async (req, res) => {
    const title = 'Project Categories';
    res.render('categories', { title });
});




// app.get('/', (req, res) => {
//     // Redirect to organizations page or render a simple message
//     res.redirect('/organizations');
// });


app.get('/organizations', async (req, res) => {
    const title = 'Our Partner Organizations';
let organizations = [];
    try {
        organizations = await getAllOrganizations();
        console.log('Fetched organizations:', organizations.length);
    } catch (err) {
        console.error('Failed to fetch organizations:', err);
    }
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