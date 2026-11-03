import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ChatbotComponent } from './chatbot.component';
import { ChatbotService } from './chatbot.service';
import { CHATBOT_ERROR_MESSAGE } from './chatbot.constants';

describe('ChatbotComponent', () => {
  let fixture: ComponentFixture<ChatbotComponent>
  let component: ChatbotComponent
  let chatbotSvc: { sendMessage: jest.Mock }

  beforeEach(() => {
    chatbotSvc = { sendMessage: jest.fn() }
    TestBed.configureTestingModule({
      imports: [ChatbotComponent],
      providers: [{ provide: ChatbotService, useValue: chatbotSvc }],
    })
    fixture = TestBed.createComponent(ChatbotComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('opens the panel from the launcher and closes it again', () => {
    const host: HTMLElement = fixture.nativeElement
    host.querySelector<HTMLButtonElement>('.floating-chat-btn')!.click()
    fixture.detectChanges()
    expect(component.isOpen).toBe(true)
    expect(host.querySelector('.chatbot-panel')!.classList).toContain('open')
    expect(host.querySelector('.floating-chat-btn')).toBeNull()

    component.close()
    fixture.detectChanges()
    expect(host.querySelector('.chatbot-panel')!.classList).not.toContain('open')
  })

  it('sends the query with history and language, then types out the formatted answer', fakeAsync(() => {
    chatbotSvc.sendMessage.mockReturnValue(of({ answer: 'Hello **there**\nfriend' }))
    component.selectLanguage(component.languages[1])
    component.inputText = 'Hi'
    component.sendMessage()

    expect(chatbotSvc.sendMessage).toHaveBeenCalledWith('Hi', [{ role: 'user', content: 'Hi' }], 'hin')
    expect(component.showSuggestions).toBe(false)
    expect(component.inputText).toBe('')

    flush()
    const bot = component.messages[1]
    expect(bot.typing).toBe(false)
    expect(bot.html).toBe('Hello <strong>there</strong><br>friend')
  }))

  it('escapes HTML in bot answers', fakeAsync(() => {
    chatbotSvc.sendMessage.mockReturnValue(of({ answer: '<img src=x onerror=alert(1)>' }))
    component.inputText = 'x'
    component.sendMessage()
    flush()
    expect(component.messages[1].html).toBe('&lt;img src=x onerror=alert(1)&gt;')
  }))

  it('shows an error message when the request fails and leaves it out of the history', fakeAsync(() => {
    chatbotSvc.sendMessage.mockReturnValue(throwError(() => new Error('down')))
    jest.spyOn(console, 'error').mockImplementation(() => {})
    component.inputText = 'first'
    component.sendMessage()
    tick()
    expect(component.messages[1]).toEqual(expect.objectContaining({ text: CHATBOT_ERROR_MESSAGE, isError: true }))
    expect(component.isWaiting).toBe(false)

    chatbotSvc.sendMessage.mockReturnValue(of({ answer: 'ok' }))
    component.inputText = 'second'
    component.sendMessage()
    expect(chatbotSvc.sendMessage).toHaveBeenLastCalledWith('second', [
      { role: 'user', content: 'first' },
      { role: 'user', content: 'second' },
    ], 'eng')
    flush()
  }))

  it('ignores empty input and sends while a reply is pending', () => {
    component.inputText = '   '
    component.sendMessage()
    expect(chatbotSvc.sendMessage).not.toHaveBeenCalled()

    chatbotSvc.sendMessage.mockReturnValue(of())
    component.inputText = 'one'
    component.sendMessage()
    component.inputText = 'two'
    component.sendMessage()
    expect(chatbotSvc.sendMessage).toHaveBeenCalledTimes(1)
  })

  it('allows only one feedback choice per message', () => {
    const message: any = { sender: 'bot', text: 'a' }
    component.setFeedback(message, 'up')
    component.setFeedback(message, 'down')
    expect(message.feedback).toBe('up')
  })
})
