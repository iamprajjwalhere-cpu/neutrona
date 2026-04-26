const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

router.post('/message', auth, async (req, res) => {
  try {
    const { message } = req.body;

    const user = await User.findById(req.userId).select('-password');
    const recentTx = await Transaction.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(5);

    const txSummary = recentTx.map(tx =>
      `${tx.type} of ₹${tx.amount} on ${new Date(tx.createdAt).toLocaleDateString()}`
    ).join(', ');

    const prompt = `You are Neutrona Assistant, a helpful AI banking assistant for Neutrona Bank.
The user's name is ${user.name}.
Their current balance is ₹${user.balance}.
Their account number is ${user.accountNumber}.
Their account status is ${user.accountStatus}.
Recent transactions: ${txSummary || 'No recent transactions'}.
Be helpful, concise and friendly. Only answer banking related questions.
Always use Indian Rupee (₹) for amounts.

User message: ${message}`

    const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const data = await response.json();
    console.log('Gemini response:', JSON.stringify(data));

    if (data.error) {
      return res.status(500).json({ message: data.error.message });
    }

    const reply = data.candidates[0].content.parts[0].text;
    res.json({ reply });

  } catch (error) {
    console.log('Chat error:', error.message);
    res.status(500).json({ message: 'Chat error', error: error.message });
  }
});

module.exports = router;