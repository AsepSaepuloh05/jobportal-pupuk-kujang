import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { bacaIdentitas } from "@/lib/auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userRole } = await bacaIdentitas();

    if (userRole !== "HR") {
      return NextResponse.json(
        { message: "Hanya HR yang bisa melihat detail user" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      omit: { password: true },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("GET USER ERROR:", error);
    return NextResponse.json(
      { message: "Gagal mengambil data user" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userRole } = await bacaIdentitas();

    if (userRole !== "HR") {
      return NextResponse.json(
        { message: "Hanya HR yang bisa mengubah user" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const nama = body.name?.trim() || body.nama?.trim();
    const email = body.email?.trim();

    if (!nama || !email) {
      return NextResponse.json(
        { message: "Nama dan email wajib diisi" },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id: Number(id) },
      data: {
        nama,
        email,
      },
      omit: { password: true },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("PUT USER ERROR:", error);
    return NextResponse.json(
      { message: "Gagal mengubah user" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId, userRole } = await bacaIdentitas();

    if (userRole !== "HR") {
      return NextResponse.json(
        { message: "Hanya HR yang bisa menghapus user" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const targetId = Number(id);

    if (Number(userId) === targetId) {
      return NextResponse.json(
        { message: "Tidak dapat menghapus akun sendiri yang sedang aktif" },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: { id: targetId },
    });

    return NextResponse.json({ message: "User berhasil dihapus" });
  } catch (error) {
    console.error("DELETE USER ERROR:", error);
    return NextResponse.json(
      { message: "Gagal menghapus user" },
      { status: 500 }
    );
  }
}
