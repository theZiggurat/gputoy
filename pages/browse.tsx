import React, { useEffect, useRef, useState } from 'react'
import { 
    chakra, 
    Text, 
    Box,
    Grid,
    GridItem,
    Image,
    Flex,
    Input,
} from '@chakra-ui/react'
import Scaffold from '../src/components/scaffold'
import { Project } from '.prisma/client'
import prisma from '../lib/prisma'
import project, { Project as GPUProject } from '../src/gpu/project'
import { codeFiles, params, projectStatus, setProjectStateFromDBValue, useProjectControls } from '../src/recoil/project'
import { useRecoilValue, useSetRecoilState } from 'recoil'
import { GetServerSideProps } from 'next'

export const getServerSideProps: GetServerSideProps = async ({req, res}) => {
    const projects = await prisma.project.findMany({
        take: 12,
        include: {
            shaders: true,
            author: {
                select: {
                    name: true
                }
            }
        }
    })
    projects.forEach(p => {
      p.createdAt = p.createdAt.toISOString()
      p.updatedAt = p.updatedAt.toISOString()
    })
    return {
      props: {
        projects: projects
      },
    };
  }

const ProjectCard = (props: {project: Project, imgSrc: string}) => {
    return (
        <Box width="100%" height="100%" position="relative">
            <Image 
                position="absolute" 
                src={props.imgSrc ?? "https://via.placeholder.com/1000"} 
                width="100%" 
                height="100%" 
                zIndex={0}
            />
            <Text position="relative" display="block" width="fit-content" bg="gray.1000" p="0.5rem" fontSize="xx-large" fontFamily="'JetBrains Mono'" zIndex={2}>
                {props.project?.title ?? "Placeholder"}
            </Text>
            <Text position="relative" display="inline" bg="gray.1000" p="0.5rem" fontSize="med" fontFamily="'JetBrains Mono'" zIndex={2}>
                {props.project?.author?.name ?? "Placeholder Author"}
            </Text>
        </Box>
    )
}

// const ProjectCard = (props: {project?: Project}) => {

//     const animRef = useRef(0)
//     const control = useProjectControls()
//     const projectStatusState = useRecoilValue(projectStatus)
//     setProjectStateFromDBValue(props.project)

//     const render = () => {
//         console.log('here')
//         control.step()
//         GPUProject.instance().renderFrame()
//         animRef.current = requestAnimationFrame(render)
//     }

//     useEffect(() => {
//         GPUProject.instance().attachCanvas('present')
//         GPUProject.instance().prepareRun(projectStatusState)
//         control.play()
//         animRef.current = requestAnimationFrame(render)
//         return () => cancelAnimationFrame(animRef.current)
//     }, [])

//     return (
//         <Box width="100%" height="100%" position="relative">
//             <canvas id="present" 
//                 style={{
//                     position: "absolute",
//                     backgroundColor: 'red'
//             }}/> 
//             <Text position="relative" display="block" width="fit-content" bg="gray.1000" p="0.5rem" fontSize="xx-large" fontFamily="'JetBrains Mono'">
//                 {props.project?.title ?? "Placeholder"}
//             </Text>
//             <Text position="relative" display="inline" bg="gray.1000" p="0.5rem" fontSize="med" fontFamily="'JetBrains Mono'">
//                 {props.project?.author?.name ?? "Placeholder Author"}
//             </Text>
//         </Box>
//     )
// }

const Browse = (props: {projects: Project[]}) => {

    const { projects } = props

    const [imgs, setImgs] = useState<string[]>([])
    const sizes = useRef<DOMRect[]>(Array(12))
    //const canvasRef = useRef<HTMLCanvasElement>(null)
    const relativeRef = useRef<HTMLDivElement>(null)
    const [hovered, setHovered] = useState(-1)
    const [scrollOffset, setScrollOffset] = useState(0)
    const animRef = useRef(0)
    const control = useProjectControls()
    const [playing, setPlaying] = useState(false)

    const render = () => {
        control.step()
        GPUProject.instance().renderFrame()
        animRef.current = requestAnimationFrame(render)
    }

    const init = async () => {
        await GPUProject.instance().attachCanvas('offscreen')
        const srcs = projects.map(async p => {
          return await GPUProject.instance().renderPreview(p) ?? ""
        })
        setImgs(await Promise.all(srcs))

        await GPUProject.instance().attachCanvas('presentationCanvas')
    }
      
    useEffect(() => {
        if (projects != null)
          init()
    }, [])

    useEffect(() => {
        if (playing) {
            //console.log('playing', hovered)
            control.play()
            GPUProject.instance().attachCanvas('presentationCanvas')
            GPUProject.instance().setFromDbDirect(projects[hovered])
            GPUProject.instance().prepareRun({frameNum: 0})
            animRef.current = requestAnimationFrame(render)
        } 
        return () => {
            //console.log('stopping from return', animRef.current)
            control.stop()
            cancelAnimationFrame(animRef.current)
        }
    }, [playing])

    const onHandleMouseOver = (idx: number) => {
        setHovered(idx)
        setPlaying(true)
    }
    const onHandleMouseExit = () => setPlaying(false)

    const onHandleScroll = (ev) => {
        setScrollOffset(ev.target.scrollTop)
    }

    const computeLocationAtIndex = (el: HTMLDivElement | null, idx: number) => {
        if (el == null) return
        sizes.current[idx] = el.getBoundingClientRect()
        //console.log(el.)
    }  

    return (
        <Scaffold>
            <canvas id='offscreen' height="2000px" width="2000px" style={{
                position: 'absolute',
                visibility: 'hidden'
            }}/>
            <Box p="2rem" px="4rem" bg="gray.1000" height="100%" overflowY="scroll" onScroll={onHandleScroll}>
                <Flex justifyContent="center" mb="2rem">
                    <Input type="search">
                    </Input>
                    <Input type="date">
                    </Input>
                </Flex>
                <Grid 
                    ref={relativeRef}
                    position="relative"
                    templateRows='repeat(6, 1fr)'
                    templateColumns='repeat(3, 1fr)' 
                    height="300%" 
                    gap="1rem"
                >
                    <canvas 
                        id="presentationCanvas"
                        //ref={canvasRef} 
                        // width={300}
                        // height={300}
                        width={(sizes.current[hovered]?.width ?? 1600)} 
                        height={(sizes.current[hovered]?.height ?? 1600)}
                        style={{
                            position: 'absolute',
                            backgroundColor: 'red',
                            left: (sizes.current[hovered]?.x ?? 0) - (relativeRef.current?.offsetLeft ?? 0),
                            top: (sizes.current[hovered]?.y ?? 0) - (relativeRef.current?.offsetTop ?? 0) + scrollOffset,
                            overflowY: "hidden",
                            zIndex: 1,
                            pointerEvents: 'none',
                            visibility: playing ? 'visible':'hidden',
                            opacity: playing ? 1: 0,
                            transition: 'visibility 1s, opacity 1s'
                        }}
                    />
                    {
                        projects.map((p: Project, idx: number) => {
                            return (
                                <GridItem 
                                    rowSpan={idx == 0 || idx == 7 ? 2 : 1} 
                                    colSpan={idx == 0 || idx == 7 ? 2 : 1} 
                                    onMouseOver={() => onHandleMouseOver(idx)} 
                                    onMouseLeave={onHandleMouseExit}
                                    ref={el => computeLocationAtIndex(el, idx)}
                                >
                                    <ProjectCard project={p} imgSrc={imgs[idx]} />
                                </GridItem>
                            )
                        })
                    }
                    {/* <GridItem rowSpan={2} colSpan={2} onMouseOver={() => onHandleMouseOver(0)} onMouseLeave={onHandleMouseExit}>
                        { hovered == 0 && <ProjectCard project={props.projects[0]} imgSrc={imgs[0]}/> }
                        { hovered != 0 && <StaticProjectCard project={props.projects[0]} imgSrc={imgs[0]}/> }
                    </GridItem>
                    <GridItem onMouseOver={() => onHandleMouseOver(1)} onMouseLeave={onHandleMouseExit}>
                        { hovered == 1 && <ProjectCard project={props.projects[1]} imgSrc={imgs[1]}/> }
                        { hovered != 1 && <StaticProjectCard project={props.projects[1]} imgSrc={imgs[1]}/> }
                    </GridItem>
                    <GridItem onMouseOver={() => onHandleMouseOver(2)} onMouseLeave={onHandleMouseExit}>
                        { hovered == 2 && <ProjectCard project={props.projects[2]} imgSrc={imgs[2]}/> }
                        { hovered != 2 && <StaticProjectCard project={props.projects[2]} imgSrc={imgs[2]}/> }
                    </GridItem>
                    <GridItem onMouseOver={() => onHandleMouseOver(3)} onMouseLeave={onHandleMouseExit}>
                        { hovered == 3 && <ProjectCard project={props.projects[3]} imgSrc={imgs[3]}/> }
                        { hovered != 3 && <StaticProjectCard project={props.projects[3]} imgSrc={imgs[3]}/> }
                    </GridItem>
                    <GridItem onMouseOver={() => onHandleMouseOver(4)} onMouseLeave={onHandleMouseExit}>
                        { hovered == 4 && <ProjectCard project={props.projects[4]} imgSrc={imgs[4]}/> }
                        { hovered != 4 && <StaticProjectCard project={props.projects[4]} imgSrc={imgs[4]}/> }
                    </GridItem>
                    <GridItem onMouseOver={() => onHandleMouseOver(5)} onMouseLeave={onHandleMouseExit}>
                        { hovered == 5 && <ProjectCard project={props.projects[5]} imgSrc={imgs[5]}/> }
                        { hovered != 5 && <StaticProjectCard project={props.projects[5]} imgSrc={imgs[5]}/> }
                    </GridItem>
                    <GridItem onMouseOver={() => onHandleMouseOver(6)} onMouseLeave={onHandleMouseExit}>
                        { hovered == 6 && <ProjectCard project={props.projects[6]} imgSrc={imgs[6]}/> }
                        { hovered != 6 && <StaticProjectCard project={props.projects[6]} imgSrc={imgs[6]}/> }
                    </GridItem>
                    <GridItem rowSpan={2} colSpan={2} onMouseOver={() => onHandleMouseOver(7)} onMouseLeave={onHandleMouseExit}>
                        { hovered == 7 && <ProjectCard project={props.projects[7]} imgSrc={imgs[7]}/> }
                        { hovered != 7 && <StaticProjectCard project={props.projects[7]} imgSrc={imgs[7]}/> }
                    </GridItem>
                    <GridItem onMouseOver={() => onHandleMouseOver(8)} onMouseLeave={onHandleMouseExit}>
                        { hovered == 8 && <ProjectCard project={props.projects[8]} imgSrc={imgs[8]}/> }
                        { hovered != 8 && <StaticProjectCard project={props.projects[8]} imgSrc={imgs[8]}/> }
                    </GridItem>
                    <GridItem onMouseOver={() => onHandleMouseOver(9)} onMouseLeave={onHandleMouseExit}>
                        { hovered == 9 && <ProjectCard project={props.projects[9]} imgSrc={imgs[9]}/> }
                        { hovered != 9 && <StaticProjectCard project={props.projects[9]} imgSrc={imgs[9]}/> }
                    </GridItem>
                    <GridItem onMouseOver={() => onHandleMouseOver(10)} onMouseLeave={onHandleMouseExit}>
                        { hovered == 10 && <ProjectCard project={props.projects[10]} imgSrc={imgs[10]}/> }
                        { hovered != 10 && <StaticProjectCard project={props.projects[10]} imgSrc={imgs[10]}/> }
                    </GridItem>
                    <GridItem onMouseOver={() => onHandleMouseOver(11)} onMouseLeave={onHandleMouseExit}>
                        { hovered == 11 && <ProjectCard project={props.projects[11]} imgSrc={imgs[11]}/> }
                        { hovered != 11 && <StaticProjectCard project={props.projects[11]} imgSrc={imgs[11]}/> }
                    </GridItem> */}
                </Grid>
                <Flex justifyContent="center" mt="2rem">
                    Test
                </Flex>
            </Box>
        </Scaffold>
    )
}

export default Browse;



