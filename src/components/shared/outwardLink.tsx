import { Button, ButtonProps } from "@chakra-ui/button"
import { Link } from "@chakra-ui/layout"
import React from "react"
import { IoOpenOutline } from "react-icons/io5"

type OutwardLinkProps = {
  href?: string,
  title: string
}


const OutwardLink = (props: OutwardLinkProps & ButtonProps) => {
  return <Link href={props.href} passHref>
    <Button
      size="xs"
      leftIcon={<IoOpenOutline size={13} />}
      variant="empty"
      disabled={!props.href}
    >
      {props.title}
    </Button>
  </Link>
}

export default OutwardLink