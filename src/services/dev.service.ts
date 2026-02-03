
import { supabase } from "../lib/supabase";
import { Request, Response } from "express";

export async function devLogin(req: Request, res: Response) {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  return res.json({
    access_token: data.session.access_token,
  });
}
