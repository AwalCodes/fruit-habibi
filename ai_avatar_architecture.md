# AI Avatar Assistant - Technical Architecture

## Overview

The AI Avatar Assistant for Fruit Habibi provides intelligent customer support through a RAG (Retrieval-Augmented Generation) powered chatbot with multiple avatar presentation options. The system is designed to handle multilingual support (English, Arabic, French) and seamlessly hand off complex queries to human agents.

## Architecture Diagram

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API    │    │   AI Services   │
│                 │    │                  │    │                 │
│ ┌─────────────┐ │    │ ┌──────────────┐ │    │ ┌─────────────┐ │
│ │ Chat Widget │ │◄──►│ │ API Routes   │ │◄──►│ │ OpenAI GPT  │ │
│ └─────────────┘ │    │ └──────────────┘ │    │ └─────────────┘ │
│                 │    │                  │    │                 │
│ ┌─────────────┐ │    │ ┌──────────────┐ │    │ ┌─────────────┐ │
│ │ Avatar UI   │ │    │ │ RAG Pipeline │ │◄──►│ │ Pinecone    │ │
│ └─────────────┘ │    │ └──────────────┘ │    │ │ Vector DB   │ │
│                 │    │                  │    │ └─────────────┘ │
│ ┌─────────────┐ │    │ ┌──────────────┐ │    │                 │
│ │ Voice I/O   │ │◄──►│ │ Session Mgmt │ │    │ ┌─────────────┐ │
│ └─────────────┘ │    │ └──────────────┘ │    │ │ ElevenLabs  │ │
└─────────────────┘    └──────────────────┘    │ │ TTS/STT     │ │
                                                │ └─────────────┘ │
┌─────────────────┐    ┌──────────────────┐    └─────────────────┘
│   Knowledge     │    │   Monitoring     │    
│   Sources       │    │   & Analytics    │    
│                 │    │                  │    
│ ┌─────────────┐ │    │ ┌──────────────┐ │    
│ │ Site Content│ │    │ │ Sentry       │ │    
│ └─────────────┘ │    │ └──────────────┘ │    
│                 │    │                  │    
│ ┌─────────────┐ │    │ ┌──────────────┐ │    
│ │ FAQ Docs    │ │    │ │ Analytics    │ │    
│ └─────────────┘ │    │ └──────────────┘ │    
│                 │    │                  │    
│ ┌─────────────┐ │    │ ┌──────────────┐ │    
│ │ Product DB  │ │    │ │ Conversation │ │    
│ └─────────────┘ │    │ │ Logs        │ │    
└─────────────────┘    │ └──────────────┘ │    
                       └──────────────────┘    
```

## Core Components

### 1. Frontend Chat Widget

```typescript
// src/components/AIChatWidget.tsx
interface AIChatWidgetProps {
  userId?: string;
  context?: 'product' | 'general' | 'support';
  language?: 'en' | 'ar' | 'fr';
  avatarType?: 'static' | 'animated' | 'video';
  onHumanHandoff?: () => void;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    confidence?: number;
    sources?: string[];
    language?: string;
  };
}

interface ChatSession {
  id: string;
  userId?: string;
  messages: ChatMessage[];
  context: ChatContext;
  language: string;
  avatarType: string;
  createdAt: Date;
  lastActivity: Date;
}
```

### 2. Backend API Routes

```typescript
// src/app/api/ai/chat/route.ts
interface ChatRequest {
  message: string;
  sessionId?: string;
  context?: ChatContext;
  language?: string;
  voiceEnabled?: boolean;
}

interface ChatResponse {
  response: string;
  sessionId: string;
  confidence: number;
  sources: string[];
  requiresHumanHandoff: boolean;
  suggestedActions?: string[];
}

// src/app/api/ai/ingest/route.ts
interface IngestRequest {
  contentType: 'faq' | 'product' | 'policy' | 'manual';
  content: string;
  metadata: Record<string, any>;
}

// src/app/api/ai/handoff/route.ts
interface HandoffRequest {
  sessionId: string;
  reason: 'complex_query' | 'user_request' | 'low_confidence';
  conversationSummary: string;
}
```

### 3. RAG Pipeline

```typescript
// src/lib/rag.ts
interface RAGConfig {
  maxTokens: number;
  temperature: number;
  topK: number;
  language: string;
  contextWindow: number;
}

interface RetrievalResult {
  content: string;
  source: string;
  score: number;
  metadata: Record<string, any>;
}

class RAGPipeline {
  async retrieve(query: string, context: ChatContext): Promise<RetrievalResult[]>;
  async generate(prompt: string, context: string[]): Promise<string>;
  async processMessage(message: string, session: ChatSession): Promise<ChatResponse>;
}
```

## Knowledge Sources & Ingestion

### 1. Content Types

```typescript
interface KnowledgeSource {
  id: string;
  type: 'faq' | 'product' | 'policy' | 'shipping' | 'payment' | 'support';
  title: string;
  content: string;
  language: 'en' | 'ar' | 'fr';
  metadata: {
    category?: string;
    tags?: string[];
    priority?: number;
    lastUpdated: Date;
  };
  embedding?: number[];
}
```

### 2. Automated Ingestion

```typescript
// src/lib/knowledgeIngestion.ts
class KnowledgeIngestion {
  async ingestSiteContent(): Promise<void>;
  async ingestProductCatalog(): Promise<void>;
  async ingestFAQDocuments(): Promise<void>;
  async ingestSupportManuals(): Promise<void>;
  async generateEmbeddings(content: string): Promise<number[]>;
  async upsertToVectorDB(source: KnowledgeSource): Promise<void>;
}
```

### 3. Content Sources

```markdown
## Knowledge Base Structure

### FAQ Categories
- Account & Registration
- Product Listings
- Orders & Payments
- Shipping & Logistics
- Reviews & Ratings
- Technical Support

### Product Information
- Category-specific details
- Shipping requirements
- Quality standards
- Certification requirements
- Pricing guidelines

### Policy Documents
- Terms of Service
- Privacy Policy
- Shipping Terms
- Payment Terms
- Refund Policy

### Support Manuals
- User guides
- Troubleshooting guides
- Best practices
- Common issues
```

## Avatar Implementation Options

### 1. Static Avatar (Simple)

```typescript
// src/components/StaticAvatar.tsx
interface StaticAvatarProps {
  emotion: 'neutral' | 'happy' | 'thinking' | 'speaking';
  size: 'small' | 'medium' | 'large';
}

const AvatarSVG = ({ emotion, size }: StaticAvatarProps) => {
  const sizeMap = { small: 40, medium: 80, large: 120 };
  const colorMap = {
    neutral: '#10B981',
    happy: '#F59E0B',
    thinking: '#6B7280',
    speaking: '#EF4444'
  };
  
  return (
    <svg width={sizeMap[size]} height={sizeMap[size]} viewBox="0 0 100 100">
      {/* Avatar design with emotion-based styling */}
    </svg>
  );
};
```

### 2. Animated Avatar (Medium)

```typescript
// src/components/AnimatedAvatar.tsx
interface AnimatedAvatarProps {
  isSpeaking: boolean;
  emotion: 'neutral' | 'happy' | 'thinking';
  language: 'en' | 'ar' | 'fr';
}

const AnimatedAvatar = ({ isSpeaking, emotion, language }: AnimatedAvatarProps) => {
  return (
    <div className="relative">
      {/* Base avatar */}
      <div className="avatar-container">
        {/* Face, eyes, mouth with CSS animations */}
        <div className={`mouth ${isSpeaking ? 'speaking' : 'idle'}`} />
        <div className={`eyes ${emotion}`} />
      </div>
      
      {/* Language-specific styling for RTL */}
      {language === 'ar' && (
        <div className="rtl-indicator">العربية</div>
      )}
    </div>
  );
};
```

### 3. Video Avatar (Premium)

```typescript
// src/components/VideoAvatar.tsx
interface VideoAvatarProps {
  message: string;
  language: 'en' | 'ar' | 'fr';
  onVideoReady: () => void;
}

const VideoAvatar = ({ message, language, onVideoReady }: VideoAvatarProps) => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  
  useEffect(() => {
    // Generate video using Synthesia/HeyGen API
    generateTalkingAvatar(message, language).then(setVideoUrl);
  }, [message, language]);
  
  return (
    <div className="video-avatar-container">
      {videoUrl ? (
        <video 
          src={videoUrl} 
          autoPlay 
          muted 
          onLoadedData={onVideoReady}
          className="talking-avatar"
        />
      ) : (
        <div className="loading-avatar">Generating video...</div>
      )}
    </div>
  );
};
```

## Voice Integration

### 1. Speech-to-Text (STT)

```typescript
// src/lib/voiceInput.ts
interface VoiceInputConfig {
  language: 'en-US' | 'ar-SA' | 'fr-FR';
  continuous: boolean;
  interimResults: boolean;
}

class VoiceInput {
  private recognition: SpeechRecognition;
  
  constructor(config: VoiceInputConfig) {
    this.recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    this.setupRecognition(config);
  }
  
  startListening(): Promise<string>;
  stopListening(): void;
  onResult(callback: (text: string) => void): void;
}
```

### 2. Text-to-Speech (TTS)

```typescript
// src/lib/voiceOutput.ts
interface VoiceOutputConfig {
  language: 'en' | 'ar' | 'fr';
  voice: 'male' | 'female';
  speed: number;
  pitch: number;
}

class VoiceOutput {
  async synthesize(text: string, config: VoiceOutputConfig): Promise<AudioBuffer>;
  async playAudio(audioBuffer: AudioBuffer): Promise<void>;
  async speakText(text: string, config: VoiceOutputConfig): Promise<void>;
}
```

## Multilingual Support

### 1. Language Detection

```typescript
// src/lib/languageDetection.ts
class LanguageDetector {
  async detectLanguage(text: string): Promise<'en' | 'ar' | 'fr'>;
  async translateText(text: string, targetLanguage: string): Promise<string>;
  async getLanguageSpecificPrompt(basePrompt: string, language: string): Promise<string>;
}
```

### 2. RTL Support

```css
/* src/styles/rtl.css */
.rtl-container {
  direction: rtl;
  text-align: right;
}

.rtl-container .chat-message {
  margin-right: 0;
  margin-left: 1rem;
}

.rtl-container .avatar {
  order: 2;
}

.rtl-container .message-content {
  order: 1;
}
```

## Conversation Management

### 1. Session Storage

```typescript
// src/lib/conversationStorage.ts
interface ConversationSession {
  id: string;
  userId?: string;
  messages: ChatMessage[];
  context: ChatContext;
  language: string;
  startTime: Date;
  lastActivity: Date;
  metadata: {
    userAgent: string;
    ipAddress: string;
    referrer?: string;
  };
}

class ConversationManager {
  async createSession(context: ChatContext): Promise<ConversationSession>;
  async getSession(sessionId: string): Promise<ConversationSession | null>;
  async updateSession(sessionId: string, updates: Partial<ConversationSession>): Promise<void>;
  async archiveSession(sessionId: string): Promise<void>;
  async getSessionHistory(userId: string): Promise<ConversationSession[]>;
}
```

### 2. Context Management

```typescript
// src/lib/contextManager.ts
interface ChatContext {
  type: 'product' | 'general' | 'support' | 'shipping' | 'payment';
  productId?: string;
  userId?: string;
  userRole?: 'farmer' | 'importer' | 'admin';
  sessionData: Record<string, any>;
}

class ContextManager {
  async buildContext(sessionId: string, message: string): Promise<ChatContext>;
  async updateContext(sessionId: string, updates: Partial<ChatContext>): Promise<void>;
  async getRelevantKnowledge(context: ChatContext): Promise<KnowledgeSource[]>;
}
```

## Human Handoff System

### 1. Handoff Triggers

```typescript
// src/lib/handoffTriggers.ts
interface HandoffTrigger {
  type: 'confidence_threshold' | 'complex_query' | 'user_request' | 'escalation_keyword';
  condition: (message: string, confidence: number) => boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

const handoffTriggers: HandoffTrigger[] = [
  {
    type: 'confidence_threshold',
    condition: (message, confidence) => confidence < 0.7,
    priority: 'medium'
  },
  {
    type: 'escalation_keyword',
    condition: (message) => /speak to human|talk to agent|customer service/i.test(message),
    priority: 'high'
  },
  {
    type: 'complex_query',
    condition: (message) => message.length > 500 || message.split('?').length > 3,
    priority: 'medium'
  }
];
```

### 2. Handoff Process

```typescript
// src/lib/humanHandoff.ts
interface HandoffRequest {
  sessionId: string;
  reason: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  conversationSummary: string;
  userInfo?: {
    userId?: string;
    email?: string;
    role?: string;
  };
}

class HumanHandoff {
  async initiateHandoff(request: HandoffRequest): Promise<string>;
  async getAvailableAgents(): Promise<Agent[]>;
  async assignAgent(ticketId: string, agentId: string): Promise<void>;
  async notifyAgent(ticketId: string): Promise<void>;
}
```

## Analytics & Monitoring

### 1. Conversation Analytics

```typescript
// src/lib/analytics.ts
interface ConversationMetrics {
  sessionId: string;
  userId?: string;
  startTime: Date;
  endTime: Date;
  messageCount: number;
  averageResponseTime: number;
  confidenceScores: number[];
  handoffRequired: boolean;
  handoffReason?: string;
  userSatisfaction?: number;
  resolutionType: 'ai_resolved' | 'human_handoff' | 'abandoned';
}

class ConversationAnalytics {
  async trackMessage(sessionId: string, message: ChatMessage): Promise<void>;
  async trackHandoff(sessionId: string, reason: string): Promise<void>;
  async getMetrics(dateRange: DateRange): Promise<ConversationMetrics[]>;
  async getSatisfactionScore(sessionId: string): Promise<number>;
}
```

### 2. Performance Monitoring

```typescript
// src/lib/performanceMonitoring.ts
interface PerformanceMetrics {
  responseTime: number;
  embeddingTime: number;
  generationTime: number;
  totalTokens: number;
  cacheHitRate: number;
  errorRate: number;
}

class PerformanceMonitor {
  async trackResponseTime(operation: string, duration: number): Promise<void>;
  async trackTokenUsage(tokens: number): Promise<void>;
  async trackError(error: Error, context: Record<string, any>): Promise<void>;
  async getPerformanceReport(): Promise<PerformanceMetrics>;
}
```

## Privacy & Compliance

### 1. Data Protection

```typescript
// src/lib/privacyCompliance.ts
interface PrivacyConfig {
  dataRetentionDays: number;
  anonymizeAfterDays: number;
  consentRequired: boolean;
  gdprCompliant: boolean;
}

class PrivacyManager {
  async anonymizeSession(sessionId: string): Promise<void>;
  async deleteUserData(userId: string): Promise<void>;
  async exportUserData(userId: string): Promise<UserDataExport>;
  async checkConsent(userId: string): Promise<boolean>;
}
```

### 2. Conversation Logging

```typescript
// src/lib/conversationLogging.ts
interface ConversationLog {
  sessionId: string;
  timestamp: Date;
  messageType: 'user' | 'assistant' | 'system';
  content: string;
  metadata: {
    confidence?: number;
    sources?: string[];
    processingTime?: number;
  };
  anonymized: boolean;
}

class ConversationLogger {
  async logMessage(log: ConversationLog): Promise<void>;
  async getConversationLogs(sessionId: string): Promise<ConversationLog[]>;
  async anonymizeLogs(sessionId: string): Promise<void>;
}
```

## Implementation Roadmap

### Phase 1: Basic RAG Chatbot (Weeks 1-2)
1. Set up Pinecone vector database
2. Implement basic RAG pipeline
3. Create simple chat widget
4. Ingest FAQ and basic content

### Phase 2: Multilingual Support (Weeks 3-4)
1. Add language detection
2. Implement Arabic and French support
3. Create RTL layout support
4. Add translation capabilities

### Phase 3: Voice Integration (Weeks 5-6)
1. Implement STT with Web Speech API
2. Add TTS with ElevenLabs
3. Create voice-enabled chat interface
4. Add voice command recognition

### Phase 4: Advanced Avatar (Weeks 7-8)
1. Create animated avatar with CSS
2. Add emotion-based animations
3. Implement lip-sync for speaking state
4. Add avatar customization options

### Phase 5: Human Handoff (Weeks 9-10)
1. Implement handoff triggers
2. Create agent assignment system
3. Build handoff dashboard
4. Add escalation workflows

### Phase 6: Analytics & Optimization (Weeks 11-12)
1. Implement conversation analytics
2. Add performance monitoring
3. Create admin dashboard
4. Optimize RAG pipeline

This architecture provides a comprehensive foundation for implementing an intelligent, multilingual AI assistant that can scale with the Fruit Habibi marketplace while maintaining high-quality user interactions and seamless human handoff capabilities.
