import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";

// GET /api/notes - Tüm notları getir
export async function GET() {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Bu işlem için giriş yapmalısınız" },
        { status: 401 }
      );
    }

    const notes = await prisma.note.findMany({
      orderBy: {
        createdAt: "desc",
      },
      where: {
        userId: parseInt(session.user.id),
      },
    });

    return NextResponse.json(notes);
  } catch (error) {
    console.error("Failed to fetch notes:", error);
    return NextResponse.json(
      { error: "Notlar alınırken bir hata oluştu" },
      { status: 500 }
    );
  }
}

// POST /api/notes - Yeni not ekle
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
        { error: "Not başlığı gereklidir" },
        { status: 400 }
      );
    }

    const newNote = await prisma.note.create({
      data: {
        title: data.title,
        content: data.content || "",
        userId: parseInt(session.user.id),
      },
    });

    return NextResponse.json(newNote, { status: 201 });
  } catch (error) {
    console.error("Failed to create note:", error);
    return NextResponse.json(
      { error: "Not oluşturulurken bir hata oluştu" },
      { status: 500 }
    );
  }
}

// PUT /api/notes?id=1 - Notu güncelle
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
        { error: "Not ID'si gereklidir" },
        { status: 400 }
      );
    }

    // Notun kullanıcıya ait olup olmadığını kontrol et
    const note = await prisma.note.findUnique({
      where: {
        id: parseInt(id),
      },
    });

    if (!note || note.userId !== parseInt(session.user.id)) {
      return NextResponse.json(
        { error: "Bu notu düzenleme yetkiniz yok" },
        { status: 403 }
      );
    }

    const data = await request.json();

    const updatedNote = await prisma.note.update({
      where: {
        id: parseInt(id),
      },
      data: {
        title: data.title,
        content: data.content,
      },
    });

    return NextResponse.json(updatedNote);
  } catch (error) {
    console.error("Failed to update note:", error);
    return NextResponse.json(
      { error: "Not güncellenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

// DELETE /api/notes?id=1 - Notu sil
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
        { error: "Not ID'si gereklidir" },
        { status: 400 }
      );
    }

    // Notun kullanıcıya ait olup olmadığını kontrol et
    const note = await prisma.note.findUnique({
      where: {
        id: parseInt(id),
      },
    });

    if (!note || note.userId !== parseInt(session.user.id)) {
      return NextResponse.json(
        { error: "Bu notu silme yetkiniz yok" },
        { status: 403 }
      );
    }

    await prisma.note.delete({
      where: {
        id: parseInt(id),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete note:", error);
    return NextResponse.json(
      { error: "Not silinirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
