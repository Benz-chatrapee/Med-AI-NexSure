import "server-only";

import { checkSupabaseConnection } from "@/lib/database/supabase-rest";

export const databaseService = {
  async getHealth() {
    return checkSupabaseConnection();
  },
};
