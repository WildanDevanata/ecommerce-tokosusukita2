import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: any) {
  const body = await req.json();

  const order = await prisma.order.update({
    where: { id: params.id },
    data: {
      status: body.status,
    },
  });

  return Response.json(order);
}