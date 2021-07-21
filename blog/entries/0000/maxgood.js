// Moves the focal outline within a menu.
const setOutline = menu => {
  const menuItems = Array.from(menu.getElementsByTagName('a'));
  menuItems.forEach(menuItem => {
    menuItem.class = menuItem.id === menu.ariaActivedescendant ? 'focal' : 'blurred';
  });
};
// Toggles a menu open or closed.
const toggleMenu = button => {
  const isOpen = button.ariaExpanded === "true";
  const menu = document.getElementById(button.ariaControls);
  if (isOpen) {
    menu.className = 'shut';
    button.ariaExpanded = 'false';
  }
  else {
    menu.className = 'open';
    button.ariaExpanded = 'true';
    menu.focus();
    setOutline(menu);
  }
  menu.className = isOpen ? 'shut' : 'open';
  button.ariaExpanded = isOpen ? 'false' : 'true';
  if (! isOpen) {
    menu.focus();
  }
};
// Sets the active menu item.
const setActive = (menu, whither) => {
  const menuItemIDs = Array.from(menu.getElementsByTagName('a')).map(menuItem => menuItem.id);
  const activeIndex = menuItemIDs.indexOf(menu.ariaActivedescendant);
  let newIndex;
  if (whither === 'down') {
    newIndex = activeIndex + 1;
  }
};
  // Add the manager username and computed email to the query.
  globals.queryExpandMan(query, 'man');
  if (globals.queryIncludes(query, ['man', 'manUserName'])) {
    globals.render(query, 'addUser2', true, response);
  }
  else {
    globals.serveMessage('ERROR: Your code missing or invalid.', response);
  }
};
