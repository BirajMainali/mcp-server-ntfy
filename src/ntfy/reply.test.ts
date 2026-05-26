import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { NtfyPublishedMessage } from "../types.js";
import { findReply, isUserReply } from "./reply.js";

const message = (
  partial: Partial<NtfyPublishedMessage> & Pick<NtfyPublishedMessage, "id" | "time">,
): NtfyPublishedMessage => ({
  event: "message",
  topic: "test",
  ...partial,
});

describe("isUserReply", () => {
  const anchor = { id: "question", time: 100 };

  it("accepts a message after the anchor", () => {
    assert.equal(
      isUserReply(message({ id: "reply", time: 101, message: "yes" }), anchor),
      true,
    );
  });

  it("rejects the anchor message itself", () => {
    assert.equal(
      isUserReply(message({ id: "question", time: 100, message: "q?" }), anchor),
      false,
    );
  });

  it("rejects older cached messages", () => {
    assert.equal(
      isUserReply(message({ id: "old", time: 50, message: "stale" }), anchor),
      false,
    );
  });
});

describe("findReply", () => {
  const anchor = { id: "question", time: 100 };

  it("ignores stale cache when ntfy returns all messages", () => {
    const events: NtfyPublishedMessage[] = [
      { id: "open", time: 99, event: "open", topic: "test" },
      message({ id: "old", time: 50, message: "stale hi" }),
      message({ id: "question", time: 100, message: "what next?" }),
    ];

    assert.equal(findReply(events, anchor), null);
  });

  it("returns the first reply after the anchor", () => {
    const events: NtfyPublishedMessage[] = [
      message({ id: "old", time: 50, message: "stale hi" }),
      message({ id: "question", time: 100, message: "what next?" }),
      message({ id: "reply", time: 101, message: "fix the bug" }),
    ];

    assert.equal(findReply(events, anchor), "fix the bug");
  });
});
