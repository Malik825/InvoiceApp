import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Sidebar } from "./components/sidebar/sidebar.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, Sidebar], // ✅ required for <router-outlet>
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
   toggleTheme(): void {
    document.body.classList.toggle('dark-theme');
  }
}
