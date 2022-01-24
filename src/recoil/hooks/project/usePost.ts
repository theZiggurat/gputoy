import { useToast } from '@chakra-ui/react'
import { withCreatePageProject } from "@database/selectors"
import { currentProjectIDAtom, projectLastSave } from "@recoil/project"
import { useRouter } from "next/router"
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil"

type PostAction = 'save' | 'publish'

/* eslint-disable import/no-anonymous-default-export */
const usePost = () => {
  const [project, setProject] = useRecoilState(withCreatePageProject)
  const projectId = useRecoilValue(currentProjectIDAtom)
  const setLastSave = useSetRecoilState(projectLastSave)
  const toast = useToast()
  const router = useRouter()

  const publish = (action: PostAction) => {
    fetch("/api/project", {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project: project,
        action: action
      })
    }).then(res => {
      if (res.ok) {
        res.json().then(newproj => {
          setProject(newproj)
          setLastSave(new Date().toISOString())
          localStorage.removeItem(`project_local_${projectId}`)
          if (newproj.id != projectId) {
            setTimeout(() => router.push(`/create/${newproj.id}`), 0.5)

          }
          toast({
            title: action == 'publish' ? 'Project Published' : 'Project Saved',
            status: 'info',
            duration: 2000,
            isClosable: true
          })
        })
      } else {
        res.json().then(err => {
          const { error } = err
          toast({
            title: 'Save failed',
            description: error.clientVersion ? 'Unknown error' : error,
            status: 'error',
            duration: 3000,
            isClosable: true
          })
        })
      }
    })
  }

  return publish
}

export default usePost