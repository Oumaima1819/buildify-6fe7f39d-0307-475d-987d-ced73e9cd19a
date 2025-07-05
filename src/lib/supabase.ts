
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qfyfmjlmbvwpyhnjprnd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmeWZtamxtYnZ3cHlobmpwcm5kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4NzU2ODMsImV4cCI6MjA1OTQ1MTY4M30.yAKVCNvj6Nocnc-hCDOeRDjcsKkpWq7dDdEiLgEfLPg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  gender: string | null;
  birth_date: string | null;
  height: number | null;
  weight: number | null;
  health_goals: string[] | null;
  chronic_conditions: string[] | null;
  created_at: string;
  updated_at: string;
};

export type HealthMetric = {
  id: string;
  user_id: string;
  date: string;
  weight: number | null;
  sleep_hours: number | null;
  heart_rate: number | null;
  steps: number | null;
  water_intake: number | null;
  mood: string | null;
  stress_level: number | null;
  notes: string | null;
  created_at: string;
};

export type Meal = {
  id: string;
  user_id: string;
  date: string;
  meal_type: string;
  food_items: string[] | null;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  notes: string | null;
  created_at: string;
};

export type Medication = {
  id: string;
  user_id: string;
  name: string;
  dosage: string | null;
  frequency: string | null;
  start_date: string | null;
  end_date: string | null;
  reminder_times: string[] | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Appointment = {
  id: string;
  user_id: string;
  title: string;
  doctor_name: string | null;
  specialty: string | null;
  location: string | null;
  date: string;
  time: string;
  notes: string | null;
  reminder_sent: boolean;
  created_at: string;
  updated_at: string;
};

export type HealthArticle = {
  id: string;
  title: string;
  content: string;
  author: string | null;
  category: string | null;
  tags: string[] | null;
  image_url: string | null;
  published_at: string;
  is_featured: boolean;
};

export type MentalExercise = {
  id: string;
  title: string;
  description: string;
  category: string | null;
  duration: number | null;
  instructions: string | null;
  audio_url: string | null;
  image_url: string | null;
};

export type NutritionPlan = {
  id: string;
  title: string;
  description: string;
  goal: string | null;
  daily_calories: number | null;
  protein_percentage: number | null;
  carbs_percentage: number | null;
  fat_percentage: number | null;
  meal_suggestions: any | null;
  image_url: string | null;
};