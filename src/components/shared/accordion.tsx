import { Flex, Box, Icon, Text } from "@chakra-ui/react"
import { themed } from "@theme/theme"
import { ReactElement, ReactNode, useState } from "react"
import { MdArrowRight } from "react-icons/md"

type AccordionProps = {
  title: string,
  initOpen?: boolean
  children: ReactElement<any>[] | ReactElement<any>,
  first?: boolean
  last?: boolean
  rightSide?: ReactNode
}
const Accordion = (props: AccordionProps) => {

  const { title, children, initOpen, first, last, rightSide, ...rest } = props
  const [isOpen, setOpen] = useState(initOpen ?? false)

  const onHandleClick = () => {
    setOpen(o => !o)
  }

  return (
    <Flex flexDir="column">
      <Flex
        onClick={onHandleClick}
        cursor="pointer"
        flex="0"
        flexDir="row"
        justifyContent="space-between"
        alignItems="center"
        borderBottom={isOpen ? "1px" : props.last ? '1px' : '0px'}
        borderTop={first ? "0px" : "1px"}
        borderColor={themed('border')}
        bg={themed('a1')}
        p="0.5rem"
        py="0.3rem"
        color={themed('textMid')}
        _hover={{
          bg: themed('a2'),
          color: themed('textHigh')
        }}
      >
        <Box>
          <Icon
            as={MdArrowRight}
            transform={isOpen ? "rotate(90deg)" : ""}
            transition="transform 0.15s ease"
            mr="0.5rem"
          />
          <Text
            fontWeight="semibold"
            display="inline"
            userSelect="none"
            fontSize="sm"
          >
            {title}
          </Text>
        </Box>
        {
          props.rightSide
        }
      </Flex>
      {isOpen &&
        <Box {...rest}>
          {children}
        </Box>
      }
    </Flex>
  )

}

export default Accordion