import { NextRequest, NextResponse } from "next/server";

// Tip güvenliği için ChatMessage tipini tanımla
export interface ChatMessage {
  id: number;
  content: string;
  sender: {
    id: number;
    username: string;
  };
  is_current_user: boolean;
  created_at: string;
}

// GET handler
export async function GET(req: NextRequest) {
  return NextResponse.json({
    message: "WebSocket server route",
    info: "WebSocket functionality is handled by a separate server process"
  });
}

// POST handler - örnek olarak mesaj durumunu döndüren bir endpoint
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    return NextResponse.json({
      status: "success",
      message: "Message acknowledged",
      data: {
        ...data,
        id: Date.now(),
        created_at: new Date().toISOString()
      }
    });
  } catch (error) {
    return NextResponse.json({
      status: "error",
      message: "Invalid request data"
    }, { status: 400 });
  }
}
