import { useTaskReciever } from "@core/hooks/useTask";
import * as types from "@core/types";

const TaskReciever = (props: {
  id: string;
  onTask: Record<string, (task: types.Task) => boolean>;
}) => {
  useTaskReciever(props.id, props.onTask);
  return <></>;
};

export default TaskReciever;
