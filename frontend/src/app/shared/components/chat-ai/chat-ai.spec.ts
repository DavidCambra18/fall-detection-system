import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatAiComponent } from './chat-ai';

describe('ChatAiComponent', () => {
  let component: ChatAiComponent;
  let fixture: ComponentFixture<ChatAiComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatAiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatAiComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
