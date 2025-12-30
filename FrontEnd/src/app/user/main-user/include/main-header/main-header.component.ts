import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CountdownComponent, CountdownConfig } from 'ngx-countdown';
import { TokenService } from 'src/services/token/token.service';
import { UserService } from 'src/services/user/user.service';
import { SeasonService, Season } from 'src/app/services/season.service';
import { ExtensionService } from 'src/services/extension/extension.service';



@Component({
  selector: 'app-main-header',
  templateUrl: './main-header.component.html',
  styleUrls: ['./main-header.component.scss']
})
export class MainHeaderComponent implements OnInit {

  date: any;
  now: any;
  targetDate: any = new Date(2026, 0);
  targetTime: any = this.targetDate.getTime();
  difference: number = 0;
  months: Array<string> = ["January", "February", "March", "April",
    "May", "June", "July", "August", "September", "October", "November", "December"];

  // Template literals is ideal for this scenario
  currentTime: any = this.months[this.targetDate.getMonth()] +
    ' ' + this.targetDate.getDate() + ', ' + this.targetDate.getFullYear();

  @ViewChild("days", { static: true }) days!: ElementRef;
  @ViewChild("hours", { static: true }) hours!: ElementRef;
  @ViewChild("minutes", { static: true }) minutes!: ElementRef;
  @ViewChild("seconds", { static: true }) seconds!: ElementRef;

  imagePath: String = ""
  isAdmin: boolean = false
  activeSeason: Season | null = null;
  userName: string = "Usuario";
  userEmail: string = "";
  hasNewExtension: boolean = false;

  constructor(
    private tokenService: TokenService,
    private userService: UserService,
    private seasonService: SeasonService,
    private extensionService: ExtensionService
  ) { }

  ngOnInit() {
    this.isAdmin = this.tokenService.isAdmin()
    this.getUserProfile()
    this.checkForNewExtension()

    // Subscribe to version changes to update badge reactively
    this.extensionService.versionSeen$.subscribe(() => {
      this.checkForNewExtension();
    });

    // Load active season
    this.seasonService.getActiveSeason().subscribe({
      next: (season) => {
        this.activeSeason = season;
      },
      error: (error) => {
        console.error('Error loading active season:', error);
      }
    });

  }

  ngAfterViewInit() {
    setInterval(() => {
      this.tickTock();
      this.difference = this.targetDate - this.now;
      this.difference = this.difference / (1000 * 60 * 60 * 24);
      if (this.days && this.days.nativeElement) {
        !isNaN(this.days.nativeElement.innerText)
          ? (this.days.nativeElement.innerText = Math.floor(this.difference))
          : (this.days.nativeElement.innerHTML = "<img src='https://i.gifer.com/VAyR.gif' />");
      }
    }, 1000);

  }


  tickTock() {
    this.date = new Date();
    this.now = this.date.getTime();
    if (this.days && this.days.nativeElement) {
      this.days.nativeElement.innerText = Math.floor(this.difference);
    }
    if (this.hours && this.hours.nativeElement) {
      this.hours.nativeElement.innerText = 23 - this.date.getHours();
    }
    if (this.minutes && this.minutes.nativeElement) {
      this.minutes.nativeElement.innerText = 60 - this.date.getMinutes();
    }
    if (this.seconds && this.seconds.nativeElement) {
      this.seconds.nativeElement.innerText = 60 - this.date.getSeconds();
    }
  }




  logOut() {
    this.tokenService.closeSession();
  }

  private getUserProfile() {

    this.userService.getProfile().then((data: any) => {
      this.imagePath = data.profile_image;
      this.userName = data.name || "Usuario";
      this.userEmail = data.email || "";

      if (data.profile_image == null) {
        this.imagePath = '../../../assets/user.png';
      }

    }).catch(error => {
      this.imagePath = '../../../assets/user.png';
    })

  }

  private checkForNewExtension() {
    this.extensionService.getLatestVersion().subscribe({
      next: (version) => {
        this.hasNewExtension = this.extensionService.hasNewVersion(version.id);
      },
      error: (error) => {
        console.error('Error checking for new extension:', error);
      }
    });
  }


}