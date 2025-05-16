import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";

// GET /api/chat - Kullanıcının mesajlarını getir
export async function GET() {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Bu işlem için giriş yapmalısınız" },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id);

    // Kullanıcının gönderdiği ve aldığı tüm mesajları getir
    const messages = await prisma.chatMessage.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId },
        ],
      },
      orderBy: {
        timestamp: "asc",
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
          },
        },
        receiver: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Failed to fetch chat messages:", error);
    return NextResponse.json(
      { error: "Mesajlar alınırken bir hata oluştu" },
      { status: 500 }
    );
  }
}

// POST /api/chat - Yeni mesaj gönder
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Bu işlem için giriş yapmalısınız" },
        { status: 401 }
      );
    }

    const data = await request.json();

    // Gerekli alanları kontrol et
    if (!data.content || !data.receiverId) {
      return NextResponse.json(
        { error: "Mesaj içeriği ve alıcı ID'si gereklidir" },
        { status: 400 }
      );
    }

    const senderId = parseInt(session.user.id);
    const receiverId = parseInt(data.receiverId);

    // Kullanıcı kendine mesaj gönderemez
    if (senderId === receiverId) {
      return NextResponse.json(
        { error: "Kendinize mesaj gönderemezsiniz" },
        { status: 400 }
      );
    }

    // Alıcının var olup olmadığını kontrol et
    const receiver = await prisma.user.findUnique({
      where: {
        id: receiverId,
      },
    });

    if (!receiver) {
      return NextResponse.json(
        { error: "Geçersiz alıcı" },
        { status: 400 }
      );
    }

    const newMessage = await prisma.chatMessage.create({
      data: {
        content: data.content,
        senderId,
        receiverId,
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
          },
        },
        receiver: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    console.error("Failed to send message:", error);
    return NextResponse.json(
      { error: "Mesaj gönderilirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

// DELETE /api/chat?id=1 - Mesajı sil
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Bu işlem için giriş yapmalısınız" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Mesaj ID'si gereklidir" },
        { status: 400 }
      );
    }

    // Mesajın kullanıcıya ait olup olmadığını kontrol et
    const message = await prisma.chatMessage.findUnique({
      where: {
        id: parseInt(id),
      },
    });

    if (!message || message.senderId !== parseInt(session.user.id)) {
      return NextResponse.json(
        { error: "Bu mesajı silme yetkiniz yok" },
        { status: 403 }
      );
    }

    await prisma.chatMessage.delete({
      where: {
        id: parseInt(id),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete message:", error);
    return NextResponse.json(
      { error: "Mesaj silinirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
