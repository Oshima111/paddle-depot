/**
 * Production Diagnostic Utility for Paddle Depot
 *
 * This module logs critical runtime information to the browser console
 * when the Admin Dashboard loads in production. It helps diagnose
 * authentication, configuration, and database issues.
 *
 * Safe: No Supabase keys or secrets are logged.
 */

import { supabase } from "./supabase";

// Check if Supabase is configured from env vars
const isSupabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL && 
  import.meta.env.VITE_SUPABASE_ANON_KEY && 
  (import.meta.env.VITE_SUPABASE_URL as string).startsWith('http')
);

export interface DiagnosticResult {
  timestamp: string;
  isSupabaseConfigured: boolean;
  supabaseUrlHost: string | null;
  authUser: { id: string | null; email: string | null };
  authError: string | null;
  adminAllowlistStatus: string;
  sessionExists: boolean;
}

/**
 * Runs a full production diagnostic and returns/logs the results.
 * Does NOT expose the Supabase anon key or any secrets.
 */
export async function runDiagnostic(): Promise<DiagnosticResult> {
  const result: DiagnosticResult = {
    timestamp: new Date().toISOString(),
    isSupabaseConfigured: false,
    supabaseUrlHost: null,
    authUser: { id: null, email: null },
    authError: null,
    adminAllowlistStatus: "Not checked",
    sessionExists: false,
  };

  // Step 1: Check if Supabase is configured
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const supabaseKeyExists = Boolean(import.meta.env.VITE_SUPABASE_ANON_KEY);

  result.isSupabaseConfigured = isSupabaseConfigured;

  if (supabaseUrl) {
    try {
      result.supabaseUrlHost = new URL(supabaseUrl).hostname;
    } catch {
      result.supabaseUrlHost = "invalid URL";
    }
  }

  console.group("%c[PROD DIAGNOSTIC] Admin Dashboard Startup", "color: #10b981; font-weight: bold");
  console.log("Timestamp:", result.timestamp);
  console.log("Supabase configured:", isSupabaseConfigured);
  console.log("Supabase URL hostname:", result.supabaseUrlHost || "N/A");
  console.log("Supabase key exists in env:", supabaseKeyExists);

  if (!isSupabaseConfigured) {
    console.warn(
      "🚨 DEMO MODE ACTIVE: isSupabaseConfigured is FALSE. " +
      "The app is running in demo mode. " +
      "For production CRUD, VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY " +
      "must be set in Vercel Production environment variables."
    );
    console.groupEnd();
    return result;
  }

  // Step 2: Check authentication
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      result.authError = sessionError.message;
      console.error("Session fetch error:", sessionError.message);
    } else {
      result.sessionExists = !!sessionData?.session;
      console.log("Session exists:", !!sessionData?.session);
      
      if (sessionData?.session) {
        const user = sessionData.session.user;
        result.authUser = { id: user?.id || null, email: user?.email || null };
        console.log("Auth user ID:", user?.id);
        console.log("Auth user email:", user?.email);
        console.log("Auth user created at:", user?.created_at);
        
        // Check if email is confirmed
        const emailConfirmed = user?.email_confirmed_at || user?.confirmed_at;
        console.log("Email confirmed:", !!emailConfirmed);
      } else {
        console.warn("🚨 NO SESSION: User is not authenticated with Supabase.");
        console.warn("The ProtectedRoute may be using demo localStorage fallback.");
      }
    }
  } catch (err: any) {
    result.authError = err?.message || "Unknown error";
    console.error("Auth check error:", err);
  }

  // Step 3: Check admin_allowlist
  if (result.authUser.email) {
    try {
      const { data: allowlistData, error: allowlistError } = await supabase
        .from("admin_allowlist")
        .select("email")
        .eq("email", result.authUser.email)
        .maybeSingle();

      if (allowlistError) {
        result.adminAllowlistStatus = `Error: ${allowlistError.message}`;
        console.error("Admin allowlist query error:", allowlistError.message);
        
        if (allowlistError.message?.includes("does not exist")) {
          console.error("🚨 admin_allowlist TABLE DOES NOT EXIST in production!");
          console.error("Run migration 00002_admin_allowlist.sql in Supabase SQL Editor.");
        } else if (allowlistError.message?.includes("permission denied") || allowlistError.code === "42501") {
          console.warn("🚨 RLS BLOCKING: Permission denied querying admin_allowlist.");
          console.warn("The table exists but RLS may be blocking the SELECT.");
        }
      } else if (allowlistData) {
        result.adminAllowlistStatus = `✅ Found: ${allowlistData.email}`;
        console.log("✅ Admin allowlist match found:", allowlistData.email);
      } else {
        result.adminAllowlistStatus = "❌ NOT FOUND";
        console.error(
          `🚨 USER "${result.authUser.email}" IS NOT IN admin_allowlist!`,
          "Run: INSERT INTO admin_allowlist (email) VALUES ('" + result.authUser.email + "');"
        );
      }
    } catch (err: any) {
      result.adminAllowlistStatus = `Error: ${err?.message || "Unknown"}`;
      console.error("Allowlist check error:", err);
    }
  } else {
    result.adminAllowlistStatus = "Cannot check: No authenticated email";
    console.warn("Cannot check allowlist - no authenticated user email.");
  }

  // Step 4: Check products table accessibility
  try {
    const { error: productsError, count } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true });

    if (productsError) {
      console.error("Products table query error:", productsError.message);
      if (productsError.message?.includes("does not exist")) {
        console.error("🚨 products TABLE DOES NOT EXIST in production!");
        console.error("Run migration 00001_create_products_table.sql in Supabase SQL Editor.");
      } else if (productsError.message?.includes("permission denied") || productsError.code === "42501") {
        console.error("🚨 RLS BLOCKING SELECT on products table!");
      }
    } else {
      console.log(`✅ Products table accessible. Product count: ${count || 0}`);
    }
  } catch (err: any) {
    console.error("Products table check error:", err);
  }

  console.groupEnd();
  return result;
}

/**
 * Returns a user-friendly summary of the diagnostic result.
 */
export function getDiagnosticSummary(result: DiagnosticResult): string[] {
  const lines: string[] = [];

  if (!result.isSupabaseConfigured) {
    lines.push("🔴 Demo Mode Active — Supabase is NOT configured.");
    lines.push("   Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel.");
    return lines;
  }

  lines.push("🟢 Supabase is configured.");
  lines.push(`   URL host: ${result.supabaseUrlHost || "N/A"}`);

  if (result.sessionExists && result.authUser.email) {
    lines.push(`🟢 Authenticated as: ${result.authUser.email}`);
  } else {
    lines.push("🔴 Not authenticated with Supabase.");
    return lines;
  }

  if (result.adminAllowlistStatus.startsWith("✅")) {
    lines.push("🟢 Admin allowlist: OK");
  } else if (result.adminAllowlistStatus.startsWith("❌")) {
    lines.push("🔴 Admin allowlist: USER NOT FOUND");
    lines.push("   Run: INSERT INTO admin_allowlist (email) VALUES ('" + result.authUser.email + "');");
  } else if (result.adminAllowlistStatus.startsWith("Error")) {
    lines.push(`🔴 Admin allowlist error: ${result.adminAllowlistStatus}`);
  }

  if (result.authError) {
    lines.push(`🔴 Auth error: ${result.authError}`);
  }

  return lines;
}

