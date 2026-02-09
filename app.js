require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth.routes');
const connectDB = require('./config/db');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>');
});


const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is listening on port: ${PORT}`);
  connectDB();
});

