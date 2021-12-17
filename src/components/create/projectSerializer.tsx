import { Project as ProjectDB } from '.prisma/client'
import React, { useEffect } from 'react'
import { DefaultValue, useRecoilState, useResetRecoilState, useSetRecoilState } from 'recoil'
import { clearConsole } from '../../recoil/console'
import { layoutState } from '../../recoil/layout'
import { projectControl, projectState, projectStatus, workingProjectID } from '../../recoil/project'


type ProjectSerializerProps = {
  projectID: string,
  project?: ProjectDB
}
const ProjectSerializer = (props: ProjectSerializerProps) => {

  const {
    projectID,
    project
  } = props

  const [projectStateValue, setProjectState] = useRecoilState(projectState(projectID))
  const setProjectID = useSetRecoilState(workingProjectID)

  const setClearConsole = clearConsole()
  const resetProjectStatus = useResetRecoilState(projectStatus)
  const setProjectControls = useSetRecoilState(projectControl)

  const setLayout = useSetRecoilState(layoutState)

  useEffect(() => {
    return () => {
      console.log('clearing')
      setClearConsole()
      setProjectControls('stop')
    }
    
    //resetProjectStatus()
  }, [])

  useEffect(() => {
    setProjectID(projectID)
    if (projectID == 'local') {
      const projectLoad = localStorage.getItem('project_local')
      if (projectLoad)
        setProjectState(JSON.parse(projectLoad))
    } else {
      if (project) {
        console.log('from db', project)
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

  return <></>
}

export default ProjectSerializer