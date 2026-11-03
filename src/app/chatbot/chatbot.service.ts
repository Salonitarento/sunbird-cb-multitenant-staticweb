import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export interface ChatHistoryMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatResponse {
  response_type: string
  answer: string
  items: any[]
  table_headers: string[]
  table_rows: any[]
  actions: any[]
  sources: { filename: string, page: number, section: string }[]
  confidence_level: 'high' | 'medium' | 'low'
  session_id: string
  turn_number: number
  lang: string
}

const REQUEST_TIMEOUT_MS = 45000

/** Client for the Ministry of Tribal Affairs (Jago / Tribot) RAG chat backend. */
@Injectable({
  providedIn: 'root'
})
export class ChatbotService {

  constructor(private http: HttpClient) {}

  /**
   * Sends a query to the chat backend.
   * `history` is the conversation so far; the query is appended if it is not already the last user turn.
   */
  sendMessage(query: string, history: ChatHistoryMessage[] = [], language = 'eng'): Observable<ChatResponse> {
    const messages = [...history]
    const last = messages[messages.length - 1]
    if (!last || last.role !== 'user' || last.content !== query) {
      messages.push({ role: 'user', content: query })
    }

    const body = {
      query,
      messages,
      language,
      top_k: 10,
    }

    return this.http
      .post<ChatResponse>(`${environment.chatbotApiUrl}/chat`, body, { headers: this.getHeaders() })
      .pipe(timeout(REQUEST_TIMEOUT_MS))
  }

  private getHeaders(): HttpHeaders {
    const apiKey = environment.chatbotApiKey
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' })
    if (apiKey) {
      headers = headers
        .set('x-api-key', apiKey)
        .set('Authorization', `Bearer ${apiKey}`)
    }
    return headers
  }
}
