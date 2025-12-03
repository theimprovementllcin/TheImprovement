// Chatbot.tsx
import { useState, useEffect, useRef, FormEvent } from "react";
import { IoMdClose } from "react-icons/io";
import { FiSend, FiMinimize2, FiMaximize2, FiUser, FiChevronDown } from "react-icons/fi";
import { RiRobot2Line } from "react-icons/ri";
import { useChat, Message } from "ai/react";
import Image from "next/image";
import Button from "../Button";
import Markdown from "react-markdown";
import toast from "react-hot-toast";

const STORAGE_KEY = "onecasa_chat_messages_v1";

// more permissive HTML check so tags don't show as text
const looksLikeHTML = (txt: string) => {
  if (typeof txt !== "string") return false;
  const t = txt.trim().toLowerCase();
  if (t.startsWith("<")) return true;
  return ["<p", "<div", "<h1", "<h2", "<h3", "<ul", "<ol", "<li", "<span", "<a", "<br", "<hr"].some(tag => t.includes(tag));
};

const SUGGESTIONS = [
  "Show properties to buy in Hyderabad",
  "Give Vastu tips for a 2BHK flat (short)",
  "Estimate painting cost for 3BHK, washable finish",
  "What’s the difference between carpet, built-up & super area?",
  "How does TheImprovement track construction progress daily?",
  "Share your interiors packages for 2BHK",
];

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [scrolledUp, setScrolledUp] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    stop,
    setMessages,
    reload,
    append
  } = useChat({
    id: "theimprovementllc-global-chat",
    api: "/api/chat",
    initialInput: "",
    keepLastMessageOnError: true,
    onError: (err) => {
      toast.error(err?.message || "Something went wrong. Please try again.");
    },
  });

  // restore history
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const prev: Message[] = JSON.parse(raw);
        if (Array.isArray(prev) && prev.length > 0) setMessages(prev);
      }
    } catch { }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // persist history
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages ?? []));
    } catch { }
  }, [messages]);

  // scroll handling
  useEffect(() => {
    if (!scrolledUp) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, scrolledUp]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const onScroll = () => {
      const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 48;
      setScrolledUp(!nearBottom);
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // focus on open
  useEffect(() => {
    if (isOpen && !isMinimized) {
      const t = setTimeout(() => inputRef.current?.focus(), 120);
      return () => clearTimeout(t);
    }
  }, [isOpen, isMinimized]);

  const toggleMinimize = () => setIsMinimized((v) => !v);
  const onOpen = () => setIsOpen(true);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;
    if (!navigator.onLine) return toast.error("You’re offline. Please check your connection.");
    if (isLoading) return;
    handleSubmit(e);
  };

  const onSuggestion = async (text: string) => {
    await append({ role: "user", content: text });
  };

  const extractUrls = (text: string) => {
    const urlPattern = /https?:\/\/[^\s/$.?#].[^\s]*/gi;
    const url = text.match(urlPattern);
    const remainingText = text.replace(urlPattern, "").trim();
    return (
      <>
        {remainingText && <Markdown>{remainingText}</Markdown>}
        {url?.[0] && (
          <a
            href={url[0]}
            className="text-[#2872a1] font-Gordita-Regular underline underline-offset-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open link
          </a>
        )}
      </>
    );
  };

  if (!isOpen) {
    return (
      <Button
        onClick={onOpen}
        className="fixed md:bottom-10 bottom-[60px] right-4 z-20 bg-[#2173A2] text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-600 animate-bounce"
        aria-label="Open chatbot"
      >
        <RiRobot2Line className="w-6 h-6" />
      </Button>
    );
  }

  return (
    <div
      className={`fixed bottom-[50px] right-2 sm:right-4 z-[999] w-[300px] sm:w-96 bg-white rounded-xl shadow-2xl transition-all duration-300 transform ${isMinimized ? "h-16" : "h-[340px] sm:h-[460px]"}`}
    >
      {/* === YOUR ORIGINAL HEADER (kept) === */}
      <div className="bg-gradient-to-r from-[#2872a1] to-blue-700 p-4 rounded-t-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#212227] backdrop-blur-sm rounded-full flex items-center justify-center">
            <Image src="/llclogo.png" alt="logo" width={24} height={24} />
          </div>
          <div className="text-white">
            <p className="font-Gordita-Medium label-text text-white">Hi, how can I help you today?</p>
            <div>
              {isLoading ? (
                <div className="flex gap-1 mt-3" aria-live="polite" aria-busy="true">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "200ms" }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "400ms" }} />
                </div>
              ) : (
                <p className="text-[10px] md:text-[12px] font-Gordita-Regular text-blue-100">We respond immediately</p>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={toggleMinimize}
            className="text-white/80 hover:text-white transition-colors"
            aria-label={isMinimized ? "Maximize chat" : "Minimize chat"}
          >
            {isMinimized ? <FiMaximize2 className="w-5 h-5" /> : <FiMinimize2 className="w-5 h-5" />}
          </Button>
          <Button
            onClick={() => { if (isLoading) stop(); setIsOpen(false); }}
            className="text-white/80 hover:text-white transition-colors"
            aria-label="Close chat"
          >
            <IoMdClose className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div
            ref={viewportRef}
            className="h-[calc(100%-9.5rem)] p-2 overflow-y-auto bg-gray-50 no-scrollbar"
          >
            <div className="flex flex-col gap-4">
              {messages.map((msg) => {
                const isUser = msg.role === "user";
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-2 items-end ${isUser ? "flex-row-reverse" : ""}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${isUser ? "bg-blue-100" : "bg-gray-100"}`}
                    >
                      {isUser ? (
                        <FiUser className="w-4 h-4 text-[#2872a1]" />
                      ) : (
                        <div className="w-[30px] h-[30px] bg-[#212227] backdrop-blur-sm rounded-full flex items-center justify-center">
                          <Image src="/llclogo.png" alt="logo" width={24} height={24} />
                        </div>
                      )}
                    </div>
                    <div
                      className={`relative px-4 py-2 rounded-2xl font-Gordita-Regular text-[12px] max-w-[75%] shadow-sm ${isUser ? "bg-[#2872a1] text-white rounded-br-none" : "bg-white rounded-bl-none"
                        }`}
                    >
                      {/* tiny triangle tail */}
                      <span
                        className={`absolute w-3 h-3 bottom-0 translate-y-1 rotate-45 ${isUser ? "right-0 bg-[#2872a1]" : "left-0 bg-white"
                          }`}
                      />
                      {!isUser && looksLikeHTML(msg.content) ? (
                        <div className="leading-relaxed" dangerouslySetInnerHTML={{ __html: msg.content }} />
                      ) : (
                        extractUrls(msg.content)
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Scroll to bottom pill */}
            {scrolledUp && (
              <button
                onClick={() => {
                  messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
                  setScrolledUp(false);
                }}
                className="absolute right-4 bottom-24 flex items-center gap-1 text-[11px] bg-white border border-black/10 shadow px-2.5 py-1.5 rounded-full"
              >
                <FiChevronDown className="w-4 h-4" />
                New messages
              </button>
            )}
          </div>

          {/* Suggestions + Input */}
          <div className="p-3 bg-white border-t">
            {/* suggestion chips (subtle, no heavy slider) */}
            <div className="flex gap-2 mb-2 overflow-x-auto custom-scrollbar">
              {SUGGESTIONS.slice(0, 4).map((s, i) => (
                <button
                  key={i}
                  onClick={() => onSuggestion(s)}
                  className="text-[11px] whitespace-nowrap px-3 py-[2px] rounded-full bg-gray-50 border border-gray-200 hover:border-[#1d547] hover:text-[#2872a1] transition"
                >
                  {s}
                </button>
              ))}
            </div>

            <form onSubmit={onSubmit}>
              <div className="flex gap-2 items-center">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Ask about properties, Vastu, interiors, painting…"
                  className="flex-1 px-4 py-1 bg-gray-50 rounded-[10px] text-[12px] font-Gordita-Regular focus:outline-none focus:ring-2 focus:ring-[#2872a1] focus:bg-white transition-all border border-gray-200"
                />
                <Button
                  disabled={!input.trim() || isLoading}
                  className="bg-[#2872a1] text-white p-2 rounded-xl flex items-center justify-center hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
                  type="submit"
                  aria-label="Send message"
                >
                  <FiSend className="w-4 h-4" />
                </Button>
              </div>
              {error && (
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-red-500">{error.message || "Failed to send. Please try again."}</p>
                  <button
                    type="button"
                    onClick={() => reload()}
                    className="text-xs text-[#2872a1] underline underline-offset-2"
                  >
                    Retry
                  </button>
                </div>
              )}
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default Chatbot;

/* Tailwind helper (add once globally):
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
*/
