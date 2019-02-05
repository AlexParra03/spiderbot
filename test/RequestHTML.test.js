const expect = require("chai").expect;
const { RequestHTML } = require("../src/RequestHTML");
const nock = require("nock");

describe("HTML request", () => {
  it("ERASE XXX", async () => {
    nock("http://www.exampleeee.com")
      .get("/")
      .reply(200, "<html><p>Hello world</p></html>");

    const requestHTML = new RequestHTML();
    const html = await requestHTML.get("http://www.exampleeee.com");
    console.log('1111111',html.request.uri);
    expect(html.body).to.equal("<html><p>Hello world</p></html>");
  });

  it.only("ERASE XXX", async () => {
    nock.cleanAll.bind(nock);
    nock("http://www.example12.com")
      .get("/hi")
      .reply(302, undefined, {
        location: "http://www.google.com"
      });

    nock("http://www.google.com")
      .get("/")
      .reply(200, "<html><p>hi</p></html>");

    const requestHTML = new RequestHTML();
    let html = "";
    try {
      html = await requestHTML.get("http://www.example12.com/hi");
    } catch (err) {
      console.log("Er", err);
    }
    console.log('1111111',html.request.uri);
    // console.log(html);
    // expect(html).to.equal("<html><p>Hello world</p></html>");
    // done();
  });
});
