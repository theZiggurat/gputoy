import { Box, Button, Flex, Text, Divider, useColorModeValue } from "@chakra-ui/react"
import React, { ReactChildren, ReactNode, ReactNodeArray, useState } from "react"
import { MdArrowRight } from "react-icons/md"
import { themed } from "theme/theme"

type DropdownProps = {
  text: string,
  size?: string,
  children: ReactNode,
}

const Dropdown = (props: DropdownProps) => {
  const [open, setOpen] = useState(false)

  const onDropdownClick = () => {
    setOpen(t => !t)
  }

  const onDropdownBlur = (ev) => {
    if (ev.currentTarget.contains(ev.relatedTarget)) {
      ev.preventDefault()
      return
    }
    setOpen(false)
  }

  return (
    <Box position="relative" onClick={onDropdownClick} onBlur={onDropdownBlur}>
      <Button
        variant="empty"
        bg={open ? themed('buttonHovered') : 'none'}
        color={open ? themed('textHigh') : themed('textMid')}
        _hover={{ color: themed('textHigh') }}
        borderRadius="none"
        size={props.size}
      >
        {props.text}
      </Button>
      {
        open &&
        <Flex
          position="absolute"
          minW="10rem"
          width="fit-content"
          height="fit-content"
          bg={themed('a2')}
          border="1px"
          borderColor={themed('border')}
          flexDirection="column"
          shadow="xl"
          size={props.size}
        >
          {props.children}
        </Flex>
      }
    </Box>
  )
}

type DropdownItemProps = {
  text: string,
  onClick?: () => void,
  rightText?: string,
  disabled?: boolean
}

export const DropdownItem = (props: DropdownItemProps) => {
  return (
    <Flex
      justifyContent="space-between"
      as={Button}
      borderRadius="none"
      border="0px"
      onMouseDown={props.onClick}
      disabled={props.disabled}
      gridGap="1rem"
      bg="none"
    >
      <Text textAlign="left" fontSize="xs" color={themed('textMid')}>
        {props.text}
      </Text>
      <Text textAlign="right" color={themed('textLight')} fontSize="xx-small">
        {props.rightText ?? ""}
      </Text>
    </Flex>
  )
}

type DropdownSubDropdownProps = {
  text: string,
  children: ReactNode,
  onClick?: () => void,
  disabled?: boolean
}

export const DropdownSubDropdown = (props: DropdownSubDropdownProps) => {
  return (
    <Flex
      justifyContent="space-between"
      as={Button}
      borderRadius="none"
      border="0px"
      onMouseDown={props.onClick}
      disabled={props.disabled}
      gridGap="1rem"
      bg="none"
      position="relative"
    >
      <Text textAlign="left" fontSize="xs" color={themed('textMid')}>
        {props.text}
      </Text>
      <MdArrowRight fill={useColorModeValue('rgba(0, 0, 0, 0.36)', 'rgba(255, 255, 255, 0.45)')} />

    </Flex>
  )
}

export const DropdownDivider = () => {
  return <Divider outlineColor={'border'} borderTop="5px" />
}

export default Dropdown