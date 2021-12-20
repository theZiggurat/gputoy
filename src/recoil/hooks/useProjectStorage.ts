import { Project as ProjectDB } from '.prisma/client'
import { layoutAtom } from '@recoil/layout'
import { currentProjectIDAtom, withProjectState } from '@recoil/project'
import { useEffect } from 'react'
import { useRecoilState, useSetRecoilState } from 'recoil'

type ProjectStorageProps = {
  projectID: string,
  project?: ProjectDB
}

export default (props: ProjectStorageProps) => {
  const {
    projectID,
    project
  } = props

  const [projectStateValue, setProjectState] = useRecoilState(withProjectState(projectID))

  const setProjectID = useSetRecoilState(currentProjectIDAtom)
  const setLayout = useSetRecoilState(layoutAtom)

  useEffect(() => {

  }, [])

  useEffect(() => {
    setProjectID(projectID)
    if (projectID == 'local') {
      const projectLoad = localStorage.getItem('project_local')
      if (projectLoad)
        setProjectState(JSON.parse(projectLoad))
    } else {
      if (project) {
        setProjectState(() => {
          return {
            title: project.title,
            params: JSON.parse(project.params ?? '[]'),
            files: project.shaders.map(s => {
              return {
                filename: s.name,
                file: s.source,
                lang: s.lang,
                isRender: s.isRender,
              }
            }),
          }
        })
        if (project.layout != null)
          setLayout(project.layout)
      }
    }
  }, [props])

  useEffect(() => {
    if (projectID == 'local')
      localStorage.setItem('project_local', JSON.stringify(projectStateValue))
  }, [projectStateValue])
}