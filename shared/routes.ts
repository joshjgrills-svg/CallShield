import { z } from "zod";

export const routes = {
  getUser: {
    path: "/api/user",
    method: "GET",
    responses: {
      200: z.object({
        id: z.number(),
        username: z.string(),
        displayName: z.string().nullable(),
      }).nullable(),
    },
  },
  getCalls: {
    path: "/api/calls",
    method: "GET",
    responses: {
      200: z.array(z.object({
        id: z.number(),
        phoneNumber: z.string(),
        callerName: z.string().nullable(),
        timestamp: z.string(),
        riskScore: z.number(),
        category: z.string(),
        blocked: z.boolean(),
        duration: z.number().nullable(),
      })),
    },
  },
  getCall: {
    path: "/api/calls/:id",
    method: "GET",
    responses: {
      200: z.object({
        id: z.number(),
        phoneNumber: z.string(),
        callerName: z.string().nullable(),
        timestamp: z.string(),
        riskScore: z.number(),
        category: z.string(),
        transcription: z.string().nullable(),
        aiResponse: z.string().nullable(),
        blocked: z.boolean(),
        duration: z.number().nullable(),
      }),
    },
  },
  simulateCall: {
    path: "/api/calls/simulate",
    method: "POST",
    body: z.object({
      phoneNumber: z.string(),
      callerName: z.string().optional(),
      message: z.string(),
    }),
    responses: {
      200: z.object({
        success: z.boolean(),
        callId: z.number(),
        riskScore: z.number(),
        category: z.string(),
        aiResponse: z.string(),
        blocked: z.boolean(),
      }),
    },
  },
  getBlockedRules: {
    path: "/api/blocked-rules",
    method: "GET",
    responses: {
      200: z.array(z.object({
        id: z.number(),
        phoneNumber: z.string(),
        ruleName: z.string(),
        isWildcard: z.boolean(),
        createdAt: z.string(),
      })),
    },
  },
  addBlockedRule: {
    path: "/api/blocked-rules",
    method: "POST",
    body: z.object({
      phoneNumber: z.string(),
      ruleName: z.string(),
      isWildcard: z.boolean().optional(),
    }),
    responses: {
      200: z.object({
        success: z.boolean(),
        rule: z.object({
          id: z.number(),
          phoneNumber: z.string(),
          ruleName: z.string(),
          isWildcard: z.boolean(),
        }),
      }),
    },
  },
  deleteBlockedRule: {
    path: "/api/blocked-rules/:id",
    method: "DELETE",
    responses: {
      200: z.object({
        success: z.boolean(),
      }),
    },
  },
  getSettings: {
    path: "/api/settings",
    method: "GET",
    responses: {
      200: z.object({
        screeningEnabled: z.boolean(),
        protectionLevel: z.string(),
        quietHoursStart: z.string().nullable(),
        quietHoursEnd: z.string().nullable(),
        autoBlockThreshold: z.number(),
      }),
    },
  },
  updateSettings: {
    path: "/api/settings",
    method: "PUT",
    body: z.object({
      screeningEnabled: z.boolean().optional(),
      protectionLevel: z.string().optional(),
      quietHoursStart: z.string().nullable().optional(),
      quietHoursEnd: z.string().nullable().optional(),
      autoBlockThreshold: z.number().optional(),
    }),
    responses: {
      200: z.object({
        success: z.boolean(),
      }),
    },
  },
  getConversations: {
    path: "/api/conversations",
    method: "GET",
    responses: {
      200: z.array(z.object({
        id: z.number(),
        title: z.string(),
        createdAt: z.string(),
        updatedAt: z.string(),
      })),
    },
  },
  getMessages: {
    path: "/api/conversations/:id/messages",
    method: "GET",
    responses: {
      200: z.array(z.object({
        id: z.number(),
        role: z.string(),
        content: z.string(),
        timestamp: z.string(),
      })),
    },
  },
  sendMessage: {
    path: "/api/conversations/:id/messages",
    method: "POST",
    body: z.object({
      content: z.string(),
    }),
    responses: {
      200: z.object({
        success: z.boolean(),
        message: z.object({
          id: z.number(),
          role: z.string(),
          content: z.string(),
          timestamp: z.string(),
        }),
      }),
    },
  },
  createConversation: {
    path: "/api/conversations",
    method: "POST",
    body: z.object({
      title: z.string().optional(),
    }),
    responses: {
      200: z.object({
        success: z.boolean(),
        conversation: z.object({
          id: z.number(),
          title: z.string(),
          createdAt: z.string(),
        }),
      }),
    },
  },
} as const;
