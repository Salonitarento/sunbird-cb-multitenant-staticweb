import { Component, ElementRef, HostBinding, HostListener, NgZone, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ChatbotService, ChatHistoryMessage } from './chatbot.service';
import {
  CHATBOT_ERROR_MESSAGE,
  CHATBOT_LANGUAGES,
  CHATBOT_PLACEHOLDERS,
  CHATBOT_SUGGESTIONS,
  CHATBOT_VOICE_LOCALES,
  ChatbotLanguage,
} from './chatbot.constants';

interface ChatMessage {
  sender: 'user' | 'bot'
  text: string
  /** Rendered HTML for bot messages (escaped, then lightly formatted). */
  html?: string
  /** True while the typewriter effect is still running. */
  typing?: boolean
  /** Bot messages that are errors are not part of the conversation history. */
  isError?: boolean
  feedback?: 'up' | 'down'
  copied?: boolean
}

const WORD_DELAY_MS = 50
const SPACE_DELAY_MS = 10

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.component.html',
})
export class ChatbotComponent implements OnDestroy {
  @HostBinding('class.jago-chatbot') readonly hostClass = true

  @ViewChild('messagesArea') messagesArea?: ElementRef<HTMLElement>
  @ViewChild('chatInput') chatInput?: ElementRef<HTMLInputElement>
  @ViewChild('langDropdown') langDropdown?: ElementRef<HTMLElement>

  readonly languages = CHATBOT_LANGUAGES
  readonly suggestions = CHATBOT_SUGGESTIONS

  isOpen = false
  isExpanded = false
  isLangMenuOpen = false
  isWaiting = false
  isListening = false
  showSuggestions = true
  selectedLanguage: ChatbotLanguage = CHATBOT_LANGUAGES[0]
  inputText = ''
  messages: ChatMessage[] = []

  private requestSub?: Subscription
  private timers: ReturnType<typeof setTimeout>[] = []
  private recognition: any
  private destroyed = false

  constructor(private chatbotSvc: ChatbotService, private ngZone: NgZone) {}

  get placeholder(): string {
    return CHATBOT_PLACEHOLDERS[this.selectedLanguage.code] || CHATBOT_PLACEHOLDERS['eng']
  }

  /* --- Panel --- */

  open() {
    this.isOpen = true
    this.defer(() => this.chatInput?.nativeElement.focus())
  }

  close() {
    this.isOpen = false
    this.isLangMenuOpen = false
  }

  toggleExpand() {
    this.isExpanded = !this.isExpanded
  }

  /* --- Language --- */

  toggleLangMenu(event: Event) {
    event.stopPropagation()
    this.isLangMenuOpen = !this.isLangMenuOpen
  }

  selectLanguage(lang: ChatbotLanguage) {
    this.selectedLanguage = lang
    this.isLangMenuOpen = false
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    if (this.isLangMenuOpen && !this.langDropdown?.nativeElement.contains(event.target as Node)) {
      this.isLangMenuOpen = false
    }
  }

  /* --- Messaging --- */

  sendSuggestion(query: string) {
    this.inputText = query
    this.sendMessage()
  }

  sendMessage() {
    const text = this.inputText.trim()
    if (!text || this.isWaiting) return

    this.showSuggestions = false
    this.inputText = ''
    this.messages.push({ sender: 'user', text })
    this.isWaiting = true
    this.scrollToBottom()

    const history: ChatHistoryMessage[] = this.messages
      .filter(m => !m.isError && !m.typing)
      .map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text }))

    this.requestSub = this.chatbotSvc.sendMessage(text, history, this.selectedLanguage.code).subscribe({
      next: response => {
        this.isWaiting = false
        if (response && response.answer) {
          this.typeBotMessage(response.answer)
        } else {
          this.pushError()
        }
      },
      error: error => {
        console.error('Chatbot API error:', error)
        this.isWaiting = false
        this.pushError()
      },
    })
  }

  private pushError() {
    this.messages.push({
      sender: 'bot',
      text: CHATBOT_ERROR_MESSAGE,
      html: escapeHtml(CHATBOT_ERROR_MESSAGE),
      isError: true,
    })
    this.scrollToBottom()
  }

  /** Reveals the answer word by word, then applies formatting. */
  private typeBotMessage(text: string) {
    const message: ChatMessage = { sender: 'bot', text, html: '', typing: true }
    this.messages.push(message)

    const chunks = text.split(/(\s+)/)
    let shown = ''
    let index = 0

    const step = () => {
      if (this.destroyed) return
      if (index >= chunks.length) {
        message.html = formatResponse(text)
        message.typing = false
        this.scrollToBottom()
        return
      }
      const chunk = chunks[index++]
      shown += chunk
      message.html = escapeHtml(shown).replace(/\n/g, '<br>')
      this.scrollToBottom()
      this.defer(step, chunk.trim().length > 0 ? WORD_DELAY_MS : SPACE_DELAY_MS)
    }
    step()
  }

  /* --- Message actions --- */

  copyMessage(message: ChatMessage) {
    const plainText = message.text.replace(/\*\*(.*?)\*\*/g, '$1')
    if (!navigator.clipboard) return
    navigator.clipboard.writeText(plainText).then(() => {
      this.ngZone.run(() => {
        message.copied = true
        this.defer(() => message.copied = false, 2000)
      })
    })
  }

  setFeedback(message: ChatMessage, feedback: 'up' | 'down') {
    if (!message.feedback) {
      message.feedback = feedback
    }
  }

  /* --- Voice input --- */

  startVoiceInput() {
    const w = window as any
    const SpeechRecognition = w.SpeechRecognition || w.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('Voice recognition is not supported in your browser.')
      return
    }
    if (this.isListening) return

    const recognition = new SpeechRecognition()
    recognition.lang = CHATBOT_VOICE_LOCALES[this.selectedLanguage.code] || 'en-IN'
    recognition.interimResults = false

    recognition.onstart = () => this.ngZone.run(() => this.isListening = true)
    recognition.onresult = (event: any) => this.ngZone.run(() => {
      this.inputText = event.results[0][0].transcript
    })
    recognition.onend = () => this.ngZone.run(() => this.isListening = false)
    recognition.onerror = () => this.ngZone.run(() => {
      this.isListening = false
      alert('Voice recognition failed. Please try again.')
    })

    this.recognition = recognition
    recognition.start()
  }

  /* --- Helpers --- */

  trackByIndex(index: number) {
    return index
  }

  private scrollToBottom() {
    this.defer(() => {
      const el = this.messagesArea?.nativeElement
      if (el) el.scrollTop = el.scrollHeight
    })
  }

  private defer(fn: () => void, delay = 0) {
    const id = setTimeout(() => {
      this.timers = this.timers.filter(t => t !== id)
      fn()
    }, delay)
    this.timers.push(id)
  }

  ngOnDestroy() {
    this.destroyed = true
    this.timers.forEach(t => clearTimeout(t))
    this.requestSub?.unsubscribe()
    if (this.recognition) {
      this.recognition.onend = this.recognition.onerror = null
      this.recognition.abort()
    }
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** Escapes the answer, then renders **bold** and line breaks. */
function formatResponse(text: string): string {
  return escapeHtml(text)
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
}
