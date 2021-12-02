import React, { useEffect, useLayoutEffect } from 'react'
import { Panels, usePanels } from '../src/components/panels/panel'
import Scaffold from '../src/components/scaffold'

import descriptors from '../src/components/panels/descriptors'
import { setSkipStorage } from '../src/recoil/effects'
import { codeFiles, mousePos, params, projectControl, projectStatus, resolution, setProjectStateFromLocalStorage } from '../src/recoil/project'
import { useResetRecoilState, useSetRecoilState } from 'recoil'
import { layoutState } from '../src/recoil/atoms'
import { _console } from '../src/recoil/console'
import { Flex, Text, Divider } from '@chakra-ui/react'
import { RiArrowDropDownLine } from 'react-icons/ri'
import { AiOutlineCloudServer } from 'react-icons/ai'
import {FiHardDrive } from 'react-icons/fi'
import Head from 'next/head'

type ProjectHeaderProps = {
    title?: string,
}
const ProjectHeader = (props: ProjectHeaderProps) => {
    return (
        <Flex bg="whiteAlpha.100" p={2} paddingX={3} fontSize="sm" fontWeight="bold" borderRadius="md" justifyItems="center">
            <Text pr={2}>{props.title ?? "Unnamed Project"}</Text>
            <FiHardDrive/>
            <Divider orientation="vertical"/>
            <RiArrowDropDownLine size={20}/>
        </Flex>
    )
}

const Create = () => {

    setSkipStorage(false)

    const props = usePanels()

    const resetConsole = useResetRecoilState(_console)
    const resetStatus = useResetRecoilState(projectStatus)
    const resetControl = useResetRecoilState(projectControl)
    const resetShaders = useResetRecoilState(codeFiles)
    const resetParams = useResetRecoilState(params)
    const resetLayout = useResetRecoilState(layoutState)

    const setShaders = useSetRecoilState(codeFiles)
    const setParams = useSetRecoilState(params)
    const setLayout = useSetRecoilState(layoutState)

    useEffect(() => {

        resetStatus()
        resetConsole()
        resetControl()

        let shaders = window.localStorage.getItem('files')
        if (shaders)
            setShaders(JSON.parse(shaders))
        else
            resetShaders()
    
        let parameters = window.localStorage.getItem('params')
        if (parameters)
            setParams(JSON.parse(parameters))
        else
            resetParams()
    
        let layout = window.localStorage.getItem('layout')
        if (layout)
            setLayout(JSON.parse(layout))
        else
            resetLayout()
    }, [])
    
    return (
        <Scaffold navChildren={
            <ProjectHeader/>
        }>
            <Head>
                <title>{`GPUToy :: Unnamed Project`}</title>
            </Head>
            <Panels {...props} descriptors={descriptors}/>
        </Scaffold>
    )
}

export default Create
