import React from 'react'
import SplitPane from 'react-split-pane'

export interface PanelDescriptor {
  index: number
  name: string,
  icon: React.ReactElement<any>,
  component: React.FC<any>,
  staticProps: any,
  defaultDynProps: any,
}

export interface PanelDynProps {
    [key: string]: any
}

export interface PanelOutProps {
    onSplitPanel: (path: string, direction: 'horizontal' | 'vertical', panelIndex: number) => void,
    onCombinePanel: (path: string) => void,
    onSwitchPanel: (path: string, panelIndex: number) => void,
}

export const usePanels = (panelDesc: PanelDescriptor[], initial: any): [Tree, PanelOutProps] => {
    const [panelTree, setPanelTree] = React.useState(new Tree(initial, panelDesc))

    // the three functions below mutate the panelTree, so we need to ensure we updat the tree with a clone
    // at the end of every function if there was a change
    const forceUpdate = () => setPanelTree(panelTree.clone())

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
            let replace: TreeNode | undefined
            let parent: TreeNode | undefined = node?.parent
            // the node on the other side of this roots parent is what we will replace the parent with
            if(path.endsWith('l'))
                replace = parent?.right
            else
                replace = parent?.left
            if (replace && parent) {
                // move replacement's fields to parent
                Object.keys(parent).filter(k => k!='parent').forEach(k => delete parent[k])
                Object.keys(replace).filter(k => k!='parent').forEach(k => parent[k] = replace[k])
                // replacement -> parent, so update the replacement's children to point to new parent
                if (replace.left && replace.right) {
                    replace.left.parent = parent
                    replace.right.parent = parent
                }
            }
        }))
            forceUpdate()
    }

    const onSwitch = (path: string, panelIndex: number) => {
        if (panelTree.walk(path, node => node.index = panelIndex))
            forceUpdate()
    }

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

    constructor(obj: any, panelDesc: PanelDescriptor[]){
        this.root = new TreeNode(obj)
    }
    
    walk(path: string, f: (node: TreeNode) => void): boolean {
        return this.root.walk(path, '', f)
    }

    clone(): Tree {
        return Object.assign(Object.create(Object.getPrototypeOf(this)), this)
    }

    render(panelDesc: PanelDescriptor[], props: any): React.ReactElement<any> {
        return this.root.render(panelDesc, '', props)
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

    render(panelDesc: PanelDescriptor[], path: string, props: any): React.ReactElement<any> {

        if (this.type == 'leaf')
            return panelDesc.length <= this.index ? <div className="ERRORDIV"/>: 
                React.createElement(
                    panelDesc[this.index].component, 
                    {   ...props, 
                        ...panelDesc[this.index].staticProps,
                        path: path, 
                        panelIndex: this.index, 
                        style: path=='' ? {
                            flex: '1 1 auto',
                            position: 'relative',
                            maxHeight: '100%',
                            minHeight: '0%'
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
                    this.left.render(panelDesc, path.concat('l'), props), 
                    this.right.render(panelDesc, path.concat('r'), props)
                ]
            )
        else 
            return <div className="ERRORDIV"/>
    }
    
}