// UTILITIES FOR EVENT HANDLERS

// Returns the menu controlled by a menu button.
const controlledMenu = button => document.getElementById(button.getAttribute('aria-controls'));
// Returns the button controlling a menu.
const controller = menu => document.body.querySelector(`button[aria-controls=${menu.id}`);
// Returns whether an element is a menu.
const isMenu = element => ['menu', 'menubar'].includes(element.getAttribute('role'));
// Returns whether an element is a menu item.
const isMenuItem = element =>
  element.getAttribute('role') === 'menuitem'
  && isMenu(element.parentElement);
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
    menu.removeAttribute('tabindex');
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
// Makes the specified (or the last if -1) menu item active.
const setActive = (focusType, menu, itemIndex) => {
  // Identify the menu items.
  const menuItems = menuItemsOf(menu);
  // Identify the specified index.
  const newIndex = itemIndex === -1 ? menuItems.length - 1 : itemIndex;
  // For each menu item:
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
    // Otherwise, i.e. if does not have the specified index:
    else {
      // If the menu is a pseudofocus manager:
      if (focusType === 'fake') {
        // Mark the item as nonfocal.
        item.className = 'blurred';
      }
      // Otherwise, if the item is a true focus manager:
      else if (focusType === 'true') {
        // Make the item nonfocusable.
        item.removeAttribute('tabindex');
      }
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
// Navigates within a menu according to a key press.
const keyNav = (isBar, menu, key, focusType) => {
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
  if (newIndex > -1) {
    setActive(focusType, menu, newIndex);
  }
};
// Returns the index of a keyboard-chosen menu item.
const newMenuIndex = (isBar, menu, key) => {
};

// EVENT LISTENERS

// Handle clicks.
document.body.addEventListener('click', event => {
  // Initialize a set of menu buttons to be closed.
  let openButtons = Array.from(document.querySelectorAll(
    'button[aria-haspopup=menu][aria-expanded=true], button[aria-haspopup=true][aria-expanded=true]'
  ));
  // Identify the click target.
  let target = event.target;
  // Identify the target’s menu item and menu, if any.
  let menuItem;
  if (isMenuItem(target)) {
    menuItem = target;
  }
  else if (isMenuItem(target.parentElement)) {
    menuItem = target.parentElement;
  }
  const itemParent = menuItem.parentElement;
  const menu = isMenu(itemParent) ? itemParent : null;
  // If they exist:
  if (menuItem && menu) {
    // Make the menu item active.
    const itemIndex = menuItemsOf(menu).indexOf(menuItem);
    setActive(focusTypeOf(menu), menu, itemIndex);
    // If the target is a menu button:
    if (target.tagName === 'BUTTON' && ['menu', 'true'].includes(target.ariaHasPopup)) {
      // If the menu it controls is closed:
      if (target.ariaExpanded === 'false') {
        // Open it with its existing active item, or the first if none.
        openMenu(target);
      }
    }
    // Otherwise, if the target is a link:
    else if (target.tagName === 'A') {
      // Identify the button controlling the menu, if any.
      const ownerButton = controller(menu);
      // If it exists:
      if (ownerButton) {
        // Identify its parent.
        const ownerItem = ownerButton.parentElement;
        // If its parent is a menu item:
        if (isMenuItem(ownerItem)) {
          // Identify its parent.
          const ownerMenu = ownerItem.parentElement;
          // If it is a menu:
          if (isMenu(ownerMenu)) {
            // Identify the menu item’s index.
            const ownerIndex = menuItemsOf(ownerMenu).indexOf(ownerItem);
            // Make it active.
            setActive(focusTypeOf(ownerMenu), ownerMenu, ownerIndex);
          }
        }
      }
    }
  }
  // For each open menu button:
  openButtons.forEach(btn => {
    // When the main click event ends:
    window.setTimeout(() => {
      // Close the menu.
      closeMenu(btn);
    });
  });
});
// Handle key presses.
window.addEventListener('keydown', event => {
  const key = event.key;
  // If no ineligible modifier key was in effect when the key was depressed:
  if (! (event.altKey || event.ctrlKey || event.metaKey)) {
    // Identify whether the shift key was in effect.
    const shift = event.shiftKey;
    // Identify the element in focus.
    const focus = document.activeElement;
    // Identify its role.
    const role = focus.getAttribute('role');
    // If a menu, menu bar, or menu item is in focus:
    if (['menu', 'menubar', 'menuitem'].includes(role)) {
      // Identify the menu.
      const menu = role === 'menuitem' ? focus.parentElement : focus;
      // Identify its role.
      const menuRole = menu.getAttribute('role');
      // Identify whether it manages pseudofocus or true focus.
      const focusType = focusTypeOf(menu);
      // Identify the menu button controlling the menu, if any.
      const ownerButton = controller(menu);
      // Identify the menu item containing the menu and any menu button controlling it.
      let ownerItem = menu.parentElement;
      if (ownerItem.getAttribute('role') !== 'menuitem') {
        ownerItem = null;
      }
      // Identify the index of the active item of the menu.
      const activeIndex = activeIndexOf(false, menu);
      // Identify that item.
      const activeItem = menuItemsOf(menu)[activeIndex];
      // Identify the child element of the item.
      const activeChild = activeItem.firstElementChild;
      // Identify the child’s type.
      let activeType = 'plain';
      const activeTagName = activeChild.tagName;
      if (activeTagName === 'A') {
        activeType = 'link';
      }
      else if (activeTagName === 'BUTTON') {
        activeType = activeChild.ariaExpanded ? 'menuButton' : 'button';
      }
      // If the key is Enter:
      if (key === 'Enter' && ! shift) {
        // If the active menu item contains a link or ordinary button:
        if (['link', 'button'].includes(activeType)) {
          // Simulate a click on the link or button.
          activeChild.click();
        }
        // Otherwise, if the menu item contains a menu button:
        else if (activeType === 'menuButton') {
          // Its menu must be closed, so open it.
          openMenu(activeChild);
        }
      }
      // Otherwise, if the key is Space:
      else if (key === ' ' && ! shift) {
        // If the menu item contains an ordinary button:
        if (activeType === 'button') {
          // Prevent default scrolling.
          event.preventDefault();
          // Simulate a click on the button.
          activeChild.click();
        }
        // Otherwise, if the menu item contains a menu button:
        else if (activeType === 'menuButton') {
          // Prevent default scrolling.
          event.preventDefault();
          // Its menu must be closed, so open it.
          openMenu(activeChild);
        }
      }
      // Otherwise, if the key is Tab and the menu is closable:
      else if (key === 'Tab' && ownerButton) {
        // Close the menu.
        closeMenu(ownerButton);
      }
      // Otherwise, if the key is Escape and the menu is closable:
      else if (key === 'Escape' && ! shift && ownerButton && ownerItem) {
        // Close the menu.
        closeMenu(ownerButton);
        // Focus its parent menu item.
        ownerItem.focus();
      }
      // Otherwise, if the key solely navigates within the menu:
      else if (
        ['ArrowLeft', 'ArrowRight'].includes(key) && ! shift && menuRole === 'menubar'
        || /^[a-zA-Z]$/.test(key)
      ) {
        // Obey the key.
        keyNav(true, menu, key, focusType);
      }
      // Otherwise, if the key specially navigates within the menu:
      else if (['Home', 'End'].includes(key) && ! shift) {
        // Prevent default page scrolling.
        event.preventDefault();
        // Obey the key.
        keyNav(true, menu, key, focusType);
      }
      // Otherwise, if the key conditionally navigates or opens a menu:
      else if (['ArrowUp', 'ArrowDown'].includes(key) && ! shift) {
        // If the active menu item contains a menu button and is in a menu bar:
        if (menuRole === 'menubar' && activeType === 'menuButton') {
          // Prevent default scrolling.
          event.preventDefault();
          // Open the menu button’s menu.
          openMenu(activeChild, key === 'ArrowUp' ? -1 : 0);
        }
        // Otherwise, if the active item does not contain a menu button and is in a menu:
        else if (menuRole === 'menu' && activeType !=='menuButton') {
          // Prevent default scrolling.
          event.preventDefault();
          // Obey the key.
          keyNav(false, menu, key, focusType);
        }
      }
    }
  }
});
