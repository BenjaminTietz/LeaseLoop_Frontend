import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LandingFooterComponent } from "../shared/components/landing-footer/landing-footer.component";
import { LandingHeaderComponent } from "../shared/components/landing-header/landing-header.component";

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [RouterOutlet, LandingFooterComponent, LandingHeaderComponent],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss'
})
export class LandingPageComponent {

}
