-- ========================================
-- Organization Table
-- ========================================
CREATE TABLE organization (
    organization_id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    logo_filename VARCHAR(255) NOT NULL
);

INSERT INTO organization (name, description, contact_email, logo_filename)
VALUES
('BrightFuture Builders', 'A nonprofit focused on improving community infrastructure through sustainable construction projects.', 'info@brightfuturebuilders.org', 'brightfuture-logo.png'),
('GreenHarvest Growers', 'An urban farming collective promoting food sustainability and education in local neighborhoods.', 'contact@greenharvest.org', 'greenharvest-logo.png'),
('UnityServe Volunteers', 'A volunteer coordination group supporting local charities and service initiatives.', 'hello@unityserve.org', 'unityserve-logo.png');



-- ========================================
-- Project Table
-- ========================================
CREATE TABLE project (
    project_id SERIAL PRIMARY KEY,
    organization_id INT NOT NULL REFERENCES organization(organization_id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    date DATE
);

-- BrightFuture Builders (organization_id = 1)
INSERT INTO project (organization_id, title, description, location, date)
VALUES
(1, 'Community Library Build', 'Constructing a new library for local schools.', 'Madhivani', '2026-06-10'),
(1, 'Youth Skills Workshop', 'Training youth in carpentry and masonry.', 'Jinja', '2026-07-05'),
(1, 'School Renovation', 'Renovating classrooms and providing desks.', 'Mbale', '2026-08-15'),
(1, 'Water Well Project', 'Drilling wells to provide clean water.', 'Iganga', '2026-09-01'),
(1, 'Solar Lighting Installation', 'Installing solar lights in rural homes.', 'Tororo', '2026-10-20'),


(2, 'Organic Farming Training', 'Teaching farmers sustainable organic practices.', 'Lira', '2026-06-18'),
(2, 'Community Garden Setup', 'Creating shared gardens for food security.', 'Soroti', '2026-07-12'),
(2, 'Tree Planting Drive', 'Planting 10,000 trees to combat deforestation.', 'Gulu', '2026-08-22'),
(2, 'Irrigation System Build', 'Installing drip irrigation for small farms.', 'Arua', '2026-09-09'),
(2, 'Seed Distribution Program', 'Providing high-yield seeds to farmers.', 'Masindi', '2026-10-28'),


(3, 'Health Camp', 'Organizing free medical check-ups.', 'Kampala', '2026-06-25'),
(3, 'Literacy Program', 'Teaching adults basic reading and writing skills.', 'Entebbe', '2026-07-15'),
(3, 'Disaster Relief Support', 'Providing aid to flood-affected families.', 'Kasese', '2026-08-30'),
(3, 'Community Clean-Up', 'Mobilizing volunteers to clean public spaces.', 'Fort Portal', '2026-09-14'),
(3, 'Vocational Training', 'Offering tailoring and craft skills to women.', 'Mbarara', '2026-10-31');


-- ========================================
-- Category Table
-- ========================================
CREATE TABLE IF NOT EXISTS category (
    category_id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    category_description TEXT NOT NULL,
    category_image VARCHAR(255) NOT NULL
);

-- ========================================
-- Project-Category Join Table
-- ========================================
CREATE TABLE IF NOT EXISTS project_category (
    project_id INT NOT NULL REFERENCES project(project_id),
    category_id INT NOT NULL REFERENCES category(category_id),
    PRIMARY KEY (project_id, category_id)
);

-- ========================================
-- Category Data
-- ========================================
INSERT INTO category (category_name, category_description, category_image)
VALUES
('Environmental', 'Protect our planet through tree planting and conservation.', 'environmental.jpg'),
('Educational', 'Help students succeed by tutoring and providing school supplies.', 'educational.jpg'),
('Community Service', 'Build a stronger neighborhood by helping at shelters.', 'community.jpg'),
('Health and Wellness', 'Support local clinics and promote healthy living.', 'heath.jpg')
ON CONFLICT (category_name) DO NOTHING;

-- ========================================
-- Project-Category Associations
-- ========================================
-- Assigning categories to each service project
INSERT INTO project_category (project_id, category_id)
VALUES
-- BrightFuture Builders projects
(1, 2), (1, 3),  -- Community Library Build: Educational, Community Service
(2, 2),          -- Youth Skills Workshop: Educational
(3, 2), (3, 3),  -- School Renovation: Educational, Community Service
(4, 1), (4, 3),  -- Water Well Project: Environmental, Community Service
(5, 1),          -- Solar Lighting Installation: Environmental
-- GreenHarvest Growers projects
(6, 1), (6, 2),  -- Organic Farming Training: Environmental, Educational
(7, 1), (7, 3),  -- Community Garden Setup: Environmental, Community Service
(8, 1),          -- Tree Planting Drive: Environmental
(9, 1),          -- Irrigation System Build: Environmental
(10, 1),         -- Seed Distribution Program: Environmental
-- UnityServe Volunteers projects
(11, 3), (11, 4), -- Health Camp: Community Service, Health and Wellness
(12, 2),         -- Literacy Program: Educational
(13, 3), (13, 4), -- Disaster Relief Support: Community Service, Health and Wellness
(14, 1), (14, 3), (14, 4), -- Community Clean-Up: Environmental, Community Service, Health and Wellness
(15, 2), (15, 4) -- Vocational Training: Educational, Health and Wellness
ON CONFLICT DO NOTHING;
