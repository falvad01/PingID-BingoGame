import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/services/user/user.service';

interface User {
  id: number;
  username: string;
  name_surname: string;
  administrator: number;
  created_at: string;
  numberCount: number;
  repeatedCount: number;
}


@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.scss'],
})
export class AdminUsersComponent {

  constructor(private userService: UserService) {
    this.getAllUsers()
  }

  getAllUsers() {

    this.userService.getAllUSers().then((data: any) => {

      this.populateTable(data);

    }).catch((error: any) => {

    })



  }

  // Method to populate the table
  populateTable(data: User[]): void {
    const tbody = document.querySelector('#example2 tbody');
    if (tbody) {
      tbody.innerHTML = ''; // Clear existing rows

      data.forEach(user => {
        const newRow = document.createElement('tr');

        // Create new cells and append them to the row
        const idCell = document.createElement('td');
        idCell.textContent = user.id.toString();
        newRow.appendChild(idCell);

        const nameSurnameCell = document.createElement('td');
        nameSurnameCell.textContent = user.name_surname;
        newRow.appendChild(nameSurnameCell);

        const usernameCell = document.createElement('td');
        usernameCell.textContent = user.username;
        newRow.appendChild(usernameCell);

        const totalNumbersCell = document.createElement('td');
        totalNumbersCell.textContent = user.numberCount.toString();
        newRow.appendChild(totalNumbersCell);

        const repeatedNumbersCell = document.createElement('td');
        repeatedNumbersCell.textContent = user.repeatedCount.toString();
        newRow.appendChild(repeatedNumbersCell);

        // Admin checkbox cell
        // TypeScript code to create the table rows
        const adminCell = document.createElement('td');
        adminCell.className = 'admin-cell';

        const adminIcon = document.createElement('ion-icon');
        adminIcon.name = user.administrator === 1 ? 'checkmark-done-outline' : ''; // Set the icon based on admin status
        adminIcon.className = 'admin-icon'; // Apply the styling class

        adminCell.appendChild(adminIcon);
        newRow.appendChild(adminCell);



        // Edit button cell
        const editCell = document.createElement('td');
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.className = 'btn btn-info'; // Bootstrap class for styling
        editButton.addEventListener('click', () => this.editUser(user.id));
        editCell.appendChild(editButton);
        newRow.appendChild(editCell);

        // Append the new row to the tbody
        tbody.appendChild(newRow);

        // Append the new row to the tbody
        tbody.appendChild(newRow);
      });
    }

  }
  // Method to handle user editing
  editUser(userId: number): void {
    console.log('Edit user with ID:', userId);
    // Add your logic to handle user editing here
  }
}
