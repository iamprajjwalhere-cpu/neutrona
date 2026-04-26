const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');

// Auto categorize based on description
const categorize = (description, type) => {
  if (type === 'deposit') return 'Income';
  const desc = description.toLowerCase();
  if (desc.includes('food') || desc.includes('restaurant') || desc.includes('swiggy') || desc.includes('zomato')) return 'Food';
  if (desc.includes('shop') || desc.includes('amazon') || desc.includes('flipkart') || desc.includes('mall')) return 'Shopping';
  if (desc.includes('travel') || desc.includes('uber') || desc.includes('ola') || desc.includes('flight')) return 'Travel';
  if (desc.includes('bill') || desc.includes('electricity') || desc.includes('water') || desc.includes('rent')) return 'Bills';
  if (desc.includes('netflix') || desc.includes('movie') || desc.includes('spotify') || desc.includes('game')) return 'Entertainment';
  if (desc.includes('hospital') || desc.includes('medicine') || desc.includes('doctor') || desc.includes('health')) return 'Health';
  if (desc.includes('school') || desc.includes('college') || desc.includes('course') || desc.includes('book')) return 'Education';
  return 'Other';
};

// Get expense summary
router.get('/summary', auth, async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const transactions = await Transaction.find({
      userId: req.userId,
      createdAt: { $gte: startOfMonth }
    });

    // Auto categorize transactions
    const summary = {};
    transactions.forEach(tx => {
      const category = categorize(tx.description, tx.type);
      if (!summary[category]) summary[category] = { total: 0, count: 0, transactions: [] };
      summary[category].total += tx.amount;
      summary[category].count += 1;
      summary[category].transactions.push(tx);
    });

    // Get budgets
    const month = `${now.getFullYear()}-${now.getMonth() + 1}`;
    const budgets = await Budget.find({ userId: req.userId, month });

    res.json({ summary, budgets });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Set budget
router.post('/budget', auth, async (req, res) => {
  try {
    const { category, limit } = req.body;
    const now = new Date();
    const month = `${now.getFullYear()}-${now.getMonth() + 1}`;

    const existing = await Budget.findOne({ userId: req.userId, category, month });
    if (existing) {
      existing.limit = limit;
      await existing.save();
      return res.json({ message: 'Budget updated ✅', budget: existing });
    }

    const budget = await Budget.create({ userId: req.userId, category, limit, month });
    res.json({ message: 'Budget set ✅', budget });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all budgets
router.get('/budgets', auth, async (req, res) => {
  try {
    const now = new Date();
    const month = `${now.getFullYear()}-${now.getMonth() + 1}`;
    const budgets = await Budget.find({ userId: req.userId, month });
    res.json(budgets);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;