import { toast, useToast } from '@chakra-ui/toast'
import { ProjectQuery, ProjectSaveHistorySerialized } from '@core/types'
import { withProjectJSON } from '@core/recoil/atoms/project'
import { currentProjectIdAtom, projectLastSave, projectLastSaveLocal } from 'core/recoil/atoms/project'
import { debounce, update } from 'lodash'
import { Session } from 'next-auth'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRecoilState, useResetRecoilState, useSetRecoilState } from 'recoil'
import useProjectSession from '../useProjectSession'
import useLogger from '../useLogger'

type ProjectStorageProps = {
  projectFromDB?: ProjectQuery,
  dateInfo: ProjectSaveHistorySerialized | null
  session: Session | null
}

const useProjectStorage = (props: ProjectStorageProps) => {

  const {
    projectFromDB,
    dateInfo,
    session
  } = props

  const [projectState, setProjectState] = useRecoilState(withProjectJSON)
  const [projectID, setProjectID] = useRecoilState(currentProjectIdAtom)
  const setProjectLastSave = useSetRecoilState(projectLastSave)
  const setProjectLastSaveLocal = useSetRecoilState(projectLastSaveLocal)
  const [_s, _l, isOwner] = useProjectSession()
  const [enableSave, setEnableSave] = useState(false)
  const toast = useToast()
  const logger = useLogger()

  const router = useRouter()

  const [isSet, setIsSet] = useState(false)
  const timeoutId = useRef(0)

  useEffect(() => {
    timeoutId.current = setTimeout(() => {
      toast({
        title: 'Project not found or link outdated',
        status: 'info',
        duration: 5000,
        isClosable: true
      })
      router.push('/editor')
    }, 1000)
    return () => clearTimeout(timeoutId.current)
  }, [])

  useEffect(() => {
    if (isSet)
      clearTimeout(timeoutId.current)
  }, [isSet])

  /**
   * 
   */
  useEffect(() => {



    const projectFromStorage = localStorage.getItem(`project_local_${projectID}`)
    if (!projectFromDB && !projectFromStorage) {
      return
    }


    if (!projectFromStorage) {
      logger.log('Serializer', `Using project from server: ${projectFromDB!.title}`)
      setProjectState(projectFromDB!)
      if (dateInfo)
        setProjectLastSave(dateInfo.updatedAt)
    } else {
      const { updatedAt, ...project } = JSON.parse(projectFromStorage)
      logger.log('Serializer', `Using project from local storage: ${project.title}`)
      setProjectState(project)
      setProjectLastSaveLocal(updatedAt)
    }
    setIsSet(true)
    setEnableSave(true)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectID, projectFromDB, setProjectID])



  const saveToLocalStorage = () => {
    const updateDateLocal = new Date().toISOString()
    const projectWithDate = { ...projectState, updatedAt: updateDateLocal }
    setProjectLastSaveLocal(updateDateLocal)
    //logger.log('Serializer', 'Saving project locally to '.concat(projectID))
    localStorage.setItem(`project_local_${projectID}`, JSON.stringify(projectWithDate))
  }

  const debouncedSaveToLocalStorage = useMemo(() => debounce(saveToLocalStorage, 5000), [projectState, projectID])

  useEffect(() => {
    router.beforePopState(({ url, as, options }) => {
      debouncedSaveToLocalStorage.flush()
      return true
    })
  }, [router, debouncedSaveToLocalStorage])

  useEffect(() => {
    console.log('here')
    if (projectID !== undefined && projectID !== 'NOT_SET' && isOwner && enableSave) {
      debouncedSaveToLocalStorage()
    }
    return () => debouncedSaveToLocalStorage.cancel()
  }, [projectState, projectID, isOwner, enableSave, debouncedSaveToLocalStorage])

}

export default useProjectStorage