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

export const defaultProject: ProjectQuery = {
  id: '',
  title: '',
  author: null,
  type: 'DEFAULT',
  description: '',
  forkedFrom: null,
  files: {},
  graph: {},
  layout: {
    layout: {
      "left": {
        "type": "leaf",
        "index": 5,
        "instanceID": "y8ZUxqQJ"
      },
      "size": 0.1,
      "type": "vertical",
      "index": -1,
      "right": {
        "left": {
          "left": {
            "type": "leaf",
            "index": 1,
            "instanceID": "0xSKLShr"
          },
          "size": 0.72,
          "type": "horizontal",
          "index": -1,
          "right": {
            "type": "leaf",
            "index": 4,
            "instanceID": "MKIjf_Qa"
          },
          "instanceID": "GeqNhtot"
        },
        "size": 0.58,
        "type": "vertical",
        "index": -1,
        "right": {
          "type": "leaf",
          "index": 3,
          "instanceID": "jrNLmruC"
        },
        "instanceID": "VWoGrNRr"
      },
      "instanceID": "R_VTy8at"
    }
  },
  config: {},
  published: false,
  tags: [],
  params: []
}