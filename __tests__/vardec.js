import JSEngine from '..'

let jsEngine = null
beforeEach(() => jsEngine = new JSEngine)

describe('JSEngine feature: ', () => {

  describe('Assignment', () => {

    test('Number literal', () => {
      const source = 'var a = 1'
      jsEngine.execute(source)
      expect(jsEngine.global['0.a']).toBe(1)
    })

    test('String literal', () => {
      const source = 'var a = "a"'
      jsEngine.execute(source)
      expect(jsEngine.global['1.a']).toBe('a')
    })

    test('Another variable', () => {
      const source = 'var a = 100; var b = a'
      jsEngine.execute(source)
      expect(jsEngine.global['2.b']).toBe(100)
    })

    test('BinaryExpression', () => {
      const source = 'var a = 1 + "a"'
      jsEngine.execute(source)
      console.log(jsEngine.global)
      expect(jsEngine.global['3.a']).toBe('1a')
    })

  })

})
