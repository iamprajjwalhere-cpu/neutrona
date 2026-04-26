const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const bankingRoutes = require('./routes/banking');
const chatRoutes = require('./routes/chat');
const adminRoutes = require('./routes/admin');
const expenseRoutes = require('./routes/expense');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
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