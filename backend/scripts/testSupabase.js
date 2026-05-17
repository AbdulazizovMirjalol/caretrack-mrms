import { supabase } from "../src/config/supabase.js";
import { env } from "../src/config/env.js";

console.log("Testing Supabase connection...");

console.log("SUPABASE_URL:", env.supabaseUrl ? "loaded" : "missing");
console.log(
  "SUPABASE_SERVICE_ROLE_KEY:",
  env.supabaseServiceRoleKey ? "loaded" : "missing",
);

const { error } = await supabase
  .from("users")
  .select("id", { count: "exact", head: true });

if (error) {
  console.error("Supabase connection failed:");
  console.error(error);
  process.exit(1);
}

console.log("Supabase connection OK.");
