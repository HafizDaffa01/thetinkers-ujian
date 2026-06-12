import { soalDatabase } from '../../data/Soal';
import crypto from 'node:crypto';

export const prerender = false; // Ensure this is evaluated at request time

const SALT = "tinkers_sec_2026_salt";

export async function GET() {
  // Shuffle and pick 50 questions
  const shuffled = [...soalDatabase].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 50);

  // Map to safe format (no plain text answers)
  const safeQuestions = selected.map(q => {
    const hash = crypto
      .createHash('sha256')
      .update(`${q.id}-${q.answer}-${SALT}`)
      .digest('hex');
      
    return {
      id: q.id,
      category: q.category,
      question: q.question,
      options: q.options,
      answerHash: hash
    };
  });

  return new Response(JSON.stringify(safeQuestions), {
    status: 200,
    headers: {
      "Content-Type": "application/json"
    }
  });
}
