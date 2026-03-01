import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_API_KEY } from '@/constants/aiConfig';
import { MOCK_USER, MOCK_ACCOUNTS, MOCK_TRANSACTIONS } from './mockData';
import {
  calculateConfidenceScore,
  calculateSafeToSpend,
  generateActionPlan,
} from './financialEngine';

export type ChatMessage = {
  role: 'user' | 'model';
  text: string;
};

function buildFinancialContext(): string {
  const score = calculateConfidenceScore();
  const safe = calculateSafeToSpend();
  const actions = generateActionPlan();

  const accounts = MOCK_ACCOUNTS.map((a) => {
    if (a.type === 'Credit') {
      const util = Math.round((Math.abs(a.balance) / (a.creditLimit ?? 1)) * 100);
      return `${a.type} (${a.name} ${a.number}): Owed $${Math.abs(a.balance).toFixed(2)}, Limit $${a.creditLimit?.toLocaleString()}, Utilization ${util}%`;
    }
    return `${a.type} (${a.name} ${a.number}): Balance $${a.balance.toFixed(2)}, Available $${a.available.toFixed(2)}`;
  }).join('\n');

  const txLines = MOCK_TRANSACTIONS.map((t) =>
    `  ${t.date} | ${t.description} | ${t.amount > 0 ? '+' : ''}$${t.amount.toFixed(2)} | ${t.category}${t.pending ? ' [pending]' : ''}`
  ).join('\n');

  const actionLines = actions.map((a) =>
    `  [${a.priority.toUpperCase()}] ${a.title} — ${a.impact}`
  ).join('\n');

  const breakdownLines = score.breakdown.map((f) =>
    `  ${f.label}: ${f.score}/100 — ${f.insight}`
  ).join('\n');

  return `USER: ${MOCK_USER.name}

ACCOUNTS:
${accounts}

ALL TRANSACTIONS:
${txLines}

FINANCIAL CONFIDENCE SCORE: ${score.score}/100 (Grade ${score.grade}, "${score.tier}")
Score Breakdown:
${breakdownLines}

SAFE TO SPEND:
  Daily: $${safe.dailyAmount.toFixed(2)}
  Weekly: $${safe.weeklyAmount.toFixed(2)}
  Days left this month: ${safe.daysLeftInMonth}
  Status: ${safe.reasoning}

RECOMMENDED ACTIONS:
${actionLines}`.trim();
}

const SYSTEM_INSTRUCTION = `You are a PNC Smart Banking AI financial assistant embedded in the PNC mobile app. You have access to the user's real account and transaction data below. Answer questions about their finances clearly and accurately.

Rules:
- Always reference actual dollar amounts and merchant names from the data — never invent figures
- Be concise: 2-4 sentences for simple questions, bullet points for breakdowns
- Be encouraging but honest about problem areas
- Do not tell users to "contact their bank" for info already in the data
- Do not discuss topics outside personal finance

${buildFinancialContext()}`;

function getModel() {
  if (GEMINI_API_KEY === 'YOUR_GEMINI_KEY_HERE') {
    throw new Error('Add your Gemini API key to constants/aiConfig.ts');
  }
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  return genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: SYSTEM_INSTRUCTION,
  });
}

export async function generateAIInsight(): Promise<string> {
  const model = getModel();
  const result = await model.generateContent(
    "Write a 2-3 sentence personalized summary of this user's current financial health. Be specific — mention actual dollar amounts and account names. Be direct and actionable."
  );
  return result.response.text();
}

export async function askFinancialQuestion(messages: ChatMessage[]): Promise<string> {
  const model = getModel();
  const history = messages.slice(0, -1).map((m) => ({
    role: m.role,
    parts: [{ text: m.text }],
  }));
  const chat = model.startChat({ history });
  const lastMessage = messages[messages.length - 1];
  const result = await chat.sendMessage(lastMessage.text);
  return result.response.text();
}

export async function getAIActionAdvice(actionTitle: string, actionDescription: string): Promise<string> {
  const model = getModel();
  const result = await model.generateContent(
    `Give me 3-4 specific, actionable steps for: "${actionTitle}". Context: ${actionDescription}. Reference my actual account balances and transactions where relevant. Be brief and practical.`
  );
  return result.response.text();
}
