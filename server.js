const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Configuration, OpenAIApi } = require('openai');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY, // pega do .env
});
const openai = new OpenAIApi(configuration);

app.post('/ask', async (req, res) => {
    const { question } = req.body;
    if (!question) return res.status(400).json({ answer: "Pergunta vazia." });

    try {
        const completion = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: question }],
            max_tokens: 200
        });

        const answer = completion.data.choices[0].message.content.trim();
        res.json({ answer });
    } catch (error) {
        console.error(error);
        res.status(500).json({ answer: "Erro no servidor GPT." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
