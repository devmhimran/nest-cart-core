import { UsersType } from '@/types/users';
import { UserCard } from './user-card';

interface UsersCardsProps {
  users: UsersType[];
  onEdit: (user: UsersType) => void;
  onDelete: (user: UsersType) => void;
}

export function UsersCards({ users, onEdit, onDelete }: UsersCardsProps) {
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden'>
      {users.map((user) => (
        <UserCard
          key={user.id}
          user={user}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
