const books = [];
const RENDER_EVENT = "render-book";

document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("form");
  submitForm.addEventListener("submit", function (e) {
    e.preventDefault();
    addBook();
    deleteInputValue();
    swal({
      title: "Success!",
      icon: "success",
      text: "Successfully added the book",
      button: false,
      timer: 1000,
    });
  });

  const searchInput = document.getElementById("search-input");
  searchInput.addEventListener("input", function () {
    searchBooks(this.value.trim());
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

function searchBooks(query) {
  const uncompletedBookList = document.getElementById("uncompleted-book-list");
  const completedBookList = document.getElementById("completed-book-list");
  uncompletedBookList.innerHTML = "";
  completedBookList.innerHTML = "";

  const filteredBooks = books.filter(function (book) {
    return book.title.toLowerCase().includes(query.toLowerCase()) || book.author.toLowerCase().includes(query.toLowerCase());
  });

  for (let bookItem of filteredBooks) {
    const bookElement = makeBook(bookItem);
    if (!bookItem.isCompleted) {
      uncompletedBookList.append(bookElement);
    } else {
      completedBookList.append(bookElement);
    }
  }
}

function deleteInputValue() {
  const bookTitle = document.getElementById("title");
  const bookAuthor = document.getElementById("author");
  const bookYear = document.getElementById("year");

  bookTitle.value = "";
  bookAuthor.value = "";
  bookYear.value = "";
}

function addBook() {
  const bookTitle = document.getElementById("title").value;
  const bookAuthor = document.getElementById("author").value;
  const bookYear = document.getElementById("year").value;
  const bookIscompletedCheckbox = document.getElementById("iscompletedCheck").checked;
  const iscompletedCheck = bookIscompletedCheckbox ? true : false;

  const generatedID = generateId();
  const bookObject = generateBookObject(generatedID, bookTitle, bookAuthor, bookYear, iscompletedCheck);
  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isCompleted) {
  return {
    id,
    title,
    author,
    year,
    isCompleted,
  };
}

function makeBook(bookObject) {
  const textTitle = document.createElement("h5");
  textTitle.innerText = bookObject.title;
  textTitle.classList.add("card-title");

  const textYear = document.createElement("h6");
  textYear.innerText = bookObject.year;
  textYear.classList.add("card-subtitle", "text-body-secondary", "mb-2");

  const textAuthor = document.createElement("p");
  textAuthor.innerText = bookObject.author;
  textAuthor.classList.add("card-text");

  const textContainer = document.createElement("div");
  textContainer.classList.add("card-body");
  textContainer.append(textTitle, textYear, textAuthor);

  const cardContainer = document.createElement("div");
  cardContainer.classList.add("card");
  cardContainer.append(textContainer);

  const container = document.createElement("div");
  container.classList.add("col");
  container.append(cardContainer);
  container.setAttribute("id", `book-${bookObject.id}`);

  if (bookObject.isCompleted) {
    const undoButton = document.createElement("i");
    undoButton.classList.add("bi", "bi-arrow-counterclockwise");

    undoButton.addEventListener("click", function () {
      undoBookFromCompleted(bookObject.id);
    });

    textContainer.append(undoButton);
  } else {
    const checkButton = document.createElement("i");
    checkButton.classList.add("bi", "bi-check-circle-fill");

    checkButton.addEventListener("click", function () {
      addBookToCompleted(bookObject.id);
    });

    textContainer.append(checkButton);
  }

  const trashButton = document.createElement("i");
  trashButton.classList.add("bi", "bi-trash3-fill");

  trashButton.addEventListener("click", function () {
    deletePopup(bookObject.id);
  });
  textContainer.append(trashButton);

  return container;
}

function addBookToCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }

  return null;
}

function deletePopup(bookId) {
  swal({
    title: "Are you sure?",
    text: "Once deleted, you will not be able to recover this book!",
    icon: "warning",
    buttons: true,
    dangerMode: true,
  }).then((willDelete) => {
    if (willDelete) {
      removeBook(bookId);
      swal("Poof! Your book has been deleted!", {
        icon: "success",
        timer: 1000,
        button: false,
      });
    } else {
      swal("Your book is safe!", {
        timer: 1000,
        button: false,
      });
    }
  });
}

function removeBook(bookId) {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget == null) return;

  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }

  return -1;
}

function undoBookFromCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isCompleted = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

const yearInput = document.getElementById("year");
yearInput.addEventListener("input", function () {
  if (yearInput.value.length >= 4) {
    yearInput.value = yearInput.value.slice(0, 4);
  }
});

document.addEventListener(RENDER_EVENT, function () {
  const uncompletedBookList = document.getElementById("uncompleted-book-list");
  uncompletedBookList.innerHTML = "";

  const completedBookList = document.getElementById("completed-book-list");
  completedBookList.innerHTML = "";

  for (let bookItem of books) {
    const bookElement = makeBook(bookItem);
    if (!bookItem.isCompleted) {
      uncompletedBookList.append(bookElement);
    } else {
      completedBookList.append(bookElement);
    }
  }
});

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(RENDER_EVENT));
  }
}

const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "BOOKSHELF-APP";

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("browser kamu tidak mendukung lokal storage");
    return false;
  }
  return true;
}

document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (let book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}
