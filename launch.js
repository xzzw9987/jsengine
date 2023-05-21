/**
 injected method: log
 log(123)
 log("AAA")
 */
const global = this
global.console = {
    log(...arg) {
        global.log(arg)
    }
}

console.log(1)
console.log('some_string')
console.log(JSON.stringify({
    a: 1
}), 'another_string')

/**
 callClassMethod
 */
let childView = global.callClassMethod('UIView', 'alloc')
console.log(childView)

childView = global.callInstanceMethod(childView, 'initWithFrame:', [{
    origin: {
        x: 0,
        y: 0
    },
    size: {
        width: 300,
        height: 300
    }
}])
console.log(childView)

global.callInstanceMethod(childView, 'setBackgroundColor:', [
    global.callClassMethod('UIColor', 'redColor')
])
console.log(rootView)
global.callInstanceMethod(rootView, 'addSubview:', [childView])

global.callInstanceMethod(childView, 'setFrame:', [{
    origin: {
        x: 0,
        y: 0
    },
    size: {
        width: 300,
        height: 500
    }
}])

let textView = global.callClassMethod('UITextView', 'alloc')
textView = global.callInstanceMethod(textView, 'initWithFrame:textContainer:', [{
origin: {
    x: 0,
    y: 100
},
size: {
    width: 300,
    height: 100
}
}, null
                                                                                ])
global.callInstanceMethod(rootView, 'addSubview:', [textView])
global.callInstanceMethod(textView, 'setText:', ['Hello']);
global.callInstanceMethod(textView, 'setBackgroundColor:', [
    global.callClassMethod('UIColor', 'colorWithWhite:alpha:', [0,0])
])

let url = global.callClassMethod('NSURL', 'URLWithString:', ['https://cloudfour.com/examples/img-currentsrc/images/kitten-large.png'])
let imageData = global.callClassMethod('NSData', 'dataWithContentsOfURL:', [url])
let image = global.callClassMethod('UIImage', 'imageWithData:', [imageData])
let imageView = global.callClassMethod('UIImageView', 'alloc')
imageView = global.callInstanceMethod(imageView, 'initWithImage:', [image])

global.callInstanceMethod(rootView, 'addSubview:', [imageView])


//global.setTimeout(() => {
//    console.log('HAHAHA 3000');
//}, 3000)

//console.log(global.callInstanceMethod(rootView, 'frame').size.width)
//global.callback(() => {})

//const ret3 = global.callInstanceMethod(ret2, 'layoutSubviews')
//console.log(ret3)
//
//const ret4 = global.callInstanceMethod(ret2, 'frame')
//console.log(ret3)
