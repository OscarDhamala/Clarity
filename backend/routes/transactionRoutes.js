const express = require('express');
const Transaction = require('../models/Transaction');
const authMiddleware = require('../middleware/authMiddleware');
const { analyzeTransactionPrompt, ClarityAIError } = require('../services/clarityAi');

const router = express.Router();

// All transactions for the logged-in user with optional filters
router.get('/', authMiddleware, async (req, res) => {
  const { type, category, startDate, endDate } = req.query;
  const filters = { user: req.user.id };

  if (type) {
    filters.type = type;
  }

  if (category) {
    filters.category = category;
  }

  if (startDate || endDate) {
    filters.date = {};
    if (startDate) filters.date.$gte = new Date(startDate);
    if (endDate) filters.date.$lte = new Date(endDate);
  }

  try {
    const transactions = await Transaction.find(filters).sort({ date: -1 });
    return res.json({ transactions });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load transactions' });
  }
});

// Create a new transaction
router.post('/', authMiddleware, async (req, res) => {
  const { type, amount, category, date, note } = req.body;

  if (!type || amount === undefined || amount === null || !category) {
    return res
      .status(400)
      .json({ message: 'Type, amount, and category are required' });
  }

  const numericAmount = Number(amount);
  if (Number.isNaN(numericAmount)) {
    return res.status(400).json({ message: 'Amount must be a valid number' });
  }

  try {
    const transaction = await Transaction.create({
      user: req.user.id,
      type,
      amount: numericAmount,
      category,
      date: date || Date.now(),
      note,
    });

    return res.status(201).json({ transaction });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create transaction' });
  }
});

router.post('/ai', authMiddleware, async (req, res) => {
  const { prompt, userDate } = req.body;

  try {
    const aiResult = await analyzeTransactionPrompt(prompt);
    const { raw, date: aiDate, ...transactionFields } = aiResult;
    const fallbackDate = new Date();

    const resolvedDateString = typeof userDate === 'string' && userDate.trim().length > 0
      ? userDate.trim()
      : aiDate;

    let parsedDate = null;

    if (resolvedDateString && /^\d{4}-\d{2}-\d{2}$/.test(resolvedDateString)) {
      parsedDate = new Date(`${resolvedDateString}T00:00:00`);
    } else if (resolvedDateString) {
      const temp = new Date(resolvedDateString);
      parsedDate = Number.isNaN(temp.getTime()) ? null : temp;
    }

    const dateValue = parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate : fallbackDate;

    const transaction = await Transaction.create({
      user: req.user.id,
      ...transactionFields,
      date: dateValue,
    });

    return res.status(201).json({ transaction });
  } catch (error) {
    if (error instanceof ClarityAIError) {
      return res.status(error.statusCode || 400).json({ message: error.message });
    }
    console.error('Clarity AI error:', error);
    return res.status(500).json({ message: 'Clarity AI could not process that entry' });
  }
});

// Update an existing transaction
router.put('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  const allowedFields = ['type', 'amount', 'category', 'date', 'note'];
  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  if (updates.amount !== undefined) {
    const numericAmount = Number(updates.amount);
    if (Number.isNaN(numericAmount)) {
      return res.status(400).json({ message: 'Amount must be a valid number' });
    }
    updates.amount = numericAmount;
  }

  try {
    const transaction = await Transaction.findOneAndUpdate(
      { _id: id, user: req.user.id },
      updates,
      { new: true }
    );

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    return res.json({ transaction });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update transaction' });
  }
});

// Delete a transaction
router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const transaction = await Transaction.findOneAndDelete({ _id: id, user: req.user.id });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    return res.json({ message: 'Transaction removed' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete transaction' });
  }
});

module.exports = router;
