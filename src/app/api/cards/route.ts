import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";

// GET /api/cards - Tüm kartları getir
export async function GET() {
  try {
    const cards = await prisma.card.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return NextResponse.json(cards);
  } catch (error) {
    console.error("Failed to fetch cards:", error);
    return NextResponse.json(
      { error: "Kartlar alınırken bir hata oluştu" },
      { status: 500 }
    );
  }
}

// POST /api/cards - Yeni kart ekle
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
    if (!data.title) {
      return NextResponse.json(
        { error: "Kart başlığı gereklidir" },
        { status: 400 }
      );
    }

    const newCard = await prisma.card.create({
      data: {
        title: data.title,
        content: data.content || "",
        imageUrl: data.imageUrl || "",
      },
    });

    return NextResponse.json(newCard, { status: 201 });
  } catch (error) {
    console.error("Failed to create card:", error);
    return NextResponse.json(
      { error: "Kart oluşturulurken bir hata oluştu" },
      { status: 500 }
    );
  }
}

// PUT /api/cards?id=1 - Kartı güncelle
export async function PUT(request: NextRequest) {
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
        { error: "Kart ID'si gereklidir" },
        { status: 400 }
      );
    }

    const data = await request.json();

    const updatedCard = await prisma.card.update({
      where: {
        id: parseInt(id),
      },
      data: {
        title: data.title,
        content: data.content,
        imageUrl: data.imageUrl,
      },
    });

    return NextResponse.json(updatedCard);
  } catch (error) {
    console.error("Failed to update card:", error);
    return NextResponse.json(
      { error: "Kart güncellenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

// DELETE /api/cards?id=1 - Kartı sil
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
        { error: "Kart ID'si gereklidir" },
        { status: 400 }
      );
    }

    await prisma.card.delete({
      where: {
        id: parseInt(id),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete card:", error);
    return NextResponse.json(
      { error: "Kart silinirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
