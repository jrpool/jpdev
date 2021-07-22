// UTILITIES FOR EVENT HANDLERS
// Opens a menu controlled by a button.
const openMenu = button => {
  const menu = document.getElementById(button.getAttribute('aria-controls'));
  menu.className = 'open';
  button.ariaExpanded === 'true';
  menu.focus();
};
// Closes a menu controlled by a button.
const closeMenu = button => {
  button.ariaExpanded === 'false';
  const menu = document.getElementById(button.getAttribute('aria-controls'));
  button.focus();
  menu.className = 'shut';
};
// Makes the specified (or the last if -1) menu item active.
const setActive = (menu, itemIndex, permLabel) => {
  const menuItems = Array.from(menu.querySelectorAll('[role=menuitem]'));
  menuItems.forEach((item, index) => {
    if (itemIndex === -1 && index === menuItems.length - 1 || index === itemIndex) {
      item.className = 'focal';
      menu.setAttribute('aria-activedescendant', item.id);
      menu.setAttribute('aria-labelledby', `${permLabel} ${item.id}`);
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
  const activeIndex = menuItemIDs.indexOf(menu.getAttribute('aria-activedescendant'));
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
      (item, index) => item.textContent.toLowerCase().startsWith(key.toLowerCase()) ? index : -1
    )
    .filter(index => index > -1 && index > activeIndex)[0];
  }
  return newIndex;
};
// Clicks the active menu item.
const click = menu => {
  const activeItem = document.getElementById(menu.getAttribute('aria-activedescendant'));
  activeItem.dispatchEvent(new Event('click'));
};
// Handles click activation of a menu button.
const menuButtonClickHandler = (button, permLabel) => {
  if (button.ariaExpanded === 'true') {
    closeMenu(button);
  }
  else {
    openMenu(button);
    const menu = document.getElementById(button.getAttribute('aria-controls'));
    if (! menu.getAttribute('aria-activedescendant')) {
      setActive(menu, 0, permLabel);
    }
  }
};
// Handles keyboard activation of a menu button.
const menuButtonKeyHandler = (button, key, permLabel) => {
  openMenu(button);
  const menu = document.getElementById(button.getAttribute('aria-controls'));
  if (key === 'ArrowUp') {
    setActive(menu, -1, permLabel);
  }
  else {
    setActive(menu, 0, permLabel);
  }
};
// Handles keyboard operations in a menu.
const menuKeyHandler = (menu, key, permLabel) => {
  const newIndex = newMenuIndex(menu, key);
  if (newIndex > -1) {
    setActive(menu, newIndex, permLabel);
  }
};
// CONSTANTS
const defButton = document.getElementById('defButton');
const defMenu = document.getElementById('defMenu');
const permLabel = defMenu.getAttribute('aria-labelledby');
// EVENT LISTENERS
defButton.addEventListener('click', event => menuButtonClickHandler(event.target, permLabel));
defMenu.addEventListener('click', event => {
  event.preventDefault();
  const target = event.target;
  if (target.role === 'menuitem') {
    closeMenu(defButton);
    target.dispatchEvent(new Event('click'));
  }
});
defMenu.addEventListener('blur', () => {
  defButton.ariaExpanded = 'false';
  menu.className = 'shut';
});
window.addEventListener('keyup', event => {
  const key = event.key;
  const focus = document.activeElement;
  if (focus === defButton) {
    if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(key)) {
      event.preventDefault();
      menuButtonKeyHandler(defButton, key, permLabel);
    }
  }
  else if (focus === defMenu) {
    if (key === 'Enter') {
      const activeItem = document.getElementById(defMenu.getAttribute('aria-activedescendant'));
      closeMenu(defButton);
      activeItem.dispatchEvent(new Event('click'));
    }
    else if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(key) || /^[a-zA-Z]+$/.test(key)) {
      event.preventDefault();
      const newIndex = newMenuIndex(defMenu, key);
      setActive(defMenu, newIndex, permLabel);
    }
  }
});
