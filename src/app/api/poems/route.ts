import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";

// GET /api/poems - Tüm şiirleri getir
export async function GET() {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Bu işlem için giriş yapmalısınız" },
        { status: 401 }
      );
    }

    const poems = await prisma.poem.findMany({
      orderBy: {
        createdAt: "desc",
      },
      where: {
        userId: parseInt(session.user.id),
      },
    });

    return NextResponse.json(poems);
  } catch (error) {
    console.error("Failed to fetch poems:", error);
    return NextResponse.json(
      { error: "Şiirler alınırken bir hata oluştu" },
      { status: 500 }
    );
  }
}

// POST /api/poems - Yeni şiir ekle
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
        { error: "Şiir başlığı gereklidir" },
        { status: 400 }
      );
    }

    const newPoem = await prisma.poem.create({
      data: {
        title: data.title,
        content: data.content || "",
        userId: parseInt(session.user.id),
      },
    });

    return NextResponse.json(newPoem, { status: 201 });
  } catch (error) {
    console.error("Failed to create poem:", error);
    return NextResponse.json(
      { error: "Şiir oluşturulurken bir hata oluştu" },
      { status: 500 }
    );
  }
}

// PUT /api/poems?id=1 - Şiiri güncelle
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
        { error: "Şiir ID'si gereklidir" },
        { status: 400 }
      );
    }

    // Şiirin kullanıcıya ait olup olmadığını kontrol et
    const poem = await prisma.poem.findUnique({
      where: {
        id: parseInt(id),
      },
    });

    if (!poem || poem.userId !== parseInt(session.user.id)) {
      return NextResponse.json(
        { error: "Bu şiiri düzenleme yetkiniz yok" },
        { status: 403 }
      );
    }

    const data = await request.json();

    const updatedPoem = await prisma.poem.update({
      where: {
        id: parseInt(id),
      },
      data: {
        title: data.title,
        content: data.content,
      },
    });

    return NextResponse.json(updatedPoem);
  } catch (error) {
    console.error("Failed to update poem:", error);
    return NextResponse.json(
      { error: "Şiir güncellenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

// DELETE /api/poems?id=1 - Şiiri sil
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
        { error: "Şiir ID'si gereklidir" },
        { status: 400 }
      );
    }

    // Şiirin kullanıcıya ait olup olmadığını kontrol et
    const poem = await prisma.poem.findUnique({
      where: {
        id: parseInt(id),
      },
    });

    if (!poem || poem.userId !== parseInt(session.user.id)) {
      return NextResponse.json(
        { error: "Bu şiiri silme yetkiniz yok" },
        { status: 403 }
      );
    }

    await prisma.poem.delete({
      where: {
        id: parseInt(id),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete poem:", error);
    return NextResponse.json(
      { error: "Şiir silinirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
