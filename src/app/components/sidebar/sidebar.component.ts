import { Component } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  imports: [],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class Sidebar {
logoUrl = './assets/image.png';
themeIcon = './assets/icon-moon.svg';
profileImage = './assets/image-avatar.jpg';

   toggleTheme(): void {
    document.body.classList.toggle('dark-theme');
  }
}
