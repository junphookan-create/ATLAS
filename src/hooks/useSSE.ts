import { useEffect, useRef, useState, useCallback } from 'react';
import { getApiBaseUrl, getAuthToken } from '../lib/api';
import { SSEEventType, SSEMessage } from '../types/apiTypes';

interface UseSSEOptions {
  userId?: string;
  onNewApproval?: (data: any) => void;
  onApprovalDecided?: (data: any) => void;
  onHighMatchOpportunity?: (data: any) => void;
  onGcwQuestion?: (data: any) => void;
  onProjectUpdated?: (data: any) => void;
  onAnyEvent?: (event: SSEMessage) => void;
  enabled?: boolean;
}

export function useSSE({
  userId = 'usr-atlas-default',
  onNewApproval,
  onApprovalDecided,
  onHighMatchOpportunity,
  onGcwQuestion,
  onProjectUpdated,
  onAnyEvent,
  enabled = true,
}: UseSSEOptions = {}) {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [lastEvent, setLastEvent] = useState<SSEMessage | null>(null);
  const [eventHistory, setEventHistory] = useState<SSEMessage[]>([]);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<any>(null);

  const connect = useCallback(() => {
    if (!enabled || typeof window === 'undefined') return;

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const baseUrl = getApiBaseUrl();
    let sseUrl = `${baseUrl.replace(/\/+$/, '')}/sse/approvals?user_id=${encodeURIComponent(userId)}`;
    if (baseUrl.startsWith('/')) {
      sseUrl = `/sse/approvals?user_id=${encodeURIComponent(userId)}`;
    }

    // Attach token if available via query param for EventSource
    const token = getAuthToken();
    if (token) {
      sseUrl += `&token=${encodeURIComponent(token)}`;
    }

    try {
      const es = new EventSource(sseUrl);
      eventSourceRef.current = es;

      es.onopen = () => {
        setIsConnected(true);
        setConnectionError(null);
      };

      const handleIncoming = (type: SSEEventType, rawData: string) => {
        try {
          const parsed = JSON.parse(rawData);
          const message: SSEMessage = {
            event: type,
            data: parsed,
            timestamp: new Date().toISOString(),
          };
          setLastEvent(message);
          setEventHistory((prev) => [message, ...prev.slice(0, 49)]);

          if (onAnyEvent) onAnyEvent(message);

          switch (type) {
            case 'new_approval':
              if (onNewApproval) onNewApproval(parsed);
              break;
            case 'approval_decided':
              if (onApprovalDecided) onApprovalDecided(parsed);
              break;
            case 'high_match_opportunity':
              if (onHighMatchOpportunity) onHighMatchOpportunity(parsed);
              break;
            case 'gcw_question':
              if (onGcwQuestion) onGcwQuestion(parsed);
              break;
            case 'project_updated':
              if (onProjectUpdated) onProjectUpdated(parsed);
              break;
            default:
              break;
          }
        } catch (e) {
          console.warn(`Failed to parse SSE payload for ${type}:`, rawData);
        }
      };

      // Standard message event
      es.onmessage = (event) => {
        handleIncoming('new_approval', event.data);
      };

      // Specific named events
      es.addEventListener('new_approval', (event: any) => {
        handleIncoming('new_approval', event.data);
      });

      es.addEventListener('approval_decided', (event: any) => {
        handleIncoming('approval_decided', event.data);
      });

      es.addEventListener('high_match_opportunity', (event: any) => {
        handleIncoming('high_match_opportunity', event.data);
      });

      es.addEventListener('gcw_question', (event: any) => {
        handleIncoming('gcw_question', event.data);
      });

      es.addEventListener('project_updated', (event: any) => {
        handleIncoming('project_updated', event.data);
      });

      es.onerror = (err) => {
        setIsConnected(false);
        setConnectionError('SSE Stream disconnected. Auto-reconnecting in 5s...');
        es.close();

        // Auto reconnect after delay
        if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 5000);
      };
    } catch (err: any) {
      setIsConnected(false);
      setConnectionError(err.message || 'Failed to establish SSE connection');
    }
  }, [
    userId,
    enabled,
    onNewApproval,
    onApprovalDecided,
    onHighMatchOpportunity,
    onGcwQuestion,
    onProjectUpdated,
    onAnyEvent,
  ]);

  useEffect(() => {
    connect();
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  const reconnect = useCallback(() => {
    connect();
  }, [connect]);

  return {
    isConnected,
    lastEvent,
    eventHistory,
    connectionError,
    reconnect,
  };
}
