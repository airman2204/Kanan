import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://gkiqxexacyhnhjfbmvqw.supabase.co";
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdraXF4ZXhhY3lobmhqZmJtdnF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMwMzM5MzEsImV4cCI6MjEwODYwOTkzMX0.2VQs1EMRZNZ2SCPuxzcLJ5G1IvQrdJrqJ2SAKodD-lM";

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});
