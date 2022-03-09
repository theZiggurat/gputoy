import { Monaco } from "@monaco-editor/react"
import * as JSONSchema from '../../public/runner.schema.json'

const setJSONSchema = (monaco: Monaco) => {
  console.log('setting schema')
  monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
    validate: true,
    allowComments: false,
    schemas: [
      {
        uri: "http://gputoy.io/runner.schema.json",
        fileMatch: ["*"],
        schema: JSONSchema
      }
    ],
    schemaValidation: 'warning',
    comments: 'ignore'

  })
}

export default setJSONSchema