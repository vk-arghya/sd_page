// This file is your "backend proxy".
// It runs on a server, not in the user's browser.
// It is the ONLY file that can securely read your .env file.

exports.handler = async (event) => {
    // 1. Get the user's message from the frontend (script.js).
    // We only process POST requests
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { userQuery } = JSON.parse(event.body);

        // 2. Get the secret API key from the .env file.
        // (Netlify/Vercel make this available via process.env)
        const apiKey = process.env.GEMINI_API_KEY;
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

        // 3. IMPORTANT: Copy your full System Prompt from script.js and paste it here.
        const systemPrompt = `
            You are a friendly and professional AI assistant for "Pioneering Marketing", 
            a business growth consulting company. Your name is "Pioneering AI".
            Your ONLY job is to answer questions about Pioneering Marketing.
            This includes its services (Google/PPC Ads, Social Media, etc.), 
            its clients (Pony Up Salon, Novacare Clinic, Riyanka Sarkar), 
            its work process (Step 1: Understand, Step 2: Custom Plan, Step 3: Execute), 
            and the industries it serves (Healthcare, Salons, Real Estate, Tech, etc.).
            You MUST follow these rules:
            1.  If the user asks ANY question NOT related to Pioneering Marketing, 
                you MUST politely refuse. For example, if they ask "What is the capital of France?" 
                or "Write me a poem", you must say: "I'm sorry, I can only answer questions 
                about Pioneering Marketing and its services."
            2.  Be helpful and concise.
            3.  Do not make up information. If you don't know, say "That's a great question! 
                I'd recommend booking a free consultation to get a detailed answer for that."
            4.  Always be polite and professional.
        `;

        const payload = {
            contents: [{ parts: [{ text: userQuery }] }],
            systemInstruction: {
                parts: [{ text: systemPrompt }]
            },
        };

        // 4. Call the Google API *from the server*
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error("Google API Error:", errorBody);
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        
        if (!result.candidates || !result.candidates[0].content.parts[0].text) {
             console.error("Invalid API response structure:", result);
             throw new Error("Invalid API response structure");
        }

        const aiResponse = result.candidates[0].content.parts[0].text;

        // 5. Send the AI's answer back to the frontend (script.js)
        return {
            statusCode: 200,
            body: JSON.stringify({ reply: aiResponse })
        };

    } catch (error) {
        console.error("Backend Proxy Error:", error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Sorry, I'm having trouble connecting." })
        };
    }
};

