import { soalDatabase } from '../../data/Soal';
import { supabase } from '../../lib/supabase';
import crypto from 'node:crypto';

export const prerender = false;

export async function POST({ request }) {
  try {
    const body = await request.json();
    const { operatorName, userSelections, activeQuestionIds, cheatCount } = body;
    
    const SALT = import.meta.env.QUIZ_SALT || "fallback_salt";

    // 1. Calculate Score Server-Side
    let score = 0;
    const isCorrectArray = activeQuestionIds.map((id, index) => {
      const question = soalDatabase.find(q => q.id === id);
      const userAnswer = userSelections[index];
      const isCorrect = question && question.answer === userAnswer;
      if (isCorrect) score++;
      return isCorrect;
    });

    const accuracy = Math.round((score / activeQuestionIds.length) * 100);

    // 2. Submit to Supabase from Server
    const { error } = await supabase
      .from('kandidat')
      .insert([
        {
          nama: operatorName.toUpperCase(),
          skor: score,
          akurasi: accuracy,
          jawaban: userSelections,
          is_correct: isCorrectArray,
          violation_count: cheatCount,
          created_at: new Date().toISOString()
        }
      ]);

    if (error) throw error;

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    console.error("Submission error:", err);
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
