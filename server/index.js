const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const bankingRoutes = require('./routes/banking');
const chatRoutes = require('./routes/chat');
const adminRoutes = require('./routes/admin');
const expenseRoutes = require('./routes/expense');

// Load .env only in development
try {
  require('dotenv').config();
} catch(e) {}

const app = express();

app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI;
console.log('MONGO_URI exists:', !!MONGO_URI);

mongoose.connect('mongodb+srv://neutronaadmin:neutrona123@cluster0.ixgfmcy.mongodb.net/neutrona?appName=Cluster0')
  .then(() => console.log('MongoDB Connected ✅'))
  .catch((err) => console.log('MongoDB Error ❌', err));

app.use('/api/auth', authRoutes);
app.use('/api/banking', bankingRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/expense', expenseRoutes);

app.get('/api', (req, res) => {
  res.json({ message: 'Neutrona API Running ✅' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});