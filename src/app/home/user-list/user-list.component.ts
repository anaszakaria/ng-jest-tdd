import { Component, OnInit } from '@angular/core';
import { UserService } from '../../core/user.service';
import { UserPage } from 'src/app/shared/types';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  fetchingData = false;
  page: UserPage = {
    content: [],
    page: 0,
    size: 3,
    totalPages: 0
  };

  get hasNextPage() {
    const { page, totalPages } = this.page;
    return totalPages > page + 1;
  }

  get hasPrevPage() {
    return this.page.page != 0;
  }

  constructor(private userService: UserService, private router: Router) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(page: number = 0) {
    this.fetchingData = true;
    this.userService.loadUsers(page).subscribe(responseBody => {
      this.page = responseBody as UserPage;
      this.fetchingData = false;
    })
  }

  navigate(id: number) {
    this.router.navigate(['/user/', id]);
  }
}
