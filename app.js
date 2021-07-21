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
    form[0].addEventListener('submit', (event) => {
      event.preventDefault();
      if (formValidation()) {
        registerUser();
      }
    });
  }

  if (location.hash === '#login') {
    const menu = document.querySelector('.menu-container');

    menu.style.visibility = 'hidden';
    logoutBtn.style.visibility = 'hidden';
    settingsBtn.style.visibility = 'hidden';

    form[0].addEventListener('submit', (event) => {
      event.preventDefault();
      loginUser(username, password);
    });
  }

  if (location.hash === '#dashboard') {
    loggedInState(getUserObj);
  }

  if (location.hash === '#lists') {
    form[0].addEventListener('submit', (event) => {
      event.preventDefault();
      createNewList();
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

    form[0].addEventListener('submit', (event) => {
      event.preventDefault();
      createNewTodo();
    });

    deleteBtn.addEventListener('click', (e) => {
      deleteList(getSelectedListId());
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
      console.log('clicked');
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
        appendTodosToView(getSelectedListId(), e.target.innerText);
      });
    });
  }

  animateSection(section);
}

function animateSection(section) {
  if (section.classList.contains('animate__bounceInUp')) {
    section.classList.remove('animate__animated', 'animate__bounceInUp');
    section.classList.add('animate__animated', 'animate__bounceInUp');
  } else {
    section.classList.add('animate__animated');
    section.classList.add('animate__bounceInUp');
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

  listNameElement.innerText = getSelectedListName();
  listIdElement.innerText = '#' + getSelectedListId();
};

const formValidation = () => {
  const userForm = document.querySelector('form');

  let validationResult = true;

  for (let formField = 0; formField < userForm.length - 2; formField++) {
    const input = userForm[formField];
    const errorMessage = userForm.querySelector(`.${input.name}-error-message`);

    console.log('Not null = ' + errorMessage !== null);
    console.log('Not undefined = ' + errorMessage !== undefined);
    console.log(errorMessage);

    if (errorMessage !== null || errorMessage !== undefined) {
      console.log(errorMessage);
      errorMessage.classList.remove('error-identified');
    }

    if (input.getAttribute('type') == 'text' || input.getAttribute('type') == 'password' || input.getAttribute('type') == 'email') {
      if (input.value === '' || input.value === null) {
        displayFormError(userForm[formField], 'This field cannot be empty!');
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
  console.log('user is registered!');
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
  if (formValidation) {
    getUserObj = registeredUsers.find((user) => username.value === user.email);

    if (getUserObj) {
      if (getUserObj.email === username.value && getUserObj.password === password.value) {
        currentUser = getUserObj.email;
        console.log('user is Logged in!');
        location.hash = '#dashboard';
        loggedInState(getUserObj);
      } else {
        displayFormError(username, 'Username Not Found');
      }
    }
  } else {
    displayFormError();
  }
};

const loggedInState = (userObj) => {
  menu.style.visibility = 'visible';
  logoutBtn.style.visibility = 'visible';
  settingsBtn.style.visibility = 'visible';

  appendListsToView();

  setTimeout(() => {
    const welcomeMsg = document.querySelector('.welcome-message');
    welcomeMsg.innerText = `Welcome to your dashboard, ${getUserObj.firstName} \n ADD or SELECT lists to get started!`;
  }, 200);
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
  }, 100);
};

function generateUniqueID() {
  const uniqueId = Date.now().toString();
  return uniqueId;
}

function createListObj(listName) {
  return {
    id: generateUniqueID(),
    submitBy: getUserObj.email,
    name: '#' + listName,
    todos: [],
  };
}

const appendListsToView = () => {
  // Reset all LI elements containing Lists.
  clearElementsFromView(listItems);

  const getUserLists = lists.filter((listItem) => listItem.submitBy === getUserObj.email);

  //Append all lists to view
  if (getUserLists) {
    for (listIndex = 0; listIndex < getUserLists.length; listIndex++) {
      const generatedDivcontainer = document.createElement('div');
      const generatedLiElement = document.createElement('li');

      generatedDivcontainer.classList.add('list-item-container');
      listItems.appendChild(generatedDivcontainer);

      generatedLiElement.id = getUserLists[listIndex].id;
      generatedDivcontainer.id = getUserLists[listIndex].id;
      generatedLiElement.classList.add('list-item');
      generatedLiElement.innerText = getUserLists[listIndex].name;
      generatedDivcontainer.appendChild(generatedLiElement);
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
  const newTodo = document.getElementById('todo').value;

  const findMatchingListId = lists.find((list) => list.id === currentSelectedList.toString());

  findMatchingListId.todos.push({ id: generateUniqueID(), todoItem: newTodo, completed: false });
  localStorage.setItem('lists', JSON.stringify(lists));
  appendTodosToView(currentSelectedList, 'All');
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
      const generatedDivcontainer = document.createElement('div');
      const generatedInputElement = document.createElement('input');
      const generatedCheckboxElement = document.createElement('label');
      const generatedLiElement = document.createElement('li');
      const generatedTrashIcon = document.createElement('i');

      generatedDivcontainer.classList.add('todo-item-container');
      generatedDivcontainer.id = todo.id;
      todoItems.appendChild(generatedDivcontainer);

      generatedInputElement.setAttribute('type', 'checkbox');
      generatedInputElement.setAttribute('name', 'check');
      generatedInputElement.id = `checkbox-${todo.id}`;
      generatedInputElement.setAttribute('hidden', 'hidden');
      generatedDivcontainer.appendChild(generatedInputElement);

      generatedCheckboxElement.classList.add('custom-checkbox');
      generatedCheckboxElement.setAttribute('for', `checkbox-${todo.id}`);
      generatedDivcontainer.appendChild(generatedCheckboxElement);

      if (todoItem.completed) {
        generatedInputElement.checked = true;
        generatedLiElement.style.textDecoration = 'line-through';
        generatedDivcontainer.style.opacity = 0.6;
      }

      generatedLiElement.id = todo.id;
      generatedLiElement.classList.add('todo-item');
      generatedLiElement.innerText = todo.todoItem;
      generatedDivcontainer.appendChild(generatedLiElement);

      generatedTrashIcon.classList.add('btnTrash', 'fas', 'fa-trash');
      generatedDivcontainer.appendChild(generatedTrashIcon);

      generatedTrashIcon.addEventListener('click', (event) => {
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
    section.innerHTML = 'section deleted!';
  }

  selectList(listItems.firstChild.id, listItems.firstChild.firstChild.innerText);
  getSelectedListInfo();
  appendTodosToView(listItems.firstChild.id, 'All');
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
  console.log(newListName);
  const findList = lists.find((list) => list.id === listId);
  const listIndex = lists.indexOf(findList);

  if (findList) {
    lists[listIndex].name = newListName;
    localStorage.setItem('lists', JSON.stringify(lists));
  }

  appendListsToView();
};

function animateDeletedTodo(deletedTodoId) {
  const deletedTodoDiv = document.getElementById(deletedTodoId);
  deletedTodoDiv.classList.add('animate__animated', 'animate__bounceOutRight');
}

form[0].addEventListener('submit', (event) => {
  event.preventDefault();
  loginUser(username, password);
});

window.addEventListener('hashchange', () => {
  const clickedlink = location.hash.substr(1);
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
  console.log('user logged out!');
});

signupBtn.addEventListener('click', (event) => {
  console.log('clicked');
  location.hash = '#signup';
});

const loadUserData = (inputFields) => {
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
  });

  switch (filter) {
    case 'All':
      filteredTodos = todos;
      filters[0].classList.add('filter-selected');
      break;

    case 'Incomplete':
      filteredTodos = todos.filter((todo) => {
        return todo.completed == false;
      });
      filters[1].classList.add('filter-selected');
      break;

    case 'Completed':
      filteredTodos = todos.filter((todo) => {
        return todo.completed == true;
      });
      filters[2].classList.add('filter-selected');
      break;
  }
  return filteredTodos.reverse();
};
