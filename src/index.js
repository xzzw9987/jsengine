import traverse from 'babel-traverse'
import { parse } from '@babel/parser'

export default class {
  constructor () {
    this.global = {}
  }

  execute (source) {
    const run = exec(this.global)
    try {
      run(source)
    }

    catch (e) {
      console.log(e)
    }
  }
}

const exec = global => {
  return source => {
    traverse(
      parse(source),
      visitor(global))
  }
}

const visitor = global => ({
  VariableDeclarator: VariableDeclarator.bind(global),
  Identifier: Identifier.bind(global),
  FunctionDeclaration: FunctionDeclaration.bind(global)
})

function Identifier (path) {
  /*  const global = this
    let currentPath = path,
      variableKey
    while (currentPath) {
      const key = globalKey(currentPath.scope.uid, path.node.name)
      if (key in global) {
        variableKey = key
        break
      }
      currentPath = currentPath.parentPath
    }
    if (variableKey) { return global[variableKey] }*/
}

function FunctionDeclaration(path) {
  const global = this

}

function globalKey (uid, value) { return `${uid}.${value}` }

/*
 * Variable assignment
 **/

function VariableDeclarator (path) {
  const global = this,
    node = path.node,
    nodeValueDescriptor = evaluateNode.call(global, node.init, path)

  if (nodeValueDescriptor.valid) {
    global[globalKey(path.scope.uid, path.node.id.name)] =
      nodeValueDescriptor.value
    path.skip()
  }
}

function evaluateNode (node, path) {
  const
    global = this,
    initType = node.type

  if (/expression/i.test(initType)) {
    return {value: evaluateExpression.call(global, node, path), valid: true}
  }
  else if (/literal/i.test(initType)) {
    return {value: evaluateLiteral.call(global, node, path), valid: true}
  }
  else if (/identifier/i.test(initType)) {
    return {value: evaluateIdentifier.call(global, node, path), valid: true}

  }
  else {
    console.log('TODO:', initType)
    return {valid: false}
  }
}

function evaluateLiteral (node) {
  return node.value
}

function evaluateIdentifier (node, path) {
  const global = this
  let currentPath = path,
    variableKey
  while (currentPath) {
    const key = globalKey(currentPath.scope.uid, node.name)
    if (key in global) {
      variableKey = key
      break
    }
    currentPath = currentPath.parentPath
  }
  if (variableKey) { return global[variableKey] }
}

function evaluateExpression (node, path) {
  const
    global = this,
    conditions = {
      BinaryExpression () {
        switch (node.operator) {
          case '+':
            return evaluateNode.call(global, node.left, path).value + evaluateNode.call(global, node.right, path).value
          case '-':
            return evaluateNode.call(global, node.left, path).value - evaluateNode.call(global, node.right, path).value
          case '*':
            return evaluateNode.call(global, node.left, path).value * evaluateNode.call(global, node.right, path).value
          case '/':
            return evaluateNode.call(global, node.left, path).value / evaluateNode.call(global, node.right, path).value
          case '&':
            return evaluateNode.call(global, node.left, path).value & evaluateNode.call(global, node.right, path).value
          case '%':
            return evaluateNode.call(global, node.left, path).value % evaluateNode.call(global, node.right, path).value
          case '>':
            return evaluateNode.call(global, node.left, path).value > evaluateNode.call(global, node.right, path).value
          case '<':
            return evaluateNode.call(global, node.left, path).value < evaluateNode.call(global, node.right, path).value
          case '==':
            return evaluateNode.call(global, node.left, path).value == evaluateNode.call(global, node.right, path).value
          case '&&':
            return evaluateNode.call(global, node.left, path).value && evaluateNode.call(global, node.right, path).value
          case '||':
            return evaluateNode.call(global, node.left, path).value || evaluateNode.call(global, node.right, path).value
          default:
            console.log('TODO:', node.operator)
            return

        }
      },
      ObjectExpression (path) {}
    }
  return conditions[node.type] && conditions[node.type]()
}
