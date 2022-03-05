import { useTaskReciever } from "@core/hooks/useTask"
import { Task } from "@core/types"

const TaskReciever = (props: { id: string, onTask: (task: Task) => boolean }) => {

  useTaskReciever(props.id, props.onTask)

  return <></>
}

export default TaskReciever