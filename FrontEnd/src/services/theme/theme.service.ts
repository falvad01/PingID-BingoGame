import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type Theme = 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'bingo-theme';
  private themeSubject: BehaviorSubject<Theme>;
  public theme$: Observable<Theme>;

  constructor() {
    const initialTheme: Theme = 'dark';

    this.themeSubject = new BehaviorSubject<Theme>(initialTheme);
    this.theme$ = this.themeSubject.asObservable();

    // Apply initial theme
    this.applyTheme(initialTheme);
  }

  /**
   * Get current theme
   */
  getCurrentTheme(): Theme {
    return 'dark';
  }

  /**
   * Set theme (always dark)
   */
  setTheme(theme: Theme): void {
    this.themeSubject.next('dark');
    this.applyTheme('dark');
    this.saveTheme('dark');
  }

  /**
   * Toggle theme (disabled)
   */
  toggleTheme(): void {
    // Light mode removed
    this.setTheme('dark');
  }

  /**
   * Check if current theme is dark
   */
  isDarkMode(): boolean {
    return true;
  }

  /**
   * Apply theme to document
   */
  private applyTheme(theme: Theme): void {
    const body = document.body;
    const html = document.documentElement;

    body.classList.add('dark-mode');
    html.setAttribute('data-theme', 'dark');
  }

  /**
   * Save theme to localStorage
   */
  private saveTheme(theme: Theme): void {
    localStorage.setItem(this.THEME_KEY, 'dark');
  }
}
