import { createClient } from "@supabase/supabase-js";

/* ===========================================================
   SETUP — paste your Supabase project details below.

   1. Go to https://supabase.com → create a free account/project
   2. In your project: Settings → API
   3. Copy "Project URL" and paste below as SUPABASE_URL
   4. Copy "anon public" key and paste below as SUPABASE_ANON_KEY
=========================================================== */

const SUPABASE_URL = "https://oveqdbsisvrbddffafmj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92ZXFkYnNpc3ZyYmRkZmZhZm1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxMzEwNjcsImV4cCI6MjA5NzcwNzA2N30.WGrkVzRsJIhvdf_YrO3aY2-OZi4N0zCz3kg8NHKWaJQ";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
