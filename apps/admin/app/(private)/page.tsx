import { redirect } from 'next/navigation';

export default function PrivatePage() {
  return redirect(`/dashboard/`);
}
