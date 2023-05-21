//
//  ViewController.m
//  helloios
//
//  Created by xinzhongzhu on 2020/4/9.
//  Copyright © 2020 xinzhongzhu. All rights reserved.
//

#import "ViewController.h"
#import <JavaScriptCore/JavaScriptCore.h>
#import "JSEnv.h"
@interface ViewController ()

@end

@implementation ViewController {
    JSEnv *jsEnv;
    NSInvocation *invocation;
} 

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view.
    jsEnv = [JSEnv new];
    [jsEnv setValueInContext:self.view forKey:@"rootView"];
    [jsEnv start];
}


@end
