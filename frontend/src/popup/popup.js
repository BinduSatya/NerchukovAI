// document.addEventListener("DOMContentLoaded", () => {
//   let outputDiv = document.getElementById("output");

//   chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//     chrome.tabs.sendMessage(tabs[0].id, { action: "getText" }, (response) => {
//       if (response && response.text) {
//         outputDiv.textContent = response.text;
//       } else {
//         outputDiv.textContent = "No text found";
//       }
//     });
//   });
// });
