import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Generate a stable userId once and persist it
function generateUserId() {
  return 'user-' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

export const useStore = create(
  persist(
    (set) => ({
      prompt: '',
      setPrompt: (prompt) => set({ prompt }),
      history: [], // Elements: { type: 'user' | 'ai', content: string, timestamp: number }
      addHistory: (item) => set((state) => ({ history: [...state.history, item] })),
      clearHistory: () => set({ history: [] }),
      loadingStep: 'idle', // 'idle' | 'enhancing' | 'generating' | 'building' | 'ready'
      setLoadingStep: (step) => set({ loadingStep: step }),
      generatedCode: '',
      setGeneratedCode: (code) => set({ generatedCode: code }),
      currentComponent: null,
      setCurrentComponent: (component) => set({ currentComponent: component }),
      loading: false,
      setLoading: (loading) => set({ loading }),
      error: null,
      setError: (error) => set({ error }),
      iframeUrl: null,
      setIframeUrl: (url) => set({ iframeUrl: url }),

      // Progress tracking (0-100 from backend)
      jobProgress: 0,
      setJobProgress: (progress) => set({ jobProgress: progress }),

      // Persistent user ID for backend history
      userId: generateUserId(),

      // AI Provider selection
      provider: 'gemini', // 'gemini' | 'openrouter'
      setProvider: (provider) => set({ provider }),
      model: '', // optional model override (empty = use provider default)
      setModel: (model) => set({ model }),

      // UI states
      activeTab: 'preview', // 'preview' | 'code'
      setActiveTab: (tab) => set({ activeTab: tab }),
      viewport: 'desktop', // 'desktop' | 'tablet' | 'mobile'
      setViewport: (vp) => set({ viewport: vp }),
      isSidebarOpen: true,
      setIsSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),

      // Navigation
      currentView: 'landing', // 'landing' | 'canvas'
      setCurrentView: (view) => set({ currentView: view }),

      // Abort controller for API cancellation
      activeAbortController: null,
      setActiveAbortController: (controller) => set({ activeAbortController: controller }),

      resetAllData: () => set((state) => ({
        prompt: '',
        history: [],
        loadingStep: 'idle',
        generatedCode: '',
        currentComponent: null,
        loading: false,
        error: null,
        iframeUrl: null,
        jobProgress: 0,
        activeTab: 'preview',
        userId: generateUserId(), // Generate new user identity
        // Notice we DO NOT reset currentView to keep them on the current page
      })),
    }),
    {
      name: 'neura-store', // localStorage key
      partialize: (state) => ({
        // Only persist meaningful state, not transient/ephemeral fields
        history: state.history,
        generatedCode: state.generatedCode,
        currentComponent: state.currentComponent,
        iframeUrl: state.iframeUrl,
        activeTab: state.activeTab,
        viewport: state.viewport,
        isSidebarOpen: state.isSidebarOpen,
        currentView: state.currentView,
        userId: state.userId,
        provider: state.provider,
        model: state.model,
      }),
    }
  )
)