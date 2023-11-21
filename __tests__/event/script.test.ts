import { test, expect, describe, beforeEach, vi } from "vitest";
import { screen, waitFor } from "@testing-library/dom";

import { main } from "../../event/script";

const requestUrl = "https://jsonplaceholder.typicode.com/posts";
const result = {
  id: 101,
  title: "title",
  content: "content",
};

beforeEach(() => {
  document.body.innerHTML = `
    <form>
    <div>
      <label for="title">Title: </label>
      <input data-testid="form-title" id="title" type="text">
    </div>
    <div>
      <label for="content">Content: </label>
      <input data-testid="form-content" id="content" type="text">
    </div>
    <div>
      <input data-testid="submit" id="submit" type="submit" />
    </div>
  </form>

  <div data-testid="result-id" id="result-id"></div>
  <div data-testid="result-title" id="result-title"></div>
  <div data-testid="result-content" id="result-content"></div>
  `;
  const formTitle = screen.queryByTestId<HTMLInputElement>("form-title");
  const formContent = screen.queryByTestId<HTMLInputElement>("form-content");
  if (formTitle) formTitle.value = result.title;
  if (formContent) formContent.value = result.content;
});

describe("DOM操作とイベントの問題", () => {
  test("正しい挙動になっている", async () => {
    main();
    screen.queryByTestId("submit")?.click();
    await waitFor(() => {
      expect(screen.queryByTestId("result-id")?.textContent).toEqual(
        "created post ID is 101"
      );
      expect(screen.queryByTestId("result-title")?.textContent).toEqual(
        `created post title is ${result.title}`
      );
      expect(screen.queryByTestId("result-content")?.textContent).toEqual(
        `created post content is ${result.content}`
      );
    });
  });

  test("POSTリクエストが正しく行われている", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve(result),
    });
    main();
    screen.queryByTestId("submit")?.click();
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(requestUrl, {
        method: "POST",
        body: JSON.stringify({
          title: result.title,
          content: result.content,
        }),
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      });
    });
  });
});
