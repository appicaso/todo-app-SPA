const loginBtn = document.querySelector(".loginbtn");
const signupBtn = document.querySelector(".signupbtn");
const form = document.getElementsByTagName("form");
const listContainer = document.querySelector(".lists");
const listItems = document.querySelector(".list-items");
const lists = JSON.parse(localStorage.getItem("lists")) || [];
const registeredUsers = JSON.parse(localStorage.getItem("users")) || [];

async function fetchHtml(url) {
  return await (await fetch(url)).text();
}

async function loadNewContent(clickedlink) {
  const content = document.querySelector(".main-content");

  content.innerHTML = await fetchHtml(clickedlink + ".html");

  if (location.hash === "#signup") {
    form[0].addEventListener("submit", (event) => {
      event.preventDefault();
      if (formValidation()) {
        registerUser();
      }
    });
  }

  if (location.hash === "#login") {
    form[0].addEventListener("submit", (event) => {
      event.preventDefault();
      loginUser(username, password);
    });
  }

  if (location.hash === "#dashboard") {
    loggedInState();
  }

  if (location.hash === "#lists") {
    form[0].addEventListener("submit", (event) => {
      event.preventDefault();
      createNewList();
      location.hash = "todo";
    });
  }

  if (location.hash === "#todo") {
    form[0].addEventListener("submit", (event) => {
      event.preventDefault();
      createNewTodo();
    });
  }
}

listContainer.addEventListener("click", (e) => {
  const clickedList = e.target.id;

  if (e.target.tagName.toLowerCase() === "li") {
    selectList(clickedList);
    renderListView(clickedList);
  }
});

const formValidation = () => {
  const userForm = Array.from(form[0]);
  const errorMessage = [];

  userForm.forEach((formfield) => {
    if (
      formfield.getAttribute("type") == "text" ||
      formfield.getAttribute("type") == "password" ||
      formfield.getAttribute("type") == "email"
    ) {
      if (formfield.innerText == "") {
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
  const errorMessageContainer = document.querySelector(".error");
  errorMessage.forEach((error) => {
    errorMessageContainer.innerText += error;
    errorMessageContainer.classList.add("show");
  });
};

const registerUser = () => {
  const inputFields = document.getElementsByTagName("input");
  const newUser = createNewUser(inputFields);

  registeredUsers.push(newUser);
  localStorage.setItem("users", JSON.stringify(registeredUsers));
  console.log("user is registered!");
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
  const findUser = registeredUsers.find(
    (user) => username.value === user.email
  );

  if (
    findUser.email === username.value &&
    findUser.password === password.value
  ) {
    console.log("user is Logged in!");
    location.hash = "#dashboard";
    loggedInState();
  } else {
    displayFormError();
  }
};

const loggedInState = () => {
  appendListsToView();
  const welcomeMsg = document.querySelector(".welcome-message");
  welcomeMsg.innerText = `Welcome to your dashboard, ${
    JSON.parse(localStorage.getItem("users")).firstName
  } \n Add or Select new todo's to get started!`;
};

const createNewList = () => {
  const newListName = document.getElementById("list").value;
  const newListObj = createListObj(newListName);

  lists.push(newListObj);
  localStorage.setItem("lists", JSON.stringify(lists));
  appendListsToView();
  selectList(newListObj.id);
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
    const generatedDivcontainer = document.createElement("div");
    const generatedLiElement = document.createElement("li");

    generatedDivcontainer.classList.add("list-item-container");
    listItems.appendChild(generatedDivcontainer);

    generatedLiElement.id = list.id;
    generatedLiElement.classList.add("list-item");
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
  const relatedListId = JSON.parse(localStorage.getItem("selected.listID"));
  const newTodo = document.getElementById("todo").value;

  const findMatchingId = lists.find(
    (list) => list.id === relatedListId.toString()
  );

  findMatchingId.todos.push({ id: generateUniqueID(), todoItem: newTodo });
  localStorage.setItem("lists", JSON.stringify(lists));
  appendTodosToView(relatedListId);
};

function selectList(selectedListId) {
  const selectedListElement = document.getElementById(selectedListId);
  selectedListElement.classList.add("selected");
  localStorage.setItem("selected.listID", selectedListId);
}

function renderListView(listID) {
  location.hash = "todo";
  appendTodosToView(listID);
}

const appendTodosToView = (listID) => {
  const todoItems = document.querySelector(".todo-items");

  // Reset all LI elements containing Lists.
  clearElementsFromView(todoItems);

  const findMatchingTodoId = lists.find(
    (list) => list.id === listID.toString()
  );

  //Append all lists to view
  findMatchingTodoId.todos.forEach((todo) => {
    const generatedLiElement = document.createElement("li");
    generatedLiElement.id = todo.id;
    generatedLiElement.classList.add("todo-item");
    generatedLiElement.innerText = todo.todoItem;
    todoItems.appendChild(generatedLiElement);
  });
};

// Event listeners
window.addEventListener("hashchange", () => {
  const clickedlink = location.hash.substr(1);
  loadNewContent(clickedlink);
});

//DO ON LOAD
appendListsToView();
