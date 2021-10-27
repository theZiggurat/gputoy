export type StatusHeader = 'Idle' | 'Running' | 'Paused' | 'Error'
export default interface Status {
  header: StatusHeader,
  message?: string
}