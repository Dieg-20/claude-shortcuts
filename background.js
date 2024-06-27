console.log("Background script starting...");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "contentScriptReady") {
    console.log("Content script is ready in tab:", sender.tab.id);
    sendResponse({ status: "acknowledged" });
  }
});

chrome.commands.onCommand.addListener((command) => {
  console.log(`Command received in background: ${command}`);

  if (command === "open-new-chat-tab") {
    chrome.tabs.create({ url: "https://claude.ai/new" });
    console.log("Opened new Claude.ai chat in new tab");
    return;
  }

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    console.log(`Active tab URL: ${activeTab.url}`);

    if (activeTab.url.startsWith("https://claude.ai")) {
      if (command === "start-new-chat") {
        sendMessageToContentScript(activeTab.id, { action: "startNewChat" });
      } else if (command === "copy-contents") {
        sendMessageToContentScript(activeTab.id, { action: "copyContents" });
      }
    } else {
      console.log("Not on claude.ai, command ignored");
    }
  });
});

function sendMessageToContentScript(tabId, message) {
  chrome.tabs.sendMessage(tabId, message, (response) => {
    if (chrome.runtime.lastError) {
      console.log("Error sending message:", chrome.runtime.lastError);
      chrome.scripting.executeScript(
        {
          target: { tabId: tabId },
          files: ["content.js"],
        },
        () => {
          if (chrome.runtime.lastError) {
            console.log(
              "Error injecting content script:",
              chrome.runtime.lastError
            );
          } else {
            console.log("Content script injected, retrying message");
            setTimeout(() => sendMessageToContentScript(tabId, message), 100);
          }
        }
      );
    } else {
      console.log("Message sent successfully, response:", response);
    }
  });
}

console.log("Background script loaded and listening for commands");
