import * as monaco from 'monaco-editor-core'

export const wgslHovers: monaco.languages.HoverProvider = {
  provideHover: (model, position) => {
    console.log(model.getWordAtPosition(position)?.word)
    return {
      contents: [
        {
          value: '**var** _keyword_'
        },
        {
          supportThemeIcons: true,
          value: 'Test2'
        },
      ]
    }
  }
}