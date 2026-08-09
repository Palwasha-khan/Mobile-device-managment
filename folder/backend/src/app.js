const express = require('express');
const multer = require('multer');

const app = express(); 
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage()
})

app.post('/create-post', upload.single('image'), (req, res) => {
   console.log(req.file);
   console.log(req.body);

   res.status(200).json({ message: 'Post created successfully' });
});

module.exports = app;