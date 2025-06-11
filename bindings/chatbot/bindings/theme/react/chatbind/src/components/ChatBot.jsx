import React, { useState } from "react";
import styles from "../styles/style.css";


export function ChatBot({ onQuery }) {
  const [input, setInput] = useState("");
  // const [messages, setMessages] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // const userMessage = { from: "user", text: input };
    // const botMessage = {
    //   from: "bot",
    //   text: "Fetching fashion recommendations...",
    // };

    // const response = await fetch("https://recommend-shipments-holder-climbing.trycloudflare.com/chatdata", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({ query: input }),
    //   });

    // const data = await response.json();
    // console.log("Chat inserted:", data);

  //   setMessages((prev) => [...prev, userMessage, botMessage]);
    await onQuery(input);
    setInput("");

  //   setMessages((prev) =>
  //     prev.map((msg, i) =>
  //       i === prev.length - 1
  //         ? { ...msg, text: "Here are your outfit suggestions!" }
  //         : msg
  //     )
  //   );
  };

  return (
    <div className={styles.chatbotContainer}>
      <div className={styles.messageArea}>
        {/*messages.map((msg, i) => (
          <div
            key={i}
            className={
              msg.from === "bot" ? styles.botMessage : styles.userMessage
            }
          >
            {msg.text}
          </div>
        ))*/}
      </div>
      <form onSubmit={handleSubmit} className={styles.chatForm}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className={styles.chatInput}
          placeholder="Ask something like 'suggest me outfits for goa'"
        />
        <button type="submit" className={styles.sendButton} >
          Send
        </button>
      </form>
    </div>
  );
}