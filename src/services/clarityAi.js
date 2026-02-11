const { GoogleGenerativeAI } = require('@google/generative-ai');

const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'models/gemini-2.5-flash';

class ClarityAIError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

let cachedModel;

const getModel = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new ClarityAIError('GEMINI_API_KEY is missing. Add it to your root .env file.', 500);
  }

  if (!cachedModel) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    cachedModel = genAI.getGenerativeModel({
      model: DEFAULT_MODEL,
      generationConfig: {
        temperature: 0.25,
        maxOutputTokens: 512,
      },
    });
  }

  return cachedModel;
};

const SYSTEM_PROMPT = `You are Clarity AI, an assistant that normalizes Nepali personal finance notes.
Return ONLY minified JSON that matches this schema:
{
  "type": "income" | "expense",
  "category": "short descriptive label",
  "amount": number,
  "date": "YYYY-MM-DD",
  "note": "<=120 characters"
}
Rules:
- Decide if it is money earned (income) or spent (expense) even if words like deposit/paid/upfront are used.
- amount must be a positive number (absolute value if the user includes +/- or words like "spent").
- category is 1-2 words (Salary, Freelancing, Groceries, Rent, Dining, Utilities, Health, Travel, Misc, etc.).
- date should use the one mentioned in the note or default to today's date in the user's timezone.
- note should be a concise summary (max 120 chars) derived from the input.
- If information is missing, make a practical assumption instead of leaving it blank.
Respond with JSON only. No prose, markdown, or code fences.`;

const stripJson = (rawText) => {
  if (!rawText) {
    throw new ClarityAIError('AI response was empty', 502);
  }

  const withoutFences = rawText.replace(/```json|```/gi, '').trim();
  const start = withoutFences.indexOf('{');
  const end = withoutFences.lastIndexOf('}');

  if (start === -1 || end === -1) {
    throw new ClarityAIError('AI response did not contain JSON', 502);
  }

  return withoutFences.slice(start, end + 1);
};

const normalizeType = (value) => (value === 'income' ? 'income' : 'expense');

const normalizeAmount = (value) => {
  const numericValue = Number(value);
  if (Number.isNaN(numericValue) || numericValue <= 0) {
    throw new ClarityAIError('AI could not determine a valid amount', 422);
  }
  return Number(Math.abs(numericValue).toFixed(2));
};

const normalizeCategory = (value) => {
  if (!value) {
    return 'Misc';
  }

  return String(value).trim().replace(/\s+/g, ' ').slice(0, 30) || 'Misc';
};

const normalizeDate = (value) => {
  if (!value) {
    return new Date();
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return new Date();
  }

  return parsed;
};

const normalizeNote = (value, fallback) => {
  if (!value) {
    return fallback.slice(0, 120);
  }

  return String(value).trim().slice(0, 120);
};

const analyzeTransactionPrompt = async (userInput) => {
  const trimmedInput = (userInput || '').trim();

  if (!trimmedInput) {
    throw new ClarityAIError('Say something about the transaction first.', 400);
  }

  const model = getModel();
  const composedPrompt = `${SYSTEM_PROMPT}\nTransaction note: "${trimmedInput}"`;
  const response = await model.generateContent({
    contents: [
      {
        role: 'user',
        parts: [{ text: composedPrompt }],
      },
    ],
  });

  const rawText = response?.response?.text();
  const jsonPayload = stripJson(rawText);
  let parsed;

  try {
    parsed = JSON.parse(jsonPayload);
  } catch (error) {
    throw new ClarityAIError('AI response was not valid JSON', 502);
  }

  const amount = normalizeAmount(parsed.amount);
  const category = normalizeCategory(parsed.category);
  const type = normalizeType(parsed.type);
  const date = normalizeDate(parsed.date);
  const note = normalizeNote(parsed.note, trimmedInput);

  return {
    type,
    amount,
    category,
    date: date.toISOString().split('T')[0],
    note,
    raw: {
      prompt: trimmedInput,
      model: DEFAULT_MODEL,
    },
  };
};

module.exports = {
  analyzeTransactionPrompt,
  ClarityAIError,
};
