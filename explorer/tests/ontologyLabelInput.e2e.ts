import assert from "node:assert/strict";
import test from "node:test";
import { createServer } from "vite";
import { chromium } from "playwright";

test("ontology labels keep typed and composed text in sync with canvas and draft", async (t) => {
  const server = await createServer({ server: { host: "127.0.0.1", port: 0 } });
  await server.listen();
  t.after(() => server.close());
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH });
  t.after(() => browser.close());
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
  page.setDefaultTimeout(10_000);
  page.on("pageerror", (error) => console.error(error.message));
  const uri = "https://example.org/test";
  const nodes = [
    { id: `${uri}/Device`, type: "owl:Class", entity_type: "class", content: "Device" },
    { id: `${uri}/version`, type: "owl:DatatypeProperty", entity_type: "property", content: "version" },
    { id: uri, type: "owl:Ontology", entity_type: "ontology", content: "Test ontology" },
    { id: `${uri}/external`, type: "owl:NamedIndividual", entity_type: "individual", content: "External" },
  ];
  let draft: any;
  await page.route("**/api/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    let json: unknown = {};
    if (path === "/api/ontology/registry") json = [{ uri, name: "Test ontology" }];
    if (path === "/api/ontology/graph") json = { uri, nodes, edges: [] };
    if (path === "/api/ontology/draft") {
      draft = route.request().postDataJSON();
      json = { draft_id: "test-draft" };
    }
    await route.fulfill({ json });
  });
  // Mount the real editor and ReactFlow without unrelated workspaces or services.
  await page.route("**/label-test.html*", (route) => route.fulfill({
    contentType: "text/html",
    body: `<div id="root" style="height:950px"></div><script type="module">
      import RefreshRuntime from '/@react-refresh';
      RefreshRuntime.injectIntoGlobalHook(window);
      window.$RefreshReg$ = () => {}; window.$RefreshSig$ = () => (type) => type;
      window.__vite_plugin_react_preamble_installed__ = true;
      const { default: React } = await import('/node_modules/.vite/deps/react.js');
      const { default: ReactDOM } = await import('/node_modules/.vite/deps/react-dom_client.js');
      const { OntologyEditor } = await import('/src/workspaces/OntologyWorkspace/OntologyEditor.tsx');
      ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(OntologyEditor));
    </script>`,
  }));
  await page.goto(`${server.resolvedUrls!.local[0]}label-test.html?lang=zh-CN`);
  const input = page.locator('input[type="text"]');
  const node = (id: string) => page.locator(`.react-flow__node[data-id="${id}"]`);
  const cdp = await page.context().newCDPSession(page);
  for (const [index, finalLabel] of [[0, "蜜点设备"], [1, "安装版本"]] as const) {
    await node(nodes[index].id).click();
    await input.fill("");
    await input.pressSequentially("LabelABC");
    assert.equal(await input.inputValue(), "LabelABC", "continuous typing must not revert");
    await input.press("Backspace");
    assert.equal(await input.inputValue(), "LabelAB");
    await input.fill("");
    await cdp.send("Input.imeSetComposition", { text: "mi", selectionStart: 2, selectionEnd: 2 });
    assert.equal(await input.inputValue(), "mi", "composition text must survive rerenders");
    await cdp.send("Input.imeSetComposition", { text: finalLabel, selectionStart: finalLabel.length, selectionEnd: finalLabel.length });
    await cdp.send("Input.insertText", { text: finalLabel });
    assert.equal(await input.inputValue(), finalLabel);
    assert.ok((await node(nodes[index].id).innerText()).includes(finalLabel));
  }
  await node(nodes[0].id).click();
  assert.equal(await input.inputValue(), "蜜点设备", "switching selection must retain the edited value");
  await input.fill("蜜点设备粘贴");
  assert.equal(await input.inputValue(), "蜜点设备粘贴");
  for (const index of [2, 3]) {
    await node(nodes[index].id).click();
    assert.equal(await input.getAttribute("readonly"), "");
  }
  await Promise.all([
    page.waitForEvent("dialog").then((dialog) => dialog.accept()),
    page.waitForResponse((response) => response.url().endsWith("/api/ontology/draft")),
    page.getByRole("button", { name: "提交变更提案" }).click(),
  ]);
  assert.equal(draft.diff.modified_classes[nodes[0].id].label, "蜜点设备粘贴");
  assert.equal(draft.diff.modified_properties[nodes[1].id].label, "安装版本");
});
