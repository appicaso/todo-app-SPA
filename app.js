const form = document.getElementsByTagName('form');
const listContainer = document.querySelector('.lists');
const listItems = document.querySelector('.list-items');
const lists = JSON.parse(localStorage.getItem('lists')) || [];
const registeredUsers = JSON.parse(localStorage.getItem('users')) || [];
const menu = document.querySelector('.menu-container');
const section = document.querySelector('.section');
const logoutBtn = document.querySelector('.logout-btn-container');
const settingsBtn = document.querySelector('.settings-btn-container');
const signupBtn = document.querySelector('.signupbtn');
const inputFields = document.getElementsByTagName('input');
const topRightNav = document.querySelector('.top-right-nav');
let currentUser;
let getUserObj;
const userLists = [];

const getSelectedListId = () => {
  const selectedListId = localStorage.getItem('selected.listID');
  return selectedListId;
};

const getSelectedListName = () => {
  const selectedListName = localStorage.getItem('selected.listName');
  return selectedListName;
};

async function fetchHtml(url) {
  return await (await fetch(url)).text();
}

async function loadNewContent(clickedlink) {
  const content = document.querySelector('.main-content');

  content.innerHTML = await fetchHtml(`${clickedlink}.html`);

  if (location.hash === '#signup') {
    const loginBtn = document.querySelector('.loginbtn');

    content.style.height = '100%';
    form[0].addEventListener('submit', (e) => {
      e.preventDefault();
      if (formValidation()) {
        registerUser();
      }
    });

    loginBtn.addEventListener('click', (e) => {
      location.hash = '#login';
    });
  }

  if (location.hash === '#login') {
    const menu = document.querySelector('.menu-container');
    const signupBtn = document.querySelector('.signupbtn');
    const bodyWrapper = document.querySelector('.body-wrapper');

    bodyWrapper.style.gridTemplateAreas =
      '"head head head head head head head head head head head head" "section section section section section section section section section section section section"';

    menu.style.display = 'none';
    topRightNav.style.display = 'none';

    form[0].addEventListener('submit', (e) => {
      e.preventDefault();
      loginUser(email, password);
    });

    signupBtn.addEventListener('click', (e) => {
      location.hash = '#signup';
    });
  }

  if (location.hash === '#dashboard') {
    loggedInState(getUserObj);
  }

  if (location.hash === '#lists') {
    form[0].addEventListener('submit', (e) => {
      const newListName = document.getElementById('list').value;

      e.preventDefault();

      if (!listNameExists(newListName)) {
        createNewList();
      } else {
        const duplicateListNameError = document.querySelector('.list-name-error');

        duplicateListNameError.innerText = `${newListName} already exists, please choose a different name for your new list`;
        duplicateListNameError.classList.add('duplicatelist-error-message');
        duplicateListNameError.style.visibility = 'visible';

        return;
      }

      location.hash = 'todo';
    });
  }

  if (location.hash === '#settings') {
    loadUserData(inputFields);

    form[0].addEventListener('submit', (e) => {
      e.preventDefault();
      saveSettings();
      location.hash = 'dashboard';
    });
  }

  if (location.hash === '#todo') {
    const listNameElement = document.querySelector('.list-name');
    const deleteBtn = document.querySelector('.delete-list-btn');
    const renameListBtn = document.querySelector('.rename-list');
    const listInfoContainer = document.querySelector('.list-info-container');
    const saveNewListNameBtn = document.querySelector('.save-list-name-btn');
    const filters = document.querySelectorAll('.filter');
    const addTodoContainer = document.querySelector('.new-todo-input');
    const addTodoBtn = document.querySelector('.todoaddicon');
    const deleteListConfirmationContainer = document.querySelector('.deletelist-confirmation-container');
    const confirmBtn = document.querySelector('.delete-confirmation-buttons.confirm');
    const cancelBtn = document.querySelector('.delete-confirmation-buttons.cancel');
    const todosSection = document.querySelector('.section.todos');
    const todoIconContainer = document.querySelector('.todoaddicon-container');

    confirmBtn.addEventListener('click', (e) => {
      deleteList(getSelectedListId());
      deleteListConfirmationContainer.classList.toggle('show');
      todosSection.classList.toggle('blurred');
      menu.classList.toggle('blurred');
    });

    cancelBtn.addEventListener('click', (e) => {
      deleteListConfirmationContainer.classList.toggle('show');
      todosSection.classList.toggle('blurred');
      menu.classList.toggle('blurred');
    });

    form[0].addEventListener('submit', (e) => {
      e.preventDefault();
      createNewTodo();
    });

    todoIconContainer.addEventListener('click', (e) => {
      createNewTodo();
    });

    deleteBtn.addEventListener('click', (e) => {
      const deleteListConfirmationContainer = document.querySelector('.deletelist-confirmation-container');
      const todosSection = document.querySelector('.section.todos');

      deleteListConfirmationContainer.classList.toggle('show');
      todosSection.classList.toggle('blurred');
      menu.classList.toggle('blurred');
    });

    renameListBtn.addEventListener('click', (e) => {
      renameList(listNameElement);
      renameListBtn.style.opacity = '50%';
      renameListBtn.disabled = true;
      renameListBtn.style.cursor = 'not-allowed';
      saveNewListNameBtn.style.visibility = 'visible';
    });

    listInfoContainer.addEventListener('keydown', function (e) {
      if (e.keyCode === 13) e.preventDefault();
    });

    saveNewListNameBtn.addEventListener('click', (e) => {
      saveRenamedListName(getSelectedListId());
      saveNewListNameBtn.style.visibility = 'hidden';
      listNameElement.setAttribute('contentEditable', false);
      listNameElement.classList.remove('focused');
      renameListBtn.style.opacity = 1;
      renameListBtn.disabled = false;
      renameListBtn.style.cursor = 'pointer';
    });

    filters.forEach((filter) => {
      filter.addEventListener('click', (e) => {
        const filterAll = e.target.innerText;
        appendTodosToView(getSelectedListId(), filterAll);
      });
    });

    addTodoContainer.addEventListener('focusin', (e) => {
      addTodoBtn.classList.toggle('fa-rotate-90');
    });
  }

  animateSection(section);
}

function animateSection(section) {
  if (section.classList.contains('animate__bounceInUp')) {
    section.classList.remove('animate__animated', 'animate__bounceInUp');
    section.classList.add('animate__animated', 'animate__bounceInUp');
  } else {
    section.classList.add('animate__animated', 'animate__bounceInUp');
  }
}

listContainer.addEventListener('click', (e) => {
  const selectedListId = e.target.id;
  const selectedListName = e.target.innerText;

  if (e.target.tagName.toLowerCase() === 'div' || e.target.tagName.toLowerCase() === 'li') {
    location.hash = 'todo';

    selectList(selectedListId, selectedListName);
    setTimeout(() => {
      appendTodosToView(selectedListId, 'All');
      getSelectedListInfo();
    }, 100);
  }
});

const getSelectedListInfo = () => {
  const listNameElement = document.querySelector('.list-name');
  const listIdElement = document.querySelector('.list-id');
  const listInfo = getSelectedListName();

  if (listInfo.includes('#')) {
    listNameElement.innerText = listInfo;
    listIdElement.innerText = '#' + getSelectedListId();
  } else {
    listNameElement.innerText = '#' + listInfo;
    listIdElement.innerText = '#' + getSelectedListId();
  }
};

const listNameExists = (newListName) => {
  const currentListNames = lists.filter((listItem) => listItem.submitBy === getUserObj.email).map((list) => list.name);

  if (currentListNames.includes(newListName)) {
    return true;
  } else {
    return false;
  }
};

const formValidation = () => {
  const userForm = document.querySelector('form');

  let validationResult = true;

  for (let formField = 0; formField < userForm.length - 1; formField++) {
    const input = userForm[formField];

    const errorMessage = userForm.querySelector(`.${input.name}-error-message`);

    if (errorMessage != null || errorMessage != undefined) {
      errorMessage.classList.remove('error-identified');
    }

    if (input.getAttribute('type') == 'text' || input.getAttribute('type') == 'email') {
      if (input.value === '' || input.value === null) {
        displayFormError(userForm[formField], 'This field cannot be empty!');
        validationResult = false;
      }
    }

    if (input.getAttribute('type') == 'password') {
      if (input.value === '' || input.value === null) {
        displayFormError(userForm[formField], 'Enter a password for your account');
        validationResult = false;
      }
    }
  }

  if (!email.validity.valid) {
    displayFormError(email, 'Thats not an e-mail address dude!!');
    validationResult = false;
  }

  return validationResult;
};

const displayFormError = (fieldContainingError, errorMessage) => {
  const inputParentElement = fieldContainingError.parentElement;
  const errorMessageField = inputParentElement.querySelector(`.${fieldContainingError.name}-error-message`);

  errorMessageField.classList.add('error-identified');
  errorMessageField.innerText = errorMessage;
};

const registerUser = () => {
  const inputFields = document.getElementsByTagName('input');
  const newUser = createNewUser(inputFields);

  registeredUsers.push(newUser);
  localStorage.setItem('users', JSON.stringify(registeredUsers));
  location.hash = '#login';
};

function createNewUser(inputFields) {
  return {
    id: generateUniqueID(),
    firstName: inputFields[0].value,
    lastName: inputFields[1].value,
    email: inputFields[2].value,
    password: inputFields[3].value,
    termsAndConditions: true,
  };
}

const loginUser = (username, password) => {
  if (formValidation()) {
    getUserObj = registeredUsers.find((user) => username.value === user.email);

    if (getUserObj) {
      if (getUserObj.email === username.value && getUserObj.password === password.value) {
        currentUser = getUserObj.email;
        location.hash = '#dashboard';
        loggedInState(getUserObj);
      } else {
        displayFormError(password, 'The password you entered is incorrect');
      }
    } else {
      displayFormError(username, 'No matching username found in our records');
    }
  }
};

const loggedInState = (userObj) => {
  const bodyWrapper = document.querySelector('.body-wrapper');
  const content = document.querySelector('.main-content');

  bodyWrapper.style.gridTemplateAreas =
    '"head head head head head head head head head head toprightnav toprightnav" "menu menu section section section section section section section section section section"';

  topRightNav.style.display = 'flex';
  menu.style.display = 'block';
  menu.style.visibility = 'visible';
  content.style.height = '100%';

  appendListsToView();

  setTimeout(() => {
    const welcomeMsg = document.querySelector('.welcome-message');
    welcomeMsg.innerText = `Welcome to your dashboard, ${getUserObj.firstName} \n ADD or SELECT lists to get started!`;
  }, 100);
};

const createNewList = () => {
  const newListName = document.getElementById('list').value;
  const newListObj = createListObj(newListName);

  lists.push(newListObj);
  getUserObj.lists = lists;
  localStorage.setItem('lists', JSON.stringify(lists));
  appendListsToView();

  selectList(newListObj.id, newListName);

  setTimeout(() => {
    getSelectedListInfo();
    setTodoFilter(newListObj.todos, 'All');
  }, 200);
};

function generateUniqueID() {
  const uniqueId = Date.now().toString();
  return uniqueId;
}

function createListObj(listName) {
  return {
    id: generateUniqueID(),
    submitBy: getUserObj.email,
    name: listName,
    todos: [],
  };
}

const appendListsToView = () => {
  // Reset all LI elements containing Lists.
  clearElementsFromView(listItems);

  const getUserLists = lists
    .slice()
    .reverse()
    .filter((listItem) => listItem.submitBy === getUserObj.email);

  //Append all lists to view
  if (getUserLists) {
    for (listIndex = 0; listIndex < getUserLists.length; listIndex++) {
      const generatedDivContainer = document.createElement('div');
      const generatedLiElement = document.createElement('li');

      generatedDivContainer.classList.add('list-item-container');
      listItems.appendChild(generatedDivContainer);

      generatedLiElement.id = getUserLists[listIndex].id;
      generatedDivContainer.id = getUserLists[listIndex].id;
      generatedLiElement.classList.add('list-item');
      generatedLiElement.innerText = `#${getUserLists[listIndex].name}`;
      generatedDivContainer.appendChild(generatedLiElement);
    }
  }
};

function clearElementsFromView(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

const createNewTodo = () => {
  const currentSelectedList = JSON.parse(localStorage.getItem('selected.listID'));
  const todoInput = document.querySelector('.new-todo-input');
  const newTodo = document.getElementById('todo').value;

  const findMatchingListId = lists.find((list) => list.id === currentSelectedList.toString());

  findMatchingListId.todos.push({ id: generateUniqueID(), todoItem: newTodo, completed: false });
  localStorage.setItem('lists', JSON.stringify(lists));
  appendTodosToView(currentSelectedList, 'All');
  todoInput.value = '';
};

function selectList(selectedListId, selectedListName) {
  const previousSelectedListElements = document.querySelectorAll('.selected');
  const selectedListElement = document.getElementById(selectedListId);

  if (previousSelectedListElements != null) {
    for (i = 0; i < previousSelectedListElements.length; i++) {
      previousSelectedListElements[i].classList.remove('selected');
    }
  }

  selectedListElement.classList.add('selected');
  selectedListElement.firstChild.classList.add('selected');
  localStorage.setItem('selected.listID', selectedListId);
  localStorage.setItem('selected.listName', selectedListName);
}

const handleTodoItemStatus = (selectedListId, checkedTodoItemId, event) => {
  const selectedList = lists.find((listItem) => listItem.id === selectedListId);
  const checkedTodoItem = selectedList.todos.find((todoItem) => todoItem.id === checkedTodoItemId);
  const todoItemContainer = document.getElementById(checkedTodoItemId);

  if (!checkedTodoItem.completed) {
    checkedTodoItem.completed = true;
    event.target.nextSibling.style.textDecoration = 'line-through';
    todoItemContainer.style.opacity = 0.6;
  } else {
    checkedTodoItem.completed = false;
    event.target.nextSibling.style.textDecoration = 'none';
    todoItemContainer.style.opacity = 1;
  }

  localStorage.setItem('lists', JSON.stringify(lists));
};

const appendTodosToView = (listID, filter) => {
  const todoItems = document.querySelector('.todo-items');
  const todoCountElement = document.querySelector('.todo-count');

  const findMatchingListId = lists.find((list) => list.id === listID.toString());
  const filteredTodos = setTodoFilter(findMatchingListId.todos, filter);
  const todoCount = findMatchingListId.todos.length > 0 ? findMatchingListId.todos.length : 0;

  // Reset all LI elements containing todos.
  if (document.body.contains(todoItems)) {
    clearElementsFromView(todoItems);
  }

  //Append all Todos to view

  if (todoCount < 1) {
    const noTodosFoundContainer = document.createElement('div');
    const noTodosFoundAlert = document.createElement('p');

    todoItems.appendChild(noTodosFoundContainer);
    noTodosFoundContainer.appendChild(noTodosFoundAlert);
    noTodosFoundContainer.classList.add('no-todos-found-container');
    noTodosFoundAlert.classList.add('no-todos-found-alert');
    noTodosFoundAlert.innerText = 'No Todos Found Buddy!';
  } else {
    filteredTodos.forEach((todo) => {
      const todoItem = findMatchingListId.todos.find((todoItem) => todoItem.id === todo.id);
      const generatedDivContainer = document.createElement('div');
      const generatedInputElement = document.createElement('input');
      const generatedCheckboxElement = document.createElement('label');
      const generatedLiElement = document.createElement('li');
      const generatedTrashIcon = document.createElement('i');

      generatedDivContainer.classList.add('todo-item-container');
      generatedDivContainer.id = todo.id;
      todoItems.appendChild(generatedDivContainer);

      generatedInputElement.setAttribute('type', 'checkbox');
      generatedInputElement.setAttribute('name', 'check');
      generatedInputElement.id = `checkbox-${todo.id}`;
      generatedInputElement.setAttribute('hidden', 'hidden');
      generatedDivContainer.appendChild(generatedInputElement);

      generatedCheckboxElement.classList.add('custom-checkbox');
      generatedCheckboxElement.setAttribute('for', `checkbox-${todo.id}`);
      generatedDivContainer.appendChild(generatedCheckboxElement);

      if (todoItem.completed) {
        generatedInputElement.checked = true;
        generatedLiElement.style.textDecoration = 'line-through';
        generatedDivContainer.style.opacity = 0.6;
      }

      generatedLiElement.id = todo.id;
      generatedLiElement.classList.add('todo-item');
      generatedLiElement.innerText = todo.todoItem;
      generatedDivContainer.appendChild(generatedLiElement);

      generatedTrashIcon.classList.add('btnTrash', 'fas', 'fa-trash');
      generatedDivContainer.appendChild(generatedTrashIcon);

      generatedTrashIcon.addEventListener('click', (e) => {
        deleteTodo(generatedTrashIcon.previousSibling.id);
      });

      generatedCheckboxElement.addEventListener('click', (e) => {
        const checkedTodoId = e.target.parentNode.id;
        const checkbox = e.target.previousElementSibling;

        handleTodoItemStatus(getSelectedListId(), checkedTodoId, e);
      });
    });
  }

  todoCountElement.innerText = todoCount;
};

const deleteTodo = (deletedTodoId) => {
  lists.forEach((list) => {
    const findTodo = list.todos.find((todoItem) => todoItem.id === deletedTodoId);

    if (findTodo) {
      const todoIndex = list.todos.indexOf(findTodo);

      list.todos.splice(todoIndex, 1);
      localStorage.setItem('lists', JSON.stringify(lists));
      animateDeletedTodo(deletedTodoId);

      setTimeout(() => {
        appendTodosToView(getSelectedListId(), 'All');
      }, 700);
    }
  });
};

const deleteList = (selectedList) => {
  const findList = lists.find((list) => list.id == selectedList);

  if (findList) {
    const listIndex = lists.indexOf(findList);

    lists.splice(listIndex, 1);
    localStorage.setItem('lists', JSON.stringify(lists));
    appendListsToView();
    location.hash = '#deleted-list';
  }
};

const renameList = (listNameElement) => {
  listNameElement.setAttribute('contentEditable', true);
  listNameElement.classList.add('focused');
  listNameElement.focus();

  const moveCursorTextEnd = (listNameElement) => {
    const range = document.createRange();
    const sel = window.getSelection();
    range.selectNodeContents(listNameElement);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
  };

  moveCursorTextEnd(listNameElement);
};

const saveRenamedListName = (listId) => {
  const newListName = document.querySelector('.list-name').innerText;
  let newlistItemText = document.getElementById(listId).firstChild;
  const findList = lists.find((list) => list.id === listId);
  const listIndex = lists.indexOf(findList);

  if (findList) {
    lists[listIndex].name = newListName;
    newlistItemText.innerText = newListName;
    localStorage.setItem('lists', JSON.stringify(lists));
  }
};

function animateDeletedTodo(deletedTodoId) {
  const deletedTodoDiv = document.getElementById(deletedTodoId);
  deletedTodoDiv.classList.add('animate__animated', 'animate__bounceOutRight');
}

form[0].addEventListener('submit', (e) => {
  e.preventDefault();
  loginUser(email, password);
});

window.addEventListener('hashchange', () => {
  const clickedlink = location.hash.substr(1);
  const section = document.querySelector('.section');
  loadNewContent(clickedlink);
  animateSection(section);
});

window.addEventListener('DOMContentLoaded', (e) => {
  const addBtn = document.querySelector('.addBtn');
  const listItemContainers = document.querySelectorAll('.list-item-container');

  animateSection(section);

  addBtn.classList.add('animate__animated', 'animate__bounceInDown');

  listItemContainers.forEach((item) => {
    item.classList.add('animate__animated', 'animate__slideInLeft');
  });
});

settingsBtn.addEventListener('click', (e) => {
  location.hash = '#settings';
});

logoutBtn.addEventListener('click', (e) => {
  location.hash = '#login';
});

signupBtn.addEventListener('click', (e) => {
  location.hash = '#signup';
});

const loadUserData = (inputFields) => {
  console.log(inputFields);
  inputFields[0].value = getUserObj.firstName;
  inputFields[1].value = getUserObj.lastName;
  inputFields[2].value = getUserObj.email;
  inputFields[3].value = getUserObj.password;
};

const saveSettings = () => {
  const userID = getUserObj.id;
  const userIndex = registeredUsers.indexOf(getUserObj);
  const newUserInfo = createNewUser(inputFields);

  registeredUsers.splice(userIndex, 1);
  newUserInfo.id = userID;
  registeredUsers.push(newUserInfo);
  localStorage.setItem('users', JSON.stringify(registeredUsers));
};

const setTodoFilter = (todos, filter) => {
  let filteredTodos;
  const filters = document.querySelectorAll('.filter');

  filters.forEach((filter) => {
    filter.classList.remove('filter-selected');
    filter.classList.remove('fadein-animate');
  });

  switch (filter) {
    case 'All':
      filteredTodos = todos;
      filters[0].classList.add('filter-selected');
      filters[0].classList.add('fadein-animate');
      break;

    case 'Incomplete':
      filteredTodos = todos.filter((todo) => {
        return todo.completed == false;
      });
      filters[1].classList.add('filter-selected');
      filters[1].classList.add('fadein-animate');
      break;

    case 'Completed':
      filteredTodos = todos.filter((todo) => {
        return todo.completed == true;
      });
      filters[2].classList.add('filter-selected');
      filters[2].classList.add('fadein-animate');
      break;
  }
  return filteredTodos.slice().reverse();
};
