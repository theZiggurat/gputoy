import {
    Avatar,
    Button,
    chakra, HStack,
    Input,
    Skeleton,
    Stack,
    Tag,
    Text
} from "@chakra-ui/react";
import Label from "@components/shared/label";
import OutwardLink from "@components/shared/outwardLink";
import {
    useProjectAuthor, useProjectDescription, useProjectTitle
} from "@core/hooks/useProjectMetadata";
import useProjectSession from "@core/hooks/useProjectSession";
import {
    projectAuthorAtom,
    projectForkSource, projectIsPublished
} from "@core/recoil/atoms/project";
import { Author } from "@core/types";
import { themed } from "@theme/theme";
import { AiFillLike } from "react-icons/ai";
import { BiGitRepoForked } from "react-icons/bi";
import { IoIosEye } from "react-icons/io";
import { useRecoilValue, useSetRecoilState } from "recoil";

const SummaryInfo = () => {
  const [title, setTitle] = useProjectTitle();
  const [description, setDescription] = useProjectDescription();
  const isPublished = useRecoilValue(projectIsPublished);

  const author = useProjectAuthor();
  const setAuthor = useSetRecoilState(projectAuthorAtom);
  const [session, _l, isOwner] = useProjectSession();
  const forkSource = useRecoilValue(projectForkSource);

  const onClaimProject = () => {
    let set = {
      id: session?.user?.id!,
      name: session?.user?.name,
      image: session?.user?.image,
    };
    setAuthor(set as Author);
  };

  let titleComponent;
  let descriptionComponent;
  if (title != null) {
    if (isOwner) {
      titleComponent = (
        <Input
          value={title}
          bg="transparent"
          minW="min-content"
          onChange={setTitle}
          placeholder="Project Title"
          pl="0"
          fontWeight="black"
          fontSize="lg"
          color={themed("textMid")}
        />
      );
      descriptionComponent = (
        <chakra.textarea
          value={description ?? undefined}
          onChange={setDescription}
          color={themed("textMidLight")}
          fontSize="xs"
          bg="transparent"
          w="100%"
          resize="vertical"
          outline="none"
          placeholder="Project Description"
        />
      );
    } else {
      titleComponent = (
        <Text fontWeight="black" fontSize="lg" color={themed("textMid")}>
          {title}
        </Text>
      );

      descriptionComponent = (
        <Text fontSize="xs" color={themed("textMidLight")}>
          {description}
        </Text>
      );
    }
  } else {
    titleComponent = (
      <Skeleton
        height="20px"
        startColor={themed("border")}
        endColor={themed("borderLight")}
        speed={0.5}
      />
    );
    descriptionComponent = (
      <>
        <Skeleton
          height="10px"
          startColor={themed("border")}
          endColor={themed("borderLight")}
          speed={0.5}
        />
        <Skeleton
          height="10px"
          startColor={themed("border")}
          endColor={themed("borderLight")}
          speed={0.5}
        />
      </>
    );
  }

  return (
    <Stack bg={themed("a1")}>
      <Stack p="1rem" py="0.5rem">
        {titleComponent}
        {descriptionComponent}
        <Stack direction={["column", "row"]} pt="0.5rem">
          <Tag size="sm" colorScheme="red">
            {" "}
            wgsl{" "}
          </Tag>
          <Tag size="sm" colorScheme="blue">
            {" "}
            mouse{" "}
          </Tag>
          <Tag size="sm" colorScheme="teal">
            {" "}
            spiral{" "}
          </Tag>
        </Stack>
        {isPublished && (
          <HStack pt="0.5rem">
            <HStack>
              <AiFillLike size={13} />
              <Text fontSize="xs">529&nbsp;&nbsp;&bull;</Text>
            </HStack>
            <HStack>
              <IoIosEye size={13} />
              <Text fontSize="xs">20493&nbsp;&nbsp;&bull;</Text>
            </HStack>
            <HStack>
              <BiGitRepoForked size={13} />
              <Text fontSize="xs">29</Text>
            </HStack>
          </HStack>
        )}
      </Stack>
      <Stack p="1rem" py="0.5rem">
        <HStack dir="row" mb="0.5rem">
          <Avatar
            name={author?.name ?? "Anonymous"}
            size="xs"
            display="inline"
            src={author?.image ?? undefined}
          />
          <Text display="inline">
            {author ? author.name ?? "Anonymous" : "Anonymous"}
          </Text>
        </HStack>
        {!author?.name && !!session && (
          <Button bg="red.500" size="xs" onClick={onClaimProject}>
            Claim project
          </Button>
        )}

        {forkSource && (
          <Label text="Forks">
            <OutwardLink
              title={forkSource.title}
              href={`/editor/${forkSource.id}`}
            />
          </Label>
        )}
      </Stack>
    </Stack>
  );
};

export default SummaryInfo;
