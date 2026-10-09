import { handleGenerate } from "@/lib/model-gateway.mjs";
export async function POST(request: Request) { return handleGenerate(request); }
