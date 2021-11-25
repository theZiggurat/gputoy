import React from 'react'
import { useRecoilValue } from 'recoil'
import { projectStatus, projectControl } from '../../recoil/project'
import { Text, Box } from '@chakra-ui/react'

export const ProjectStatusView = () => {

  const projectStatusState = useRecoilValue(projectStatus)
  const projectController = useRecoilValue(projectControl)

  return <Box 
      position="absolute" 
      left="800px" top="20px" 
      bg="blackAlpha.600" 
      borderRadius="lg" 
      width="fit-content" 
      p={3}
  >
      <Text whiteSpace="pre-wrap">
          {JSON.stringify(projectStatusState, null, 2)}
      </Text>
      <Text whiteSpace="pre-wrap">
          {JSON.stringify(projectController, null, 2)}
      </Text>
      
  </Box>
}
