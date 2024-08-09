const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

// In-memory data store for galleries and bookmarks
const galleries = {};
const bookmarks = {};

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Dashboard route
app.get('/dash', (req, res) => {
  res.render('dashboard', { bookmarks });
});

app.post('/dash/add', (req, res) => {
  const { link, name } = req.body;
  if (link && name) {
    bookmarks[name] = link;
  }
  res.redirect('/dash');
});

// Routes for galleries
app.get('/', (req, res) => {
  const uniqueId = uuidv4();
  galleries[uniqueId] = [];
  res.redirect(`/${uniqueId}`);
});

app.get('/:id', (req, res) => {
  const galleryId = req.params.id;
  if (!galleries[galleryId]) {
    galleries[galleryId] = [];
  }
  res.render('index', { galleryId });
});

app.get('/:id/gallery', (req, res) => {
  const galleryId = req.params.id;
  if (!galleries[galleryId]) {
    return res.status(404).send('Gallery not found');
  }
  const images = galleries[galleryId];
  res.render('gallery', { images, galleryId });
});

app.post('/:id/upload', upload.single('image'), (req, res) => {
  const galleryId = req.params.id;
  if (!galleries[galleryId]) {
    return res.status(404).send('Gallery not found');
  }
  const imagePath = `/uploads/${req.file.filename}`;
  galleries[galleryId].push(imagePath);
  res.redirect(`/${galleryId}/gallery`);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
