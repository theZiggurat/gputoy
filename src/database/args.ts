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

export const createPageProjectQueryWithId = {
  select: {
    id: true,
    title: true,
    description: true,
    params: true,
    graph: true,
    layout: true,
    config: true,
    published: true,
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

export const createPageProjectSaveHistory = {
  select: {
    updatedAt: true,
    createdAt: true,
  }
}

const _createPageProjectQueryWithId = Prisma.validator<Prisma.ProjectArgs>()(createPageProjectQueryWithId)
export type CreatePageProjectQueryWithId = Prisma.ProjectGetPayload<typeof _createPageProjectQueryWithId>

const _createPageProjectSaveHistory = Prisma.validator<Prisma.ProjectArgs>()(createPageProjectSaveHistory)
export type CreatePageProjectSaveHistory = Prisma.ProjectGetPayload<typeof _createPageProjectSaveHistory>
export type CreatePageProjectSaveHistorySer = {
  updatedAt: string,
  createdAt: string
}

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