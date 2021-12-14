import prisma from "../../../lib/prisma";

export default async (req, res) => {
  console.log(req)
  const {
    query: { id },
    method,
  } = req

  switch (method) {
    case 'GET':
      break
    case 'PUT':
      console.log('put request', id)
      break
    default:
      console.log('neither')
  }
}