const mock = require(".");

mock([
  [
    "https://httpbin.org/get",
    {
      json: { hey: "there!" }
    }
  ]
]);

fetch("https://httpbin.org/get")
  .then(res => res.json())
  .then(body => {
    console.log("ADJ body", body);
  })
  .catch(err => {
    console.error("ADJ error", err);
  });
