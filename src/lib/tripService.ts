// src/lib/tripService.ts

/**
 * Service layer for Trip management using Supabase.
 * Assumes the following tables exist in Supabase:
 *   - trips: columns id (uuid), name (text), start_date (date), end_date (date), created_by (uuid)
 *   - trip_invitations: columns id (uuid), trip_id (uuid), email (text), status (text enum: 'pending','accepted','declined'), invited_by (uuid)
 */

import { createClient as createServerClient } from "@/lib/supabase/server";

export type Trip = {
  id: string;
  name: string;
  start_date: string; // ISO date string
  end_date: string;   // ISO date string
  created_by: string;
};

export type Invitation = {
  id: string;
  trip_id: string;
  email: string;
  status: string;
  invited_by: string;
};

/**
 * Helper to get a Supabase client for server‑side usage.
 */
async function getSupabase() {
  return await createServerClient();
}

/** Create a new trip */
export async function createTrip(data: {
  name: string;
  start_date: string;
  end_date: string;
  created_by: string;
}) {
  const supabase = await getSupabase();
  const { data: trip, error } = await supabase.from("trips").insert([data]).single();
  if (error) throw error;
  return trip as Trip;
}

/** Get a single trip by ID */
export async function getTrip(id: string) {
  const supabase = await getSupabase();
  const { data: trip, error } = await supabase.from("trips").select("*").eq("id", id).single();
  if (error) throw error;
  return trip as Trip;
}

/** Update a trip */
export async function updateTrip(id: string, updates: Partial<Omit<Trip, "id" | "created_by">>) {
  const supabase = await getSupabase();
  const { data: trip, error } = await supabase.from("trips").update(updates).eq("id", id).single();
  if (error) throw error;
  return trip as Trip;
}

/** Delete a trip */
export async function deleteTrip(id: string) {
  const supabase = await getSupabase();
  const { error } = await supabase.from("trips").delete().eq("id", id);
  if (error) throw error;
  return true;
}

/** List trips belonging to a user (owner) */
export async function listUserTrips(userId: string) {
  const supabase = await getSupabase();
  const { data: trips, error } = await supabase
    .from("trips")
    .select("*")
    .eq("created_by", userId)
    .order("start_date", { ascending: true });
  if (error) throw error;
  return trips as Trip[];
}

/** Invite a user to a trip by email */
export async function inviteUser(params: {
  trip_id: string;
  email: string;
  invited_by: string;
}) {
  const supabase = await getSupabase();
  const { data: invite, error } = await supabase.from("trip_invitations").insert([params]).single();
  if (error) throw error;
  return invite as Invitation;
}

/** Accept an invitation */
export async function acceptInvite(inviteId: string) {
  const supabase = await getSupabase();
  const { data: invite, error } = await supabase
    .from("trip_invitations")
    .update({ status: "accepted" })
    .eq("id", inviteId)
    .single();
  if (error) throw error;
  return invite as Invitation;
}

/** List pending invitations for a user (by email) */
export async function listInvitations(email: string) {
  const supabase = await getSupabase();
  const { data: invites, error } = await supabase
    .from("trip_invitations")
    .select("*")
    .eq("email", email)
    .eq("status", "pending");
  if (error) throw error;
  return invites as Invitation[];
}
