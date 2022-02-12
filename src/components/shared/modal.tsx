import { Box, Portal } from "@chakra-ui/react";
import React, { ReactElement, useContext, useState } from "react";
import { themed } from "theme/theme";

type ModalProps = {
  isOpen?: boolean,
  onRequestClose: () => void
  children: ReactElement,
}

export const Modal = (props: ModalProps) => {

  return (
    <Portal >
      {
        props.isOpen &&
        <>
          <Box
            pos="absolute"
            width="100%"
            height="100%"
            left="0"
            top="2.5rem"
            zIndex={4}
            onClick={props.onRequestClose}
          />
          <Box
            pos="absolute"
            width="fit-content"
            height="fit-content"
            top="50%"
            left="50%"
            bg={themed('a2')}
            zIndex={5}
            transform="translate(-50%, -50%)"
            border="1px"
            borderColor={themed('border')}
          >
            {props.children}
          </Box>
        </>
      }
    </Portal>
  )
}

export const useModal = (autoOpen?: boolean) => {
  const [isOpen, setOpen] = useState(autoOpen ?? false)

  const closeModal = () => setOpen(false)
  const openModal = () => setOpen(true)
  const toggleModal = () => setOpen(o => !o)

  return { isOpen, openModal, closeModal, toggleModal }
}