// Query selectors for buttons
let optionsButtons = document.querySelectorAll(".option-button");
let advancedOptionButton = document.querySelectorAll(".adv-option-button");
let fontName = document.getElementById("fontName");
let fontSizeRef = document.getElementById("fontSize");
let writingArea = document.getElementById("text-input");
let linkButton = document.getElementById("createLink");
let alignButtons = document.querySelectorAll(".align");
let spacingButtons = document.querySelectorAll(".spacing");
let formatButtons = document.querySelectorAll(".format");
let scriptButtons = document.querySelectorAll(".script");

// Tooltips mapping for all buttons
const tooltips = {
  bold: "Bold",
  italic: "Italic",
  underline: "Underline",
  strikethrough: "Strikethrough",
  superscript: "Superscript",
  subscript: "Subscript",
  insertOrderedList: "Ordered List",
  insertUnorderedList: "Unordered List",
  undo: "Undo",
  redo: "Redo",
  createLink: "Insert Link",
  unlink: "Remove Link",
  justifyLeft: "Align Left",
  justifyCenter: "Align Center",
  justifyRight: "Align Right",
  justifyFull: "Justify Text",
  indent: "Indent",
  outdent: "Outdent",
  insertImage: "Insert Image",
  formatBlock: "Change Heading",
  fontName: "Change Font",
  fontSize: "Change Font Size",
  foreColor: "Font Color",
  backColor: "Highlight Color",
};

// Add tooltips to all matching elements
document
  .querySelectorAll(".option-button, .adv-option-button")
  .forEach((element) => {
    const elementId = element.id;
    if (tooltips[elementId]) {
      element.setAttribute("title", tooltips[elementId]);
    }
  });

// Add tooltips to static labels (e.g., Font Color, Highlight Color)
document.querySelectorAll(".input-wrapper label").forEach((label) => {
  const inputId = label.getAttribute("for");
  if (tooltips[inputId]) {
    label.setAttribute("title", tooltips[inputId]);
  }
});

// Ensure the writing area is contenteditable
writingArea.contentEditable = true;

// List of font names
let fontList = [
  "Arial",
  "Verdana",
  "Times New Roman",
  "Garamond",
  "Georgia",
  "Courier New",
  "cursive",
];

// Initializer for setting up the font list and size options
const initializer = () => {
  highlighter(alignButtons, true);
  highlighter(spacingButtons, true);
  highlighter(formatButtons, false);
  highlighter(scriptButtons, true);

  // Adding font names
  fontList.forEach((value) => {
    let option = document.createElement("option");
    option.value = value;
    option.innerHTML = value;
    fontName.appendChild(option);
  });

  // Adding font size options from 1px to 100px
  for (let i = 1; i <= 100; i++) {
    let option = document.createElement("option");
    option.value = `${i}px`; // Font sizes in pixels
    option.innerHTML = `${i}px`;
    fontSizeRef.appendChild(option);
  }

  fontSizeRef.value = "12px"; // Default font size
};

// Main logic for applying text modifications
const modifyText = (command, value) => {
  if (command === "fontName" || command === "fontSize") {
    applyFontSize(value); // Call font size logic
  } else {
    document.execCommand(command, false, value);
  }
};

// Apply Font Size Directly in Pixels
const applyFontSize = (size) => {
  const selection = window.getSelection();
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);

    // If text is selected, wrap it in a <span> with the new font size
    if (!range.collapsed) {
      const span = document.createElement("span");
      span.style.fontSize = size;
      range.surroundContents(span);
    }
  }
};

// Basic operations which don't need a value parameter
optionsButtons.forEach((button) => {
  button.addEventListener("click", () => {
    modifyText(button.id, null);
  });
});

// Options that require a value parameter (e.g., fonts, colors, font sizes)
advancedOptionButton.forEach((button) => {
  button.addEventListener("change", () => {
    modifyText(button.id, button.value);
  });
});

// Specifically handle font size changes
fontSizeRef.addEventListener("change", () => {
  const selectedFontSize = fontSizeRef.value;
  applyFontSize(selectedFontSize);
});

// Link creation logic
linkButton.addEventListener("click", () => {
  let userLink = prompt("Enter a URL");
  if (/http/i.test(userLink)) {
    modifyText("createLink", userLink);
  } else {
    userLink = "http://" + userLink;
    modifyText("createLink", userLink);
  }
});

// Highlight clicked button and toggle the 'active' class
const highlighter = (className, needsRemoval) => {
  className.forEach((button) =>
    button.addEventListener("click", () => {
      if (needsRemoval) {
        let alreadyActive = false;

        if (button.classList.contains("active")) {
          alreadyActive = true;
        }

        highlighterRemover(className);
        if (!alreadyActive) {
          button.classList.add("active");
        }
      } else {
        button.classList.toggle("active");
      }
    })
  );
};

// Remove active class from buttons
const highlighterRemover = (className) => {
  className.forEach((button) => {
    button.classList.remove("active");
  });
};

// Image Insertion Logic
document.addEventListener("DOMContentLoaded", () => {
  const insertImageBtn = document.getElementById("insertImage");
  const imageInput = document.createElement("input");
  imageInput.type = "file";
  imageInput.accept = "image/*";
  imageInput.style.display = "none";

  document.body.appendChild(imageInput);

  insertImageBtn.addEventListener("click", () => {
    imageInput.click();
  });

  imageInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        insertImageAtCursor(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  });
});

// Function to insert image at cursor position
function insertImageAtCursor(imageSource) {
  writingArea.focus();

  const imageWrapper = document.createElement("div");
  imageWrapper.classList.add("image-wrapper");

  const img = document.createElement("img");
  img.src = imageSource;
  img.style.maxWidth = "100%";
  img.style.height = "auto";

  imageWrapper.appendChild(img);
  imageWrapper.style.width = "300px";
  imageWrapper.style.height = "auto";

  const selection = window.getSelection();
  const range = selection.getRangeAt(0);
  range.insertNode(imageWrapper);

  const textNode = document.createTextNode("\u200B");
  imageWrapper.parentNode.insertBefore(textNode, imageWrapper.nextSibling);

  range.setStartAfter(textNode);
  range.setEndAfter(textNode);
  selection.removeAllRanges();
  selection.addRange(range);

  writingArea.focus();
}

// Initialize
window.onload = initializer;
