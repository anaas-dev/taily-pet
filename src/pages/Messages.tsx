import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, MessageCircle, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  created_at: string;
  read: boolean;
}

interface Conversation {
  partnerId: string;
  partnerName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

const Messages = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedPartnerId = searchParams.get("with");

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedConversation, setSelectedConversation] = useState<string | null>(selectedPartnerId);
  const [partnerName, setPartnerName] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  // Fetch conversations
  useEffect(() => {
    if (!user) return;

    const fetchConversations = async () => {
      setLoading(true);
      try {
        // Get all messages where user is sender or receiver
        const { data: allMessages, error } = await supabase
          .from("messages")
          .select("*")
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .order("created_at", { ascending: false });

        if (error) throw error;

        // Group by conversation partner
        const conversationMap = new Map<string, { messages: Message[]; unread: number }>();
        
        allMessages?.forEach((msg) => {
          const partnerId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
          if (!conversationMap.has(partnerId)) {
            conversationMap.set(partnerId, { messages: [], unread: 0 });
          }
          conversationMap.get(partnerId)!.messages.push(msg);
          if (!msg.read && msg.receiver_id === user.id) {
            conversationMap.get(partnerId)!.unread++;
          }
        });

        // Fetch partner profiles
        const partnerIds = Array.from(conversationMap.keys());
        if (partnerIds.length === 0) {
          setConversations([]);
          setLoading(false);
          return;
        }

        // Use secure RPC function to get partner names (only for users we have messages with)
        const { data: profiles } = await supabase
          .rpc("get_message_partner_info", { partner_ids: partnerIds });

        const { data: sitterProfiles } = await supabase
          .from("sitter_profiles")
          .select("user_id, first_name, last_name")
          .in("user_id", partnerIds);

        const nameMap = new Map<string, string>();
        profiles?.forEach((p) => {
          const name = [p.first_name, p.last_name].filter(Boolean).join(" ") || "User";
          nameMap.set(p.user_id, name);
        });
        sitterProfiles?.forEach((p) => {
          if (!nameMap.has(p.user_id)) {
            const name = [p.first_name, p.last_name].filter(Boolean).join(" ") || "Sitter";
            nameMap.set(p.user_id, name);
          }
        });

        const convList: Conversation[] = partnerIds.map((partnerId) => {
          const conv = conversationMap.get(partnerId)!;
          const lastMsg = conv.messages[0];
          return {
            partnerId,
            partnerName: nameMap.get(partnerId) || "Unknown",
            lastMessage: lastMsg.content,
            lastMessageTime: lastMsg.created_at,
            unreadCount: conv.unread,
          };
        });

        setConversations(convList);
      } catch (error) {
        console.error("Error fetching conversations:", error);
        toast.error("Failed to load conversations");
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [user]);

  // Fetch messages for selected conversation
  useEffect(() => {
    if (!user || !selectedConversation) return;

    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from("messages")
          .select("*")
          .or(
            `and(sender_id.eq.${user.id},receiver_id.eq.${selectedConversation}),and(sender_id.eq.${selectedConversation},receiver_id.eq.${user.id})`
          )
          .order("created_at", { ascending: true });

        if (error) throw error;
        setMessages(data || []);

        // Mark messages as read
        await supabase
          .from("messages")
          .update({ read: true })
          .eq("sender_id", selectedConversation)
          .eq("receiver_id", user.id)
          .eq("read", false);

        // Get partner name
        const conv = conversations.find((c) => c.partnerId === selectedConversation);
        if (conv) {
          setPartnerName(conv.partnerName);
        } else {
          // Use secure RPC function to get partner name
          const { data: profile } = await supabase
            .rpc("get_single_partner_info", { partner_id: selectedConversation });
          
          if (profile && profile.length > 0) {
            setPartnerName([profile[0].first_name, profile[0].last_name].filter(Boolean).join(" ") || "User");
          }
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [user, selectedConversation, conversations]);

  // Real-time subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("messages-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${user.id}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          
          // If viewing this conversation, add message
          if (selectedConversation === newMsg.sender_id) {
            setMessages((prev) => [...prev, newMsg]);
            // Mark as read
            supabase
              .from("messages")
              .update({ read: true })
              .eq("id", newMsg.id);
          }
          
          // Update conversations list
          setConversations((prev) => {
            const existing = prev.find((c) => c.partnerId === newMsg.sender_id);
            if (existing) {
              return prev.map((c) =>
                c.partnerId === newMsg.sender_id
                  ? {
                      ...c,
                      lastMessage: newMsg.content,
                      lastMessageTime: newMsg.created_at,
                      unreadCount: selectedConversation === newMsg.sender_id ? 0 : c.unreadCount + 1,
                    }
                  : c
              );
            }
            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, selectedConversation]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !selectedConversation || sending) return;

    setSending(true);
    try {
      const { data, error } = await supabase
        .from("messages")
        .insert({
          content: newMessage.trim(),
          sender_id: user.id,
          receiver_id: selectedConversation,
        })
        .select()
        .single();

      if (error) throw error;

      setMessages((prev) => [...prev, data]);
      setNewMessage("");

      // Update conversations list
      setConversations((prev) => {
        const existing = prev.find((c) => c.partnerId === selectedConversation);
        if (existing) {
          return prev.map((c) =>
            c.partnerId === selectedConversation
              ? { ...c, lastMessage: data.content, lastMessageTime: data.created_at }
              : c
          );
        }
        return [
          {
            partnerId: selectedConversation,
            partnerName: partnerName,
            lastMessage: data.content,
            lastMessageTime: data.created_at,
            unreadCount: 0,
          },
          ...prev,
        ];
      });
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Messages</h1>

        <div className="bg-card rounded-2xl shadow-soft border overflow-hidden h-[600px] flex">
          {/* Conversations List */}
          <div
            className={`w-full md:w-80 border-r flex flex-col ${
              selectedConversation ? "hidden md:flex" : "flex"
            }`}
          >
            <div className="p-4 border-b">
              <h2 className="font-semibold text-lg">Conversations</h2>
            </div>
            <ScrollArea className="flex-1">
              {loading ? (
                <div className="p-4 text-center text-muted-foreground">Loading...</div>
              ) : conversations.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-muted-foreground">No conversations yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Start chatting with a pet sitter!
                  </p>
                </div>
              ) : (
                conversations.map((conv) => (
                  <button
                    key={conv.partnerId}
                    onClick={() => setSelectedConversation(conv.partnerId)}
                    className={`w-full p-4 flex items-start gap-3 hover:bg-muted/50 transition-colors text-left ${
                      selectedConversation === conv.partnerId ? "bg-muted" : ""
                    }`}
                  >
                    <Avatar>
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {conv.partnerName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium truncate">{conv.partnerName}</span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(conv.lastMessageTime), "MMM d")}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5">
                        {conv.unreadCount}
                      </span>
                    )}
                  </button>
                ))
              )}
            </ScrollArea>
          </div>

          {/* Chat Area */}
          <div
            className={`flex-1 flex flex-col ${
              selectedConversation ? "flex" : "hidden md:flex"
            }`}
          >
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    onClick={() => setSelectedConversation(null)}
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                  <Avatar>
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {partnerName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-semibold">{partnerName}</span>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender_id === user.id ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                            msg.sender_id === user.id
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <p>{msg.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              msg.sender_id === user.id
                                ? "text-primary-foreground/70"
                                : "text-muted-foreground"
                            }`}
                          >
                            {format(new Date(msg.created_at), "h:mm a")}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="p-4 border-t">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      sendMessage();
                    }}
                    className="flex gap-2"
                  >
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1"
                    />
                    <Button type="submit" disabled={!newMessage.trim() || sending}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center p-8">
                <div>
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                  <p className="text-muted-foreground">Select a conversation to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Messages;
