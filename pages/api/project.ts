import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from "next-auth/client";
import prisma from "core/backend/prisma";
import { ProjectQuery } from '@core/types';
import { validateCreateProjectEntry } from 'core/backend/validators';
import { projectAuthorAtom } from 'core/recoil/atoms/project';

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

    if (authorId != session?.user?.id && authorId != null) {
      res.status(406).send({ error: 'Cannot overwrite project that isn\'t yours' })
      return
    }
    const ret = await prisma.project.upsert({
      where: {
        id: body.project.id
      },
      create: insertQuery,
      update: insertQuery,
      include: {
        // forkedFrom: {
        //   select: {
        //     id: true,
        //     title: true,
        //   }
        // },
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
  const { id, forkedFrom, author, ...projectNoId } = project as ProjectQuery

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
    // forkedFrom: {
    //   connect: {
    //     id: project.forkedFrom?.id ?? undefined
    //   }
    // },
    tags: {
      connectOrCreate: tagsConnectOrCreate
    },
    ...(project.forkedFrom?.id ? {
      forkedFromId: project.forkedFrom?.id
    } : {})
  }
}