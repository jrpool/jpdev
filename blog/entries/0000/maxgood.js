// UTILITIES FOR EVENT HANDLERS
// Opens a menu controlled by a button and returns the menu.
const openMenu = button => {
  // Chrome fails to support settable ariaExpanded property.
  button.setAttribute('aria-expanded', 'true');
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
    const menu = document.getElementById(button.getAttribute('aria-controls'));
    menu.className = 'shut';
  }
};
// Makes the specified (or the last if -1) menu item active.
const setActive = (focusType, menu, itemIndex, permLabel) => {
  // Identify the menu items.
  const menuItems = Array.from(menu.querySelectorAll('[role=menuitem]'));
  // Identify the index of the currently active item.
  let oldIndex;
  if (focusType === 'pseudo') {
    oldIndex = menuItems.map(item => item.id).indexOf(menu.getAttribute('aria-activedescendant'));
  }
  else if (focusType === 'true') {
    oldIndex = menuItems.map(item => item.tabIndex).indexOf(0);
  }
  // Identify the specified index.
  const newIndex = itemIndex === -1 ? menuItems.length - 1 : itemIndex;
  // For each menu item:
  menuItems.forEach((item, index) => {
    // If it has the specified index:
    if (index === newIndex) {
      // Make it active.
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
    // Otherwise, if it does not have the specified index and is currently active:
    else if (index === oldIndex) {
      // Make it inactive.
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
  const menuItems = Array.from(menu.querySelectorAll('[role=menuitem]'));
  const menuItemIDs = menuItems.map(item => item.id);
  const activeItemID = menu.getAttribute('aria-activedescendant');
  let activeIndex;
  if (activeItemID) {
    activeIndex = menuItemIDs.indexOf(activeItemID);
  }
  else {
    activeIndex = menuItems.map(item => item.tabIndex).indexOf(0);
  }
  const menuItemCount = menuItems.length;
  let newIndex = -1;
  if (key === 'ArrowDown') {
    newIndex = (activeIndex + 1) % menuItemCount;
  }
  else if (key === 'ArrowUp') {
    newIndex = (menuItemCount + activeIndex - 1) % menuItemCount;
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
    const laterMatches = matches.filter(index => index > -1 && index > activeIndex);
    if (laterMatches.length) {
      newIndex = laterMatches[0];
    }
  }
  return newIndex;
};
// Clicks the active menu item.
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
      const menuItems = Array.from(menu.querySelectorAll('[role=menuitem]'));
      const activeIndex = menuItems.map(item => item.tabIndex).indexOf('0');
      const newIndex = activeIndex > -1 ? activeIndex : 0;
      setActive('true', menu, newIndex);
    }
  }
};
// Handles keyboard activation of a menu button.
const menuButtonKeyHandler = (focusType, button, key, defPermLabel) => {
  const menu = openMenu(button);
  if (focusType === 'pseudo') {
    menu.focus();
  }
  if (key === 'ArrowUp') {
    setActive(focusType, menu, -1, defPermLabel);
  }
  else if (key === 'ArrowDown' || ! menu.getAttribute('aria-activedescendant')) {
    setActive(focusType, menu, 0, defPermLabel);
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
const defButton = document.getElementById('defButton');
const defMenu = document.getElementById('defMenu');
const defPermLabel = defMenu.getAttribute('aria-labelledby');
const techButton = document.getElementById('techButton');
const techMenu = document.getElementById('techMenu');
// EVENT LISTENERS
// Listen for clicks on the definition menu button.
defButton.addEventListener(
  'click', () => menuButtonClickHandler('pseudo', defButton, defPermLabel)
);
// Listen for clicks on the technology menu button.
techButton.addEventListener(
  'click', () => menuButtonClickHandler('true', techButton)
);
// Listen for clicks within the definition menu.
defMenu.addEventListener('click', event => {
  const menuItems = Array.from(defMenu.querySelectorAll('[role=menuitem]'));
  const targetIndex = menuItems.indexOf(event.target);
  // If the click is on a menu item:
  if (targetIndex > -1) {
    // When the main click event (i.e. navigation to a link target) ends:
    window.setTimeout(() => {
      // Make the clicked menu item the active one.
      setActive('pseudo', defMenu, targetIndex, defPermLabel);
      // Focus the menu button.
      defButton.focus();
      // Close the menu.
      closeMenu(defButton);
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
  [defButton, techButton].forEach(button => {
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
  const buttonIndex= [defButton, techButton].indexOf(focus);
  // If either menu button is in focus:
  if (buttonIndex > -1) {
    // If the key is a menu-button-activating key:
    if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(key)) {
      // Handle the event and prevent any default scrolling.
      event.preventDefault();
      menuButtonKeyHandler(['pseudo', 'true'][buttonIndex], focus, key, defPermLabel);
    }
  }
  // Otherwise, if the definition menu is in focus:
  else if (focus === defMenu) {
    // If the key is Enter:
    if (key === 'Enter') {
      // Simulate a click on whichever menu item is currently active.
      const activeItem = document.getElementById(defMenu.getAttribute('aria-activedescendant'));
      activeItem.click();
    }
    // Otherwise, if it is Tab:
    else if (key === 'Tab') {
      // Close the menu.
      closeMenu(defButton);
    }
    // Otherwise, if the key is an intra-menu navigation key:
    else if (
      ['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(key)
      || /^[a-zA-Z]$/.test(key) && ! (event.altKey || event.ctrlKey || event.metaKey)
    ) {
      // Navigate within the menu and prevent any default scrolling.
      event.preventDefault();
      const newIndex = newMenuIndex(defMenu, key);
      if (newIndex > -1) {
        setActive('pseudo', defMenu, newIndex, defPermLabel);
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
