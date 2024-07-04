import './loadEnv.js';
import express from 'express';
import cors from 'cors';

const PORT = process.env.PORT;
const app = express();

// Import the API modules
import weatherbit from './apis/weatherbit.js';
import pixabay from './apis/pixabay.js';
import lightbox from './apis/lightbox.js';
import locations from './apis/locations.js';

// Setup helper middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Mount static content
app.use(express.static('dist'));
app.use('/media', express.static('src/client/media'));

// Define the favicon route
app.get('/favicon.ico', (req, res) => {
    res.redirect('/media/favicon.ico')
});

// Define API routes
app.get('/api/lightbox/all', lightbox.all.v1);
app.get('/api/lightbox/:id', lightbox.specific.v1);
app.get('/api/v1/images', pixabay.handlers.v1);
app.get('/api/v1/locations', locations.handlers.v1);
app.get('/api/v1/weather', weatherbit.handlers.v1);

app.listen(PORT, () => console.info(`Server is listening on port #${PORT}`));

export default app;