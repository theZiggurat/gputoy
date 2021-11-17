import React from 'react'
import SplitPane from 'react-split-pane'

export interface PanelDescriptor {
  index: number
  name: string,
  icon: React.ReactElement<any>,
}

export interface OutProps {
    onSplitPanel: (path: string, direction: 'horizontal' | 'vertical', panelIndex: number) => void,
    onCombinePanel: (path: string) => void,
    onSwitchPanel: (path: string, panelIndex: number) => void,
}

export const usePanels = (panels: PanelDescriptor[], initial: any): [Tree, OutProps] => {
    const [panelTree, setPanelTree] = React.useState(new Tree(initial))

    const onSplit = (path: string, direction: 'horizontal' | 'vertical', panelIndex: number) => {
        if (panelTree.walk(path, node => {
            node.left = new TreeNode({index: node.index, type: 'leaf'}, node)
            node.right = new TreeNode({index: panelIndex, type: 'leaf'}, node)
            node.index = -1
            node.type = direction
        }))
            forceUpdate()
    }

    const onCombine= (path: string) => {
            
        if (panelTree.walk(path, node => {
            console.log('node', node)
            let replace: TreeNode
            if(path.endsWith('l'))
                replace = node.parent?.right
            else
                replace = node.parent?.left
            console.log('replacement', replace)
            if (replace) {
                Object.keys(node.parent).forEach(k => delete node.parent[k])
                Object.keys(replace).forEach(k => node.parent[k] = replace[k])
            }
        }))
            forceUpdate()
    }

    const onSwitch = (path: string, panelIndex: number) => {
        if (panelTree.walk(path, node => node.index = panelIndex))
            forceUpdate()
    }
    const forceUpdate = () => setPanelTree(panelTree.clone())

    return [panelTree, {
        onCombinePanel: onCombine,
        onSplitPanel: onSplit,
        onSwitchPanel: onSwitch
    }]
}

export default usePanels

type TreeType = 'vertical' | 'horizontal' | 'leaf'
export class Tree {

    root: TreeNode

    constructor(obj: any){
        this.root = new TreeNode(obj)
    }
    
    walk(path: string, f: (node: TreeNode) => void): boolean {
        return this.root.walk(path, '', f)
    }

    clone(): Tree {
        return Object.assign(Object.create(Object.getPrototypeOf(this)), this)
    }

    render(panels: JSX.Element[], path: string, props: any): React.ReactElement<any> {
        return this.root.render(panels, path, props)
    }
}

class TreeNode {
    type: TreeType
    index: number
    left?: TreeNode
    right?: TreeNode
    parent?: TreeNode

    constructor(obj: any, parent?: TreeNode) {
        this.type = obj.type
        this.index = 'index' in obj ? obj.index : -1
        this.parent = parent
        this.left = 'left' in obj ? new TreeNode(obj['left'], this) : undefined
        this.right = 'right' in obj ? new TreeNode(obj['right'], this) : undefined
    }

    walk(path: string, currPath: string, f: (node: TreeNode) => void): boolean {
        if (path == currPath) {
            f(this)
            return true
        } else {
            let left = this.left?.walk(path, currPath.concat('l'), f) 
            let right = this.right?.walk(path, currPath.concat('r'), f)
            return Boolean(left) || Boolean(right)
        }
    }

    render(panels: JSX.Element[], path: string, props: any): React.ReactElement<any> {
        if (this.type == 'leaf')
            return panels.length <= this.index ? <div className="ERRORDIV"/>: 
                React.cloneElement(
                    panels[this.index], 
                    {...props, 
                        path: path, 
                        panelIndex: this.index, 
                        style: path=='' ? {
                            flex: '1 1 auto',
                            position: 'relative'
                        } : {}
                    }
                )
        else if (this.left && this.right)
            return React.createElement(
                SplitPane,
                {
                    split: this.type, 
                    defaultSize: "60%", 
                    style: path=='' ? {
                        flex: '1 1 auto',
                        position: 'relative'
                    } : {}
                },
                [
                    this.left.render(panels, path.concat('l'), props), 
                    this.right.render(panels, path.concat('r'), props)
                ]
            )
        else 
            return <div className="ERRORDIV"/>
    }
    
}