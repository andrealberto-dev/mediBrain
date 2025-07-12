const apiKeyInput = document.getElementById("apiKey")
const problemSelect = document.getElementById("problemSelect")
const questioninput = document.getElementById("questionInput")
const askButton = document.getElementById("askButton")
const aiResponse = document.getElementById("aiResponse")
const form = document.getElementById("form")

const markdownToHTML = (text) => {
  const converter = new showdown.Converter()
  return converter.makeHtml(text)
}


const perguntarAI = async (question, problem, apiKey) => {
  const model = "gemini-2.5-flash"
  const geminiURL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`
  const pergunta = `
    ## Especialidade
    Você é um especialista na area da saúde e você precisa dar assistencia a ${problem}
    ## Tarefa
    Você deve responder as perguntas do usuário com base no seu conhecimento da área da saúde, doenças, remédios, sintomas e tudo relacionado a área da sáude
    ## Regras
    - Se você não sabe a resposta, responda com "Não sei" e não tente inventar uma resposta.
    - Se a pergunta não está relacionada a área da saúde, responda com "Essa pergunta não está relacionada a saúde".
    - Considere a data atual ${new Date().toLocaleDateString()}
    - Faça pesquisas atualizadas sobre blogs, artigos, e posts de médicos e profissionais na área baseado na data atual, para dar uma resposta coerente.
    - Nunca responda itens que você não tenha certeza de que existe.
    ## Resposta
    - Economize na resposta, seja direto e responda no máximo 500 caracteres.
    - Responda em markdown.
    - No final da resposta, alerta o usuário que se caso ele esteja com dores e sintomas de doença o mais correto é procurar ajuda médica.
    ## Exemplo de resposta
    pergunta do usuário: Remédio indicado para dores musculares ...
    resposta: O melhor remédio para dores musculares ... \n\n Ele é bom por que contém ...

    ---
    Aqui está a pergunta do usuário: ${question}
  `
  
  const contents = [{
    role: "user",
    parts: [{
      text: pergunta
    }]
  }]

  const tools = [{
    google_search: {}
  }]

  // Chamada API
  const response = await fetch(geminiURL, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents,
      tools
    })
  })

  const data = await response.json()
  return data.candidates[0].content.parts[0].text
}

const enviarFormulario = async (event) => {
  event.preventDefault()
  const apiKey = apiKeyInput.value
  const problem = problemSelect.value
  const question = questioninput.value

  if (apiKey == "" || problem == "" || question ==  "") {
    alert("Por favor, preencha todos os campos.")
    return
  }

  askButton.disabled = true
  askButton.textContent = "Perguntando..."
  askButton.classList.add("loading")

  try {
    const text = await perguntarAI(question, problem, apiKey)
    aiResponse.querySelector('.response-content').innerHTML = markdownToHTML(text)
    aiResponse.classList.remove("hidden")
  } catch(error) {
    console.log("Erro: ", error)
  } finally {
    askButton.disabled = false
    askButton.textContent = "Perguntar"
    askButton.classList.remove("loading")
  }

}
form.addEventListener("submit", enviarFormulario)
