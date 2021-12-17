import prisma from "../../../lib/prisma";
import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  console.log(req)
  const {
    query: { id },
    method,
  } = req

  switch (method) {
    case 'GET':
      break
    case 'POST':
      console.log('put request', id)
      break
    default:
      console.log('neither')
  }
}