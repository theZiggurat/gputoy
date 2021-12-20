import {
  Badge, Button, chakra, Flex, Text
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { ReactNode } from 'react';
import { themed } from '../../theme/theme';
import NavUser from './user';




interface NavLinkProps {
  href: string,
  text: string,
  currentPath: string,
  first?: boolean,
  last?: boolean
}

const NavLink = (props: NavLinkProps) => {
  const selected = props.currentPath === props.href
  return (
    <NextLink href={props.href} passHref>
      <Button
        rounded='md'
        cursor="pointer"
        userSelect="none"
        p="1em"
        size="sm"
        borderLeftRadius={props.first ? "" : "0px"}
        borderLeft={props.first ? "" : "0px"}
        borderRightRadius={props.last ? "" : "0px"}
        bg={selected ? themed('buttonHovered') : ''}
      >
        {props.text}
      </Button>
    </NextLink>
  )
};

export default function Nav(props: { children?: ReactNode }) {

  const router = useRouter();
  const isActive = router.pathname == '/';

  return (
    <chakra.nav
      h='3rem'
      justifyContent="center"
      alignItems='center'
      zIndex="1"
      borderBottom="1px"
      bg={themed('a1')}
      borderColor={themed('border')}
      display="flex"
    >
      <Flex
        flex="1"
        marginRight="auto"
        minW="min-content"
        alignItems="center"
        justifyContent="center"
        px="1rem"
      >
        <NavLink href="/browse" text="Browse" currentPath={router.pathname} first />
        <NavLink href="/create" text="Create" currentPath={router.pathname} />
        <NavLink href="/market" text="Market" currentPath={router.pathname} last />
      </Flex>

      {
        props.children ??
        <>
          <NextLink href="/">
            <Text fontSize={22} fontWeight="extrabold" cursor="pointer">
              GPUTOY
            </Text>
          </NextLink>
          <Badge colorScheme="blue" fontSize="0.6em" cursor="default" style={{ marginRight: '1rem' }}>
            Dev
          </Badge>
        </>
      }
      <NavUser />
    </chakra.nav>
  );
}