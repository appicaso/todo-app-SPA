const loginBtn = document.querySelector('.loginbtn');
const signupBtn = document.querySelector('.signupbtn');
const form = document.getElementsByTagName('form');
const listContainer = document.querySelector('.lists');
const listItems = document.querySelector('.list-items');
const listItem = document.querySelector('.list-item');
const lists = JSON.parse(localStorage.getItem('lists')) || [];
const registeredUsers = JSON.parse(localStorage.getItem('users')) || [];
const section = document.querySelector('.section');

async function fetchHtml(url) {
  return await (await fetch(url)).text();
}

async function loadNewContent(clickedlink) {
  const content = document.querySelector('.main-content');
  content.innerHTML = await fetchHtml(clickedlink + '.html');

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
    form[0].addEventListener('submit', (event) => {
      event.preventDefault();
      createNewTodo();
    });
  }

  animateSection(section);
}

function animateSection(section) {
  if (section.classList.contains('animate__fadeInLeftBig')) {
    section.classList.remove('animate__animated');
    section.classList.remove('animate__bounceInUp');
    section.classList.add('animate__animated');
    section.classList.add('animate__bounceInUp');
  } else {
    section.classList.add('animate__animated');
    section.classList.add('animate__bounceInUp');
  }
}

listContainer.addEventListener('click', (e) => {
  const clickedListId = e.target.id;
  const clickedListName = e.target.innerText;

  if (e.target.tagName.toLowerCase() === 'div' || e.target.tagName.toLowerCase() === 'li') {
    location.hash = 'todo';
    selectList(clickedListId, clickedListName);
    setTimeout(() => {
      appendTodosToView(clickedListId);
      getSelectedListInfo();
    }, 100);
  }
});

const getSelectedListInfo = () => {
  const selectedListName = localStorage.getItem('selected.listName');
  const selectedListID = localStorage.getItem('selected.listID');
  const listNameElement = document.querySelector('.list-name');
  const listIdElement = document.querySelector('.list-id');

  listNameElement.innerText = selectedListName;
  listIdElement.innerText = '#' + selectedListID;
};

const formValidation = () => {
  const userForm = Array.from(form[0]);
  const errorMessage = [];

  userForm.forEach((formfield) => {
    if (formfield.getAttribute('type') == 'text' || formfield.getAttribute('type') == 'password' || formfield.getAttribute('type') == 'email') {
      if (formfield.innerText == '') {
        errorMessage.push(`the ${formfield.name} field is empty \n`);
      }
    }
  });

  if (!email.validity.valid) {
    errorMessage.push("impossible that's an e-mail dude! \n");
    displayFormError(errorMessage);
    return false;
  } else {
    return true;
  }
};

const displayFormError = (errorMessage) => {
  const errorMessageContainer = document.querySelector('.error');
  errorMessage.forEach((error) => {
    errorMessageContainer.innerText += error;
    errorMessageContainer.classList.add('show');
  });
};

const registerUser = () => {
  const inputFields = document.getElementsByTagName('input');
  const newUser = createNewUser(inputFields);

  registeredUsers.push(newUser);
  localStorage.setItem('users', JSON.stringify(registeredUsers));
  console.log('user is registered!');
};

function createNewUser(inputFields) {
  return {
    id: generateUniqueID(),
    firstName: inputFields[0].value,
    lastName: inputFields[1].value,
    email: inputFields[2].value,
    password: inputFields[3].value,
    termsAndConditions: false,
  };
}

const loginUser = (username, password) => {
  const findUser = registeredUsers.find((user) => username.value === user.email);

  if (findUser.email === username.value && findUser.password === password.value) {
    console.log('user is Logged in!');
    location.hash = '#dashboard';
    loggedInState();
  } else {
    displayFormError();
  }
};

const loggedInState = () => {
  appendListsToView();
  const welcomeMsg = document.querySelector('.welcome-message');
  welcomeMsg.innerText = `Welcome to your dashboard, ${
    JSON.parse(localStorage.getItem('users')).firstName
  } \n Add or Select new todo's to get started!`;
};

const createNewList = () => {
  const newListName = document.getElementById('list').value;
  const newListObj = createListObj(newListName);

  lists.push(newListObj);
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
  return { id: generateUniqueID(), name: listName, todos: [] };
}

const appendListsToView = () => {
  // Reset all LI elements containing Lists.
  clearElementsFromView(listItems);
  //Append all lists to view
  lists.forEach((list) => {
    const generatedDivcontainer = document.createElement('div');
    const generatedLiElement = document.createElement('li');

    generatedDivcontainer.classList.add('list-item-container');
    listItems.appendChild(generatedDivcontainer);

    generatedLiElement.id = list.id;
    generatedDivcontainer.id = list.id;
    generatedLiElement.classList.add('list-item');
    generatedLiElement.innerText = list.name;
    generatedDivcontainer.appendChild(generatedLiElement);
  });
};

function clearElementsFromView(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

const createNewTodo = () => {
  const relatedListId = JSON.parse(localStorage.getItem('selected.listID'));
  const newTodo = document.getElementById('todo').value;

  const findMatchingId = lists.find((list) => list.id === relatedListId.toString());

  findMatchingId.todos.push({ id: generateUniqueID(), todoItem: newTodo });
  localStorage.setItem('lists', JSON.stringify(lists));
  appendTodosToView(relatedListId);
};

function selectList(selectedListId, selectedListName) {
  const selectedListElement = document.getElementById(selectedListId);
  selectedListElement.classList.add('selected');
  localStorage.setItem('selected.listID', selectedListId);
  localStorage.setItem('selected.listName', selectedListName);
}

const appendTodosToView = (listID) => {
  const todoItems = document.querySelector('.todo-items');

  // Reset all LI elements containing todos.
  if (document.body.contains(todoItems)) {
    clearElementsFromView(todoItems);
  }

  const findMatchingListId = lists.find((list) => list.id === listID.toString());

  //Append all Todos to view
  findMatchingListId.todos.forEach((todo) => {
    const generatedDivcontainer = document.createElement('div');
    const generatedLiElement = document.createElement('li');
    const generatedTrashIcon = document.createElement('i');

    generatedDivcontainer.classList.add('todo-item-container');
    generatedDivcontainer.id = todo.id;
    todoItems.appendChild(generatedDivcontainer);

    generatedLiElement.id = todo.id;
    generatedLiElement.classList.add('todo-item');
    generatedLiElement.innerText = todo.todoItem;
    generatedDivcontainer.appendChild(generatedLiElement);

    generatedTrashIcon.classList.add('fas', 'fa-trash');
    generatedDivcontainer.appendChild(generatedTrashIcon);
  });
};

// Window Event listeners
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

//DO ON LOAD
appendListsToView();
