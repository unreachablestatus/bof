import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hash } from "bcrypt";

export async function POST(request: NextRequest) {
  try {
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

    // İlk kullanıcı admin olsun, diğerleri normal kullanıcı
    const userCount = await prisma.user.count();
    const isAdmin = userCount === 0;

    const newUser = await prisma.user.create({
      data: {
        username: data.username,
        password: hashedPassword,
        isAdmin,
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
    console.error("Failed to register user:", error);
    return NextResponse.json(
      { error: "Kullanıcı kaydı yapılırken bir hata oluştu" },
      { status: 500 }
    );
  }
}
