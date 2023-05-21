//
//  JSEnv.m
//  helloios
//
//  Created by xinzhongzhu on 2023/4/22.
//  Copyright © 2023 xinzhongzhu. All rights reserved.
//

#import "JSEnv.h"

@implementation JSEnv {
    JSContext *context;
}
- (instancetype)init {
    self = [super init];
    context = [JSContext new];
    [self bindJSMethods];
    return self;
}
- (void)start {
    NSString *filePath = [[NSBundle mainBundle] pathForResource:@"launch"
                                                         ofType:@"js"];
    if (filePath) {
        NSError *error;
        NSString *fileContent =
        [NSString stringWithContentsOfFile:filePath
                                  encoding:NSUTF8StringEncoding
                                     error:&error];
        if (!error) {
            [context evaluateScript:fileContent];
            /* Performance
             
            __weak __typeof(self) weakSelf = self;
            dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_LOW, 0), ^{
                NSLog(@"invoke in background")
                __strong __typeof(weakSelf) strongSelf = weakSelf;
                if (strongSelf) {
                    [strongSelf -> context evaluateScript:fileContent];
                }
            });
             
             */
        } else {
            NSLog(@"Cannot read file launch.js");
        }
    } else {
        NSLog(@"Launch.js is nil.");
    }
}
- (void)setValueInContext:(id)value forKey:(NSString *)key {
    context[key] = value;
}
- (void)bindJSMethods {
    id (^callInstanceMethod)(id target, NSString *selectorName, NSArray *args) =
    ^id(id target, NSString *selectorName, NSArray *args) {
        SEL selector = NSSelectorFromString(selectorName);
        NSMethodSignature *signature =
        [target methodSignatureForSelector:selector];
        if (!signature) {
            NSLog(@"%@ does not exist", selectorName);
            return nil;
        }
        NSString *returnType = [NSString stringWithUTF8String:[signature methodReturnType]];
        NSLog(@"return type %@", returnType);
        NSLog(@"selector %@", selectorName);
        NSLog(@"selector.length %lu", (unsigned long)signature.numberOfArguments);
        NSLog(@"invoke target %@", target);
        NSInvocation *invocation =
        [NSInvocation invocationWithMethodSignature:signature];
        if (!invocation) {
            NSLog(@"Invocation is null");
            return nil;
        }
        for (int i = 2; i < signature.numberOfArguments; i++) {
            id currentArg = args[i - 2];
            if ([currentArg isNull]) {
                currentArg = nil;
            }
            const char *argType = [signature getArgumentTypeAtIndex:i];
            NSString *argTypeString = [NSString stringWithUTF8String:argType];
            
#define literal_arg_case(typeChar, type, selector) \
case typeChar: {   \
type arg = [currentArg selector];  \
[invocation setArgument:&arg atIndex:i];    \
break;  \
}
            switch(argType[0]/* argType[0] == 'r' ? argType[1] : argType[0] */) {
                    literal_arg_case('c', char, charValue)
                    literal_arg_case('C', unsigned char, unsignedCharValue)
                    literal_arg_case('s', short, shortValue)
                    literal_arg_case('S', unsigned short, unsignedShortValue)
                    literal_arg_case('i', int, intValue)
                    literal_arg_case('I', unsigned int, unsignedIntValue)
                    literal_arg_case('l', long, longValue)
                    literal_arg_case('L', unsigned long, unsignedLongValue)
                    literal_arg_case('q', long long, longLongValue)
                    literal_arg_case('Q', unsigned long long, unsignedLongLongValue)
                    literal_arg_case('f', float, floatValue)
                    literal_arg_case('d', double, doubleValue)
                    literal_arg_case('B', BOOL, boolValue)
                case '{': {
                    if ([argTypeString hasPrefix:@"{CGRect"]) {
                        CGRect arg = unboxCGRect(currentArg);
                        [invocation setArgument:&arg atIndex:i];
                    }
                    else if ([argTypeString hasPrefix:@"{CGPoint"]) {
                        CGPoint arg = unboxCGPoint(currentArg);
                        [invocation setArgument:&arg atIndex:i];
                    }
                    else if ([argTypeString hasPrefix:@"{CGSize"]) {
                        CGSize arg = unboxCGSize(currentArg);
                        [invocation setArgument:&arg atIndex:i];
                    }
                    break;
                }
                    // @todo function
                default: {
                    [invocation setArgument:&currentArg atIndex:i];
                }
            }
        }
        [invocation setTarget:target];
        [invocation setSelector:selector];
        [invocation invoke];
        if ([returnType isEqual: @"v"]) {
            return nil;
        }
#define struct_return(struct_name) \
if ([returnType hasPrefix:[NSString stringWithFormat:@"{%@", @#struct_name]]) { \
struct_name ret; \
[invocation getReturnValue:&ret]; \
return box##struct_name(ret); \
}
        struct_return(CGRect);
        struct_return(CGPoint);
        struct_return(CGSize);
        // https://stackoverflow.com/questions/22018272/nsinvocation-returns-value-but-makes-app-crash-with-exc-bad-access
        void *tempResult;
        [invocation getReturnValue:&tempResult];
        id ret = (__bridge id)tempResult;
        return ret;
    };
    
    context[@"log"] = ^(NSArray *arr) {
        NSMutableString *string = [NSMutableString stringWithCapacity:0];
        [arr enumerateObjectsUsingBlock:^(id _Nonnull obj, NSUInteger idx,
                                          BOOL *_Nonnull stop) {
            [string appendString:@"   "];
            [string appendString:[NSString stringWithFormat:@"%@", obj]];
        }];
        NSLog(@"Log from js: %@", string);
    };
    
    context[@"callClassMethod"] =
    ^id(NSString *className, NSString *selector, NSArray *args) {
        Class clazz = NSClassFromString(className);
        if (clazz) {
            return callInstanceMethod(clazz, selector, args);
        }
        return nil;
    };
    
    context[@"callInstanceMethod"] = callInstanceMethod;
    
    context[@"setTimeout"] = ^(JSValue *callback, int delayInMilli) {
        dispatch_after(dispatch_time(DISPATCH_TIME_NOW, delayInMilli * NSEC_PER_MSEC), dispatch_get_main_queue(), ^ {
            [callback callWithArguments:nil];
        });
    };
    
}
static NSDictionary* boxCGRect(CGRect rect) {
    return @{
        @"origin": boxCGPoint(rect.origin),
        @"size": @{
            @"width": [NSNumber numberWithDouble:rect.size.width],
            @"height": [NSNumber numberWithDouble:rect.size.height]
        }
    };
}
static CGRect unboxCGRect(NSDictionary *dict) {
    return CGRectMake(
                      [dict[@"origin"][@"x"] doubleValue],
                      [dict[@"origin"][@"y"] doubleValue],
                      [dict[@"size"][@"width"] doubleValue],
                      [dict[@"size"][@"height"] doubleValue]
                      );
}
static NSDictionary* boxCGPoint(CGPoint point) {
    return @{
        @"x": [NSNumber numberWithDouble:point.x],
        @"y": [NSNumber numberWithDouble:point.y]
    };
}
static CGPoint unboxCGPoint(NSDictionary *dict) {
    return CGPointMake(
                       [dict[@"origin"][@"x"] doubleValue],
                       [dict[@"origin"][@"y"] doubleValue]
                       );
}
static NSDictionary* boxCGSize(CGSize size) {
    return @{
        @"width": [NSNumber numberWithDouble:size.width],
        @"height": [NSNumber numberWithDouble:size.height]
    };
}
static CGSize unboxCGSize(NSDictionary *dict) {
    return CGSizeMake(
                      [dict[@"size"][@"width"] doubleValue],
                      [dict[@"size"][@"height"] doubleValue]
                      );
}
static int foo(int a) {
    return a + 200;
}
@end
