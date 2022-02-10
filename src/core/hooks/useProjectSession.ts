import { projectAuthorAtom } from "core/recoil/atoms/project"
import { useSession } from "next-auth/client"
import { useRecoilState, useRecoilValue } from "recoil"
import { Session } from 'next-auth'
import { useEffect } from "react"


const useProjectSession = (): [Session | null, boolean, boolean] => {
  const [session, loading] = useSession()
  const [projectAuthor, setProjectAuthor] = useRecoilState(projectAuthorAtom)

  const ownsProject = session ? projectAuthor?.id == session?.user?.id : false || (session == null && projectAuthor?.name == null)

  useEffect(() => {
    if (session == null) return

    if (projectAuthor == null)
      setProjectAuthor(session?.user ? {
        id: session.user.id! as string,
        name: (session.user.name ?? null) as string | null,
        image: (session.user.image ?? null) as string | null
      } : null)


  }, [session, setProjectAuthor])



  return [session, loading, ownsProject]
}

export default useProjectSession