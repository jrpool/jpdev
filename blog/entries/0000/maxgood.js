// UTILITIES FOR EVENT HANDLERS
// Returns the menu controlled by a menu button.
const controlledMenu = button => document.getElementById(button.getAttribute('aria-controls'));
// Returns the button controlling a menu.
const controllingButton = menu => document.body.querySelector(`button[aria-controls=${menu.id}`);
// Returns the role of the menu the menu-item parent of an element is in.
const inMenu = element => {
  const menuItem = element.parentElement;
  if (menuItem.getAttribute('role') === 'menuitem') {
    const menu = menuItem.parentElement;
    const menuType = menu.getAttribute('role');
    if (['menu', 'menubar'].includes(menuType)) {
      return menu;
    }
    else {
      return '';
    }
  }
  return '';
};
// Opens a menu controlled by a button and returns the menu.
const openMenu = button => {
  // Chrome fails to support settable ariaExpanded property.
  button.setAttribute('aria-expanded', 'true');
  const menu = controlledMenu(button);
  menu.className = 'open';
  return menu;
};
// Closes a menu controlled by a button.
const closeMenu = button => {
  // If the menu is open:
  if (button.ariaExpanded === 'true') {
    // Close it.
    button.setAttribute('aria-expanded', 'false');
    const menu = controlledMenu(button);
    menu.className = 'shut';
  }
};
// Returns the menu items of a menu.
const menuItemsOf = menu => Array
.from(menu.children)
.filter(element => element.getAttribute('role', 'menuitem'));
// Returns the index of the active menu item of a menu, or -1 if none.
const activeIndexOf = (isButton, buttonOrMenu) => {
  const menu = isButton ? controlledMenu(buttonOrMenu) : buttonOrMenu;
  const items = menuItemsOf(menu);
  // If the menu is a fakefocus manager, return the index.
  if (menu.hasAttribute('aria-activedescendant')) {
    const activeID = menu.getAttribute('aria-activedescendant');
    if (activeID) {
      const itemIDs = items.map(item => item.id);
      return itemIDs.indexOf(activeID);
    }
    else {
      return -1;
    }
  }
  // Otherwise, i.e. if the menu is a true focus manager, return the index.
  else {
    const tabIndexes = items.map(item => item.tabIndex);
    return tabIndexes.indexOf(0);
  }
}
// Makes the specified (or the last if -1) menu item active.
const setActive = (focusType, menu, itemIndex) => {
  // Identify the index of the active menu item.
  const oldIndex = activeIndexOf(false, menu);
  // Identify the menu items.
  const menuItems = menuItemsOf(menu);
  // Identify the specified index.
  const newIndex = itemIndex === -1 ? menuItems.length - 1 : itemIndex;
  // For each menu item:
  menuItems.forEach((item, index) => {
    // If it has the specified index:
    if (index === newIndex) {
      // Ensure it is active.
      if (focusType === 'fake') {
        item.className = 'focal';
        menu.setAttribute('aria-activedescendant', item.id);
      }
      else if (focusType === 'true') {
        item.tabIndex = 0;
        item.focus();
      }
    }
    // Otherwise, i.e. if does not have the specified index:
    else {
      // Ensure it is inactive.
      if (focusType === 'fake') {
        item.className = 'blurred';
      }
      else if (focusType === 'true') {
        item.tabIndex = -1;
      }
    }
  });
};
// Returns the index of a keyboard-chosen menu item.
const newMenuIndex = (isBar, menu, key) => {
  const oldIndex = activeIndexOf(false, menu);
  const menuItems = menuItemsOf(menu);
  const menuItemCount = menuItems.length;
  // Initialize the chosen index as the current index.
  let newIndex = oldIndex;
  // If the request is for the next menu item:
  if (key === (isBar ? 'ArrowRight' : 'ArrowDown')) {
    // Change the index to the next menu item’s, wrapping.
    newIndex = (oldIndex + 1) % menuItemCount;
  }
  // Otherwise, if the request is for the previous menu item:
  else if (key === (isBar ? 'ArrowLeft' : 'ArrowUp')) {
    // Change the index to the previous menu item’s, wrapping.
    newIndex = (menuItemCount + oldIndex - 1) % menuItemCount;
  }
  else if (key === 'Home') {
    newIndex = 0;
  }
  else if (key === 'End') {
    newIndex = menuItemCount - 1;
  }
  // Otherwise, if the request is for a menu item with an initial letter:
  else if (/^[a-zA-Z]$/.test(key)) {
    // Change the index to the next matching menu item’s, if there is one.
    const matches = menuItems.map(
      (item, index) =>
      item.textContent.toLowerCase().trim().startsWith(key.toLowerCase())
      ? index
      : -1
    );
    const laterMatches = matches.filter(index => index > -1 && index > oldIndex);
    if (laterMatches.length) {
      newIndex = laterMatches[0];
    }
  }
  return newIndex;
};
// Clicks the child link or button, if any, of the fakefocused item of a menu.
const click = menu => {
  const activeItem = menuItemsOf(menu)[activeIndexOf(false, menu)];
  const activeChild = activeItem.firstElementChild;
  if (['A', 'BUTTON'].includes(activeChild.tagName)) {
    activeChild.dispatchEvent(new Event('click'));
  }
};
// Handles click activation of a menu button.
const menuButtonClickHandler = (event, focusType, menuBar, button) => {
  // Prevent the body click handler from handling this click.
  event.stopPropagation();
  // If the button’s menu is closed:
  if (button.ariaExpanded === 'false') {
    // Open it with its existing active item, or the first if none.
    openMenu(button);
    const menu = controlledMenu(button);
    if (focusType === 'fake') {
      menu.focus();
      if (! menu.getAttribute('aria-activedescendant')) {
        setActive('fake', menu, 0);
      }
    }
    else if (focusType === 'true') {
      const oldIndex = activeIndexOf(true, button);
      const newIndex = oldIndex > -1 ? oldIndex : 0;
      setActive('true', menu, newIndex);
    }
  }
  // Otherwise, if the button’s menu is open:
  else if (button.ariaExpanded === 'true') {
    // Close it.
    closeMenu(button);
  }
  // Close any other menu of any other button of the menu bar, if open.
  const openMenuButtons = menuItemsOf(menuBar)
  .filter(item => item !== button && item.ariaExpanded === 'true');
  openMenuButtons.forEach(btn => {
    closeMenu(btn);
  });
};
// Handles keyboard activation of a menu button.
const menuButtonKeyHandler = (button, key) => {
  const oldIndex = activeIndexOf(true, button);
  const menu = openMenu(button);
  const focusType = menu.hasAttribute('aria-activedescendant') ? 'fake' : 'true';
  if (focusType === 'fake') {
    menu.focus();
  }
  if (key === 'ArrowUp') {
    setActive(focusType, menu, -1);
  }
  else if (key === 'ArrowDown') {
    setActive(focusType, menu, 0);
  }
  else if ([' ', 'Enter'].includes(key)) {
    const newIndex = oldIndex > -1 ? oldIndex : 0;
    setActive(focusType, menu, newIndex);
  }
};
// CONSTANTS
const menuButtons = Array
.from(document.querySelectorAll('button[aria-haspopup=menu], button[aria-haspopup=true'));
// EVENT LISTENERS
// Handle clicks on a menu’s item.
const handleItemClicks = (button, menu, items, focusType) => {
  items.forEach((item, index) => {
    item.addEventListener('click', event => {
      // Prevent the body click handler from handling this click.
      event.stopPropagation();
      // When the main click event (i.e. navigation to a link target) ends:
      window.setTimeout(() => {
        // Make the clicked menu item the active one.
        setActive(focusType, menu, index);
        // Focus the menu button.
        button.focus();
        // Close the menu.
        closeMenu(button);
      });
    });
  });
};
// Handle clicks on menu buttons and menu items.
menuButtons.forEach(button => {
  const menu = controlledMenu(button);
  const menuItems = menuItemsOf(menu);
  const focusType = menu.hasAttribute('aria-activedescendant') ? 'fake' : 'true';
  button.addEventListener(
    'click', event => menuButtonClickHandler(event, focusType, menu, button)
  );
  handleItemClicks(button, menu, menuItems, focusType);
});
// Close each menu on any click propagated to the body.
document.body.addEventListener('click', event => {
  // For each menu button whose menu is open:
  menuItemsOf(menuBar).filter(button => button.ariaExpanded === 'true').forEach(btn => {
    // Identify its menu.
    const menu = controlledMenu(btn);
    // When the main click event ends:
    window.setTimeout(() => {
      // Close the menu.
      closeMenu(btn);
    });
  });
});
// Handle key presses when a menu or menu button is in focus.
window.addEventListener('keydown', event => {
  const key = event.key;
  // If no ineligible modifier key was in effect when the key was depressed:
  if (! (event.altKey || event.ctrlKey || event.metaKey || key !== 'Tab' && event.shiftKey)) {
    const focus = document.activeElement;
    // If a menu button is in focus:
    if (menuButtons.includes(focus)) {
      const ownerMenu = inMenu(focus);
      const menuType = ownerMenu ? ownerMenu.getAttribute('role') : '';
      // If the menu button is in a menu bar or not in any menu:
      if (['menubar', ''].includes(menuType)) {
        // If the key is a menu-button-activating key:
        if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(key)) {
          // Handle the event and prevent any default scrolling.
          event.preventDefault();
          menuButtonKeyHandler(focus, key);
        }
        // Otherwise, if the button is in a menu bar and the key is a menubar navigation key:
        else if (menuType && ['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(key)) {
          // Handle the event and prevent any default scrolling.
          event.preventDefault();
          const newIndex = newMenuIndex(true, ownerMenu, key);
          if (newIndex > -1) {
            setActive('true', ownerMenu, newIndex);
          }
        }
      }
    }
    // Otherwise, if a menu is in focus (and thus has fake focus management):
    else if (focus.getAttribute('role') === 'menu') {
      const menuButton = controllingButton(focus);
      // If the key is Enter:
      if (key === 'Enter') {
        // Simulate a click on whichever menu item is currently active.
        const activeIndex = activeIndexOf(false, focus);
        menuItemsOf(focus)[activeIndex].click();
      }
      // Otherwise, if it is Tab:
      else if (key === 'Tab') {
        // Close the menu.
        closeMenu(menuButton);
      }
      // Otherwise, if it is Escape:
      else if (key === 'Escape') {
        // Focus the menu button.
        menuButton.focus();
        // Close the menu.
        closeMenu(menuButton);
      }
      // Otherwise, if the key is an intra-menu navigation key:
      else if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(key) || /^[a-zA-Z]$/.test(key)) {
        // Navigate within the menu and prevent any default scrolling.
        event.preventDefault();
        const newIndex = newMenuIndex(false, focus, key);
        if (newIndex > -1) {
          setActive('fake', focus, newIndex);
        }
      }
    }
    // Otherwise, if an item in a menu is in focus (and thus is truly focused):
    else if (focus.getAttribute('role') === 'menuitem') {
      const menu = focus.parentElement;
      const menuButton = controllingButton(menu);
      if (menu.getAttribute('role') === 'menu') {
        // If the key is Tab:
        if (key === 'Tab') {
          // Close the menu.
          closeMenu(menuButton);
        }
        // Otherwise, if it is Escape:
        else if (key === 'Escape') {
          // Focus the menu button.
          menuButton.focus();
          // Close the menu.
          closeMenu(menuButton);
        }
        // Otherwise, if it is an intra-menu navigation key:
        else if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(key) || /^[a-zA-Z]$/.test(key)) {
          // Navigate within the technologies menu and prevent any default scrolling.
          event.preventDefault();
          const newIndex = newMenuIndex(false, menu, key);
          if (newIndex > -1) {
            setActive('true', menu, newIndex);
          }
        }
      }
    }
  }
});
