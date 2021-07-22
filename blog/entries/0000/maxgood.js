// EVENT HANDLERS
// Opens a menu.
const openMenu = button => {
  button.ariaExpanded === 'true';
  const menu = document.getElementById(button.ariaControls);
  menu.className = 'open';
};
// Closes a menu.
const closeMenu = button => {
  button.ariaExpanded === 'false';
  const menu = document.getElementById(button.ariaControls);
  menu.className = 'shut';
};
// Makes the specified menu item (the last if itemIndex is -1) active.
const setActive = (menu, itemIndex, permLabel) => {
  const menuItems = Array.from(menu.querySelectorAll('[role=menuitem]'));
  menuItems.forEach((item, index) => {
    if (itemIndex === -1 && index === menuItems.length - 1 || index === itemIndex) {
      item.className = 'focal';
      menu.ariaActivedescendant = item.id;
      menu.ariaLabelledby = `${permLabel} ${item.id}`;
    }
    else {
      item.className = 'blurred';
    }
  });
};
// Returns the index of a keyboard-chosen menu item.
const newMenuIndex = (menu, key) => {
  const menuItems = Array.from(menu.querySelectorAll('[role=menuitem]'));
  const menuItemIDs = menuItems.map(item => item.id);
  const activeIndex = menuItemIDs.indexOf(menu.ariaActivedescendant);
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
  else if (/^[a-zA-Z]+$/.test(key)) {
    newIndex = menuItems
    .map(
      (item, index) => item.textContent.toLowerCase().startsWith(spec.toLowerCase()) ? index : -1
    )
    .filter(index => index > -1 && index > activeIndex)[0];
  }
  return newIndex;
};
// Activates the active menu item.
const activate = menu => {
  const activeItem = document.getElementById(menu.activeDescendant);
  activeItem.dispatchEvent(new Event('click'));
};
// Handles click activation of a menu button.
const menuButtonClickHandler = button => {
  if (button.ariaExpanded === 'true') {
    closeMenu(button);
  }
  else {
    openMenu(button);
    const menu = document.getElementById(button.ariaControls);
    if (! menu.activeDescendant) {
      setActive(menu, 0);
    }
  }
};
// Handles keyboard activation of a menu button.
const menuButtonKeyHandler = (button, key) => {
  openMenu(button);
  const menu = document.getElementById(button.ariaControls);
  if (key === 'ArrowUp') {
    setActive(menu, -1);
  }
  else {
    setActive(menu, 0);
  }
};
// Handles keyboard operations in a menu.
const menuKeyHandler = (menu, key, permLabel) => {
  const newIndex = newMenuIndex(menu, key);
  if (newIndex > -1) {
    setActive(menu, newIndex, permLabel);
  }
};
// OPERATIONS
// Constants.
const defButton = document.getElementById('defButton');
const permLabel = document.getElementById(defButton.ariaControls).ariaLabelledby;
// Event listeners.
defButton.addEventListener('click', menuButtonClickHandler);
document.body.addEventListener('keyup', event => {
  const key = event.key;
  if (
    document.activeElement === defButton
    && ['Enter', 'Space', 'ArrowDown', 'ArrowUp'].includes(key)
  ) {
    menuButtonKeyHandler(defButton, key);
  }
});
const defMenu = document.getElementById('defMenu');
document.body.addEventListener('keyup', event => {
  const key = event.key;
  if (document.activeElement === defMenu) {
    const key = event.key;
    if (key === 'Enter') {
      const activeItem = document.getElementById(defMenu.activeDescendant);
      closeMenu(defButton);
      activeItem.dispatchEvent(new Event('click'));
    }
    else if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(key) || /^[a-zA-Z]+$/.test(key)) {
      const newIndex = newMenuIndex(defMenu, key);
      setActive(defMenu, newIndex, permLabel);
    }
  }
});
defMenu.addEventListener('click', event => {
  event.preventDefault();
  const target = event.target;
  if (target.role === 'menuitem') {
    closeMenu(defButton);
    target.dispatchEvent(new Event('click'));
  }
});
