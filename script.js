// Function to apply formatting commands (bold, italic, etc.)
function formatDoc(cmd, value = null) {
  const content = document.querySelector("[contenteditable='true']");

  // Ensure content is focused before applying the command
  content.focus();

  // Apply the formatting command
  if (value) {
    document.execCommand(cmd, false, value);
  } else {
    document.execCommand(cmd);
  }

  // Toggle active state for the button after the command is executed
  toggleActiveState(cmd);
}

// Function to toggle the active state for toolbar buttons
function toggleActiveState(cmd) {
  const button = document.getElementById(cmd);

  // Add or remove the 'active' class based on the current state
  if (document.queryCommandState(cmd)) {
    button.classList.add("active");
  } else {
    button.classList.remove("active");
  }
}

// Function to add a hyperlink
function addLink() {
  const url = prompt("Insert URL");
  if (url) {
    formatDoc("createLink", url);
  }
}

// Handle contenteditable for links
const content = document.querySelector("[contenteditable='true']");

content.addEventListener("mouseenter", function () {
  const links = content.querySelectorAll("a");
  links.forEach((link) => {
    link.addEventListener("mouseenter", () => {
      content.setAttribute("contenteditable", false);
      link.target = "_blank";
    });
    link.addEventListener("mouseleave", () => {
      content.setAttribute("contenteditable", true);
    });
  });
});

// Toggle between code view and editor view
let active = false;
function toggleCodeView() {
  active = !active;
  if (active) {
    content.textContent = content.innerHTML;
    content.setAttribute("contenteditable", false);
  } else {
    content.innerHTML = content.textContent;
    content.setAttribute("contenteditable", true);
  }
}

// Handle file operations (new, save as txt, save as pdf)
function fileHandle(value) {
  const filename = "untitled";
  if (value === "new") {
    content.innerHTML = "";
  } else if (value === "txt") {
    const blob = new Blob([content.innerText], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.txt`;
    link.click();
  } else if (value === "pdf") {
    const options = { filename: `${filename}.pdf` };
    html2pdf().set(options).from(content).save();
  }
}

// Trigger the image upload dialog
function triggerImageUpload() {
  const imageInput = document.getElementById("imageUpload");
  imageInput.click();
}

// Function to insert uploaded images as file URLs
function insertImage(event) {
  const files = event.target.files;

  if (files.length > 0) {
    const file = files[0];

    if (file.type.startsWith("image/")) {
      const fileURL = URL.createObjectURL(file);
      const img = document.createElement("img");
      img.classList.add("resizable");
      img.src = fileURL;
      img.alt = "Uploaded Image";
      img.style.maxWidth = "200px";
      img.style.height = "auto";
      img.style.margin = "8px 0";
      img.style.borderRadius = "4px";

      content.appendChild(img);
    } else {
      alert("Only image files are allowed!");
    }
  }

  event.target.value = ""; // Clear the input field
}

// Add resizing functionality for images
content.addEventListener("mousedown", function (event) {
  const target = event.target;
  if (target.tagName === "IMG" && target.classList.contains("resizable")) {
    const startX = event.clientX;
    const startY = event.clientY;
    const startWidth = target.offsetWidth;
    const startHeight = target.offsetHeight;

    function resizeImage(e) {
      const newWidth = Math.max(startWidth + (e.clientX - startX), 50);
      const newHeight = Math.max(startHeight + (e.clientY - startY), 50);
      target.style.width = `${newWidth}px`;
      target.style.height = `${newHeight}px`;
    }

    function stopResize() {
      document.removeEventListener("mousemove", resizeImage);
      document.removeEventListener("mouseup", stopResize);
    }

    document.addEventListener("mousemove", resizeImage);
    document.addEventListener("mouseup", stopResize);
  }
});

// Change cursor when hovering over resizable images
content.addEventListener("mousemove", function (event) {
  const target = event.target;
  if (target.tagName === "IMG" && target.classList.contains("resizable")) {
    target.style.cursor = "nwse-resize";
  }
});

// Ensure uploaded images are processed correctly when new images are added
document.getElementById("imageUpload").addEventListener("change", insertImage);

// Function to insert a table
function insertTable() {
  const rows = prompt("Enter number of rows:", "2");
  const cols = prompt("Enter number of columns:", "2");

  if (rows && cols) {
    const table = document.createElement("table");
    table.style.width = "100%";
    table.style.border = "1px solid #ddd";
    table.style.borderCollapse = "collapse";

    for (let i = 0; i < rows; i++) {
      const tr = document.createElement("tr");
      for (let j = 0; j < cols; j++) {
        const td = document.createElement("td");
        td.style.border = "1px solid #ddd";
        td.style.padding = "8px";
        td.contentEditable = true;
        tr.appendChild(td);
      }
      table.appendChild(tr);
    }

    content.appendChild(table);
  }
}

// SEARCH BOX
function searchText() {
  const searchQuery = document.getElementById("searchInput").value.trim();
  const content = document.querySelector(".editor-content");

  // Reset previous highlights before applying new ones
  const highlightedText = content.innerHTML.replace(
    /<span class="highlight">(.*?)<\/span>/g,
    "$1"
  );

  if (searchQuery) {
    const regex = new RegExp(`\\b(${searchQuery})\\b`, "gi"); // Case-insensitive search for whole words
    const newContent = highlightedText.replace(
      regex,
      `<span class="highlight">$1</span>`
    );
    content.innerHTML = newContent;
  } else {
    content.innerHTML = highlightedText; // Restore original content if search is empty
  }
}
