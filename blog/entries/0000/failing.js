// UTILITIES FOR EVENT HANDLERS

// Returns the menu controlled by a menu button.
const controlledMenu = button => document.getElementById(button.getAttribute('aria-controls'));
// Returns the button controlling a menu.
const controller = menu => document.body.querySelector(`button[aria-controls=${menu.id}`);
// Returns whether an element is a menu.
const isMenu = element => element && ['menu', 'menubar'].includes(element.getAttribute('role'));
// Returns whether an element is a menu item.
const isMenuItem = element => element.getAttribute('role') === 'menuitem';
// Returns the focus type of a menu.
const focusTypeOf = menu => menu.hasAttribute('aria-activedescendant') ? 'fake' : 'true';
// Closes a menu controlled by a button.
const closeMenu = button => {
  // If the menu is open:
  if (button.ariaExpanded === 'true') {
    // Close it.
    button.setAttribute('aria-expanded', 'false');
    const menu = controlledMenu(button);
    menu.className = 'shut';
    menu.tabIndex = -1;
  }
};
// Returns the menu items of a menu.
const menuItemsOf = menu => {
  const items = [];
  const children = Array.from(menu.children);
  children.forEach(child => {
    if (isMenuItem(child)) {
      items.push(child);
    }
    else {
      const grandchild = child.firstElementChild;
      if (grandchild.getAttribute('role')) {
        items.push(grandchild);
      }
    }
  });
  return items;
};
// Returns the menu that a menu item is an item of.
const owningMenuOf = menuItem => {
  const parent = menuItem.parentElement;
  const parentRole = parent.getAttribute('role');
  if (parentRole.startsWith('menu')){
    return parent;
  }
  else {
    const grandparent = parent.parentElement;
    const grandparentRole = grandparent.getAttribute('role');
    if (grandparentRole.startsWith('menu')) {
      return grandparent;
    }
    else {
      return null;
    }
  }
};
// Returns the index of the active menu item of a menu, or -1 if none.
const activeIndexOf = (isButton, buttonOrMenu) => {
  const menu = isButton ? controlledMenu(buttonOrMenu) : buttonOrMenu;
  const items = menuItemsOf(menu);
  // If the menu is a fake focus manager, return the index.
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
// Makes the specified (or the last if -1) menu item active and close any sibling menus.
const setActive = (focusType, menu, itemIndex) => {
  // Identify the menu items.
  const menuItems = menuItemsOf(menu);
  // Identify the specified index.
  const newIndex = itemIndex === -1 ? menuItems.length - 1 : itemIndex;
  // For each menu item in the menu:
  menuItems.forEach((item, index) => {
    // If it has the specified index:
    if (index === newIndex) {
      // If the menu is a pseudofocus manager:
      if (focusType === 'fake') {
        // Mark the item as focal.
        item.className = 'focal';
        menu.setAttribute('aria-activedescendant', item.id);
        // Ensure that the menu is in focus.
        menu.tabIndex = 0;
        menu.focus();
      }
      // Otherwise, if the menu is a true focus manager:
      else if (focusType === 'true') {
        // Make the item focusable.
        item.tabIndex = 0;
        // Focus it.
        item.focus();
      }
    }
    // Otherwise, i.e. if the menu item does not have the specified index:
    else {
      // If the menu is a pseudofocus manager:
      if (focusType === 'fake') {
        // Mark the item as nonfocal.
        item.className = 'blurred';
      }
      // Otherwise, if the menu is a true focus manager:
      else if (focusType === 'true') {
        // Make the item nonfocusable.
        item.tabIndex = -1;
      }
      // Close the menu controlled by the item if the item is a menu button.
      closeMenu(item);
    }
  });
};
// Opens a menu controlled by a button and makes an item active.
const openMenu = (button, newIndex) => {
  // Open the menu (Chrome fails to support settable ariaExpanded property).
  button.setAttribute('aria-expanded', 'true');
  const menu = controlledMenu(button);
  menu.className = 'open';
  const focusType = focusTypeOf(menu);
  // If an active index was specified:
  if (newIndex > -2) {
    // Make the specified menu item active.
    setActive(focusType, menu, newIndex);
  }
  // Otherwise, i.e. if no active index was specified:
  else {
    // Make the currently active menu item, or if none the first one, active.
    const oldIndex = activeIndexOf(true, button);
    setActive(focusType, menu, oldIndex > -1 ? oldIndex : 0);
  }
};

// EVENT LISTENERS

// Handle clicks.
document.body.addEventListener('click', event => {
  // Identify the click target.
  let target = event.target;
  // If it is a menu item:
  if (isMenuItem(target)) {
    // Identify the menu that owns it.
    const menu = owningMenuOf(target);
    // If the owning menu exists:
    if (menu) {
      // Make the menu item active.
      const itemIndex = menuItemsOf(menu).indexOf(target);
      setActive(focusTypeOf(menu), menu, itemIndex);
      // If the menu item is also a menu button:
      if (target.tagName === 'BUTTON' && ['menu', 'true'].includes(target.ariaHasPopup)) {
        // If the menu it controls is closed:
        if (target.ariaExpanded === 'false') {
          // Open it with the first item active.
          openMenu(target, 0);
        }
        // Otherwise, if the menu it controls is open:
        else if (target.ariaExpanded === 'true') {
          // Close it.
          closeMenu(target);
        }
      }
      // Otherwise, if the menu item is also a link:
      else if (target.tagName === 'A') {
        // Identify the button controlling the menu, if any.
        const ownerButton = controller(menu);
        // If the menu has a controlling button:
        if (ownerButton) {
          // If the button is also a menu item:
          if (isMenuItem(ownerButton)) {
            // Identify the menu that it is an item of.
            const ownerMenu = ownerMenu(ownerButton);
            // If it exists:
            if (ownerMenu) {
              // Identify the menu button’s index as a menu item.
              const ownerIndex = menuItemsOf(ownerMenu).indexOf(ownerButton);
              // Make it active.
              setActive(focusTypeOf(ownerMenu), ownerMenu, ownerIndex);
            }
          }
        }
      }
      // Otherwise, if the target is the menu item:
      else if (target === menuItem) {
        // Prevent the menu from being closed.
        openButtons = openButtons.filter(button => button !== ownerButton);
      }
    }
  }
});
