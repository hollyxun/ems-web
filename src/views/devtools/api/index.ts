import { request } from '@/service/request';
import type { ChatMessage, ModelsResponse, ServerStatusResponse, VersionInfoResponse } from '@/typings/api/devtools';

/**
 * 获取服务器状态
 * @returns 服务器状态数据
 */
export function fetchServerStatus() {
  return request<ServerStatusResponse>({ url: '/api/v1/devtools/server/status' });
}

/**
 * 获取版本信息
 * @returns 版本信息数据
 */
export function fetchVersionInfo() {
  return request<VersionInfoResponse>({ url: '/api/v1/devtools/server/version' });
}

/**
 * AI配置请求参数
 */
interface AIConfigParams {
  baseUrl: string;
  apiKey: string;
}

/**
 * 对话请求参数
 */
interface ChatParams extends AIConfigParams {
  model: string;
  messages: ChatMessage[];
}

/**
 * 获取AI模型列表
 * @param params AI配置参数
 * @returns 模型列表
 */
export function fetchAIModels(params: AIConfigParams) {
  return request<ModelsResponse>({
    url: '/api/v1/devtools/ai/models',
    method: 'post',
    data: params
  });
}

/**
 * 创建AI对话流式请求
 * @param params 对话参数
 * @param onMessage 消息回调
 * @param onError 错误回调
 * @param onComplete 完成回调
 * @returns AbortController用于取消请求
 */
export function createAIChatStream(
  params: ChatParams,
  onMessage: (content: string) => void,
  onError?: (error: string) => void,
  onComplete?: () => void
): AbortController {
  const controller = new AbortController();

  const token = localStorage.getItem('token__') || localStorage.getItem('token') || '';

  fetch('/api/v1/devtools/ai/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      baseUrl: params.baseUrl,
      apiKey: params.apiKey,
      req: {
        model: params.model,
        messages: params.messages,
        stream: true
      }
    }),
    signal: controller.signal
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      const processChunk = (): Promise<void> | void => {
        return reader.read().then(({ done, value }) => {
          if (done) {
            onComplete?.();
            return;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim();
              if (data === '[DONE]') {
                onComplete?.();
                return;
              }

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  onMessage(content);
                }
              } catch {
                // 忽略解析错误
              }
            }
          }

          return processChunk();
        });
      };

      await processChunk();
      return;
    })
    .catch(error => {
      if (error.name !== 'AbortError') {
        onError?.(error.message);
      }
    });

  return controller;
}

export type { AIConfigParams, ChatParams };
