const expect = require("chai").expect;
const {RequestHTML} = require("../src/RequestHTML");
const nock = require("nock");

describe("HTML request", () => {
  it("performs a GET request", async() => {
    nock("http://www.exampleeee.com")
        .get("/")
        .reply(200, "<html><p>Hello world</p></html>");

    const requestHTML = new RequestHTML();
    const response = await requestHTML.get("http://www.exampleeee.com");
    expect(response.body).to.equal("<html><p>Hello world</p></html>");
  });
});
