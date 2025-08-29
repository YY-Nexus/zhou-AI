"use client"

import { useState, useCallback } from "react"
import { EDUCATION_SUBJECTS, type Subject, type LearningProgress } from "@/config/education-system"

interface QuestionRequest {
  subject: string
  topic: string
  question: string
  difficulty: "basic" | "intermediate" | "advanced" | "competition"
  studentLevel: string
}

interface AIResponse {
  answer: string
  explanation: string
  relatedTopics: string[]
  nextSteps: string[]
  confidence: number
}

export function useEducationAI() {
  const [subjects] = useState<Subject[]>(EDUCATION_SUBJECTS)
  const [learningProgress, setLearningProgress] = useState<LearningProgress[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const askQuestion = useCallback(
    async (request: QuestionRequest): Promise<AIResponse> => {
      setIsLoading(true)

      try {
        // 模拟AI响应延迟
        await new Promise((resolve) => setTimeout(resolve, 1500))

        const subject = subjects.find((s) => s.id === request.subject)
        const topic = subject?.topics.find((t) => t.id === request.topic)

        // 根据学科和主题生成智能回答
        let answer = ""
        let explanation = ""
        let relatedTopics: string[] = []
        let nextSteps: string[] = []

        if (request.subject === "math-competition") {
          answer = generateMathCompetitionResponse(request)
          explanation = "这是一道典型的奥数竞赛题目，需要运用数学思维和解题技巧。"
          relatedTopics = ["数学思维", "解题策略", "竞赛技巧"]
          nextSteps = ["练习类似题型", "掌握解题方法", "参加模拟竞赛", "总结解题经验"]
        } else if (request.subject === "chinese") {
          answer = generateChineseResponse(request)
          explanation = "语文学习需要注重积累和理解，培养语言文字运用能力。"
          relatedTopics = ["语言文字", "文学素养", "表达能力"]
          nextSteps = ["多读优秀作品", "练习写作表达", "积累词汇语句", "培养语感"]
        } else if (request.subject === "programming") {
          answer = generateProgrammingResponse(request)
          explanation = "编程学习重在培养逻辑思维和问题解决能力。"
          relatedTopics = ["逻辑思维", "算法设计", "问题分解"]
          nextSteps = ["理解基本概念", "动手实践编程", "参与项目练习", "培养计算思维"]
        } else if (request.subject === "history") {
          answer = generateHistoryResponse(request)
          explanation = "历史学习有助于了解过去，理解现在，思考未来。"
          relatedTopics = ["历史文化", "时代背景", "历史思维"]
          nextSteps = ["了解历史背景", "分析历史事件", "思考历史意义", "培养历史思维"]
        } else {
          answer = generateGeneralResponse(request)
          explanation = `这是${subject?.name}学科的重要知识点，需要理解和掌握。`
          relatedTopics = topic?.keywords.slice(0, 3) || []
          nextSteps = ["理解基本概念", "练习相关题目", "总结知识要点", "应用到实际问题"]
        }

        return {
          answer,
          explanation,
          relatedTopics,
          nextSteps,
          confidence: 0.85 + Math.random() * 0.1,
        }
      } finally {
        setIsLoading(false)
      }
    },
    [subjects],
  )

  const analyzeLearningProgress = useCallback(
    (subjectId: string) => {
      const subjectProgress = learningProgress.filter((p) => p.subjectId === subjectId)

      if (subjectProgress.length === 0) {
        return {
          averageScore: 0,
          totalTime: 0,
          completedTopics: 0,
          strengths: [],
          weaknesses: [],
          recommendations: ["开始学习基础知识", "制定学习计划", "设定学习目标"],
        }
      }

      const averageScore = subjectProgress.reduce((sum, p) => sum + p.score, 0) / subjectProgress.length
      const totalTime = subjectProgress.reduce((sum, p) => sum + p.timeSpent, 0)
      const completedTopics = subjectProgress.length

      const strengths = subjectProgress
        .filter((p) => p.score >= 80)
        .map((p) => p.topicId)
        .slice(0, 3)

      const weaknesses = subjectProgress
        .filter((p) => p.score < 60)
        .map((p) => p.topicId)
        .slice(0, 3)

      const recommendations = generateRecommendations(averageScore, weaknesses)

      return {
        averageScore,
        totalTime,
        completedTopics,
        strengths,
        weaknesses,
        recommendations,
      }
    },
    [learningProgress],
  )

  const recordProgress = useCallback((progress: Omit<LearningProgress, "completedAt">) => {
    const newProgress: LearningProgress = {
      ...progress,
      completedAt: new Date(),
    }

    setLearningProgress((prev) => [...prev, newProgress])
  }, [])

  return {
    subjects,
    learningProgress,
    isLoading,
    askQuestion,
    analyzeLearningProgress,
    recordProgress,
  }
}

function generateMathCompetitionResponse(request: QuestionRequest): string {
  const responses = [
    `🏆 **奥数竞赛解题指导**

这道题目考查的是${request.topic}的核心概念。让我们一步步分析：

**解题思路：**
1. 首先理解题目条件和要求
2. 寻找关键信息和隐含条件
3. 选择合适的解题方法
4. 逐步推理，注意逻辑严密性
5. 验证答案的合理性

**解题技巧：**
• 画图辅助理解（几何题）
• 设未知数建立方程（代数题）
• 寻找规律和特殊情况
• 运用数学归纳法
• 反证法和构造法

**练习建议：**
建议多做类似题型，掌握解题套路，培养数学直觉。`,

    `🎯 **竞赛数学专项训练**

针对您的问题，这属于${request.topic}的经典题型。

**核心知识点：**
• 理论基础要扎实
• 解题方法要灵活
• 计算过程要准确
• 答案表述要规范

**提升策略：**
1. 系统学习理论知识
2. 大量练习典型题目
3. 总结解题规律
4. 参加模拟竞赛
5. 与同学交流讨论

记住：奥数竞赛不仅考查知识，更考查思维能力！`,
  ]

  return responses[Math.floor(Math.random() * responses.length)]
}

function generateChineseResponse(request: QuestionRequest): string {
  const responses = [
    `📚 **语文学习指导**

关于${request.topic}的学习，我来为您详细解答：

**学习要点：**
• 注重基础知识的积累
• 培养良好的阅读习惯
• 提高语言表达能力
• 增强文学鉴赏水平

**学习方法：**
1. 多读经典文学作品
2. 勤写读书笔记
3. 练习各种文体写作
4. 背诵优美诗文
5. 参与讨论交流

**提升建议：**
语文学习是一个长期积累的过程，需要持之以恒的努力。`,

    `✍️ **语文素养提升**

${request.topic}是语文学习的重要组成部分：

**核心能力：**
• 理解能力 - 准确把握文意
• 表达能力 - 清晰表达思想
• 鉴赏能力 - 感受文学之美
• 运用能力 - 灵活运用语言

**实践方法：**
通过大量阅读、思考、写作来提高语文素养，培养语感和文学品味。`,
  ]

  return responses[Math.floor(Math.random() * responses.length)]
}

function generateProgrammingResponse(request: QuestionRequest): string {
  const responses = [
    `💻 **编程启蒙指导**

关于${request.topic}的学习，让我来为您详细讲解：

**核心概念：**
• 计算思维 - 分解、抽象、算法、模式识别
• 逻辑推理 - 条件判断、循环结构、函数思想
• 问题解决 - 分析问题、设计方案、编码实现
• 创意表达 - 通过代码实现想法和创意

**学习路径：**
1. 从图形化编程开始（Scratch）
2. 理解基本编程概念
3. 学习简单算法思想
4. 动手实践小项目
5. 培养调试和优化能力

**实践建议：**
编程学习重在动手实践，从简单的小程序开始，逐步挑战更复杂的项目。`,

    `🎯 **计算思维培养**

${request.topic}是编程学习的重要基础：

**思维训练：**
• 分解思维 - 将复杂问题分解为简单问题
• 抽象思维 - 提取共同特征，忽略细节
• 算法思维 - 设计解决问题的步骤
• 模式思维 - 识别和运用常见模式

**编程实践：**
通过编程练习培养逻辑思维，从游戏、动画等有趣项目开始，激发学习兴趣。`,
  ]

  return responses[Math.floor(Math.random() * responses.length)]
}

function generateHistoryResponse(request: QuestionRequest): string {
  const responses = [
    `🏛️ **历史文化学习**

关于${request.topic}的学习，让我为您详细介绍：

**学习要点：**
• 时间线索 - 理清历史发展脉络
• 因果关系 - 分析历史事件的前因后果
• 人物影响 - 了解重要历史人物的作用
• 文化传承 - 认识历史文化的传承价值

**学习方法：**
1. 构建时间线，理清历史脉络
2. 分析历史事件的背景和影响
3. 了解重要历史人物的贡献
4. 思考历史对现在的启示
5. 参观历史遗迹，增强体验

**价值意义：**
学习历史有助于培养历史思维，理解文化传承，增强民族自豪感。`,

    `📚 **文化传承教育**

${request.topic}承载着深厚的文化内涵：

**文化价值：**
• 传统智慧 - 古人的智慧结晶
• 精神财富 - 民族的精神家园
• 文化认同 - 增强文化自信
• 历史启示 - 以史为鉴，面向未来

**学习收获：**
通过历史学习，培养历史思维，增强文化自信，传承优秀传统文化。`,
  ]

  return responses[Math.floor(Math.random() * responses.length)]
}

function generateGeneralResponse(request: QuestionRequest): string {
  return `📖 **学习指导**

关于${request.topic}的问题，让我来帮您解答：

**知识要点：**
这个知识点在${request.subject}学科中具有重要地位，需要重点掌握。

**学习建议：**
1. 理解基本概念和原理
2. 通过练习加深理解
3. 联系实际应用场景
4. 总结规律和方法
5. 定期复习巩固

**注意事项：**
学习要循序渐进，打好基础，逐步提高。遇到困难不要气馁，多思考多练习。

有什么具体问题，随时可以问我！`
}

function generateRecommendations(averageScore: number, weaknesses: string[]): string[] {
  const recommendations = []

  if (averageScore < 60) {
    recommendations.push("加强基础知识学习")
    recommendations.push("增加练习时间")
    recommendations.push("寻求老师或同学帮助")
  } else if (averageScore < 80) {
    recommendations.push("巩固已学知识")
    recommendations.push("挑战更难的题目")
    recommendations.push("总结学习方法")
  } else {
    recommendations.push("保持学习状态")
    recommendations.push("拓展相关知识")
    recommendations.push("帮助其他同学")
  }

  if (weaknesses.length > 0) {
    recommendations.push(`重点关注：${weaknesses.join("、")}`)
  }

  return recommendations
}
