/*
 * This is following the practices listed in
 *
 * https://www.w3.org/TR/wai-aria-practices/#menu
 *
 * and
 *
 * https://www.w3.org/TR/wai-aria-practices/#menubutton
 */
import { keyCodes, runActionOnBufferedTypedCharacters } from 'c/utilsPrivate';

function preventDefaultAndStopPropagation(event) {
    event.preventDefault();
    event.stopPropagation();
}

function moveFocusToTypedCharacters(event, menuInterface) {
    runActionOnBufferedTypedCharacters(
        event,
        menuInterface.focusMenuItemWithText
    );
}

export function handleKeyDownOnMenuItem(event, menuItemIndex, menuInterface) {
    switch (event.keyCode) {
        // W3: Down Arrow and Up Arrow: move focus to the next and previous items, respectively, optionally
        // wrapping from last to first and vice versa.
        case keyCodes.down:
        case keyCodes.up: {
            preventDefaultAndStopPropagation(event);
            let nextIndex =
                event.keyCode === keyCodes.up
                    ? menuItemIndex - 1
                    : menuItemIndex + 1;
            const totalMenuItems = menuInterface.getTotalMenuItems();

            if (nextIndex >= totalMenuItems) {
                nextIndex = 0;
            } else if (nextIndex < 0) {
                nextIndex = totalMenuItems - 1;
            }
            menuInterface.focusOnIndex(nextIndex);
            break;
        }
        // W3: Home and End: If arrow key wrapping is not supported, move focus to first and last item
        // Note: We do support wrapping, but it doesn't hurt to support these keys anyway.
        case keyCodes.home: {
            preventDefaultAndStopPropagation(event);
            menuInterface.focusOnIndex(0);
            break;
        }
        case keyCodes.end: {
            preventDefaultAndStopPropagation(event);
            menuInterface.focusOnIndex(menuInterface.getTotalMenuItems() - 1);
            break;
        }
        // W3: Escape: Close the menu and return focus to the element or context, e.g., menu button or
        // parent menu item, from which the menu was opened
        // Tab: Close the menu and all open parent menus and move focus to the next element in the tab sequence.
        // Note: We don't have to do anything special for Tab because we're not stopping the event, we'll first
        // return the focus and the browser will then handle the tab key default event and will move the focus
        // appropriately. It's handy to return focus for 'Tab' anyway for cases where the menu is in a detached
        // popup (one that's using a panel attached directly to the body).
        case keyCodes.escape:
        case keyCodes.tab: {
            // hide menu item list if it is visible
            if (menuInterface.isMenuVisible()) {
                // prevent default escape key action only when menu is visible
                if (event.keyCode === keyCodes.escape) {
                    preventDefaultAndStopPropagation(event);
                }

                menuInterface.toggleMenuVisibility();
            }
            menuInterface.returnFocus();
            break;
        }
        default:
            // W3: Any key that corresponds to a printable character: Move focus to the next menu item in the
            // current menu whose label begins with that printable character.
            // Note: we actually support a buffer, and in the current implementation it would jump to
            // the first menu item that matches not next.
            moveFocusToTypedCharacters(event, menuInterface);
    }
}

export function handleKeyDownOnMenuTrigger(event, menuInterface) {
    const isVisible = menuInterface.isMenuVisible();
    switch (event.keyCode) {
        // W3 suggests that opening a menu should place the focus on the first item (as we do with Up/Down),
        // but we're not doing that because it would differ from most of the native menus behaviour.
        case keyCodes.enter:
        case keyCodes.space:
            preventDefaultAndStopPropagation(event);
            menuInterface.toggleMenuVisibility();
            break;
        case keyCodes.down:
        case keyCodes.up:
            preventDefaultAndStopPropagation(event);
            if (!isVisible) {
                // default to first menu item
                let focusNextIndex = 0;

                // if key was up-arrow then set to last menu item
                if (event.keyCode === keyCodes.up) {
                    focusNextIndex = 'LAST';
                }
                menuInterface.setNextFocusIndex(focusNextIndex);

                menuInterface.toggleMenuVisibility();
            }
            break;
        // W3: Home and End: If arrow key wrapping is not supported, move focus to first and last item
        // Note: We do support wrapping, but it doesn't hurt to support these keys anyway.
        case keyCodes.home:
            preventDefaultAndStopPropagation(event);
            menuInterface.focusOnIndex(0);
            break;
        case keyCodes.end:
            preventDefaultAndStopPropagation(event);
            menuInterface.focusOnIndex(menuInterface.getTotalMenuItems() - 1);
            break;
        // W3: Escape: Close the menu and return focus to the element or context, e.g., menu button or
        // parent menu item, from which the menu was opened
        case keyCodes.escape:
        case keyCodes.tab:
            if (isVisible) {
                preventDefaultAndStopPropagation(event);
                menuInterface.toggleMenuVisibility();
            }
            break;
        default:
            if (!isVisible && menuInterface.showDropdownWhenTypingCharacters) {
                preventDefaultAndStopPropagation(event);
                menuInterface.toggleMenuVisibility();
            } else if (!isVisible) {
                break;
            }
            // eslint-disable-next-line @lwc/lwc/no-async-operation
            window.requestAnimationFrame(() => {
                moveFocusToTypedCharacters(event, menuInterface);
            });
    }
}
