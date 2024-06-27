console.log("Content script starting...");

chrome.runtime.sendMessage(
  { action: "contentScriptReady" },
  function (response) {
    console.log("Received response from background script:", response);
  }
);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log(`Message received in content script: ${request.action}`);

  if (request.action === "startNewChat") {
    handleStartNewChat();
  } else if (request.action === "copyContents") {
    handleCopyContents();
  }

  sendResponse({ received: true });
  return true;
});

document.addEventListener("keydown", function (e) {
  if (e.metaKey && e.shiftKey && e.key === "ArrowLeft") {
    e.preventDefault();
    handleGoBack();
  } else if (e.metaKey && e.key === "e") {
    e.preventDefault();
    handleEditMessage();
  }
});

function handleStartNewChat() {
  console.log("Attempting to start new chat");
  const newChatButton = document.querySelector('a[href="/new"]');
  if (newChatButton) {
    newChatButton.click();
    console.log("New chat button clicked");
  } else {
    console.log("New chat button not found");
  }
}

function handleCopyContents() {
  console.log("Attempting to find and click copy button");
  const copyButton = findButtonByPath(
    "M200,32H163.74a47.92,47.92,0,0,0-71.48,0H56A16,16,0,0,0,40,48V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V48A16,16,0,0,0,200,32Z"
  );
  clickButtonAndVerify(copyButton, "Copied!");
}

function handleGoBack() {
  console.log("Attempting to find and click back button");
  const backButton = findButtonByPath(
    "M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"
  );
  clickButtonAndVerify(backButton);
}

function handleEditMessage() {
  console.log("Attempting to find and click edit button");
  const editButton = findButtonByPath(
    "M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM92.69,208H48V163.31l88-88L180.69,120ZM192,108.68,147.31,64l24-24L216,84.68Z"
  );
  clickButtonAndVerify(editButton);
}

function findButtonByPath(pathData) {
  const buttons = document.querySelectorAll("button");
  return Array.from(buttons).find((button) => {
    const svg = button.querySelector("svg");
    const path = svg && svg.querySelector("path");
    return path && path.getAttribute("d").includes(pathData);
  });
}

function clickButtonAndVerify(button, verificationLabel) {
  if (button) {
    console.log("Button found, attempting to click");
    button.click();
    console.log("Button clicked");

    if (verificationLabel) {
      setTimeout(() => {
        if (button.getAttribute("aria-label") === verificationLabel) {
          console.log("Action successfully completed");
        } else {
          console.log("Action may not have been successful");
        }
      }, 100);
    }
  } else {
    console.log("Button not found");
  }
}

console.log(
  "Content script loaded and listening for messages and keyboard events"
);
