import { Hono } from "hono";

type CloudflareBindings = {
  AI: Ai;
};

const app = new Hono<{
  Bindings: CloudflareBindings;
  Variables: {
    AI: Ai;
  };
}>();

app.get("/", (c) => {
  c.env.AI;
  return c.json({ detail: "Hono API is Up!" });
});

app.post("/ask", async (c) => {
  try {
    const { prompt } = await c.req.json();

    if (!prompt) {
      throw new Error("Please enter a valid prompt.");
    }

    const response = await c.env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
      messages: [
        {
          role: "system",
          content: `You are an assistant for question-answering tasks. If you don't know the answer, just say that you don't know.`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    if (!response) {
      throw new Error("Error getting a valid response.");
    }

    return c.json({ detail: response });
  } catch (error) {
    console.error(`${new Date().toISOString()} - POST /ask Error: `, error);
    return c.json({ detail: error });
  }
});

export default app;
