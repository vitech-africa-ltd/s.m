import { useState, useRef, useEffect } from "react";
import { useApp, mutate, uid, todayISO, me } from "../lib/data";
import { Ic } from "../components/icons";
import { Avatar, Chip } from "../components/ui";
import { useT } from "../lib/i18n";

interface Message {
  id: string;
  from: string;
  to: string;
  text: string;
  date: string;
  read: boolean;
}

export default function ChatPage() {
  const s = useApp();
  const tt = useT();
  const db = s.db;
  const user = me(s);
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get all users except current user
  const contacts = db.users.filter(u => u.id !== user?.id);

  // Get conversations - messages between current user and others
  const getConversation = (contactId: string) => {
    return (db as any).messages?.filter((m: Message) => 
      (m.from === user?.id && m.to === contactId) || 
      (m.from === contactId && m.to === user?.id)
    ).sort((a: Message, b: Message) => a.date.localeCompare(b.date)) || [];
  };

  // Get last message for each contact
  const getLastMessage = (contactId: string) => {
    const conv = getConversation(contactId);
    return conv.length > 0 ? conv[conv.length - 1] : null;
  };

  // Get unread count for each contact
  const getUnreadCount = (contactId: string) => {
    return (db as any).messages?.filter((m: Message) => 
      m.from === contactId && m.to === user?.id && !m.read
    ).length || 0;
  };

  // Send message
  const sendMessage = () => {
    if (!message.trim() || !selectedContact) return;

    mutate((db) => {
      if (!(db as any).messages) (db as any).messages = [];
      (db as any).messages.push({
        id: uid(),
        from: user?.id,
        to: selectedContact,
        text: message.trim(),
        date: `${todayISO()} ${new Date().toTimeString().slice(0, 5)}`,
        read: false,
      });
    });

    setMessage("");
    
    // Auto-scroll to bottom
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // Mark messages as read
  useEffect(() => {
    if (selectedContact) {
      mutate((db) => {
        if (!(db as any).messages) return;
        (db as any).messages.forEach((m: Message) => {
          if (m.from === selectedContact && m.to === user?.id) {
            m.read = true;
          }
        });
      });
    }
  }, [selectedContact, user?.id]);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [getConversation(selectedContact || "")]);

  const currentConversation = selectedContact ? getConversation(selectedContact) : [];

  return (
    <div className="flex h-[calc(100vh-8rem)]">
      {/* Contacts sidebar */}
      <div className="w-80 border-r border-ink-100 dark:border-ink-800 flex flex-col">
        <div className="p-4 border-b border-ink-100 dark:border-ink-800">
          <h2 className="font-display font-bold text-[18px]">{tt("Messages")}</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {contacts.map(contact => {
            const lastMsg = getLastMessage(contact.id);
            const unread = getUnreadCount(contact.id);
            const isSelected = selectedContact === contact.id;

            return (
              <button
                key={contact.id}
                onClick={() => setSelectedContact(contact.id)}
                className={`w-full p-4 flex items-start gap-3 hover:bg-ink-50 dark:hover:bg-ink-900 transition-colors border-b border-ink-50 dark:border-ink-800/50 ${
                  isSelected ? "bg-cobalt-50 dark:bg-cobalt-500/10" : ""
                }`}
              >
                <Avatar first={contact.name.split(" ")[0]} last={contact.name.split(" ")[1] || ""} hue={contact.hue} size={48} />
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-[14px] truncate">{contact.name}</h3>
                    {unread > 0 && (
                      <span className="bg-cobalt-600 text-white text-[11px] font-bold rounded-full px-2 py-0.5 min-w-[20px] text-center">
                        {unread}
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-ink-400 truncate">
                    {lastMsg ? lastMsg.text : tt("No messages yet")}
                  </p>
                  {lastMsg && (
                    <p className="text-[10px] text-ink-300 mt-0.5">
                      {lastMsg.date.slice(11, 16)}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {selectedContact ? (
          <>
            {/* Chat header */}
            <div className="p-4 border-b border-ink-100 dark:border-ink-800 flex items-center gap-3">
              {(() => {
                const contact = contacts.find(c => c.id === selectedContact);
                if (!contact) return null;
                return (
                  <>
                    <Avatar first={contact.name.split(" ")[0]} last={contact.name.split(" ")[1] || ""} hue={contact.hue} size={40} />
                    <div>
                      <h3 className="font-bold text-[15px]">{contact.name}</h3>
                      <p className="text-[11px] text-ink-400">{contact.role}</p>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {currentConversation.length === 0 ? (
                <div className="flex items-center justify-center h-full text-ink-400">
                  <p>{tt("Start a conversation")}</p>
                </div>
              ) : (
                currentConversation.map((msg: Message) => {
                  const isMe = msg.from === user?.id;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                        isMe 
                          ? "bg-cobalt-600 text-white" 
                          : "bg-ink-100 dark:bg-ink-800 text-ink-900 dark:text-ink-100"
                      }`}>
                        <p className="text-[14px]">{msg.text}</p>
                        <p className={`text-[10px] mt-1 ${isMe ? "text-cobalt-200" : "text-ink-400"}`}>
                          {msg.date.slice(11, 16)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message input */}
            <div className="p-4 border-t border-ink-100 dark:border-ink-800">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  placeholder={tt("Type a message...")}
                  className="input flex-1"
                />
                <button
                  onClick={sendMessage}
                  disabled={!message.trim()}
                  className="btn-p !px-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Ic n="send" size={18} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-ink-400">
            <div className="text-center">
              <Ic n="chat" size={64} className="mx-auto mb-4 opacity-30" />
              <p className="text-[16px]">{tt("Select a contact to start chatting")}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
