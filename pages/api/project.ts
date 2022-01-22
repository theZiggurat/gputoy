import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from "next-auth/client";
import prisma from "@database/prisma";
import { CreatePageProjectQuery } from '@database/args';
import { validateCreateProjectEntry } from '@database/validators';
import { projectAuthorAtom } from '@recoil/project';

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

  const isValid = validateCreateProjectEntry(res, body, session)
  if (!isValid) return
  const insertQuery = transformToInsertQuery(body, session!.user!.id)

  try {

    const { authorId } = await prisma.project.findUnique({
      where: {
        id: body.project.id,
      },
      select: {
        authorId: true
      }
    }) ?? { authorId: null }

    console.log(authorId, session?.user?.id)
    console.log(body.project.id)

    if (authorId != session?.user?.id && authorId != null) {
      res.status(406).send({ error: 'Cannot overwrite project that isn\'t yours' })
      return
    }

    const shaderQuery = body.project.shaders.map(shader => {
      const { projectId, id, ...rest } = shader
      return prisma.shader.upsert({
        where: {
          id: id
        },
        create: { ...rest },
        update: { ...rest },
        select: {
          id: true
        }
      })
    })

    const shaderIds = await prisma.$transaction(shaderQuery)

    const postQuery = {
      ...insertQuery,
      shaders: {
        connect: shaderIds
      }
    }

    // console.log(body.project)
    // console.log(JSON.stringify(postQuery, undefined, 4))
    const ret = await prisma.project.upsert({
      where: {
        id: body.project.id
      },
      create: postQuery,
      update: postQuery,
      include: {
        shaders: true,
        forkedFrom: {
          select: {
            id: true,
            title: true,
          }
        },
        author: true
      }
    })
    res.status(200).send(ret)
  } catch (e) {
    res.status(500).send({ error: e })
  }
}




const transformToInsertQuery = (body: any, sid: string) => {

  const { project, action } = body
  const { id, ...projectNoId } = project as CreatePageProjectQuery

  const tagsConnectOrCreate = project.tags.map(t => {
    return {
      where: {
        id: t.tag.id ?? ''
      },
      create: { name: t.tag.name }
    }
  })

  return {
    ...projectNoId,
    published: action === 'publish',
    author: {
      connect: {
        id: sid
      }
    },
    forkedFrom: {
      connect: {
        id: project.forkedFrom?.id ?? undefined
      }
    },
    tags: {
      connectOrCreate: tagsConnectOrCreate
    }
  }
}