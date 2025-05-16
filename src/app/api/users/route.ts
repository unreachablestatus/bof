import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { hash } from "bcrypt";

// GET /api/users - Tüm kullanıcıları getir (sadece admin için)
export async function GET() {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Bu işlem için giriş yapmalısınız" },
        { status: 401 }
      );
    }

    // Admin kontrolü
    if (!session.user.isAdmin) {
      return NextResponse.json(
        { error: "Bu işlem için admin yetkileri gereklidir" },
        { status: 403 }
      );
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        isAdmin: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return NextResponse.json(
      { error: "Kullanıcılar alınırken bir hata oluştu" },
      { status: 500 }
    );
  }
}

// POST /api/users - Yeni kullanıcı ekle
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    // Admin kullanıcı ekliyorsa admin kontrolü
    if (session) {
      if (!session.user.isAdmin) {
        return NextResponse.json(
          { error: "Bu işlem için admin yetkileri gereklidir" },
          { status: 403 }
        );
      }
    }

    const data = await request.json();

    // Gerekli alanları kontrol et
    if (!data.username || !data.password) {
      return NextResponse.json(
        { error: "Kullanıcı adı ve şifre gereklidir" },
        { status: 400 }
      );
    }

    // Kullanıcı adının benzersiz olup olmadığını kontrol et
    const existingUser = await prisma.user.findUnique({
      where: {
        username: data.username,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Bu kullanıcı adı zaten kullanılıyor" },
        { status: 400 }
      );
    }

    // Şifreyi hashle
    const hashedPassword = await hash(data.password, 10);

    const newUser = await prisma.user.create({
      data: {
        username: data.username,
        password: hashedPassword,
        isAdmin: data.isAdmin || false,
      },
      select: {
        id: true,
        username: true,
        isAdmin: true,
        createdAt: true,
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error("Failed to create user:", error);
    return NextResponse.json(
      { error: "Kullanıcı oluşturulurken bir hata oluştu" },
      { status: 500 }
    );
  }
}

// PUT /api/users?id=1 - Kullanıcıyı güncelle
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
        { error: "Kullanıcı ID'si gereklidir" },
        { status: 400 }
      );
    }

    // Kullanıcının kendisi veya admin olup olmadığını kontrol et
    const userId = parseInt(id);
    const isOwnProfile = userId === parseInt(session.user.id);
    const isAdmin = session.user.isAdmin;

    if (!isOwnProfile && !isAdmin) {
      return NextResponse.json(
        { error: "Bu kullanıcıyı düzenleme yetkiniz yok" },
        { status: 403 }
      );
    }

    const data = await request.json();

    // Şifreyi güncellemeyi düşünüyorsak hash
    let updateData: any = {};

    if (data.username) {
      // Kullanıcı adı değişiyorsa, benzersiz olduğunu kontrol et
      if (data.username) {
        const existingUser = await prisma.user.findFirst({
          where: {
            username: data.username,
            id: { not: userId },
          },
        });

        if (existingUser) {
          return NextResponse.json(
            { error: "Bu kullanıcı adı zaten kullanılıyor" },
            { status: 400 }
          );
        }

        updateData.username = data.username;
      }
    }

    if (data.password) {
      updateData.password = await hash(data.password, 10);
    }

    // Admin yetkisini sadece admin değiştirebilir
    if (isAdmin && data.isAdmin !== undefined) {
      updateData.isAdmin = data.isAdmin;
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: updateData,
      select: {
        id: true,
        username: true,
        isAdmin: true,
        createdAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Failed to update user:", error);
    return NextResponse.json(
      { error: "Kullanıcı güncellenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

// DELETE /api/users?id=1 - Kullanıcıyı sil
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Bu işlem için giriş yapmalısınız" },
        { status: 401 }
      );
    }

    // Admin kontrolü
    if (!session.user.isAdmin) {
      return NextResponse.json(
        { error: "Bu işlem için admin yetkileri gereklidir" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Kullanıcı ID'si gereklidir" },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: {
        id: parseInt(id),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete user:", error);
    return NextResponse.json(
      { error: "Kullanıcı silinirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
