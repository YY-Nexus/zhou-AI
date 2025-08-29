"use client"

import { useState, useEffect, useCallback } from "react"
import { VOICE_PROFILES, AI_TEACHING_MODES } from "@/config/education-system"

export interface VoiceSettings {
  rate: number
  pitch: number
  volume: number
  voice?: SpeechSynthesisVoice
}

export interface VoiceProfile {
  name: string
  description: string
  gender: "male" | "female" | "neutral"
  ageGroup: "child" | "young" | "adult"
  settings: VoiceSettings
  subjects: string[]
}

export function useVoiceSettings() {
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedProfile, setSelectedProfile] = useState<string>("teacher_female")
  const [customSettings, setCustomSettings] = useState<VoiceSettings>({
    rate: 0.9,
    pitch: 1.0,
    volume: 0.8,
  })
  const [isEnabled, setIsEnabled] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  // 加载可用语音
  useEffect(() => {
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices()
      const chineseVoices = voices.filter(
        (voice) => 
          voice.lang.includes("zh") || 
          voice.lang.includes("cmn") ||
          voice.name.includes("Chinese") ||
          voice.name.includes("中文")
      )
      setAvailableVoices(chineseVoices.length > 0 ? chineseVoices : voices.slice(0, 10))
      setIsLoading(false)
    }

    // 如果语音已经加载，直接调用
    if (speechSynthesis.getVoices().length > 0) {
      loadVoices()
    } else {
      // 等待语音加载完成
      speechSynthesis.addEventListener("voiceschanged", loadVoices)
    }

    return () => {
      speechSynthesis.removeEventListener("voiceschanged", loadVoices)
    }
  }, [])

  // 从本地存储加载设置
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem("voice-profile")
      const savedSettings = localStorage.getItem("voice-settings")
      const savedEnabled = localStorage.getItem("voice-enabled")

      if (savedProfile) {
        setSelectedProfile(savedProfile)
      }
      if (savedSettings) {
        setCustomSettings(JSON.parse(savedSettings))
      }
      if (savedEnabled !== null) {
        setIsEnabled(savedEnabled === "true")
      }
    } catch (error) {
      console.warn("Failed to load voice settings:", error)
    }
  }, [])

  // 保存设置到本地存储
  const saveSettings = useCallback(() => {
    try {
      localStorage.setItem("voice-profile", selectedProfile)
      localStorage.setItem("voice-settings", JSON.stringify(customSettings))
      localStorage.setItem("voice-enabled", isEnabled.toString())
    } catch (error) {
      console.warn("Failed to save voice settings:", error)
    }
  }, [selectedProfile, customSettings, isEnabled])

  // 当设置改变时自动保存
  useEffect(() => {
    saveSettings()
  }, [saveSettings])

  // 获取当前语音设置
  const getCurrentSettings = useCallback((): VoiceSettings => {
    const profile = VOICE_PROFILES[selectedProfile as keyof typeof VOICE_PROFILES]
    if (profile && selectedProfile !== "custom") {
      return profile.settings
    }
    return customSettings
  }, [selectedProfile, customSettings])

  // 获取最佳语音（根据配置文件匹配）
  const getBestVoice = useCallback((subjectId?: string): SpeechSynthesisVoice | null => {
    if (availableVoices.length === 0) return null

    const profile = VOICE_PROFILES[selectedProfile as keyof typeof VOICE_PROFILES]
    
    // 如果有特定学科的语音偏好
    if (profile && subjectId && profile.subjects.includes(subjectId)) {
      const preferredVoices = availableVoices.filter((voice) => {
        const voiceName = voice.name.toLowerCase()
        if (profile.gender === "female") {
          return voiceName.includes("female") || voiceName.includes("woman") || voiceName.includes("女")
        } else if (profile.gender === "male") {
          return voiceName.includes("male") || voiceName.includes("man") || voiceName.includes("男")
        }
        return true
      })
      
      if (preferredVoices.length > 0) {
        return preferredVoices[0]
      }
    }

    // 默认选择第一个中文语音
    const chineseVoice = availableVoices.find((voice) => 
      voice.lang.includes("zh") || voice.name.includes("Chinese") || voice.name.includes("中文")
    )
    
    return chineseVoice || availableVoices[0]
  }, [availableVoices, selectedProfile])

  // 根据教学模式调整语音设置
  const getSettingsForMode = useCallback((mode: keyof typeof AI_TEACHING_MODES): VoiceSettings => {
    const baseSettings = getCurrentSettings()
    const modeSettings = AI_TEACHING_MODES[mode].voiceSettings

    return {
      ...baseSettings,
      ...modeSettings,
    }
  }, [getCurrentSettings])

  // 更新语音配置文件
  const updateProfile = useCallback((profileKey: string) => {
    setSelectedProfile(profileKey)
  }, [])

  // 更新自定义设置
  const updateCustomSettings = useCallback((settings: Partial<VoiceSettings>) => {
    setCustomSettings((prev) => ({ ...prev, ...settings }))
  }, [])

  // 切换语音开关
  const toggleEnabled = useCallback(() => {
    setIsEnabled((prev) => !prev)
  }, [])

  // 测试语音
  const testVoice = useCallback((text: string = "您好，这是语音测试。", subjectId?: string) => {
    if (!isEnabled) return

    speechSynthesis.cancel()
    
    const settings = getCurrentSettings()
    const voice = getBestVoice(subjectId)
    
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.voice = voice
    utterance.rate = settings.rate
    utterance.pitch = settings.pitch
    utterance.volume = settings.volume
    utterance.lang = "zh-CN"

    speechSynthesis.speak(utterance)
  }, [isEnabled, getCurrentSettings, getBestVoice])

  return {
    // 状态
    isLoading,
    isEnabled,
    availableVoices,
    selectedProfile,
    customSettings,
    
    // 方法
    getCurrentSettings,
    getBestVoice,
    getSettingsForMode,
    updateProfile,
    updateCustomSettings,
    toggleEnabled,
    testVoice,
    
    // 配置
    profiles: VOICE_PROFILES,
    teachingModes: AI_TEACHING_MODES,
  }
}