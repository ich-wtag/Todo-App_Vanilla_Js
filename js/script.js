import {
    $addButton,
    $todoInput,
    $todoList,
    $searchInput,
    $allTodoButton,
    $completeTodoButton,
    $incompleteTodoButton,
    $loadMoreButton,
    $searchButton,
    $createButton,
    $inputWrapper,
    $clearButton,
    $filterButtonWrapper,
} from "./element.js";
import {
    sanitizeInput,
    clearInputField,
    showToastMessage,
    showCompletedTodo,
    addButtonClasses,
    showCompletedTime,
    showFormattedDate,
    activateFilterButton,
    showBlankTaskWrapper,
    showActiveFilterButton,
    showEditedTitle,
} from "./utility.js";

import {
    INCOMPLETE,
    COMPLETE,
    PAGE_LOAD_COUNT,
    INITAIL_PAGE,
    DELETEICON,
    EDITICON,
    DONEICON,
    PLUSICON,
    ALL,
    ERROR,
    SUCCESS,
} from "./const.js";

let todos = [];

let filterState = ALL;

const pageLoadCount = PAGE_LOAD_COUNT;
let currentPage = INITAIL_PAGE;
let totalPage = INITAIL_PAGE;

const showInputWrapper = () => {
    if ($inputWrapper.classList.contains("hide")) {
        $createButton.innerText = "Hide";
    } else {
        $createButton.innerHTML = `${PLUSICON} Create`;
    }
    $inputWrapper.classList.toggle("hide");
    renderTodos();
};

const addTodoHandler = () => {
    const todoTitle = sanitizeInput($todoInput.value).trim();
    if (!todoTitle.length) {
        showToastMessage(ERROR, "You can not add a todo item without a title.");
        return;
    }

    todos.unshift({
        id: new Date().getTime(),
        title: todoTitle,
        createdAt: new Date().toUTCString(),
        isEditing: false,
        isCompleted: false,
    });
    clearInputField($todoInput);

    clearInputField($searchInput);

    showToastMessage(SUCCESS, "You have successfully added a todo item");
    renderTodos();
};

const deleteTodoHandler = (todoId) => {
    todos = todos.filter((todo) => todo.id !== todoId);
    clearInputField($searchInput);

    showToastMessage(ERROR, "You have successfully deleted a todo item");
    renderTodos();
};

const editTodoHandler = (
    editButton,
    inputElement,
    headingElement,
    paragraphElement,
    cancelButton,
    deleteButton,
    todo
) => {
    if (!todo.isEditing) {
        editButton.innerHTML = "Save";
        inputElement.value = todo.title;
        todo.isEditing = true;
    } else if (todo.isEditing && !inputElement.value) {
        showToastMessage(
            ERROR,
            "You can not update a todo without any title. Please add a title"
        );

        return;
    } else {
        editButton.innerHTML = EDITICON;
        headingElement.textContent = inputElement.value;
        todo.title = inputElement.value;
        todo.isEditing = false;

        showToastMessage(SUCCESS, " You have successfully updated a todo item");
    }

    showEditedTitle(
        editButton,
        deleteButton,
        inputElement,
        cancelButton,
        paragraphElement,
        headingElement
    );

    clearInputField($searchInput);
};

const cancelEditingTodoHandler = (
    cancelButton,
    inputElement,
    headingElement,
    paragraphElement,
    editButton,
    deleteButton,
    todo
) => {
    showEditedTitle(
        editButton,
        deleteButton,
        inputElement,
        cancelButton,
        paragraphElement,
        headingElement
    );

    showToastMessage(SUCCESS, "You have successfully updated a todo item");

    editButton.innerHTML = EDITICON;
    todo.isEditing = false;
};

const markDoneTodoHandler = (inputElement, todo) => {
    if (!inputElement.value.trim()) {
        showToastMessage(
            ERROR,
            "You can not make done a todo without any title"
        );
        return;
    }

    clearInputField($searchInput);

    showToastMessage(SUCCESS, "You have successfully completed a todo item");

    todo.title = sanitizeInput(inputElement.value).trim();
    todo.isCompleted = true;
    todo.completedAt = showCompletedTime(todo.createdAt);
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

const toggleSearchBar = () => {
    $searchInput.classList.toggle("hide");
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
        currentPage++;
    } else {
        currentPage = INITAIL_PAGE;
    }
    renderTodos();
};

const getPaginatedArray = (todos) => {
    const startIndex = 0;
    const endIndex = $inputWrapper.classList.contains("hide")
        ? currentPage * pageLoadCount
        : currentPage * pageLoadCount - 1;

    const pageAdjustmentCount = $inputWrapper.classList.contains("hide")
        ? INITAIL_PAGE
        : 0;

    totalPage =
        INITAIL_PAGE +
        Math.floor((todos.length - pageAdjustmentCount) / pageLoadCount);

    if (totalPage > 1) {
        $loadMoreButton.classList.remove("hide");
    } else {
        $loadMoreButton.classList.add("hide");
    }
    $loadMoreButton.textContent =
        currentPage < totalPage ? "Load More" : "Show Less";

    return todos?.slice(startIndex, endIndex);
};

const createTodoElement = (todo) => {
    const $todo = document.createElement("div");
    const $headingElement = document.createElement("h3");
    const $paragraphElement = document.createElement("p");
    const $buttonWrapper = document.createElement("div");
    const $deleteButton = document.createElement("button");
    const $editButton = document.createElement("button");
    const $inputElement = document.createElement("textarea");
    const $cancelButton = document.createElement("button");
    const $doneButton = document.createElement("button");
    const $completdBadgeElement = document.createElement("p");
    const $spanElement = document.createElement("span");

    $buttonWrapper.classList.add("flex", "task__button-wrapper");
    addButtonClasses($deleteButton);
    addButtonClasses($editButton);
    addButtonClasses($doneButton);
    addButtonClasses($cancelButton);

    $todo.classList.add("task");
    $headingElement.classList.add("task__title");
    $paragraphElement.classList.add("task__created-at");
    $inputElement.classList.add("task__input");
    $inputElement.rows = 3;

    $headingElement.innerText = todo.title;
    $paragraphElement.innerText = `Created At : ${showFormattedDate(
        todo.createdAt
    )}`;
    $inputElement.value = todo.title;

    $deleteButton.innerHTML = DELETEICON;

    $editButton.innerHTML = EDITICON;

    $doneButton.innerHTML = DONEICON;

    $cancelButton.innerHTML = DELETEICON;

    $completdBadgeElement.innerHTML = `Completed in ${todo.completedAt}`;
    $spanElement.innerText = todo.completedAt > 1 ? " days" : " day";

    $completdBadgeElement.append($spanElement);

    $completdBadgeElement.classList.add("task__completed-badge", "hide");
    $cancelButton.classList.add("hide");
    $inputElement.classList.add("hide");

    if (todo.isCompleted) {
        showCompletedTodo(
            $headingElement,
            $editButton,
            $doneButton,
            $completdBadgeElement
        );
    }

    $deleteButton.addEventListener("click", () => deleteTodoHandler(todo.id));

    $editButton.addEventListener("click", () =>
        editTodoHandler(
            $editButton,
            $inputElement,
            $headingElement,
            $paragraphElement,
            $cancelButton,
            $deleteButton,
            todo
        )
    );

    $cancelButton.addEventListener("click", () =>
        cancelEditingTodoHandler(
            $cancelButton,
            $inputElement,
            $headingElement,
            $paragraphElement,
            $editButton,
            $deleteButton,
            todo
        )
    );

    $doneButton.addEventListener("click", (e) =>
        markDoneTodoHandler($inputElement, todo)
    );

    $buttonWrapper.append(
        $editButton,
        $doneButton,
        $deleteButton,
        $cancelButton,
        $completdBadgeElement
    );
    $todo.append(
        $headingElement,
        $paragraphElement,
        $inputElement,
        $buttonWrapper
    );

    return $todo;
};

const renderTodos = () => {
    $todoList.innerHTML = "";

    if (!$inputWrapper.classList.contains("hide")) {
        $todoList.appendChild($inputWrapper);
    }

    const searchedTodos = searchHandler();
    const filteredTodos = filterHandler(searchedTodos);

    const paginatedTodos = getPaginatedArray(filteredTodos);

    showBlankTaskWrapper(paginatedTodos, filterState);

    activateFilterButton(todos, filterState);

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
$searchButton.addEventListener("click", toggleSearchBar);
$createButton.addEventListener("click", showInputWrapper);
$clearButton.addEventListener("click", () => clearInputField($todoInput));
$filterButtonWrapper.addEventListener("click", (e) =>
    showActiveFilterButton(e)
);