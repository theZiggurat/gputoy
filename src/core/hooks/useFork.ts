import { useToast } from "@chakra-ui/toast"
import { ProjectQuery } from "@core/types"
import { withProjectJSON } from "@core/recoil/atoms/project"
import { projectLastSave, projectLastSaveLocal } from "core/recoil/atoms/project"
import { nanoid } from "nanoid"
import router from "next/router"
import { useRecoilCallback, useSetRecoilState } from "recoil"
import useProjectSession from "@core/hooks/useProjectSession"

type ForkOptions = {
  title?: string,
}
const useFork = () => {

  const setProjectLastSave = useSetRecoilState(projectLastSave)
  const setProjectLastSaveLocal = useSetRecoilState(projectLastSaveLocal)

  const getProject = useRecoilCallback(({ snapshot: { getLoadable } }) => () => getLoadable(withProjectJSON).getValue())
  const [session, loading, isOwner] = useProjectSession()

  const toast = useToast()

  const fork = (inputProject?: ProjectQuery, forkOptions?: ForkOptions) => {

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
      updatedAt: updateDateLocal,
      published: false
    }

    setProjectLastSave(null)
    setProjectLastSaveLocal(updateDateLocal)
    localStorage.setItem(`project_local_${localProjectId}`, JSON.stringify(projectWithDate))
    router.push(`/editor/${localProjectId}`)

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