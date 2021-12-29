/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable import/no-anonymous-default-export */
import { Project as ProjectDB } from '.prisma/client'
import { CreatePageProjectQuery } from '@database/args'
import { withCreatePageProject } from '@database/selectors'
import { layoutAtom } from '@recoil/layout'
import { currentProjectIDAtom } from '@recoil/project'
import { debounce } from 'lodash'
import { nanoid } from 'nanoid'
import { useEffect } from 'react'
import { useRecoilState, useRecoilValue, useResetRecoilState, useSetRecoilState } from 'recoil'

type ProjectStorageProps = {
  projectID: string,
  project?: CreatePageProjectQuery
}

export default (props: ProjectStorageProps) => {

  const {
    projectID,
    project
  } = props

  const [projectState, setProjectState] = useRecoilState(withCreatePageProject(projectID))
  const resetProjectState = useResetRecoilState(withCreatePageProject(projectID))
  const setProjectID = useSetRecoilState(currentProjectIDAtom)
  const [layout, setLayout] = useRecoilState(layoutAtom)


  useEffect(() => {

    setProjectID(projectID)
    if (projectID.startsWith('local')) {
      const projectLoad = localStorage.getItem(`project_${projectID}`)
      if (projectLoad) {
        const project = JSON.parse(projectLoad)
        setProjectState(project)
      }
      // else {
      //   setProjectTitle({ text: 'Unnamed Project ' + projectID.split('_')[1], isValid: true })
      // }

      const layoutLoad = window.localStorage.getItem('layout')
      if (layoutLoad)
        setLayout(JSON.parse(layoutLoad))
    }
    else {
      if (project) {
        setProjectState(project)

        if (project.layout != null)
          setLayout(JSON.parse(project.layout))
      }
    }
  }, [
    projectID,
    project,
    setProjectID,
    setLayout,
  ])

  useEffect(debounce(() => {
    if (projectID.startsWith('local'))
      localStorage.setItem(`project_${projectID}`, JSON.stringify(projectState))
  }, 1000), [projectState, projectID])


  useEffect(debounce(() => {
    if (projectID.startsWith('local'))
      localStorage.setItem('layout', JSON.stringify(layout))
  }, 1000), [layout, projectID])


}