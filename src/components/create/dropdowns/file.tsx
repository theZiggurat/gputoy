import usePost from "@core/hooks/usePost";
import { useRouter } from "next/router";
import Dropdown, {
    DropdownDivider,
    DropdownItem
} from "../dropdown";

const FileDropdown = () => {
  const { goToOpen } = useDropdown();
  const [post, canPost] = usePost();

  return (
    <Dropdown text="File">
      <DropdownItem text="Select Workspace" onClick={goToOpen} />
      <DropdownDivider />
      <DropdownItem
        text="Save"
        rightText="Ctrl+S"
        onClick={() => post("save")}
        disabled={!canPost}
      />
      <DropdownItem text="Download" />
      <DropdownItem text="Export" />
      <DropdownDivider />
      <DropdownItem
        text="Publish"
        onClick={() => post("publish")}
        disabled={!canPost}
      />
      <DropdownItem text="Fork" />
    </Dropdown>
  );
};

const useDropdown = () => {
  const router = useRouter();

  const goToOpen = () =>
    router.replace("/editor", undefined, { shallow: true });

  return { goToOpen };
};

export default FileDropdown;
