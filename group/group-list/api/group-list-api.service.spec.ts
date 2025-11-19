import { TestBed } from '@angular/core/testing';

import { GroupListApiService } from './group-list-api.service';

describe('GroupsService', () => {
  let service: GroupListApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GroupListApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
