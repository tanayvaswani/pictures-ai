import { Hono } from "hono";
import { cors } from "hono/cors";

type CloudflareBindings = {
	AI: Ai;
};

const app = new Hono<{
	Bindings: CloudflareBindings;
	Variables: {
		AI: Ai;
	};
}>();

app.use("*", cors());

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

const models: { [key: string]: BaseAiTextToImageModels } = {
	sdxl1: "@cf/stabilityai/stable-diffusion-xl-base-1.0",
	sdxll: "@cf/bytedance/stable-diffusion-xl-lightning",
};

app.post("/generate-image", async (c) => {
	try {
		const { prompt, modelName } = await c.req.json();

		if (!prompt) {
			throw new Error("Please enter a valid prompt.");
		}

		if (!Object.keys(models).includes(modelName)) {
			throw new Error(
				"Sorry we don't support the model at this moment, please try from the given list of models.",
			);
		}

		const inputs = {
			prompt: prompt,
		};

		const selectedModel: BaseAiTextToImageModels = models[modelName];

		const response = await c.env.AI.run(selectedModel, inputs);

		if (!response) {
			throw new Error("Error getting a valid response.");
		}

		return c.newResponse(response);
	} catch (error) {
		console.error(`${new Date().toISOString()} - POST /ask Error: `, error);
		return c.json({ detail: error });
	}
});

export default app;
