import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/services/user/user.service';

declare var jsGrid: any;
declare var $: any; // jQuery
declare var jsGrid: any; // jsGrid

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
export class AdminUsersComponent implements OnInit {


  userName: any;
  nameSurname: any;
  password: any;
  passwordConfirmation: any;
  errorText: string | undefined;

  constructor(private userService: UserService) {

  }

  ngOnInit() {
    this.getAllUsers();
  }

  getAllUsers() {
    this.userService.getAllUSers().then((data: any) => {
      this.initializeJsGrid(data);
    }).catch((error: any) => {
      console.error('Error fetching users:', error);
    });
  }

  initializeJsGrid(data: User[]) {
    $('#jsGrid').jsGrid({
      controller: {
        loadData: $.noop,
        insertItem: $.noop,
        updateItem: $.noop,
        deleteItem: $.noop
      },

      width: "100%",
      height: "auto",
      inserting: false,
      editing: false,
      sorting: true,
      paging: true,
      data: data,
      heading: true,
      

      fields: [
        { name: "id", type: "number", width: 30, title: "ID" },
        { name: "name_surname", type: "text", width: 150, title: "Name & Surname" },
        { name: "username", type: "text", width: 150, title: "UserName" },
        { name: "numberCount", type: "number", width: 80, title: "Total Numbers" },
        { name: "repeatedCount", type: "number", width: 80, title: "Repeated Numbers" },
        {
          name: "administrator",
          type: "checkbox",
          title: "Admin",
          width: 40,
          itemTemplate: (value: any) => {
            return value === 1 ? '<ion-icon name="checkmark-done-outline"></ion-icon>' : '';
          }
        },
        {
          title: "Edit",
          align: "center",
          width: 40,
          itemTemplate: (_: any, item: any) => {
            const $editButton = $('<button>')
              .addClass('btn btn-info')
              .text('Edit')
              .on('click', () => this.editUser(item.id));
            return $editButton;
          }
        }
      ]
    });
  }

  /**
   * Save the user
   */
  saveUser() {

    if (this.userName == "" || this.nameSurname == "" || this.password == "" || this.passwordConfirmation == "") {
      this.errorText = "Todos los campos son olbigatorios"
    } else {

      if (this.password != this.passwordConfirmation) {
        this.errorText = "Las constraseñas no coinciden"
      } else {




      }

    }

  }

  editUser(userId: number): void {
    console.log('Edit user with ID:', userId);
    // Add your logic to handle user editing here
  }


}
