import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from "next-auth/client";
import prisma from "@database/prisma";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {

  switch (req.method) {
    case 'GET':
      handleGet(req, res)
      break
    case 'POST':
      break
    default:
      break
  }
}

const handleGet = async (req: NextApiRequest, res: NextApiResponse<any>) => {
  const body = req.body
  const session = await getSession({ req })

  try {
    const projects = await prisma.project.findMany({
      where: {
        authorId: session?.user?.id ?? ''
      },
      select: {
        id: true,
        title: true,
        updatedAt: true,
        published: true,
      }
    })
    res.status(200).send(projects)
  } catch (e) {
    res.status(500).send({ error: e })
  }
}