/* eslint-disable import/no-anonymous-default-export */
import { Project as ProjectDB } from '.prisma/client'
import { layoutAtom } from '@recoil/layout'
import { currentProjectIDAtom, withProjectState } from '@recoil/project'
import { debounce } from 'lodash'
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
  const [layout, setLayout] = useRecoilState(layoutAtom)

  useEffect(() => {

    setProjectID(projectID)

    if (projectID == 'local') {
      // load project from local storage
      const projectLoad = localStorage.getItem('project_local')
      if (projectLoad)
        setProjectState(JSON.parse(projectLoad))

      // load layout from local storage
      const layoutLoad = window.localStorage.getItem('layout')
      if (layoutLoad)
        setLayout(JSON.parse(layoutLoad))
    }

    else {
      if (project) {
        // set recoil project state to project loaded from DB
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

        // if project has layout, set recoil layout state to layout loaded from DB
        if (project.layout != null) {
          console.log(JSON.parse(project.layout))
          setLayout(JSON.parse(project.layout))
        }
      }
    }
  }, [projectID, project])

  // periodically save project to localstorage if project was not loaded from DB
  useEffect(debounce(() => {
    if (projectID == 'local')
      localStorage.setItem('project_local', JSON.stringify(projectStateValue))
  }, 1000), [projectStateValue, projectID])

  // periodically save layout to localstorage if project was not loaded from DB
  useEffect(debounce(() => {
    if (projectID == 'local')
      localStorage.setItem('layout', JSON.stringify(layout))
  }, 1000), [layout, projectID])
}