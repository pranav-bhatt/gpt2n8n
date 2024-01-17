// NOTE: This script relies on the powerful chatgpt.js library @ https://chatgpt.js.org
// (c) 2023–2024 KudoAI & contributors under the MIT license
// Source: https://github.com/kudoai/chatgpt.js
// Latest minified release: https://code.chatgptjs.org/chatgpt-latest-min.js

(async () => {
  // Import libs
  const { config, settings } = await import(
    chrome.runtime.getURL("lib/settings-utils.js")
  );
  const { chatgpt } = await import(chrome.runtime.getURL("lib/chatgpt.js"));
  let loggingID;

  // Add Chrome action msg listener
  chrome.runtime.onMessage.addListener((request) => {
    if (request.action === "notify") notify(request.msg, request.position);
    else if (request.action === "alert")
      alert(request.title, request.msg, request.btns);
    else if (typeof window[request.action] === "function") {
      const args = Array.isArray(request.args)
        ? request.args // preserve array if supplied
        : request.args !== undefined
        ? [request.args]
        : []; // convert to array if single or no arg
      window[request.action](...args); // call expression functions
    }
    return true;
  });

  await chatgpt.isLoaded();

  // 1. log latest message output by chatgpt every 5 seconds
  // 2. toggle should be able to start and stop logging
  // 3. refresh button should be able to upload dummy test file to chat gpt

  // Define FEEDBACK functions

  function notify(msg, position = "", notifDuration = "", shadow = "") {
    chatgpt.notify(
      `${config.appSymbol} ${msg}`,
      position,
      notifDuration,
      shadow || chatgpt.isDarkMode() ? "" : "shadow"
    );
  }

  function alert(title = "", msg = "", btns = "", checkbox = "", width = "") {
    return chatgpt.alert(
      `${config.appSymbol} ${title}`,
      msg,
      btns,
      checkbox,
      width
    );
  }

  // Create a mutation observer with a callback function
  
  // ChatGPT seems to reload all the elements so we need to observe parent
  // parentDiv = document.querySelector(".relative.flex.h-full.max-w-full.flex-1.flex-col.overflow-hidden")

  function watchGPT() {
    // mutations.forEach(function () {})
    activeGPT = document.querySelector(".group.flex.cursor-pointer.items-center")

    console.log(activeGPT.textContent);
    if (activeGPT.textContent == "DaGPT") {
      lastResponse = chatgpt.getLastResponse();
      (async () => console.log("Last response is: ", await lastResponse))();
    }
  };

  // var observer = new MutationObserver(watchGPT);

  // // Configure the observer to watch for changes in the content of myDiv
  // var parentConfig = { childList: true };

  // // Start observing the target node for configured mutations
  // observer.observe(parentDiv, parentConfig);

  settings.load("extensionDisabled").then(() => {
    if (!config.extensionDisabled) {
      loggingID = setInterval(watchGPT, 5000)
    }
  });

  // Define SYNC function

  syncExtension = () => {
    settings.load("extensionDisabled").then(() => {
      if (config.extensionDisabled) {
        console.log("extension disabled");
        clearInterval(loggingID);
      } else {
        if (loggingID == null) {
          loggingID = setInterval(watchGPT, 5000)
        }
        console.log("extension enabled");
      }
    });
  };
})();
