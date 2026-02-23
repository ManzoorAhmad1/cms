// @ts-nocheckexport const dynamic = 'force-dynamic';import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import PageModel from "@/models/Page";

// Force dynamic rendering so fetch works 
export const dynamic = 'force-dynamic';

export async function GET() {
  await dbConnect();
  try {
    const pages = await PageModel.find({});
    return NextResponse.json({ pages });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch pages" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await dbConnect();
  try {
    const body = await req.json();
    const newPage = await PageModel.create(body);
    return NextResponse.json({ message: "Page created", page: newPage });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create page" }, { status: 500 });
  }
}
