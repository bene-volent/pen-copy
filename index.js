.
// Element Query Selectors
const htmlEditorElement = document.querySelector(".editor[data-type='HTML']");
const cssEditorElement = document.querySelector(".editor[data-type='CSS']");
const jsEditorElement = document.querySelector(".editor[data-type='JS']");
const outputFrame = document.querySelector("#output");



// Options to initialize the Ace Editor
const options = {
	enableBasicAutocompletion: true,
	enableSnippets: true,
	enableLiveAutocompletion: false,
	enableEmmet: true,
	setTheme: "ace/theme/monokai",
};

// Initialize the Ace Editor
const html = ace.edit(htmlEditorElement);
html.getSession().setMode("ace/mode/html");
html.setOptions(options);

const css = ace.edit(cssEditorElement);
css.getSession().setMode("ace/mode/css");
css.setOptions(options);

const js = ace.edit(jsEditorElement);
js.getSession().setMode("ace/mode/javascript");
js.setOptions(options);


// Functions


function downloadHtmlFile() {
	const filename = prompt("Enter the filename for the HTML file with extension:", "index.html");
	if (!filename) {
		showToast("Filename cannot be empty", "error");
		return;
	}

	const title = prompt("Enter the title of the HTML file:", "Web Playground") || "Web Playground";
	const content = `
		  <html>
			<head>
			  <title>${title}</title>
			  <style>${css.getValue()}</style>
			</head>
			<body>
			  ${html.getValue()}
			  <script type="text/javascript">${js.getValue()}<\/script>
			</body>
		  </html>
		`;

	const blob = new Blob([content], { type: "text/html" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	link.style.display = "none";
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}

// Run the code in the output frame
function run() {
	outputFrame.contentDocument.body.innerHTML = `${html.getValue()}<style>${css.getValue()}</style>`;
	outputFrame.contentWindow.eval(js.getValue());
}


// Necessary for the toast notification
let toastTimeoutID = null;

function showToast(message, type = "success") {
	const icon = {
		success: "fa-solid fa-check-circle",
		error: "fa-solid fa-exclamation-circle",
		warning: "fa-solid fa-exclamation-triangle",
		info: "fa-solid fa-info-circle",
	}[type];

	const toast = document.getElementById("toast");

	if (toastTimeoutID) {
		clearTimeout(toastTimeoutID);
		toast.className = toast.className.replace("show", "");
		toast.className = toast.className.replace(`${type}-toast`, "");
	}

	toast.innerHTML = `<i class='${icon}'></i> ` + message;
	toast.className = `toast show ${type}-toast`;



	toastTimeoutID = setTimeout(() => {
		toast.className = toast.className.replace("show", "");
		toast.className = toast.className.replace(`${type}-toast`, "");
	}, 3000);
}


// Save the content to the local storage
function saveToLocalStorage() {
	const jsonContent = {
		html: html.getValue(),
		css: css.getValue(),
		js: js.getValue(),
	};

	localStorage.setItem("codepen-bene", JSON.stringify(jsonContent));
	showToast("Content saved successfully", "success");
}


// Loads the content from the local storage on page load
function loadFromLocalStorage() {
	const content = localStorage.getItem("codepen-bene");
	if (content) {
		const jsonContent = JSON.parse(content);
		if (jsonContent.html || jsonContent.css || jsonContent.js) {
			html.setValue(jsonContent.html);
			css.setValue(jsonContent.css);
			js.setValue(jsonContent.js);
			showToast("Content loaded from previous save...");
			run();
			return;
		}
	}
	showToast("No previous save found...", "warning");
}

function showShortcutsModal() {
	document.getElementById("shortcuts-modal").showModal();
}

function closeShortcutsModal() {
	document.getElementById("shortcuts-modal").close();
}

function closeModalOnClickOutside(event) {
	const modal = document.getElementById("shortcuts-modal");
	if (event.target == modal) {
		modal.close();
	}
}


// Handle keyboard shortcuts for saving and running the code
function handleKeyboardShortcuts(event) {
	if (event.ctrlKey && event.key === "s") {
		event.preventDefault();
		saveToLocalStorage();
	}
	if (event.ctrlKey && event.key === "r") {
		event.preventDefault();
		showToast("Running the code...", "info");
		run();
	}
	if (event.ctrlKey && event.shiftKey && event.key === "S") {
		event.preventDefault();
		downloadHtmlFile();
	}
}

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    saveToLocalStorage();
  }
});

// Event Listeners

// Button Event Listeners
document.querySelector("[data-func='run']").addEventListener("click", run);
document.querySelector("[data-func='save']").addEventListener("click", saveToLocalStorage);
document.querySelector("[data-func='download']").addEventListener("click", downloadHtmlFile);
document.querySelector("[data-func='show-shortcuts']").addEventListener("click", showShortcutsModal);
document.querySelector("[data-func='close-shortcuts']").addEventListener("click", closeShortcutsModal);


// Other Event Listeners
document.addEventListener("keydown", handleKeyboardShortcuts);
document.addEventListener("DOMContentLoaded", loadFromLocalStorage);
window.addEventListener("click", closeModalOnClickOutside);
