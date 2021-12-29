import { Prisma } from "@prisma/client"

export const createPageProjectQuery = {
  select: {
    id: true,
    title: true,
    description: true,
    params: true,
    graph: true,
    layout: true,
    config: true,
    published: true,
    createdAt: true,
    updatedAt: true,
    author: {
      select: {
        name: true,
        id: true,
        image: true,
      }
    },
    shaders: true,
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

const _createPageProjectQuery = Prisma.validator<Prisma.ProjectArgs>()(createPageProjectQuery)
export type CreatePageProjectQuery = Prisma.ProjectGetPayload<typeof _createPageProjectQuery>



export const browsePageProjectQuery = {
  select: {
    id: true,
    title: true,
    description: true,
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
    shaders: true,
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
const _browsePageProjectQuery = Prisma.validator<Prisma.ProjectArgs>()(browsePageProjectQuery)
export type BrowsePageProjectQuery = Prisma.ProjectGetPayload<typeof _browsePageProjectQuery>