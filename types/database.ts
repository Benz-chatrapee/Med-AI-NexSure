export type DatabaseConnectionState =
  | "connected"
  | "missing_configuration"
  | "connection_failed";

export type DatabaseHealth = {
  state: DatabaseConnectionState;
  provider: "supabase";
  checkedAt: string;
  message: string;
};
