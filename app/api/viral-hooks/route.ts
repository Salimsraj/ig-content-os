import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const DATA_FILE = path.join(process.cwd(), "data", "viral-hooks.json");

export async function GET() {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    return Response.json(JSON.parse(raw));
  } catch {
    return Response.json({ accounts: [], hooks: [] });
  }
}
