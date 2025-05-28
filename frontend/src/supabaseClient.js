// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

// Estos son tus valores reales:
const SUPABASE_URL      = 'https://uvimmvohyoejofoukrmo.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2aW1tdm9oeW9lam9mb3Vrcm1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyMTU0MzcsImV4cCI6MjA1OTc5MTQzN30.AurucT01swsZLKHQXSCZ0AyWw0njeqv10YvwxOpNXwY'

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
)
