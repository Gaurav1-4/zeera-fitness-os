import { useChat } from "@ai-sdk/react";
type Message = ReturnType<typeof useChat>["messages"][number];
const a: Message = {} as any;
a.content;
