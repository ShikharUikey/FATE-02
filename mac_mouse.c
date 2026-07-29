#include <ApplicationServices/ApplicationServices.h>
#include <stdio.h>
#include <stdlib.h>

int main(int argc, char *argv[]) {
    if (argc < 3) {
        printf("Usage: mac_mouse <x> <y> [action: 0=move, 1=left_click, 2=right_click, 3=drag_start/down, 4=drag_end/up]\n");
        return 1;
    }
    int x = atoi(argv[1]);
    int y = atoi(argv[2]);
    int actionType = (argc > 3) ? atoi(argv[3]) : 0;

    CGPoint pt = CGPointMake(x, y);

    // 0. Normal Mouse Move
    if (actionType == 0) {
        CGEventRef moveEvent = CGEventCreateMouseEvent(NULL, kCGEventMouseMoved, pt, kCGMouseButtonLeft);
        CGEventPost(kCGHIDEventTap, moveEvent);
        CFRelease(moveEvent);
    }
    // 1. Single Left Click
    else if (actionType == 1) {
        CGEventRef downEvent = CGEventCreateMouseEvent(NULL, kCGEventLeftMouseDown, pt, kCGMouseButtonLeft);
        CGEventRef upEvent = CGEventCreateMouseEvent(NULL, kCGEventLeftMouseUp, pt, kCGMouseButtonLeft);
        CGEventPost(kCGHIDEventTap, downEvent);
        CGEventPost(kCGHIDEventTap, upEvent);
        CFRelease(downEvent);
        CFRelease(upEvent);
    }
    // 2. Right Click
    else if (actionType == 2) {
        CGEventRef downEvent = CGEventCreateMouseEvent(NULL, kCGEventRightMouseDown, pt, kCGMouseButtonRight);
        CGEventRef upEvent = CGEventCreateMouseEvent(NULL, kCGEventRightMouseUp, pt, kCGMouseButtonRight);
        CGEventPost(kCGHIDEventTap, downEvent);
        CGEventPost(kCGHIDEventTap, upEvent);
        CFRelease(downEvent);
        CFRelease(upEvent);
    }
    // 3. Text Selection / Dragging (Left Mouse Down + Drag Move)
    else if (actionType == 3) {
        CGEventRef downEvent = CGEventCreateMouseEvent(NULL, kCGEventLeftMouseDown, pt, kCGMouseButtonLeft);
        CGEventRef dragEvent = CGEventCreateMouseEvent(NULL, kCGEventLeftMouseDragged, pt, kCGMouseButtonLeft);
        CGEventPost(kCGHIDEventTap, downEvent);
        CGEventPost(kCGHIDEventTap, dragEvent);
        CFRelease(downEvent);
        CFRelease(dragEvent);
    }
    // 4. Release Drag / Text Selection End (Left Mouse Up)
    else if (actionType == 4) {
        CGEventRef upEvent = CGEventCreateMouseEvent(NULL, kCGEventLeftMouseUp, pt, kCGMouseButtonLeft);
        CGEventPost(kCGHIDEventTap, upEvent);
        CFRelease(upEvent);
    }

    return 0;
}
