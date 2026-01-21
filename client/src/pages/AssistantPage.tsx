import { MessageSquare, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AssistantPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">AI Assistant</h1>
        <p className="text-muted-foreground mt-2">
          Chat with your AI call protection assistant
        </p>
      </div>

      <Card className="h-[600px] flex flex-col">
        <CardHeader>
          <CardTitle>Chat</CardTitle>
          <CardDescription>
            Ask questions about call screening, manage settings, and get help
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto mb-4">
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Start a conversation</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Your AI assistant is ready to help
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Ask me anything about call protection..."
              disabled
            />
            <Button size="icon" disabled>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
