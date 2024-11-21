import { User } from '../../../feature_module/user/user.schema';

export const userData: Partial<User>[] = [
  { username: 'John Doe', password: 'password123', status: 'active' },
  { username: 'Jane Doe', password: 'password123', status: 'inactive' },
];
