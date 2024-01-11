import {
    $addButton,
    $todoInput,
    $todoList,
    $errorMessageElement,
    $searchInput,
    $allTodoButton,
    $completeTodoButton,
    $incompleteTodoButton,
    $loadMoreButton,
} from "./element.js";
import {
    sanitizeInput,
    clearInputField,
    showErrorMessage,
    showCompletedTodo,
    addCommonClassesToButton,
} from "./utility.js";

import {
    INCOMPLETE,
    COMPLETE,
    DELETEICON,
    EDITICON,
    DONEICON,
} from "./const.js";

let todos = [];

let filterState = "all";

let endIndex = 9;
const todosNeedToBeLoaded = 6;
let currentPage = 1;
let totalPage = 1;

const addTodoHandler = () => {
    const todoTitle = sanitizeInput($todoInput.value).trim();
    if (!todoTitle.length) {
        showErrorMessage(
            "You can not add a todo item without any title. Please add a title"
        );
        return;
    }

    $errorMessageElement.classList.add("hide");
    todos.unshift({
        id: new Date().getTime(),
        title: todoTitle,
        isEditing: false,
        isCompleted: false,
    });
    clearInputField($todoInput);

    clearInputField($searchInput);
    renderTodos();
};

const deleteTodoHandler = (todoId) => {
    todos = todos.filter((todo) => todo.id !== todoId);
    clearInputField($searchInput);
    renderTodos();
};

const editTodoHandler = (
    editButton,
    inputElement,
    paragraphElement,
    cancelButton,
    deleteButton,
    editIcon,
    todo
) => {
    if (!todo.isEditing) {
        editButton.innerHTML = "Save";
        inputElement.value = todo.title;
        todo.isEditing = true;
    } else if (todo.isEditing && !inputElement.value) {
        showErrorMessage(
            "You can not update an todo without any title. Please add a title"
        );

        return;
    } else {
        $errorMessageElement.classList.add("hide");
        editButton.innerText = "";
        editButton.appendChild(editIcon);
        paragraphElement.textContent = inputElement.value;
        todo.title = inputElement.value;
        todo.isEditing = false;
    }

    editButton.classList.toggle("button-secondary");
    deleteButton.classList.toggle("hide");
    inputElement.classList.toggle("hide");
    cancelButton.classList.toggle("hide");
    paragraphElement.classList.toggle("hide");

    clearInputField($searchInput);
};

const cancelEditingTodoHandler = (
    cancelButton,
    inputElement,
    paragraphElement,
    editButton,
    deleteButton,
    editIcon,
    todo
) => {
    inputElement.classList.add("hide");
    cancelButton.classList.add("hide");
    paragraphElement.classList.remove("hide");
    deleteButton.classList.remove("hide");
    $errorMessageElement.classList.add("hide");

    editButton.classList.toggle("button-secondary");
    editButton.innerText = "";
    editButton.appendChild(editIcon);
    todo.isEditing = false;
};

const markDoneTodoHandler = (
    e,
    paragraphElement,
    editButton,
    inputElement,
    cancelButton,
    todo
) => {
    if (!inputElement.value.trim()) {
        showErrorMessage(
            "You can not make done a todo without any title. Please add a title"
        );
        return;
    }
    if (paragraphElement.classList.contains("hide")) {
        paragraphElement.innerText = sanitizeInput(inputElement.value).trim();
        paragraphElement.classList.remove("hide");
        $errorMessageElement.classList.add("hide");
    }

    inputElement.classList.add("hide");
    cancelButton.classList.add("hide");

    showCompletedTodo(paragraphElement, editButton, e.target);
    clearInputField($searchInput);

    todo.title = sanitizeInput(inputElement.value).trim();
    todo.isCompleted = true;
    renderTodos();
};

const searchHandler = () => {
    const searchedValue = $searchInput.value.toLowerCase().trim();

    if (searchedValue === "") {
        return todos;
    }
    return todos.filter((todo) => {
        return todo.title.toLowerCase().includes(searchedValue);
    });
};

const setFilter = (stateValue) => {
    filterState = stateValue;
    renderTodos();
};

const filterHandler = (tobeFilteredArray) => {
    switch (filterState) {
        case INCOMPLETE:
            return tobeFilteredArray.filter((todo) => !todo.isCompleted);

        case COMPLETE:
            return tobeFilteredArray.filter((todo) => todo.isCompleted);

        default:
            return tobeFilteredArray;
    }
};

const paginationHandler = () => {
    if (currentPage < totalPage) {
        endIndex += todosNeedToBeLoaded;
        currentPage++;
    } else {
        currentPage = 1;
        endIndex = 9;
    }
    renderTodos();
};

const getPaginatedArray = (toBePaginatedArray) => {
    const startIndex = 0;
    totalPage = Math.round(
        (toBePaginatedArray.length - 1) / todosNeedToBeLoaded
    );

    if (totalPage > 1) {
        $loadMoreButton.classList.remove("hide");
    } else {
        $loadMoreButton.classList.add("hide");
    }
    $loadMoreButton.textContent =
        currentPage < totalPage ? "Load More" : "Show Less";

    return toBePaginatedArray?.slice(startIndex, endIndex);
};

const createTodoElement = (todo) => {
    const $todo = document.createElement("div");
    const $paragraphElement = document.createElement("h3");
    const $buttonWrapper = document.createElement("div");
    const $deleteButton = document.createElement("button");
    const $editButton = document.createElement("button");
    const $inputElement = document.createElement("input");
    const $cancelButton = document.createElement("button");
    const $doneButton = document.createElement("button");
    const $doneIcon = document.createElement("img");
    const $deleteIcon = document.createElement("img");
    const $editIcon = document.createElement("img");
    const $cancelIcon = document.createElement("img");

    $buttonWrapper.classList.add("flex", "task__button-wrapper");
    addCommonClassesToButton($deleteButton);
    addCommonClassesToButton($editButton);
    addCommonClassesToButton($doneButton);
    addCommonClassesToButton($cancelButton);

    $todo.classList.add("task");
    $paragraphElement.classList.add("task__title");

    $paragraphElement.innerText = todo.title;
    $inputElement.value = todo.title;

    $deleteIcon.src = DELETEICON;
    $deleteButton.appendChild($deleteIcon);

    $editIcon.src = EDITICON;
    $editButton.appendChild($editIcon);

    $doneIcon.src = DONEICON;
    $doneButton.appendChild($doneIcon);

    $cancelIcon.src = DELETEICON;
    $cancelButton.appendChild($cancelIcon);

    // $cancelButton.innerText = "Cancel";

    $cancelButton.classList.add("hide");
    $inputElement.classList.add("hide");

    if (todo.isCompleted) {
        showCompletedTodo($paragraphElement, $editButton, $doneButton);
    }

    $deleteButton.addEventListener("click", () => deleteTodoHandler(todo.id));

    $editButton.addEventListener("click", (e) =>
        editTodoHandler(
            $editButton,
            $inputElement,
            $paragraphElement,
            $cancelButton,
            $deleteButton,
            $editIcon,
            todo
        )
    );

    $cancelButton.addEventListener("click", (e) =>
        cancelEditingTodoHandler(
            $cancelButton,
            $inputElement,
            $paragraphElement,
            $editButton,
            $deleteButton,
            $editIcon,
            todo
        )
    );

    $doneButton.addEventListener("click", (e) =>
        markDoneTodoHandler(
            e,
            $paragraphElement,
            $editButton,
            $inputElement,
            $cancelButton,
            todo
        )
    );

    $buttonWrapper.append(
        $editButton,
        $doneButton,
        $deleteButton,
        $cancelButton
    );
    $todo.append($paragraphElement, $inputElement, $buttonWrapper);

    return $todo;
};

const renderTodos = () => {
    $todoList.innerHTML = "";

    const searchedTodos = searchHandler();
    const filteredTodos = filterHandler(searchedTodos);

    const paginatedTodos = getPaginatedArray(filteredTodos);

    paginatedTodos.forEach((todo) => {
        $todoList.appendChild(createTodoElement(todo));
    });
};

$addButton.addEventListener("click", addTodoHandler);
$searchInput.addEventListener("input", () => renderTodos());
$allTodoButton.addEventListener("click", () => setFilter("all"));
$incompleteTodoButton.addEventListener("click", () => setFilter("incomplete"));
$completeTodoButton.addEventListener("click", () => setFilter("complete"));
$loadMoreButton.addEventListener("click", paginationHandler);