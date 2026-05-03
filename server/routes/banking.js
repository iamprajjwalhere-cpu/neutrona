const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const FraudAlert = require('../models/FraudAlert');
const detectFraud = require('../utils/fraudDetection');

router.get('/account', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/deposit', auth, async (req, res) => {
  try {
    const { amount } = req.body;
    if (amount <= 0) return res.status(400).json({ message: 'Amount must be greater than 0' });

    // Run fraud detection
    const fraud = await detectFraud(req.userId, amount, 'deposit');

    const user = await User.findById(req.userId);
    user.balance += amount;
    await user.save();

    const tx = await Transaction.create({
      userId: req.userId,
      type: 'deposit',
      amount,
      balanceAfter: user.balance,
      description: 'Deposit',
      status: fraud.isFlagged ? 'pending' : 'success'
    });

    // Save fraud alert if flagged
    if (fraud.riskLevel !== 'low') {
      await FraudAlert.create({
        userId: req.userId,
        transactionId: tx._id,
        riskScore: fraud.riskScore,
        riskLevel: fraud.riskLevel,
        flags: fraud.flags
      });
    }

    res.json({
      message: `₹${amount} deposited successfully ✅`,
      newBalance: user.balance,
      fraud
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/withdraw', auth, async (req, res) => {
  try {
    const { amount } = req.body;
    if (amount <= 0) return res.status(400).json({ message: 'Amount must be greater than 0' });

    const user = await User.findById(req.userId);
    if (user.balance < amount) return res.status(400).json({ message: 'Insufficient balance ❌' });

    // Run fraud detection
    const fraud = await detectFraud(req.userId, amount, 'withdrawal');

    // Block transaction if high risk
    if (fraud.isFlagged) {
      return res.status(403).json({
        message: '🚨 Transaction blocked — High fraud risk detected!',
        fraud
      });
    }

    user.balance -= amount;
    await user.save();

    const tx = await Transaction.create({
      userId: req.userId,
      type: 'withdrawal',
      amount,
      balanceAfter: user.balance,
      description: 'Withdrawal',
      status: 'success'
    });

    if (fraud.riskLevel !== 'low') {
      await FraudAlert.create({
        userId: req.userId,
        transactionId: tx._id,
        riskScore: fraud.riskScore,
        riskLevel: fraud.riskLevel,
        flags: fraud.flags
      });
    }

    res.json({
      message: `₹${amount} withdrawn successfully ✅`,
      newBalance: user.balance,
      fraud
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/transactions', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/fraud-alerts', auth, async (req, res) => {
  try {
    const alerts = await FraudAlert.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/bill', auth, async (req, res) => {
  try {
    const { amount, category, description } = req.body;
    if (amount <= 0) return res.status(400).json({ message: 'Amount must be greater than 0' });

    const user = await User.findById(req.userId);
    if (user.balance < amount) return res.status(400).json({ message: 'Insufficient balance ❌' });

    // Run fraud detection
    const fraud = await detectFraud(req.userId, amount, 'withdrawal');
    if (fraud.isFlagged) {
      return res.status(403).json({ message: '🚨 Transaction blocked — High fraud risk detected!', fraud });
    }

    user.balance -= amount;
    await user.save();

    const tx = await Transaction.create({
      userId: req.userId,
      type: 'withdrawal',
      amount,
      balanceAfter: user.balance,
      description: description || category,
      category,
      status: 'success'
    });

    if (fraud.riskLevel !== 'low') {
      await FraudAlert.create({
        userId: req.userId,
        transactionId: tx._id,
        riskScore: fraud.riskScore,
        riskLevel: fraud.riskLevel,
        flags: fraud.flags
      });
    }

    res.json({
      message: `₹${amount} paid for ${category} ✅`,
      newBalance: user.balance,
      transaction: tx
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;