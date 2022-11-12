import {
  Avatar, Box, Center, Checkbox, Flex, Grid,
  HStack, Icon, IconButton, Spinner, Text, useColorModeValue
} from "@chakra-ui/react";
import { Modal } from "@components/shared/modal";
import NavUser from "@components/shared/user";
import useProjectDirect from "@core/hooks/useProjectDirect";
import useProjectSession from "@core/hooks/useProjectSession";
import * as types from "@core/types";
import useFork from "core/hooks/useFork";
import { currentProjectIdAtom } from "core/recoil/atoms/project";
import { useSession } from "next-auth/client";
import Link from "next/link";
import { useRouter } from "next/router";
import generate from "project-name-generator";
import { useCallback, useEffect, useState } from "react";
import { BsCloudArrowUp, BsCloudCheck } from "react-icons/bs";
import { FiHardDrive } from "react-icons/fi";
import {
  MdAdd, MdCheck, MdClose,
  MdDeleteOutline, MdPublishedWithChanges
} from "react-icons/md";
import { useSetRecoilState } from "recoil";
import { themed } from "theme/theme";

type ProjectInfo = {
  id: string;
  title: string;
  authorId: string | null;
  updatedAt: string;
  type: number;
  unclaimed?: boolean;
};

const projectAccessModeIcon = [
  <FiHardDrive key="0" title="Saved to local storage" size={14} />,
  <BsCloudCheck key="1" title="Saved to account" size={14} />,
  <BsCloudArrowUp
    key="2"
    title="Saved to account with local changes"
    size={14}
  />,
  <MdCheck key="3" title="Published" size={14} />,
  <MdPublishedWithChanges
    key="4"
    title="Published with local changes"
    size={14}
  />,
];

const foldProjectArrays = (
  local: ProjectInfo[],
  remote: ProjectInfo[],
  authorId: string | null
) => {
  const localChangesSet = local
    .filter((i1) => remote.find((i2) => i1.id === i2.id))
    .map((i) => {
      return { ...i, type: i.type + 1 } as ProjectInfo;
    });
  const localChangesIds = localChangesSet.map((i) => i.id);
  const localFiltered = local.filter((i) => !localChangesIds.includes(i.id));
  const remoteFiltered = remote.filter((i) => !localChangesIds.includes(i.id));

  return localChangesSet
    .concat(localFiltered)
    .concat(remoteFiltered)
    .filter((i) => i.authorId == authorId || !i.authorId)
    .map((i) => (i.authorId ? i : { ...i, unclaimed: true }))
    .sort((a, b) => {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
};

const ProjectDrawer = () => {
  const [localProjects, setLocalProjects] = useState<ProjectInfo[]>([]);
  const [remoteProjects, setRemoteProjects] = useState<ProjectInfo[]>([]);

  const [checked, setChecked] = useState<boolean[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const [session, _l, _i] = useProjectSession();
  const [isSyncing, setIsSyncing] = useState(true);

  const allProjects = foldProjectArrays(
    localProjects,
    remoteProjects,
    session?.user?.id ?? null
  );
  const router = useRouter();
  const setCurrentProjectId = useSetRecoilState(currentProjectIdAtom);

  /**
   * load projects from session
   */
  useEffect(() => {
    const fetchProjects = async () => {
      if (session) {
        const res = await fetch("/api/myprojects", {
          method: "GET",
        });
        const projects = await res.json();
        setRemoteProjects(
          projects.map((p) => ({
            ...p,
            type: p.published ? 3 : 1,
            authorId: session?.user?.id ?? null,
          }))
        );
        setIsSyncing(false);
      } else {
        setIsSyncing(false);
      }
    };
    fetchProjects();
  }, [session]);

  const fetchFromLocalStorage = useCallback(() => {
    const localProj: ProjectInfo[] = [];
    for (let key in localStorage) {
      if (key.startsWith("project_local")) {
        const project = JSON.parse(localStorage.getItem(key)!);

        localProj.push({
          id: key.match(/(?<=project_local_).*/gm)![0],
          title: project.title,
          authorId: project.author?.id ?? null,
          updatedAt: project.updatedAt,
          type: 0,
        });
      }
    }
    setLocalProjects(localProj);
  }, []);

  /**
   * load projects from storage on component init
   */
  useEffect(() => {
    fetchFromLocalStorage();
  }, [fetchFromLocalStorage]);

  const onCheckboxClick = (idx: number) => {
    setChecked((old) => {
      let newVal = [...old];

      newVal[idx] = !newVal[idx];
      return newVal;
    });
  };

  const onHandleDelete = () => {
    allProjects
      .filter((_, idx) => checked[idx])
      .forEach((p) => {
        // TODO: add delete endpoint to /pages/api
        // for now it only removed local storage
        localStorage.removeItem(`project_local_${p.id}`);
      });
    setIsDeleting(false);
    fetchFromLocalStorage();
  };

  return (
    <Flex flexDir="column" borderRight="1px" borderColor={themed("border")}>
      <Flex
        bg={themed("a2")}
        borderBottom="1px"
        borderColor={themed("borderLight")}
        color={themed("textMidLight")}
        fontWeight="bold"
        fontSize="sm"
        p="0.5rem"
        pl="1rem"
        justifyContent="space-between"
        alignItems="center"
      >
        Recent Projects
        {isSyncing && (
          <Box fontWeight="light" fontSize="xs">
            Syncing with account
            <Spinner size="xs" ml="1rem" />
          </Box>
        )}
        {!isDeleting && (
          <IconButton
            title="Mark for deletion"
            aria-label="Mark for deletion"
            icon={<MdDeleteOutline />}
            color={themed("textLight")}
            size="8px"
            onClick={() => setIsDeleting(true)}
          />
        )}
        {isDeleting && (
          <Flex gridGap="0.5rem">
            <IconButton
              aria-label="Set name"
              title="Set name"
              disabled={!checked.find((v) => v)}
              icon={<MdCheck />}
              size="8px"
              onClick={onHandleDelete}
            />
            <IconButton
              aria-label="Cancel"
              title="Cancel"
              icon={<MdClose />}
              size="8px"
              onClick={() => {
                setIsDeleting(false);
                setChecked([]);
              }}
            />
          </Flex>
        )}
      </Flex>
      <Flex w="20rem" flexDir="column">
        {allProjects.map((p, idx) => (
          <Flex
            key={p.id}
            justifyContent="space-between"
            alignItems="center"
            w="100%"
            borderBottom="1px"
            borderColor={themed("borderLight")}
            p="0.5rem"
            pl="1rem"
            fontSize="sm"
            transition="background-color 0.2s ease"
            _hover={{
              bg: themed("inputHovered"),
            }}
            //onClick={() => onClickProject(p.id)}
          >
            <Box>
              {isDeleting && (
                <Checkbox
                  pr="1rem"
                  transform="translate(0, 4px)"
                  isChecked={checked[idx]}
                  onChange={(e) => onCheckboxClick(idx)}
                />
              )}

              <Link href={`/editor/${p.id}`} passHref>
                <Text
                  display="inline"
                  fontWeight="bold"
                  color={themed("textMid")}
                  cursor="pointer"
                >
                  {p.title}
                </Text>
              </Link>
            </Box>
            <HStack sx={{ color: themed("textLight"), fontSize: "lg" }}>
              {projectAccessModeIcon[p.type]}
            </HStack>
          </Flex>
        ))}
        {allProjects.length == 0 && (
          <Text
            textAlign="center"
            fontSize="xs"
            color={themed("textLight")}
            p="1rem"
          >
            Choose a template on the right to get started
          </Text>
        )}
      </Flex>
    </Flex>
  );
};

const ProjectTemplates = (props: { templates: types.ProjectQuery[] }) => {
  const fork = useFork();
  const onClickProjectTemplate = (idx: number) =>
    fork(props.templates[idx], { title: generate().dashed });
  const onClickEmptyProject = () =>
    fork(types.defaultProject, { title: generate().dashed });

  return (
    <Flex flexDir="column">
      <Flex
        borderBottom="1px"
        borderColor={themed("borderLight")}
        color={themed("textMidLight")}
        bg={themed("a2")}
        fontWeight="bold"
        fontSize="sm"
        p="0.5rem"
        pl="1rem"
        justifyContent="space-between"
      >
        <Text>New Project</Text>
        {/* <Input size="xs" maxW="50%" h="1.3rem">

        </Input> */}
      </Flex>
      <Grid
        templateColumns="repeat(3, 1fr)"
        p="1rem"
        gridGap="1rem"
        maxH="600px"
        overflowY="scroll"
      >
        {props.templates.map((p, idx) => (
          <ProjectTemplate
            key={p.title}
            project={p}
            idx={idx}
            onClickProjectTemplate={onClickProjectTemplate}
          />
        ))}
        <Flex
          width="15rem"
          height="15rem"
          position="relative"
          className="group"
          transition="transform 0.2s ease"
          cursor="pointer"
          _hover={{
            transform: "scale(1.03)",
          }}
          border="2px dashed"
          borderColor={themed("borderLight")}
          justifyContent="center"
          alignItems="center"
          flexDir="column"
          onClick={onClickEmptyProject}
        >
          <Text fontSize="xl" fontWeight="bold" color={themed("textMidLight")}>
            Empty Project
          </Text>
          <Icon as={MdAdd} size={30} color={themed("textMidLight")} />
        </Flex>
      </Grid>
    </Flex>
  );
};

type ProjectTemplateProps = {
  project: types.ProjectQuery;
  onClickProjectTemplate: (idx: number) => void;
  idx: number;
};
const ProjectTemplate = (props: ProjectTemplateProps) => {
  const { project } = props;

  const canvasId = `${project.id}_canvas`;
  const io = {
    builtin: {
      id: project.id,
      label: "builtin",
      ioType: "viewport",
      args: {
        canvasId,
        mouseId: canvasId,
      },
    },
  } as Record<string, types.IOChannel>;

  const [loading, failure, setPlaying] = useProjectDirect(project, io, false);
  const textBg = useColorModeValue("light.bg", "dark.bg");

  const onHandleHover = () => {
    setPlaying(true);
  };
  const onHandleLeave = () => {
    setPlaying(false);
  };

  const handleClickProjectTemplate = () => {
    props.onClickProjectTemplate(props.idx);
  };

  return (
    <Box
      onClick={handleClickProjectTemplate}
      width="15rem"
      height="15rem"
      position="relative"
      onMouseEnter={onHandleHover}
      onMouseLeave={onHandleLeave}
      className="group"
      transition="transform 0.2s ease"
      cursor="pointer"
      _hover={{
        transform: "scale(1.03)",
      }}
    >
      {loading && (
        <Center width="100%" height="100%" position="absolute">
          <Spinner zIndex={5}></Spinner>
        </Center>
      )}
      <Box
        pos="absolute"
        zIndex={1}
        left="-1px"
        top="-1px"
        p="1rem"
        w="101%"
        bg={themed("bgVisible")}
      >
        <Text fontSize="xl" fontWeight="bold" color={themed("textMidLight")}>
          {project.title}
        </Text>
        <Text fontSize="sm" color={themed("textMidLight")}>
          {project.description}
        </Text>
      </Box>

      <canvas
        id={canvasId}
        width="100%"
        height="100%"
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          visibility: loading ? "hidden" : "visible",
          opacity: loading ? 0 : 1,
          transition: "opacity 1.0s ease",
          pointerEvents: "none",
        }}
      />
    </Box>
  );
};

const ProjectSelection = (props: { templates: types.ProjectQuery[] }) => {
  const [session, loading] = useSession();

  return (
    <Modal onRequestClose={() => {}} isOpen>
      <Flex
        bg={themed("p")}
        flexDir="column"
        border="2px"
        borderColor={themed("borderLight")}
      >
        <Flex
          p="1rem"
          bg={themed("bg")}
          borderBottom="1px"
          borderColor={themed("border")}
          justifyContent="space-between"
        >
          <Text
            fontSize="xx-large"
            fontWeight="bold"
            color={themed("textMidLight")}
          >
            Select Project
          </Text>
          <HStack>
            {session && (
              <>
                <Text fontWeight="light" color={themed("textLight")}>
                  Welcome, {session?.user?.name}
                </Text>
                <Avatar size="sm" src={session?.user?.image ?? undefined} />
              </>
            )}
            {!session && <NavUser size="lg" p="1rem" offset="2.5rem" />}
          </HStack>
        </Flex>
        <Flex flexDir="row">
          <ProjectDrawer />
          <ProjectTemplates {...props} />
        </Flex>
      </Flex>
    </Modal>
  );
};

export default ProjectSelection;

function generated() {
  throw new Error("Function not implemented.");
}
