/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable import/no-anonymous-default-export */
import { Project as ProjectDB } from '.prisma/client'
import { layoutAtom } from '@recoil/layout'
import { currentProjectIDAtom, projectAuthorAtom, projectDescriptionAtom, projectParamsAtom, projectShadersAtom, projectTagsAtom, projectTitleAtom, withProjectState } from '@recoil/project'
import { debounce } from 'lodash'
import { nanoid } from 'nanoid'
import { useEffect } from 'react'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'

type ProjectStorageProps = {
  projectID: string,
  project?: ProjectDB
}

export default (props: ProjectStorageProps) => {

  const {
    projectID,
    project
  } = props

  const projectStateValue = useRecoilValue(withProjectState(projectID))

  const setProjectID = useSetRecoilState(currentProjectIDAtom)

  const setProjectTitle = useSetRecoilState(projectTitleAtom(projectID))
  const setProjectDescription = useSetRecoilState(projectDescriptionAtom(projectID))
  const setProjectAuthor = useSetRecoilState(projectAuthorAtom(projectID))
  const setProjectTags = useSetRecoilState(projectTagsAtom(projectID))
  const setProjectShaders = useSetRecoilState(projectShadersAtom(projectID))
  const setProjectParams = useSetRecoilState(projectParamsAtom(projectID))

  const [layout, setLayout] = useRecoilState(layoutAtom)


  useEffect(() => {

    setProjectID(projectID)
    if (projectID.startsWith('local')) {
      const projectLoad = localStorage.getItem(`project_${projectID}`)
      if (projectLoad) {
        const project = JSON.parse(projectLoad)
        setProjectTitle(project.title)
        setProjectDescription(project.description)
        setProjectAuthor('You')
        setProjectTags(project.tags ?? [])
        setProjectShaders(project.files)
        setProjectParams(project.params)
      } else {
        setProjectTitle({ text: 'Unnamed Project ' + projectID.split('_')[1], isValid: true })
      }

      const layoutLoad = window.localStorage.getItem('layout')
      if (layoutLoad)
        setLayout(JSON.parse(layoutLoad))
    }
    else {
      if (project) {
        setProjectTitle({ text: project.title, isValid: true })
        setProjectDescription({ text: project.description ?? '', isValid: true })
        setProjectAuthor(project.author?.name ?? 'unknown')
        setProjectTags(project.tags ?? [])
        setProjectShaders(project.shaders.map(s => {
          return {
            filename: s.name,
            file: s.source,
            lang: s.lang,
            isRender: s.isRender,
          }
        }))
        setProjectParams(JSON.parse(project.params ?? '[]'))

        if (project.layout != null)
          setLayout(JSON.parse(project.layout))
      }
    }
  }, [
    projectID,
    project,
    setProjectID,
    setLayout,
    setProjectTitle,
    setProjectDescription,
    setProjectAuthor,
    setProjectTags,
    setProjectShaders,
    setProjectParams
  ])

  useEffect(debounce(() => {
    if (projectID.startsWith('local'))
      localStorage.setItem(`project_${projectID}`, JSON.stringify(projectStateValue))
  }, 1000), [projectStateValue, projectID])


  useEffect(debounce(() => {
    if (projectID.startsWith('local'))
      localStorage.setItem('layout', JSON.stringify(layout))
  }, 1000), [layout, projectID])


}