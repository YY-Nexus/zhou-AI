export interface LocalModel {
  id: string
  name: string
  description: string
  provider: string
  modelSize?: string
  capabilities: string[]
  isAvailable: boolean
  language?: "chinese" | "english" | "multilingual"
  endpoint?: string
  apiKey?: string
}

export const defaultLocalModels: LocalModel[] = [
  {
    id: "qwen-7b",
    name: "通义千问 7B",
    description: "阿里云开源中文大模型，适合对话和文本生成",
    provider: "阿里云",
    modelSize: "7B",
    capabilities: ["中文对话", "文本生成", "代码生成", "翻译"],
    isAvailable: false,
    language: "chinese",
    endpoint: "http://localhost:8000/v1/chat/completions",
  },
  {
    id: "chatglm3-6b",
    name: "ChatGLM3 6B",
    description: "清华大学开源对话模型，支持中英文",
    provider: "清华大学",
    modelSize: "6B",
    capabilities: ["中英文对话", "代码生成", "数学推理"],
    isAvailable: false,
    language: "multilingual",
    endpoint: "http://localhost:8001/v1/chat/completions",
  },
  {
    id: "baichuan2-7b",
    name: "百川2 7B",
    description: "百川智能开源模型，中文能力强",
    provider: "百川智能",
    modelSize: "7B",
    capabilities: ["中文理解", "知识问答", "创意写作"],
    isAvailable: false,
    language: "chinese",
    endpoint: "http://localhost:8002/v1/chat/completions",
  },
  {
    id: "llama2-7b",
    name: "Llama 2 7B",
    description: "Meta开源模型，英文能力优秀",
    provider: "Meta",
    modelSize: "7B",
    capabilities: ["英文对话", "推理分析", "代码生成"],
    isAvailable: false,
    language: "english",
    endpoint: "http://localhost:8003/v1/chat/completions",
  },
]

export async function checkModelAvailability(model: LocalModel): Promise<boolean> {
  if (!model.endpoint) return false

  try {
    const response = await fetch(`${model.endpoint}/health`, {
      method: "GET",
      timeout: 5000,
    })
    return response.ok
  } catch (error) {
    console.warn(`模型 ${model.name} 不可用:`, error)
    return false
  }
}

export async function sendMessageToLocalModel(
  model: LocalModel,
  messages: Array<{ role: string; content: string }>,
): Promise<string> {
  if (!model.endpoint) {
    throw new Error(`模型 ${model.name} 没有配置端点`)
  }

  try {
    const response = await fetch(model.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(model.apiKey && { Authorization: `Bearer ${model.apiKey}` }),
      },
      body: JSON.stringify({
        model: model.id,
        messages,
        temperature: 0.7,
        max_tokens: 2000,
        stream: false,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    return data.choices?.[0]?.message?.content || "模型响应为空"
  } catch (error) {
    console.error(`调用模型 ${model.name} 失败:`, error)
    throw new Error(`模型调用失败: ${error instanceof Error ? error.message : "未知错误"}`)
  }
}
