import type { Express } from 'express';
import { requireAuth } from './auth';
import { supabase } from './db';

export function setupRoutes(app: Express) {
  app.get('/api/user', (req, res) => {
    if (!req.user) {
      return res.json(null);
    }
    res.json(req.user);
  });

  app.get('/api/calls', requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { data, error } = await supabase
        .from('calls')
        .select('id, phone_number, caller_name, timestamp, risk_score, category, blocked, duration')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false });

      if (error) throw error;
      res.json(data || []);
    } catch (error) {
      console.error('Error fetching calls:', error);
      res.status(500).json({ error: 'Failed to fetch calls' });
    }
  });

  app.get('/api/calls/:id', requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const callId = parseInt(req.params.id);

      const { data, error } = await supabase
        .from('calls')
        .select('*')
        .eq('id', callId)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        return res.status(404).json({ error: 'Call not found' });
      }

      res.json(data);
    } catch (error) {
      console.error('Error fetching call:', error);
      res.status(500).json({ error: 'Failed to fetch call' });
    }
  });

  app.post('/api/calls/simulate', requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { phoneNumber, callerName, message } = req.body;

      const riskScore = Math.floor(Math.random() * 100);
      const categories = ['spam', 'scam', 'legitimate', 'telemarketer', 'unknown'];
      const category = categories[Math.floor(Math.random() * categories.length)];

      const aiResponse = `Thank you for calling. I'm screening calls right now. Please state your name and reason for calling.`;

      const { data: settings } = await supabase
        .from('user_settings')
        .select('auto_block_threshold')
        .eq('user_id', userId)
        .maybeSingle();

      const threshold = settings?.auto_block_threshold || 70;
      const blocked = riskScore >= threshold;

      const { data: call, error } = await supabase
        .from('calls')
        .insert([{
          user_id: userId,
          phone_number: phoneNumber,
          caller_name: callerName || null,
          risk_score: riskScore,
          category,
          transcription: message,
          ai_response: aiResponse,
          blocked,
          duration: Math.floor(Math.random() * 120) + 10,
        }])
        .select()
        .single();

      if (error) throw error;

      res.json({
        success: true,
        callId: call.id,
        riskScore,
        category,
        aiResponse,
        blocked,
      });
    } catch (error) {
      console.error('Error simulating call:', error);
      res.status(500).json({ error: 'Failed to simulate call' });
    }
  });

  app.get('/api/blocked-rules', requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { data, error } = await supabase
        .from('blocked_rules')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      res.json(data || []);
    } catch (error) {
      console.error('Error fetching blocked rules:', error);
      res.status(500).json({ error: 'Failed to fetch blocked rules' });
    }
  });

  app.post('/api/blocked-rules', requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { phoneNumber, ruleName, isWildcard } = req.body;

      const { data: rule, error } = await supabase
        .from('blocked_rules')
        .insert([{
          user_id: userId,
          phone_number: phoneNumber,
          rule_name: ruleName,
          is_wildcard: isWildcard || false,
        }])
        .select()
        .single();

      if (error) throw error;

      res.json({
        success: true,
        rule,
      });
    } catch (error) {
      console.error('Error adding blocked rule:', error);
      res.status(500).json({ error: 'Failed to add blocked rule' });
    }
  });

  app.delete('/api/blocked-rules/:id', requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const ruleId = parseInt(req.params.id);

      const { error } = await supabase
        .from('blocked_rules')
        .delete()
        .eq('id', ruleId)
        .eq('user_id', userId);

      if (error) throw error;

      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting blocked rule:', error);
      res.status(500).json({ error: 'Failed to delete blocked rule' });
    }
  });

  app.get('/api/settings', requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { data, error } = await supabase
        .from('user_settings')
        .select('screening_enabled, protection_level, quiet_hours_start, quiet_hours_end, auto_block_threshold')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        const { data: newSettings, error: insertError } = await supabase
          .from('user_settings')
          .insert([{ user_id: userId }])
          .select('screening_enabled, protection_level, quiet_hours_start, quiet_hours_end, auto_block_threshold')
          .single();

        if (insertError) throw insertError;
        return res.json(newSettings);
      }

      res.json(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      res.status(500).json({ error: 'Failed to fetch settings' });
    }
  });

  app.put('/api/settings', requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const updates = req.body;

      const { error } = await supabase
        .from('user_settings')
        .update(updates)
        .eq('user_id', userId);

      if (error) throw error;

      res.json({ success: true });
    } catch (error) {
      console.error('Error updating settings:', error);
      res.status(500).json({ error: 'Failed to update settings' });
    }
  });

  app.get('/api/conversations', requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      res.json(data || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      res.status(500).json({ error: 'Failed to fetch conversations' });
    }
  });

  app.post('/api/conversations', requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { title } = req.body;

      const { data: conversation, error } = await supabase
        .from('conversations')
        .insert([{
          user_id: userId,
          title: title || 'New Conversation',
        }])
        .select()
        .single();

      if (error) throw error;

      res.json({
        success: true,
        conversation,
      });
    } catch (error) {
      console.error('Error creating conversation:', error);
      res.status(500).json({ error: 'Failed to create conversation' });
    }
  });

  app.get('/api/conversations/:id/messages', requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const conversationId = parseInt(req.params.id);

      const { data: conversation } = await supabase
        .from('conversations')
        .select('user_id')
        .eq('id', conversationId)
        .maybeSingle();

      if (!conversation || conversation.user_id !== userId) {
        return res.status(404).json({ error: 'Conversation not found' });
      }

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('timestamp', { ascending: true });

      if (error) throw error;
      res.json(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  });

  app.post('/api/conversations/:id/messages', requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const conversationId = parseInt(req.params.id);
      const { content } = req.body;

      const { data: conversation } = await supabase
        .from('conversations')
        .select('user_id')
        .eq('id', conversationId)
        .maybeSingle();

      if (!conversation || conversation.user_id !== userId) {
        return res.status(404).json({ error: 'Conversation not found' });
      }

      const { data: userMessage, error: userError } = await supabase
        .from('messages')
        .insert([{
          conversation_id: conversationId,
          role: 'user',
          content,
        }])
        .select()
        .single();

      if (userError) throw userError;

      const aiResponseText = `I'm your AI assistant for CallShield. How can I help you protect yourself from unwanted calls today?`;

      const { data: aiMessage, error: aiError } = await supabase
        .from('messages')
        .insert([{
          conversation_id: conversationId,
          role: 'assistant',
          content: aiResponseText,
        }])
        .select()
        .single();

      if (aiError) throw aiError;

      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

      res.json({
        success: true,
        message: aiMessage,
      });
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ error: 'Failed to send message' });
    }
  });
}
