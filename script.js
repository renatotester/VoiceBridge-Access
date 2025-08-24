window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!window.SpeechRecognition) {
    alert("Seu navegador não suporta reconhecimento de voz. Use Chrome ou Edge.");
} else {
    const recognition = new window.SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    const startBtn = document.getElementById('start-btn');
    const status = document.getElementById('status');
    const output = document.getElementById('output');
    const responseDiv = document.getElementById('response');

    function normalizeText(text) {
        return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[.,!?]/g, "").toLowerCase();
    }

    const faq = [
        { questionKeywords: ["como funciona", "detalhes", "explica"], answer: "O VoiceBridge Access funciona offline usando reconhecimento de voz e respostas automáticas." },
        { questionKeywords: ["como usar", "instrucoes", "manual"], answer: "Clique em 'Iniciar Reconhecimento', fale sua pergunta, e o sistema vai responder automaticamente." },
        { questionKeywords: ["offline", "sem internet"], answer: "Ele funciona completamente offline, sem precisar de internet. Respostas online só funcionam se houver conexão." },
        { questionKeywords: ["quem criou", "desenvolvedor"], answer: "O VoiceBridge Access foi desenvolvido por Renato Bernardo como projeto de acessibilidade." },
        { questionKeywords: ["ajuda", "suporte"], answer: "Claro! Estou aqui para ajudar. Faça sua pergunta e responderei." }
    ];

    function getFAQAnswer(userText) {
        const msg = normalizeText(userText);

        for (let item of faq) {
            for (let keyword of item.questionKeywords) {
                const regex = new RegExp("\\b" + keyword + "\\b");
                if (regex.test(msg)) {
                    return item.answer;
                }
            }
        }
        return null;
    }

    async function getOnlineAnswer(question) {
        try {
            const response = await fetch('http://localhost:3000/ask', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question })
            });
            const data = await response.json();
            return data.answer;
        } catch (error) {
            console.log("Sem conexão, usando FAQ offline.");
            return null;
        }
    }

    function speak(text) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'pt-BR';
        utterance.rate = 1;
        utterance.pitch = 1;
        window.speechSynthesis.speak(utterance);
    }

    startBtn.addEventListener('click', () => {
        recognition.start();
        status.textContent = "Ouvindo... fale sua pergunta!";
    });

    recognition.addEventListener('result', async (event) => {
        const transcript = event.results[0][0].transcript;
        output.textContent = `Você disse: "${transcript}"`;

        let reply = getFAQAnswer(transcript);
        if (!reply) {
            reply = await getOnlineAnswer(transcript);
            if (!reply) reply = "Desculpe, não entendi. Pode reformular sua pergunta?";
        }

        responseDiv.textContent = reply;
        speak(reply);
        status.textContent = "Clique no botão para falar novamente.";
    });

    recognition.addEventListener('end', () => {
        status.textContent = "Clique no botão para falar novamente.";
    });

    recognition.addEventListener('error', (event) => {
        status.textContent = `Erro: ${event.error}`;
    });
}
