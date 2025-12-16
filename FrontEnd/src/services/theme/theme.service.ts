import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'bingo-theme';
  private themeSubject: BehaviorSubject<Theme>;
  public theme$: Observable<Theme>;

  constructor() {
    // Get initial theme from localStorage or system preference
    const savedTheme = this.getSavedTheme();
    const initialTheme = savedTheme || this.getSystemPreference();
    
    this.themeSubject = new BehaviorSubject<Theme>(initialTheme);
    this.theme$ = this.themeSubject.asObservable();
    
    // Apply initial theme
    this.applyTheme(initialTheme);
    
    // Listen for system theme changes
    this.listenToSystemThemeChanges();
  }

  /**
   * Get current theme
   */
  getCurrentTheme(): Theme {
    return this.themeSubject.value;
  }

  /**
   * Set theme and persist to localStorage
   */
  setTheme(theme: Theme): void {
    this.themeSubject.next(theme);
    this.applyTheme(theme);
    this.saveTheme(theme);
  }

  /**
   * Toggle between light and dark theme
   */
  toggleTheme(): void {
    const newTheme: Theme = this.getCurrentTheme() === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  /**
   * Check if current theme is dark
   */
  isDarkMode(): boolean {
    return this.getCurrentTheme() === 'dark';
  }

  /**
   * Apply theme to document
   */
  private applyTheme(theme: Theme): void {
    const body = document.body;
    const html = document.documentElement;
    
    if (theme === 'dark') {
      body.classList.add('dark-mode');
      html.setAttribute('data-theme', 'dark');
    } else {
      body.classList.remove('dark-mode');
      html.setAttribute('data-theme', 'light');
    }
  }

  /**
   * Get saved theme from localStorage
   */
  private getSavedTheme(): Theme | null {
    const saved = localStorage.getItem(this.THEME_KEY);
    return saved === 'light' || saved === 'dark' ? saved : null;
  }

  /**
   * Save theme to localStorage
   */
  private saveTheme(theme: Theme): void {
    localStorage.setItem(this.THEME_KEY, theme);
  }

  /**
   * Get system color scheme preference
   */
  private getSystemPreference(): Theme {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  /**
   * Listen to system theme changes
   */
  private listenToSystemThemeChanges(): void {
    if (window.matchMedia) {
      const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      // Modern approach
      if (darkModeQuery.addEventListener) {
        darkModeQuery.addEventListener('change', (e) => {
          // Only update if user hasn't manually set a preference
          if (!this.getSavedTheme()) {
            const newTheme: Theme = e.matches ? 'dark' : 'light';
            this.setTheme(newTheme);
          }
        });
      } else if ((darkModeQuery as any).addListener) {
        // Fallback for older browsers
        (darkModeQuery as any).addListener((e: MediaQueryListEvent) => {
          if (!this.getSavedTheme()) {
            const newTheme: Theme = e.matches ? 'dark' : 'light';
            this.setTheme(newTheme);
          }
        });
      }
    }
  }

  /**
   * Reset theme to system preference
   */
  resetToSystemPreference(): void {
    localStorage.removeItem(this.THEME_KEY);
    const systemTheme = this.getSystemPreference();
    this.setTheme(systemTheme);
  }
}
