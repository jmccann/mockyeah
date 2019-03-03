const { expect } = require("chai");

const mock = require(".");

mock([
  [
    "https://httpbin.org/get",
    {
      json: { hey: "there!" }
    }
  ],
  [
    {
      url: "https://httpbin.org/post",
      method: "post",
      query: {
        posting: /tru/
      },
      body: {
        some: v => v.includes("oste")
      }
    },
    {
      json: { you: "posted!" }
    }
  ]
]);

describe("mockyeah-fetch", () => {
  it("should mock get", () =>
    fetch("https://httpbin.org/get")
      .then(res => res.json())
      .then(body => {
        expect(body).to.deep.equal({
          hey: "there!"
        });
      }));

  it("should mock post", () =>
    fetch("https://httpbin.org/post?posting=true", {
      method: "post",
      body: JSON.stringify({
        some: "posted"
      })
    })
      .then(res => res.json())
      .then(body => {
        expect(body).to.deep.equal({
          you: "posted!"
        });
      }));
});
