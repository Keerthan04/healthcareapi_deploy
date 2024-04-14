const {GoogleGenerativeAI} = require('@google/generative-ai');
require('dotenv').config();


const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-pro"});


async function takeCare(disease, symptoms, answers, severity) {
    let symptomText = '';
    let symptomQuestion = '';

    // Construct symptom text and symptom questions
    for (let i = 0; i < symptoms.length; i++) {
        if (answers[i] === 1) {
            symptomText += `${symptoms[i]}, `;
        }
        symptomQuestion += `${symptoms[i]}, `;
    }

    // Check if the patient has no symptoms related to the disease
    if (symptomText === '') {
        return `You have no symptoms related to ${disease}. Please take care at home.`;
    }

    // Remove trailing comma and space
    symptomText = symptomText.slice(0, -2);
    symptomQuestion = symptomQuestion.slice(0, -2);

    // Constructing the prompt
    let prompt = `The patient has been diagnosed with ${disease} with a severity level of ${severity}/10. `;
    prompt += `The symptoms questioned the patient are ${symptomQuestion}, `;
    prompt += `and the symptoms reported by the patient include ${symptomText}. `;
    prompt += `Consider the severity level and see the symptoms questioned and also symptom reported by user and determine the appropriate course of action. `;
    prompt += `Please recommend whether the patient should consult a doctor or practice self-care at home. `;
    prompt += `If self-care at home is recommended, provide steps for home care.`;

    // Generating content based on the prompt
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    return text;
}


module.exports = {takeCare};