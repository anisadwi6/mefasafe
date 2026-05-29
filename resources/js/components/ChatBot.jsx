import { useState, useEffect, useRef } from "react";
import { Send, Bot, User, Sparkles, MessageCircle, X, Loader2, Clock } from "lucide-react";
import axios from "axios";

function ChatBot() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      text: "Halo! Saya MefaBot, asisten virtual MefaSafe. Ada yang bisa saya bantu hari ini?",
      time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [quickReplies, setQuickReplies] = useState([
    "Gejala demam",
    "Gejala flu dan batuk",
    "Gejala hipertensi",
    "Gejala diabetes",
    "Obat maag dan asam lambung",
    "Cara hidup sehat",
    "Tips nutrisi dan gizi",
    "Konsultasi dokter",
    "Kalender pengingat obat",
    "Cara klaim asuransi",
    "Daftar rumah sakit",
  ]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    // Hanya scroll jika bukan initial mount (ada pesan baru)
    if (!isInitialMount.current) {
      scrollToBottom();
    } else {
      isInitialMount.current = false;
    }
  }, [messages]);

  useEffect(() => {
    fetchQuickReplies();
  }, []);

  const fetchQuickReplies = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/v1/chatbot/quick-replies", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data.success) {
        setQuickReplies(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching quick replies:", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (messageText = inputMessage) => {
    if (!messageText.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: "user",
      text: messageText,
      time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    try {
      // Call backend API with Gemini
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "/api/v1/chatbot/chat",
        {
          message: messageText,
          conversation_history: messages.slice(-10), // Send last 10 messages for context
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        const botMessage = {
          id: messages.length + 2,
          type: "bot",
          text: response.data.message,
          time: response.data.timestamp,
        };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        throw new Error("Failed to get response");
      }
    } catch (error) {
      console.error("ChatBot Error:", error);
      const errorMessage = {
        id: messages.length + 2,
        type: "bot",
        text: "Maaf, terjadi kesalahan saat memproses pesan Anda. Silakan coba lagi.",
        time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickReply = (reply) => {
    handleSendMessage(reply);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="animate-fadeIn" style={{ background: "linear-gradient(135deg, #f8fafc 0%, #eff6ff 50%, #eef2ff 100%)" }}>
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-140px] right-[-80px] h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="absolute bottom-[-120px] left-[-60px] h-80 w-80 rounded-full bg-violet-200/40 blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 py-6 md:px-8 md:py-8 flex flex-col" style={{ height: "calc(100vh - 73px)" }}>
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">MefaBot</h1>
              <p className="text-sm text-slate-500 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Online - Siap membantu Anda
              </p>
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <div className="flex-1 rounded-[28px] border border-white/70 bg-white/85 backdrop-blur-xl shadow-[0_30px_80px_-40px_rgba(15,23,42,0.28)] flex flex-col overflow-hidden">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.type === "user" ? "flex-row-reverse" : "flex-row"} animate-slide-up`}
              >
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {message.type === "bot" ? (
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-md">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shadow-md">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>

                {/* Message Bubble */}
                <div className={`flex flex-col ${message.type === "user" ? "items-end" : "items-start"} max-w-[75%]`}>
                  <div
                    className={`rounded-2xl px-4 py-3 shadow-md ${
                      message.type === "user"
                        ? "bg-gradient-to-br from-blue-500 to-purple-500 text-white"
                        : "bg-white border border-slate-100 text-slate-800"
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-line">{message.text}</p>
                  </div>
                  <div className="flex items-center gap-1 mt-1 px-2">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span className="text-xs text-slate-400">{message.time}</span>
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-3 animate-slide-up">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-md">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-white border border-slate-100 rounded-2xl px-4 py-3 shadow-md">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          {quickReplies.length > 0 && (
            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50">
              <p className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Pertanyaan Cepat
              </p>
              <div className="flex flex-wrap gap-2">
                {quickReplies.map((reply, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickReply(reply)}
                    className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-full hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:border-blue-200 hover:text-blue-600 transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 border-t border-slate-100 bg-white/50">
            <div className="flex gap-3 items-end">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ketik pesan Anda..."
                  rows="1"
                  className="w-full px-4 py-3 pr-12 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 resize-none text-sm transition-all duration-300 scrollbar-thin scrollbar-thumb-slate-300"
                  style={{ maxHeight: "120px" }}
                />
              </div>
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || isTyping}
                className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 text-white flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300"
              >
                {isTyping ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-2 text-center">
              MefaBot dapat membantu dengan informasi umum. Untuk bantuan lebih lanjut, hubungi customer service.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatBot;
