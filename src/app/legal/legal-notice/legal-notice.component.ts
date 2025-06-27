import { Component } from '@angular/core';

@Component({
  selector: 'app-legal-notice',
  standalone: true,
  imports: [],
  templateUrl: './legal-notice.component.html',
  styleUrl: './legal-notice.component.scss'
})
export class LegalNoticeComponent {
  ngOnInit(){
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
}
