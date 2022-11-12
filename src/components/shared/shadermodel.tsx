import { Box, Flex, FlexProps, Text } from "@chakra-ui/react";
import { projectFileMetadataAtom } from "@core/recoil/atoms/files";
import { withSystemModels } from "@core/recoil/atoms/system";
import * as types from "@core/types";
import { fontMono, themed } from "@theme/theme";
import { useRecoilValue } from "recoil";

const StructBox = (props: { struct: types.NagaTypeStructFull }) => {
  const { name, members } = props.struct;
  return (
    <Flex
      flexDir="column"
      borderTop="1px"
      borderColor={themed("border")}
      p="0.5rem"
      fontFamily={fontMono}
      fontSize="xs"
    >
      <Box>{name}</Box>
      {members.map((m) => (
        <Box key={m.name} pl="1rem">
          {m.name}: {types.getTypeDecl(m.ty, "wgsl")}
        </Box>
      ))}
    </Flex>
  );
};

const ModelBox = (props: { model: types.Model }) => {
  const fileMetadata = useRecoilValue(
    projectFileMetadataAtom(props.model.definingFileId)
  );

  return (
    <Flex flexDir="column" w="100%" border="4px" borderColor={themed("border")}>
      <Flex>
        <Text
          fontSize="md"
          fontWeight="bold"
          px="0.5rem"
          color={themed("textMid")}
        >
          {props.model.name}
          {props.model.definingFileId !== "system" &&
            "." + fileMetadata.extension}
        </Text>
      </Flex>
      {Object.keys(props.model.namedTypes)
        .map((name) => types.getStructFromModel(props.model, name))
        .filter((struct) => !!struct)
        .map((struct) => (
          <StructBox key={struct!.name} struct={struct!} />
        ))}
    </Flex>
  );
};

type ModelListProps = {};
export const ModelList = (props: ModelListProps & FlexProps) => {
  const models = useRecoilValue(withSystemModels);
  const userModels = models.filter((m) => m.definingFileId !== "system");
  const systemModels = models.filter((m) => m.definingFileId === "system");

  const { ...rest } = props;
  return (
    <Flex {...rest} flexDir="column" gridGap="1rem" h="100%" overflowY="scroll">
      <Text px="0.5rem" fontWeight="bold" color={themed("textMid")}>
        Models
      </Text>
      {userModels.map((m) => (
        <Flex key={m.name + m.definingFileId}>
          <ModelBox model={m} />
        </Flex>
      ))}
      {systemModels.map((m) => (
        <Flex key={m.name + m.definingFileId}>
          <ModelBox model={m} />
        </Flex>
      ))}
    </Flex>
  );
};
