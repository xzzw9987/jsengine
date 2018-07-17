import JSEngine from '..'

let jsEngine = null
beforeEach(() => jsEngine = new JSEngine)

describe('JSEngine feature: ', () => {

  describe('Assignment', () => {

    test('Number literal', () => {
      const source = 'var a = 1'
      jsEngine.execute(source)
      expect(jsEngine.global[`${jsEngine.__rootUid}.a`]).toBe(1)
    })

    test('String literal', () => {
      const source = 'var a = "a"'
      jsEngine.execute(source)
      expect(jsEngine.global[`${jsEngine.__rootUid}.a`]).toBe('a')
    })

    test('Another variable', () => {
      const source = 'var a = 100; var b = a'
      jsEngine.execute(source)
      expect(jsEngine.global[`${jsEngine.__rootUid}.a`]).toBe(100)
    })

    test('BinaryExpression', () => {
      const source = 'var a = 1 + "a"'
      jsEngine.execute(source)
      expect(jsEngine.global[`${jsEngine.__rootUid}.a`]).toBe('1a')
    })

  })

  describe('Function', () => {
    test('Function works well', () => {
      const source = 'function foo() { var b = 200 ; return 200 }; var a = foo();'
      jsEngine.execute(source)
      expect(jsEngine.global[`${jsEngine.__rootUid}.a`]).toBe(200)
    })
  })
})
