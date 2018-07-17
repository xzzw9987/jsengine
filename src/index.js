import traverse from 'babel-traverse'
import { parse } from '@babel/parser'

export default class {
  constructor () {

    // find Program scope uid
    this.execute('var test__var = 0')
    this.__rootUid = parseInt(Object
      .keys(this.global)
      .find(v => /test__var/.test(v))
      .split('.')[0], 10) + 1

    // inject global variables
    Object.assign(
      this.global,
      {
        [globalKey(this.__rootUid, 'console')]: console
      })
  }

  __rootUid = 0
  global = {}

  execute (source) {
    try {
      traverse(
        parse(source),
        visitor(this.global)
      )
    }

    catch (e) {
      console.log(e)
    }
  }
}

const visitor = global => ({
  VariableDeclarator: VariableDeclarator.bind(global),
  // Identifier: Identifier.bind(global),
  FunctionDeclaration: FunctionDeclaration.bind(global),
  Expression: path => {
    if (/expression/i.test(path.type))
      evaluateExpression.call(global, path.node, path)
  }
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

function FunctionDeclaration (path) {
  const global = this,
    key = globalKey(path.parentPath.scope.uid, (path.node.id || {name: ''}).name)

  global[key] = function () {
    const funcVisitor = visitor(global)
    let retValue = undefined

    funcVisitor['ReturnStatement'] = (function (path) {
      const returnValueDescriptor = evaluateNode.call(global, path.node.argument, path)
      if (returnValueDescriptor.valid)
        retValue = returnValueDescriptor.value
      path.stop()
    }).bind(global)

    path.traverse(funcVisitor)
    return retValue
  }
  path.skip()

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
  if (/literal/i.test(initType)) {
    return {value: evaluateLiteral.call(global, node, path), valid: true}
  }
  if (/identifier/i.test(initType)) {
    return {value: evaluateIdentifier.call(global, node, path), valid: true}
  }
  console.log('TODO: Node Type:', initType)
  return {valid: false}
}

function evaluateLiteral (node) {
  return node.value
}

function evaluateIdentifier (node, path) {
  // find variable of node from path
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
          case '<=':
            return evaluateNode.call(global, node.left, path).value <= evaluateNode.call(global, node.right, path).value
          case '>=':
            return evaluateNode.call(global, node.left, path).value >= evaluateNode.call(global, node.right, path).value
          case '===':
            return evaluateNode.call(global, node.left, path).value === evaluateNode.call(global, node.right, path).value
          case '==':
            return evaluateNode.call(global, node.left, path).value == evaluateNode.call(global, node.right, path).value
          case '&&':
            return evaluateNode.call(global, node.left, path).value && evaluateNode.call(global, node.right, path).value
          case '||':
            return evaluateNode.call(global, node.left, path).value || evaluateNode.call(global, node.right, path).value
          default:
            console.log('TODO: Unrecognized BinaryExpression: ', node.operator)
            return

        }
      },

      CallExpression () {
        const func = evaluateIdentifier.call(global, node.callee, path)
        if (!func) throw new Error(`function ${node.callee.name} not found`)
        return func()
      },

      FunctionExpression () {

      },

      ObjectExpression (path) {}
    }
  return conditions[node.type] && conditions[node.type]()
}
