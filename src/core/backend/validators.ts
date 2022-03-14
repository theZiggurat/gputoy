import { NextApiResponse } from "next";
import { Session } from "next-auth";

export const validateCreateProjectEntry = (res: NextApiResponse<any>, body: any, session: Session | null) => {

  const { project } = body

  if (session == null || !session.user || !('id' in session.user)) {
    res.status(403).send({ error: 'Must be signed in to save projects' })
    return false
  }
  if (!project || !project.id) {
    res.status(406).send({ error: 'No projectid' })
    return false
  }
  if (project.author?.id != session.user?.id) {
    res.status(403).send({ error: 'Cannot modify project that isn\'t yours' })
    return false
  }
  if (!project || !project.title || project.title.length <= 0) {
    res.status(406).send({ error: 'Missing title' })
    return false
  }
  if (!project.description) {
    res.status(406).send({ error: 'Missing description' })
    return false
  }

  return true
}