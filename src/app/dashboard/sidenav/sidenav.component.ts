import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ThemeButtonComponent } from "../../shared/global/theme-button/theme-button.component";

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [RouterLink, ThemeButtonComponent],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.scss',
})
export class SidenavComponent {}
