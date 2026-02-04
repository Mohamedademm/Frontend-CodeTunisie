import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageCircle,
  Send,
  Loader2,
  Bot,
  User,
  Sparkles,
  Info,
  X,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Textarea } from '@/app/components/ui/textarea';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Badge } from '@/app/components/ui/badge';
import { articleService, AssistantResponse } from '@/services/articleService';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  context?: AssistantResponse['context'];
}

interface AIAssistantProps {
  currentArticleNumber: number;
}

export function AIAssistant({ currentArticleNumber }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Clear messages when article changes
  useEffect(() => {
    setMessages([]);
    setError(null);
  }, [currentArticleNumber]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await articleService.askAssistant(
        userMessage.content,
        currentArticleNumber,
        true
      );

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.answer,
        timestamp: new Date(),
        context: response.context,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: unknown) {
      console.error('Error getting AI response:', err);
      const errorMessage = err instanceof Error ? err.message : 'خطأ غير معروف';
      setError('فشل في الحصول على إجابة. يرجى المحاولة مرة أخرى.');
      
      // Add error message to chat
      const errorAssistantMessage: Message = {
        id: `assistant-error-${Date.now()}`,
        role: 'assistant',
        content: `عذراً، حدث خطأ أثناء معالجة سؤالك. ${errorMessage}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorAssistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const suggestedQuestions = [
    'ما هو تعريف الطريق؟',
    'اشرح لي هذا الفصل بشكل مبسط',
    'ما هي أهم النقاط في هذا الفصل؟',
    'أعطني مثالاً عملياً',
  ];

  return (
    <motion.div
      layout
      className={isExpanded ? 'fixed inset-4 z-50' : ''}
    >
      <Card className={`glass-effect border-border overflow-hidden ${isExpanded ? 'h-full' : ''}`}>
        {/* Header */}
        <CardHeader className="bg-gradient-to-l from-secondary/10 to-primary/10 border-b border-border py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-8 w-8"
              >
                {isExpanded ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </Button>
            </div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="relative">
                <Bot className="w-6 h-6 text-primary" />
                <Sparkles className="w-3 h-3 text-secondary absolute -top-1 -right-1" />
              </div>
              المساعد الذكي
            </CardTitle>
          </div>
          <div className="flex items-center gap-2 justify-end mt-2">
            <Badge variant="outline" className="bg-primary/10 text-primary text-xs">
              الفصل {currentArticleNumber}
            </Badge>
            <span className="text-xs text-muted-foreground">
              اسأل أي سؤال حول هذا الفصل
            </span>
          </div>
        </CardHeader>

        <CardContent className={`p-4 ${isExpanded ? 'h-[calc(100%-120px)]' : ''}`}>
          {/* Messages Area */}
          <ScrollArea
            ref={scrollAreaRef}
            className={`mb-4 ${isExpanded ? 'h-[calc(100%-160px)]' : 'h-64'}`}
          >
            <div className="space-y-4 pl-2">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">مرحباً! كيف يمكنني مساعدتك؟</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    اطرح أي سؤال حول الفصل {currentArticleNumber} وسأساعدك في فهمه
                  </p>
                  
                  {/* Suggested Questions */}
                  <div className="flex flex-wrap gap-2 justify-center">
                    {suggestedQuestions.map((question, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => {
                          setInput(question);
                          textareaRef.current?.focus();
                        }}
                      >
                        {question}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={`flex gap-3 ${
                        message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                      }`}
                    >
                      {/* Avatar */}
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          message.role === 'user'
                            ? 'bg-primary/10'
                            : 'bg-gradient-to-br from-primary/20 to-secondary/20'
                        }`}
                      >
                        {message.role === 'user' ? (
                          <User className="w-4 h-4 text-primary" />
                        ) : (
                          <Bot className="w-4 h-4 text-primary" />
                        )}
                      </div>

                      {/* Message Content */}
                      <div
                        className={`flex-1 max-w-[80%] ${
                          message.role === 'user' ? 'text-right' : 'text-right'
                        }`}
                      >
                        <div
                          className={`inline-block rounded-lg px-4 py-2 ${
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">
                            {message.content}
                          </p>
                        </div>
                        
                        {/* Context info for assistant messages */}
                        {message.role === 'assistant' && message.context && (
                          <div className="mt-1 flex items-center gap-1 justify-end text-xs text-muted-foreground">
                            <Info className="w-3 h-3" />
                            استندت على: {message.context.articlesUsed.map(a => a.title).join('، ')}
                          </div>
                        )}
                        
                        <p className="text-xs text-muted-foreground mt-1">
                          {message.timestamp.toLocaleTimeString('ar-TN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}

              {/* Loading indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div className="bg-muted rounded-lg px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      <span className="text-sm text-muted-foreground">جاري التفكير...</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </ScrollArea>

          {/* Error Alert */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center justify-between"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setError(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
                <span className="text-sm text-destructive">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="اكتب سؤالك هنا..."
              className="resize-none pl-12 text-right min-h-[60px]"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              className="absolute left-2 bottom-2"
              disabled={!input.trim() || isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </form>

          {/* Helper text */}
          <p className="text-xs text-muted-foreground text-center mt-2">
            اضغط Enter للإرسال • Shift+Enter لسطر جديد
          </p>
        </CardContent>
      </Card>

      {/* Backdrop for expanded mode */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            onClick={() => setIsExpanded(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default AIAssistant;
