import {
    Avatar,
    Button,
    ButtonProps,
    Center,
    Flex,
    HStack, Input,
    Spinner,
    Stack, useColorMode
} from "@chakra-ui/react";
import useProjectSession from "@core/hooks/useProjectSession";
import { Session } from "next-auth";
import { signIn, signOut } from "next-auth/client";
import { useRouter } from "next/router";
import { ReactElement, useState } from "react";
import { AiOutlineUser } from "react-icons/ai";
import { FaGithub, FaGoogle, FaTwitter } from "react-icons/fa";
import { IoExit } from "react-icons/io5";
import { MdSettings } from "react-icons/md";
import { RiProjector2Fill } from "react-icons/ri";
import { themed } from "../../theme/theme";
import { Divider } from "./misc/micro";

const MenuButton = (props: {
  text: string;
  onClick?: () => void;
  icon?: ReactElement;
  last?: boolean;
}) => {
  return (
    <Flex
      as={Button}
      onClick={props.onClick}
      textAlign="left"
      px="1rem"
      fontWeight="normal"
      justifyContent="space-between"
    >
      {props.text}
      {props.icon}
    </Flex>
  );
};

type UserMenuProps = {
  session: Session | null;
  loading: boolean;
  isOpen: boolean;
  offset?: string;
  center?: boolean;
};
const UserMenu = (props: UserMenuProps) => {
  const { session, loading } = props;

  let inner;
  if (loading) {
    inner = (
      <Center width="100%" height="10rem">
        <Spinner />
      </Center>
    );
  }

  if (!session) {
    inner = (
      <>
        <Stack p="0.5rem" pt="1rem">
          <Input type="text" placeholder="Email" />
          <Input type="password" placeholder="Password" />
        </Stack>
        <HStack p="0.5rem" pb="1rem" justifyContent="center">
          <Button borderRadius="md" width="50%">
            Sign In
          </Button>
          <Button borderRadius="md" width="50%">
            Sign Up
          </Button>
        </HStack>
        <Divider />
        <Stack p="0.5rem" py="1rem" sx={{ border: "0" }}>
          <Button
            onClick={() =>
              signIn("github", { callbackUrl: `${window.location.href}` })
            }
            bg="black"
            leftIcon={<FaGithub />}
            color="white"
          >
            Sign In With Github
          </Button>
          <Button
            onClick={() => signIn("google")}
            bg="#4588f1"
            leftIcon={<FaGoogle />}
            color="white"
          >
            Sign In With Google
          </Button>
          <Button
            onClick={() => signIn("twitter")}
            bg="#1DA1F2"
            leftIcon={<FaTwitter />}
            color="white"
          >
            Sign In With Twitter
          </Button>
        </Stack>
      </>
    );
  }

  if (session) {
    inner = (
      <Stack p="0.5rem" sx={{ border: "0" }}>
        <MenuButton text="Projects" icon={<RiProjector2Fill />} />
        <MenuButton text="Settings" icon={<MdSettings />} />
        <MenuButton
          text="Sign Out"
          icon={<IoExit />}
          onClick={() => signOut({ callbackUrl: `${window.location.origin}` })}
        />
      </Stack>
    );
  }

  return (
    <Flex
      minW="fit-content"
      width="100%"
      direction="column"
      borderRadius="0px"
      position="absolute"
      top={props.offset ?? "2rem"}
      right={props.center ? "50%" : "0"}
      bg={themed("a1")}
      visibility={props.isOpen ? "visible" : "hidden"}
      border="1px"
      borderColor={themed("border")}
      shadow="xl"
      transform={props.center ? "translateX(50%)" : ""}
    >
      {inner}
    </Flex>
  );
};

type NavUserProps = {
  offset?: string;
  center?: boolean;
};
const NavUser = (props: ButtonProps & NavUserProps) => {
  const router = useRouter();
  const [session, loading, isOwner] = useProjectSession();

  const [isOpen, setIsOpen] = useState(false);

  const onClick = (ev) => {
    if (ev.target === ev.currentTarget) {
      setIsOpen((o) => !o);
    }
  };

  const defaultColor = themed("button");
  const activeColor = themed("buttonHovered");

  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Button
      onClick={onClick}
      leftIcon={
        session ? (
          <Avatar size="2xs" src={session.user?.image ?? undefined} />
        ) : (
          <AiOutlineUser pointerEvents="none" />
        )
      }
      size="sm"
      h="1.6rem"
      px="0.5rem"
      mx="0.2rem"
      border="0px"
      borderRadius="3px"
      {...props}
    >
      {session?.user?.name ?? "Sign In"}
      <UserMenu
        session={session}
        loading={loading}
        isOpen={isOpen}
        offset={props.offset}
        center={props.center}
      />
    </Button>
  );
};

export default NavUser;
