// UTILITIES FOR EVENT HANDLERS
// Opens a menu controlled by a button and returns the menu.
const openMenu = button => {
  // Chrome fails to support settable ariaExpanded property.
  button.setAttribute('aria-expanded', 'true');
  button.textContent = 'Close menu';
  const menu = document.getElementById(button.getAttribute('aria-controls'));
  menu.className = 'open';
  return menu;
};
// Closes a menu controlled by a button.
const closeMenu = button => {
  // If the menu is open:
  if (button.ariaExpanded === 'true') {
    // Close it.
    button.setAttribute('aria-expanded', 'false');
    button.textContent = 'Open menu';
    const menu = document.getElementById(button.getAttribute('aria-controls'));
    menu.className = 'shut';
  }
};
// Returns the index of the active menu item of a menu, or -1 if none.
const activeIndex = (isButton, buttonOrMenu) => {
  const menu = isButton
    ? document.getElementById(buttonOrMenu.getAttribute('aria-controls'))
    : buttonOrMenu;
  const items = Array.from(menu.querySelectorAll('[role=menuitem'));
  // If the menu is a pseudofocus manager, return the index.
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
const setActive = (focusType, menu, itemIndex, permLabel) => {
  // Identify the index of the active menu item.
  const oldIndex = activeIndex(false, menu);
  // Identify the menu items.
  const menuItems = Array.from(menu.children)
  .map(listItem => listItem.firstElementChild)
  .filter(item => item.getAttribute('role') === 'menuitem');
  // Identify the specified index.
  const newIndex = itemIndex === -1 ? menuItems.length - 1 : itemIndex;
  // For each menu item:
  menuItems.forEach((item, index) => {
    // If it has the specified index:
    if (index === newIndex) {
      // Ensure it is active.
      if (focusType === 'pseudo') {
        item.className = 'focal';
        menu.setAttribute('aria-activedescendant', item.id);
        menu.setAttribute('aria-labelledby', `${permLabel} ${item.id}`);
      }
      else if (focusType === 'true') {
        item.tabIndex = 0;
        item.focus();
      }
    }
    // Otherwise, i.e. if does not have the specified index:
    else {
      // Ensure it is inactive.
      if (focusType === 'pseudo') {
        item.className = 'blurred';
      }
      else if (focusType === 'true') {
        item.tabIndex = -1;
      }
    }
  });
};
// Returns the index of a keyboard-chosen menu item.
const newMenuIndex = (menu, key) => {
  const oldIndex = activeIndex(false, menu);
  const menuItems = Array.from(menu.querySelectorAll('[role=menuitem]'));
  const menuItemCount = menuItems.length;
  let newIndex = oldIndex;
  if (key === 'ArrowDown') {
    newIndex = (oldIndex + 1) % menuItemCount;
  }
  else if (key === 'ArrowUp') {
    newIndex = (menuItemCount + oldIndex - 1) % menuItemCount;
  }
  else if (key === 'Home') {
    newIndex = 0;
  }
  else if (key === 'End') {
    newIndex = menuItemCount - 1;
  }
  else if (/^[a-zA-Z]$/.test(key)) {
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
// Returns the index of a keyboard-chosen menu-bar item.
const newMenuBarIndex = (menuBar, key) => {
  const oldIndex = activeIndex(false, menuBar);
  const menuItems = Array.from(menu.querySelectorAll('[role=menuitem]'));
  const menuItemCount = menuItems.length;
  let newIndex = oldIndex;
  if (key === 'ArrowRight') {
    newIndex = (oldIndex + 1) % menuItemCount;
  }
  else if (key === 'ArrowLeft') {
    newIndex = (menuItemCount + oldIndex - 1) % menuItemCount;
  }
  else if (key === 'Home') {
    newIndex = 0;
  }
  else if (key === 'End') {
    newIndex = menuItemCount - 1;
  }
  else if (/^[a-zA-Z]$/.test(key)) {
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
// Clicks the pseudofocused item of a menu.
const click = menu => {
  const activeItem = document.getElementById(menu.getAttribute('aria-activedescendant'));
  activeItem.dispatchEvent(new Event('click'));
};
// Handles click activation of a menu button.
const menuButtonClickHandler = (focusType, button, permLabel) => {
  if (button.ariaExpanded === 'false') {
    openMenu(button);
    const menu = document.getElementById(button.getAttribute('aria-controls'));
    if (focusType === 'pseudo') {
      menu.focus();
      if (! menu.getAttribute('aria-activedescendant')) {
        setActive('pseudo', menu, 0, permLabel);
      }
    }
    else if (focusType === 'true') {
      const oldIndex = activeIndex(true, button);
      const newIndex = oldIndex > -1 ? oldIndex : 0;
      setActive('true', menu, newIndex);
    }
  }
  else if (button.ariaExpanded === 'true') {
    closeMenu(button);
  }
};
// Handles keyboard activation of a menu button.
const menuButtonKeyHandler = (focusType, button, key, defPermLabel) => {
  const oldIndex = activeIndex(true, button);
  const menu = openMenu(button);
  if (focusType === 'pseudo') {
    menu.focus();
  }
  if (key === 'ArrowUp') {
    setActive(focusType, menu, -1, defPermLabel);
  }
  else if (key === 'ArrowDown') {
    setActive(focusType, menu, 0, defPermLabel);
  }
  else if ([' ', 'Enter'].includes(key)) {
    const newIndex = oldIndex > -1 ? oldIndex : 0;
    setActive(focusType, menu, newIndex, defPermLabel);
  }
};
// Handles keyboard operations in a menu.
const menuKeyHandler = (focusType, menu, key, defPermLabel) => {
  const newIndex = newMenuIndex(menu, key);
  if (newIndex > -1) {
    setActive(focusType, menu, newIndex, defPermLabel);
  }
};
// CONSTANTS
const menuBar = document.getElementById('menubar');
const persButton = document.getElementById('persButton');
const persMenu = document.getElementById('persMenu');
const defPermLabel = persMenu.getAttribute('aria-labelledby');
const techButton = document.getElementById('techButton');
const techMenu = document.getElementById('techMenu');
// EVENT LISTENERS
// Listen for clicks on the definition menu button.
persButton.addEventListener(
  'click', () => menuButtonClickHandler('pseudo', persButton, defPermLabel)
);
// Listen for clicks on the technology menu button.
techButton.addEventListener(
  'click', () => menuButtonClickHandler('true', techButton)
);
// Listen for clicks within the definition menu.
persMenu.addEventListener('click', event => {
  const menuItems = Array.from(persMenu.querySelectorAll('[role=menuitem]'));
  const targetIndex = menuItems.indexOf(event.target);
  // If the click is on a menu item:
  if (targetIndex > -1) {
    // When the main click event (i.e. navigation to a link target) ends:
    window.setTimeout(() => {
      // Make the clicked menu item the active one.
      setActive('pseudo', persMenu, targetIndex, defPermLabel);
      // Focus the menu button.
      persButton.focus();
      // Close the menu.
      closeMenu(persButton);
    });
  }
});
// Listen for clicks on the technology menu items.
Array.from(techMenu.querySelectorAll('[role=menuitem]')).forEach(item => {
  item.addEventListener('click', event => {
    // When the main click event (i.e. navigation to the link target) ends:
    window.setTimeout(() => {
      // Make the clicked menu item the active one.
      item.tabIndex = '0';
      // Focus the menu button.
      techButton.focus();
      // Close the menu.
      closeMenu(techButton);
    });
  });
});
// Listen for clicks within the body.
document.body.addEventListener('click', event => {
  const target = event.target;
  // For each menu button:
  [persButton, techButton].forEach(button => {
    // Identify its menu.
    const menu = document.getElementById(button.getAttribute('aria-controls'));
    // If neither it nor its menu is the click target:
    if (! [button, menu].includes(target)) {
      // When the main click event ends:
      window.setTimeout(() => {
        // Close the menu.
        closeMenu(button);
      });
    }
  });
});
// Listen for key presses.
window.addEventListener('keydown', event => {
  const key = event.key;
  const focus = document.activeElement;
  const buttonIndex= [persButton, techButton].indexOf(focus);
  // If either menu button is in focus:
  if (buttonIndex > -1) {
    // If the key is a menu-button-activating key:
    if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(key)) {
      // Handle the event and prevent any default scrolling.
      event.preventDefault();
      menuButtonKeyHandler(['pseudo', 'true'][buttonIndex], focus, key, defPermLabel);
    }
    // Otherwise, if the key is an intra-menubar navigation key:
    else if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(key)) {
      // Handle the event.
      const newIndex = newMenuBarIndex(menuBar, key);
      if (newIndex > -1) {
        setActive('true', menuBar, newIndex);
      }
    }
  }
  // Otherwise, if the definition menu is in focus:
  else if (focus === persMenu) {
    // If the key is Enter:
    if (key === 'Enter') {
      // Simulate a click on whichever menu item is currently active.
      const activeItem = document.getElementById(persMenu.getAttribute('aria-activedescendant'));
      activeItem.click();
    }
    // Otherwise, if it is Tab:
    else if (key === 'Tab') {
      // Close the menu.
      closeMenu(persButton);
    }
    // Otherwise, if it is Escape:
    else if (key === 'Escape') {
      // Focus the menu button.
      persButton.focus();
      // Close the menu.
      closeMenu(persButton);
    }
    // Otherwise, if the key is an intra-menu navigation key:
    else if (
      ['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(key)
      || /^[a-zA-Z]$/.test(key) && ! (event.altKey || event.ctrlKey || event.metaKey)
    ) {
      // Navigate within the menu and prevent any default scrolling.
      event.preventDefault();
      const newIndex = newMenuIndex(persMenu, key);
      if (newIndex > -1) {
        setActive('pseudo', persMenu, newIndex, defPermLabel);
      }
    }
  }
  // Otherwise, if a menu item (thus, of the technology menu) is in focus:
  else if (focus.getAttribute('role') === 'menuitem') {
    // If the key is Enter:
    if (key === 'Enter') {
      // Simulate a click on the menu item.
      focus.click();
    }
    // Otherwise, if the key is Tab:
    else if (key === 'Tab') {
      // Close the technology menu.
      closeMenu(techButton);
    }
    // Otherwise, if it is Escape:
    else if (key === 'Escape') {
      // Focus the menu button.
      techButton.focus();
      // Close the menu.
      closeMenu(techButton);
    }
    // Otherwise, if the key is an intra-menu navigation key:
    else if (
      ['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(key)
      || /^[a-zA-Z]$/.test(key) && ! (event.altKey || event.ctrlKey || event.metaKey)
    ) {
      // Navigate within the technology menu and prevent any default scrolling.
      event.preventDefault();
      const newIndex = newMenuIndex(techMenu, key);
      if (newIndex > -1) {
        setActive('true', techMenu, newIndex);
      }
    }
  }
});
