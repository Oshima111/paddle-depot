import { supabase, isSupabaseConfigured } from "./supabase";

export type AdminAction =
  | "product_created"
  | "product_updated"
  | "product_deleted"
  | "product_duplicated"
  | "stock_status_changed"
  | "featured_changed"
  | "is_new_changed"
  | "image_uploaded"
  | "image_replaced"
  | "image_removed"
  | "price_changed";

export interface AdminLogEntry {
  action: AdminAction;
  description: string;
  product_id?: number | string;
  product_name?: string;
  admin_email?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Log an admin activity to the admin_log table.
 * In demo mode, logs to console instead.
 * Silently fails if the table doesn't exist yet.
 */
export async function logAdminActivity(entry: AdminLogEntry): Promise<void> {
  if (!isSupabaseConfigured) {
    console.log("[Activity Log]", entry.action, "-", entry.description);
    return;
  }

  try {
    const { data: userData } = await supabase.auth.getUser();
    const adminEmail = userData?.user?.email || "unknown";

    const { error } = await supabase.from("admin_log").insert({
      action: entry.action,
      description: entry.description,
      product_id: entry.product_id ? Number(entry.product_id) : null,
      product_name: entry.product_name || null,
      admin_email: adminEmail,
      metadata: entry.metadata || {},
    });

    if (error) {
      // Table might not exist yet — silently ignore
      if (error.message?.includes("relation") && error.message?.includes("does not exist")) {
        console.warn("[Activity Log] admin_log table not found. Run the migration.");
        return;
      }
      console.error("[Activity Log] Failed to log activity:", error.message);
    }
  } catch (err) {
    console.warn("[Activity Log] Error logging activity:", err);
  }
}

