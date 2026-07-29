#include <ApplicationServices/ApplicationServices.h>
#include <stdio.h>
#include <stdlib.h>

int main(int argc, char *argv[]) {
    if (argc < 3) {
        printf("Usage: mac_mouse <x> <y> [click: 0=none, 1=left, 2=right]\n");
        return 1;
    }
    int x = atoi(argv[1]);
    int y = atoi(argv[2]);
    int clickType = (argc > 3) ? atoi(argv[3]) : 0;

    CGPoint pt = CGPointMake(x, y);

    // 1. Move Mouse Cursor to (x, y)
    CGEventRef moveEvent = CGEventCreateMouseEvent(NULL, kCGEventMouseMoved, pt, kCGMouseButtonLeft);
    CGEventPost(kCGHIDEventTap, moveEvent);
    CFRelease(moveEvent);

    // 2. Perform Left Click if requested
    if (clickType == 1) {
        CGEventRef downEvent = CGEventCreateMouseEvent(NULL, kCGEventLeftMouseDown, pt, kCGMouseButtonLeft);
        CGEventRef upEvent = CGEventCreateMouseEvent(NULL, kCGEventLeftMouseUp, pt, kCGMouseButtonLeft);
        CGEventPost(kCGHIDEventTap, downEvent);
        CGEventPost(kCGHIDEventTap, upEvent);
        CFRelease(downEvent);
        CFRelease(upEvent);
    }
    // 3. Perform Right Click if requested
    else if (clickType == 2) {
        CGEventRef downEvent = CGEventCreateMouseEvent(NULL, kCGEventRightMouseDown, pt, kCGMouseButtonRight);
        CGEventRef upEvent = CGEventCreateMouseEvent(NULL, kCGEventRightMouseUp, pt, kCGMouseButtonRight);
        CGEventPost(kCGHIDEventTap, downEvent);
        CGEventPost(kCGHIDEventTap, upEvent);
        CFRelease(downEvent);
        CFRelease(upEvent);
    }

    return 0;
}
