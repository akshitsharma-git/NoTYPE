import express from "express"
import dotenv from "dotenv"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 7777

app.get("/", (req, res) => {
  res.send("Use /ask?prompt=your_question")
})

app.get("/ask", async (req, res) => {
  const userPrompt = req.query.prompt

  if (typeof userPrompt !== "string" || userPrompt.trim() === "") {
    return res.status(400).send("No Prompt Provided")
  }

  const prompt = `Provide the most minimalistic response for: ${userPrompt}`

  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [{ role: "user", content: prompt }],
        }),
      }
    )

    const answer = await response.json()

    if (!answer.choices) {
      return res
        .status(502)
        .send("GROQ ERROR:\n" + JSON.stringify(answer, null, 2))
    }

    res.status(200).send(answer.choices[0].message.content)
  } catch (err) {
    console.error("GROQ_REQUEST_FAILED", err.message)
    res.status(500).send("Internal Server Error")
  }
})

app.listen(PORT, () => {
  console.log(`NoTYPE-BYPASSER started on http://localhost:${PORT}`)
})
