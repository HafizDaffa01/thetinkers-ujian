import { soalDatabase } from '../../data/Soal';
import crypto from 'node:crypto';

export const prerender = false; // Ensure this is evaluated at request time

const SALT = import.meta.env.QUIZ_SALT || "fallback_salt";

export async function GET() {
  // Shuffle and pick 50 questions
  const shuffled = [...soalDatabase].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 50);

  // Map to safe format (NO ANSWERS, NO HASHES - Browser doesn't need to check anything)
  const safeQuestions = selected.map(q => {
    return {
      id: q.id,
      category: q.category,
      question: q.question,
      options: q.options
    };
  });

  return new Response(JSON.stringify(safeQuestions), {
    status: 200,
    headers: {
      "Content-Type": "application/json"
    }
  });
}
