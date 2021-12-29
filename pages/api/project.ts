import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from "next-auth/client";
import prisma from "@database/prisma";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {

  switch (req.method) {
    case 'GET':
      break
    case 'POST':
      handlePost(req, res)
      break
    default:
      break
  }
}

const handlePost = async (req: NextApiRequest, res: NextApiResponse<any>) => {
  const body = req.body
  const session = await getSession({ req })

  if (session === null) {
    res.status(403).send({ error: 'Must be signed in to publish project' })
    return
  }

  if (!body?.title || body?.title.length < 0) {
    res.status(406).send({ error: 'Missing title' })
    return
  }
  // if (!body?.description) {
  //   res.status(406).send({ error: 'Missing description' })
  //   return
  // }
  if (!body?.shaders || body?.shaders.length < 0) {
    res.status(406).send({ error: 'Missing shaders' })
    return
  }

  try {
    const data = {
      title: body.title,
      description: body.description,
      authorId: session.user?.id,
      params: JSON.stringify(body?.params ?? []),
      published: true,
      shaders: {
        create: body.shaders.map(s => {
          return {
            source: s.file,
            name: s.filename,
            lang: s.lang,
            isRender: s.isRender
          }
        })
      },
      layout: body.layout ? JSON.stringify(body.layout) : null
    }
    console.log(data)
    const ret = await prisma.project.create({
      data
    })
    res.status(200).send({ projectID: ret.id })
  } catch (e) {
    res.status(500).send({ error: e })
  }
}