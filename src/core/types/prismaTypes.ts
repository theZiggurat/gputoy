import { Prisma } from "@prisma/client"

/**
 *  Prisma generated types
 */
export const projectQuery = {
  select: {
    id: true,
    title: true,
    description: true,
    type: true,
    params: true,
    graph: true,
    layout: true,
    config: true,
    published: true,
    files: true,
    author: {
      select: {
        name: true,
        id: true,
        image: true,
      }
    },
    forkedFrom: {
      select: {
        id: true,
        title: true
      }
    },
    tags: {
      select: {
        tag: {
          select: {
            name: true
          }
        }
      }
    }
  }
}
const _projectQuery = Prisma.validator<Prisma.ProjectArgs>()(projectQuery)
export type ProjectQuery = Prisma.ProjectGetPayload<typeof _projectQuery>



export const projectQueryMin = {
  select: {
    id: true,
    title: true,
    description: true,
    files: true,
    params: true,
    graph: true,
    createdAt: true,
    author: {
      select: {
        name: true,
        id: true,
        image: true,
      }
    },
    tags: {
      select: {
        tag: {
          select: {
            name: true
          }
        }
      }
    }
  }
}
const _projectQueryMin = Prisma.validator<Prisma.ProjectArgs>()(projectQueryMin)
export type ProjectQueryMin = Prisma.ProjectGetPayload<typeof _projectQueryMin>



export const projectSaveHistory = {
  select: {
    updatedAt: true,
    createdAt: true,
  }
}
const _projectSaveHistory = Prisma.validator<Prisma.ProjectArgs>()(projectSaveHistory)
export type ProjectSaveHistory = Prisma.ProjectGetPayload<typeof _projectSaveHistory>
export type ProjectSaveHistorySerialized = {
  updatedAt: string,
  createdAt: string
}