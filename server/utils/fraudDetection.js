const Transaction = require('../models/Transaction');

const detectFraud = async (userId, amount, type) => {
  const flags = [];
  let riskScore = 0;

  // ── Rule 1: Large transaction amount ──────────────────
  if (amount >= 50000) {
    flags.push('Large transaction amount detected');
    riskScore += 40;
  } else if (amount >= 20000) {
    flags.push('Moderately large transaction');
    riskScore += 20;
  }

  // ── Rule 2: High frequency — 5+ transactions in 10 mins
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
  const recentTxCount = await Transaction.countDocuments({
    userId,
    createdAt: { $gte: tenMinutesAgo }
  });

  if (recentTxCount >= 5) {
    flags.push('High transaction frequency detected');
    riskScore += 40;
  } else if (recentTxCount >= 3) {
    flags.push('Moderate transaction frequency');
    riskScore += 20;
  }

  // ── Rule 3: Rapid withdrawals ─────────────────────────
  if (type === 'withdrawal') {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentWithdrawals = await Transaction.countDocuments({
      userId,
      type: 'withdrawal',
      createdAt: { $gte: fiveMinutesAgo }
    });

    if (recentWithdrawals >= 3) {
      flags.push('Multiple rapid withdrawals detected');
      riskScore += 30;
    }
  }

  // ── Risk Level ────────────────────────────────────────
  let riskLevel = 'low';
  if (riskScore >= 60) riskLevel = 'high';
  else if (riskScore >= 30) riskLevel = 'medium';
   console.log('Fraud check result:', { riskScore, riskLevel, flags });
 
   return {
    isFlagged: riskScore >= 60,
    riskScore,
    riskLevel,
    flags
  };
};

module.exports = detectFraud;