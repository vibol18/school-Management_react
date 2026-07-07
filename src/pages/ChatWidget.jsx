import React, { useState, useRef, useEffect } from "react";

const QUICK_REPLIES = [
    "I need help with my account",
    "I want to report an issue",
    "I'd like a product tour",
    "Just browsing",
];

// --- Knowledge base ---
// Edit/add entries here. Each entry has a list of ways the question
// might be phrased, and the single correct answer to give back.
const KNOWLEDGE_BASE = [
    {
        questions: [
            "what are your hours",
            "when are you open",
            "what time do you open",
            "business hours",
        ],
        answer: "We're available Monday to Friday, 9am to 6pm. Outside those hours, leave a message and we'll reply the next business day.",
    },
    {
        questions: [
            "how much does it cost",
            "what is the price",
            "pricing",
            "how much is it",
        ],
        answer: "Our plans start at $9/month for individuals, with team and enterprise pricing available. Want me to send you the full pricing page?",
    },
    {
        questions: [
            "how do i reset my password",
            "forgot my password",
            "cant login",
            "cannot log in",
        ],
        answer: "You can reset your password from the login screen by clicking 'Forgot password' and following the email link we send you.",
    },
    {
        questions: [
            "how do i get a refund",
            "i want a refund",
            "refund policy",
            "cancel my subscription",
        ],
        answer: "We offer refunds within 14 days of purchase. I can start that for you, or you can request it directly from Billing settings.",
    },
    {
        questions: [
            "how do i contact support",
            "talk to a human",
            "speak to a person",
            "customer service",
        ],
        answer: "I can loop in a human teammate right now — just say 'connect me to support' and someone will join this chat shortly.",
    },
    {
        questions: [
            "what does your product do",
            "what is this product",
            "tell me about your product",
            "product tour",
        ],
        answer: "We help teams manage their workflow in one place — tasks, docs, and chat together. Want a quick guided tour?",
    },
];

// --- Utility Functions ---

export function levenshteinDistance(word1, word2) {
    const m = word1.length;
    const n = word2.length;

    const dp = Array.from({ length: m + 1 }, () =>
        Array(n + 1).fill(0)
    );

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (word1[i - 1] === word2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1];
            } else {
                dp[i][j] =
                    1 +
                    Math.min(
                        dp[i - 1][j], // Deletion
                        dp[i][j - 1], // Insertion
                        dp[i - 1][j - 1] // Substitution
                    );
            }
        }
    }

    return dp[m][n];
}

export function isGreeting(userInput, maxErrors = 1) {
    const greetings = [
        "hi",
        "hello",
        "hey",
        "good morning",
        "good evening"
    ];

    // Strip punctuation and split into words so a greeting can be
    // detected even when it's followed by more text, e.g. "hello there"
    // or "hey, quick question".
    const text = userInput
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    if (!text) return false;

    const words = text.split(" ");

    for (const greeting of greetings) {
        const greetingWords = greeting.split(" ");

        if (greetingWords.length === 1) {
            // Single-word greeting (hi, hello, hey): check every word
            // in the message individually, allowing small typos.
            // Exact matches always count; fuzzy (typo) matches only
            // count for words of length 3+, so short unrelated words
            // like "i" or "a" can't accidentally match "hi".
            for (const word of words) {
                if (word === greeting) return true;
                if (word.length >= 3 && levenshteinDistance(word, greeting) <= maxErrors) {
                    return true;
                }
            }
        } else {
            // Multi-word greeting (good morning, good evening): slide a
            // window matching its length across the message's words.
            for (let i = 0; i <= words.length - greetingWords.length; i++) {
                const chunk = words.slice(i, i + greetingWords.length).join(" ");
                if (chunk === greeting || levenshteinDistance(chunk, greeting) <= maxErrors) {
                    return true;
                }
            }
        }
    }

    return false;
}

// Normalize text: lowercase, strip punctuation, collapse whitespace
function normalize(text) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

// Compares two words allowing for small typos, scaled to word length
function wordsMatch(a, b) {
    if (a === b) return true;
    const maxErrors = a.length > 5 || b.length > 5 ? 2 : 1;
    return levenshteinDistance(a, b) <= maxErrors;
}

// Scores how well the user's message matches a candidate question,
// based on the fraction of candidate words found (fuzzily) in the input.
function scoreMatch(userWords, candidateWords) {
    let hits = 0;
    for (const cw of candidateWords) {
        if (userWords.some((uw) => wordsMatch(uw, cw))) {
            hits++;
        }
    }
    return hits / candidateWords.length;
}

// Finds the best-matching knowledge base answer for the user's message.
// Returns { answer, score } or null if nothing scores high enough.
export function findBestAnswer(userInput, threshold = 0.6) {
    const userWords = normalize(userInput).split(" ").filter(Boolean);
    if (userWords.length === 0) return null;

    let best = null;

    for (const entry of KNOWLEDGE_BASE) {
        for (const q of entry.questions) {
            const candidateWords = normalize(q).split(" ").filter(Boolean);
            const score = scoreMatch(userWords, candidateWords);
            if (!best || score > best.score) {
                best = { answer: entry.answer, score };
            }
        }
    }

    if (best && best.score >= threshold) {
        return best;
    }
    return null;
}

// --- Main Component ---

function ChatWidget() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([
        { from: "bot", text: "Welcome! 👋" },
        { from: "bot", text: "Ask me a question, or pick one below to get started." },
    ]);
    const [input, setInput] = useState("");
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, open]);

    const sendMessage = (text) => {
        if (!text.trim()) return;

        // 1. Add user message to log
        setMessages((prev) => [...prev, { from: "user", text }]);
        setInput("");

        // 2. Figure out the right reply:
        //    a) greeting?  b) known FAQ match?  c) fallback to human handoff
        const userSentGreeting = isGreeting(text);
        const match = findBestAnswer(text);

        // 3. Handle asynchronous simulated bot responses
        setTimeout(() => {
            let replyText;
            if (userSentGreeting) {
                replyText = "Hello there! What can I help you with today?";
            } else if (match) {
                replyText = match.answer;
            } else {
                replyText =
                    "I'm not totally sure about that one — I'll get a human teammate to follow up, or try rephrasing your question.";
            }
            setMessages((prev) => [...prev, { from: "bot", text: replyText }]);
        }, 600);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 font-sans">
            {open && (
                <div className="mb-3 w-[340px] h-[520px] bg-white rounded-2xl shadow-2xl border border-black/5 flex flex-col overflow-hidden animate-[fadeIn_0.18s_ease]">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-[#6d28d9] to-[#7c3aed] px-4 py-4 flex items-center justify-between flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="relative w-9 h-9 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5 text-[#6d28d9]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                </svg>
                                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white" />
                            </div>
                            <span className="text-white font-semibold text-sm">How can we help?</span>
                        </div>
                        <button
                            onClick={() => setOpen(false)}
                            className="text-white/80 hover:text-white transition p-1"
                            title="Close"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>

                    {/* Chat Body */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-2.5 bg-white">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                                <div
                                    className={`max-w-[80%] px-3.5 py-2.5 text-sm rounded-2xl leading-snug ${
                                        m.from === "user"
                                            ? "bg-[#6d28d9] text-white rounded-br-md"
                                            : "bg-gray-100 text-gray-800 rounded-bl-md"
                                    }`}
                                >
                                    {m.text}
                                </div>
                            </div>
                        ))}
                        {messages.length <= 2 && (
                            <div className="flex flex-col gap-2 pt-1">
                                {QUICK_REPLIES.map((q) => (
                                    <button
                                        key={q}
                                        onClick={() => sendMessage(q)}
                                        className="text-left text-sm text-gray-700 border border-gray-200 rounded-xl px-3.5 py-2.5 hover:border-[#6d28d9] hover:bg-[#6d28d9]/5 hover:text-[#6d28d9] transition"
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <div className="border-t border-gray-100 px-3 py-3 flex-shrink-0">
                        <div className="flex items-center gap-2 border border-gray-200 rounded-full px-3 py-1.5 focus-within:border-[#6d28d9] transition">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                                placeholder="Type a message..."
                                className="flex-1 text-sm outline-none bg-transparent py-1"
                            />
                            <button className="text-gray-400 hover:text-gray-600 transition p-1" title="Attach file">
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                                </svg>
                            </button>
                            <button
                                onClick={() => sendMessage(input)}
                                className="text-[#6d28d9] hover:text-[#5b21b6] transition p-1"
                                title="Send"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                                </svg>
                            </button>
                        </div>
                        <p className="text-center text-[10px] text-gray-400 mt-2">Spam protection enabled</p>
                    </div>
                </div>
            )}

            {/* Launcher Button */}
            <button
                onClick={() => setOpen((v) => !v)}
                className="w-14 h-14 rounded-full bg-gradient-to-br from-[#6d28d9] to-[#7c3aed] shadow-xl flex items-center justify-center text-white hover:scale-105 transition-transform duration-150 ml-auto"
                title="Chat with us"
            >
                {open ? (
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                ) : (
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                )}
            </button>
        </div>
    );
}

export default ChatWidget;