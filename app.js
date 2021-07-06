const form = document.getElementsByTagName('form');
const listContainer = document.querySelector('.lists');
const listItems = document.querySelector('.list-items');
const lists = JSON.parse(localStorage.getItem('lists')) || [];
const registeredUsers = JSON.parse(localStorage.getItem('users')) || [];
const section = document.querySelector('.section');
const logoutBtn = document.querySelector('.logout-btn-container');
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
    form[0].addEventListener('submit', (event) => {
      event.preventDefault();
      loginUser(username, password);
    });
  }

  if (location.hash === '#dashboard') {
    loggedInState();
  }

  if (location.hash === '#lists') {
    form[0].addEventListener('submit', (event) => {
      event.preventDefault();
      createNewList();
      location.hash = 'todo';
    });
  }

  if (location.hash === '#todo') {
    const listNameElement = document.querySelector('.list-name');
    const deleteBtn = document.querySelector('.delete-list-btn');
    const renameListBtn = document.querySelector('.rename-list');
    const saveNewListNameBtn = document.querySelector('.save-list-name-btn');

    form[0].addEventListener('submit', (event) => {
      event.preventDefault();
      createNewTodo();
    });

    deleteBtn.addEventListener('click', (e) => {
      deleteList(getSelectedListId());
    });

    renameListBtn.addEventListener('click', (e) => {
      renameList(listNameElement);
      renameListBtn.style.opacity = '10%';
      saveNewListNameBtn.style.visibility = 'visible';
    });

    saveNewListNameBtn.addEventListener('click', (e) => {
      saveRenamedListName(getSelectedListId());
      renameListBtn.style.opacity = '100%';
      saveNewListNameBtn.style.visibility = 'hidden';
    });
  }

  animateSection(section);
}

function animateSection(section) {
  if (section.classList.contains('animate__fadeInLeftBig')) {
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
      appendTodosToView(selectedListId);
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
  //const userForm = Array.from(form[0]);
  const userForm = document.querySelector('form');
  let validationResult = true;

  for (let formField = 0; formField < userForm.length; formField++) {
    const input = userForm[formField];

    if (input.getAttribute('type') == 'text' || input.getAttribute('type') == 'password' || input.getAttribute('type') == 'email') {
      userForm.querySelector(`.${input.name}-error-message`).classList.remove('active');

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

  errorMessageField.classList.add('active');
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
  } else {
    //displayFormError();
  }
};

const loggedInState = (userObj) => {
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
    name: listName,
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
  appendTodosToView(currentSelectedList);
};

function selectList(selectedListId, selectedListName) {
  const selectedListElement = document.getElementById(selectedListId);
  selectedListElement.classList.add('selected');
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
    event.target.nextSibling.style.textDecorationStyle = 'double';
    todoItemContainer.style.opacity = 0.6;
  } else {
    checkedTodoItem.completed = false;
    event.target.nextSibling.style.textDecoration = 'none';
    todoItemContainer.style.opacity = 1;
  }

  localStorage.setItem('lists', JSON.stringify(lists));
};

const appendTodosToView = (listID) => {
  const todoItems = document.querySelector('.todo-items');
  const findMatchingListId = lists.find((list) => list.id === listID.toString());

  // Reset all LI elements containing todos.
  if (document.body.contains(todoItems)) {
    clearElementsFromView(todoItems);
  }

  //Append all Todos to view
  findMatchingListId.todos.forEach((todo) => {
    const todoItem = findMatchingListId.todos.find((todoItem) => todoItem.id === todo.id);
    console.log(todoItem);
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
        appendTodosToView(getSelectedListId());
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
  appendTodosToView(listItems.firstChild.id);
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

window.addEventListener('hashchange', () => {
  const clickedlink = location.hash.substr(1);
  loadNewContent(clickedlink);
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

logoutBtn.addEventListener('click', (e) => {
  location.hash = '#login';
  console.log('user logged out!');
});
