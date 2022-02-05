import { useToast } from "@chakra-ui/toast"
import { CreatePageProjectQueryWithId } from "@database/args"
import { withCreatePageProject } from "@database/selectors"
import { projectLastSave, projectLastSaveLocal } from "@recoil/project"
import { nanoid } from "nanoid"
import { useSession } from "next-auth/client"
import router from "next/router"
import { useRecoilCallback, useRecoilState, useSetRecoilState } from "recoil"
import useProjectSession from "../useProjectSession"

type ForkOptions = {
  title?: string,
}
const useFork = () => {

  const setProjectLastSave = useSetRecoilState(projectLastSave)
  const setProjectLastSaveLocal = useSetRecoilState(projectLastSaveLocal)

  const getProject = useRecoilCallback(({ snapshot: { getLoadable } }) => () => getLoadable(withCreatePageProject).getValue())
  const [session, loading, isOwner] = useProjectSession()

  const toast = useToast()

  const fork = (inputProject?: CreatePageProjectQueryWithId, forkOptions?: ForkOptions) => {

    const localProjectId = nanoid(8)
    const updateDateLocal = new Date().toISOString()
    const project = inputProject ?? getProject()
    const projectWithDate = {
      ...project,
      forkedFrom: {
        id: project.id,
        title: project.title
      },
      title: forkOptions?.title ?? `${project.title} (fork)`,
      author: {
        id: session?.user?.id!,
        name: session?.user?.name ?? null,
        image: session?.user?.image ?? null
      } ?? null,
      id: localProjectId,
      shaders: project.shaders.map(s => ({
        ...s,
        id: '',
        projectId: localProjectId,
      })),
      updatedAt: updateDateLocal,
      published: false
    }

    setProjectLastSave(null)
    setProjectLastSaveLocal(updateDateLocal)
    localStorage.setItem(`project_local_${localProjectId}`, JSON.stringify(projectWithDate))
    router.push(`/create/${localProjectId}`)

    toast({
      title: 'Project Forked',
      status: 'info',
      isClosable: true,
      duration: 2000,
    })
  }

  return fork

}

export default useFork