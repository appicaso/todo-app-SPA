(function () {
  const loginBtn = document.querySelector('.loginbtn');
  const signupBtn = document.querySelector('.signupbtn');
  const form = document.getElementsByTagName('form');
  const listContainer = document.querySelector('.lists');
  const listItems = document.querySelector('.list-items');
  const listItemsArray = Array.from(listItems);
  const listItem = document.querySelector('.list-item');
  const lists = JSON.parse(localStorage.getItem('lists')) || [];
  const registeredUsers = JSON.parse(localStorage.getItem('users')) || [];
  const section = document.querySelector('.section');

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
    const users = JSON.parse(localStorage.getItem('users'));

    welcomeMsg.innerText = `Welcome to your dashboard, ${loggedUser} \n Add or Select new todo's to get started!`;
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
    const trashBtn = document.querySelector('btnTrash');

    // Reset all LI elements containing todos.
    if (document.body.contains(todoItems)) {
      clearElementsFromView(todoItems);
    }

    const findMatchingListId = lists.find((list) => list.id === listID.toString());

    //Append all Todos to view
    findMatchingListId.todos.forEach((todo) => {
      const generatedDivcontainer = document.createElement('div');
      const generatedInputElement = document.createElement('input');
      const generatedLabelElement = document.createElement('label');
      const generatedLiElement = document.createElement('li');
      const generatedTrashIcon = document.createElement('i');

      //   <input type="checkbox" id="check" name="check" hidden />
      //   <label class="custom-checkbox" for="check"></label>

      generatedDivcontainer.classList.add('todo-item-container');
      generatedDivcontainer.id = todo.id;
      todoItems.appendChild(generatedDivcontainer);

      generatedInputElement.setAttribute('type', 'checkbox');
      generatedInputElement.setAttribute('name', 'check');
      generatedInputElement.id = 'check';
      //generatedInputElement.set('hidden', 'hidden');
      generatedDivcontainer.appendChild(generatedInputElement);

      generatedLabelElement.classList.add('custom-checkbox');
      generatedLabelElement.setAttribute('for', 'check');
      generatedDivcontainer.appendChild(generatedLabelElement);

      generatedLiElement.id = todo.id;
      generatedLiElement.classList.add('todo-item');
      generatedLiElement.innerText = todo.todoItem;
      generatedDivcontainer.appendChild(generatedLiElement);

      generatedTrashIcon.classList.add('btnTrash', 'fas', 'fa-trash');
      generatedDivcontainer.appendChild(generatedTrashIcon);

      generatedTrashIcon.addEventListener('click', (event) => {
        deleteTodo(generatedTrashIcon.previousSibling.id);
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

  //DO ON LOAD
  appendListsToView();
})();
