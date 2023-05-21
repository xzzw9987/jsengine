//
//  JSEnv.h
//  helloios
//
//  Created by xinzhongzhu on 2023/4/22.
//  Copyright © 2023 xinzhongzhu. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <JavaScriptCore/JavaScriptCore.h>

NS_ASSUME_NONNULL_BEGIN

@interface JSEnv : NSObject
-(void)start;
-(void)setValueInContext:(id) value
                  forKey:(NSString*) key;
@end

NS_ASSUME_NONNULL_END
