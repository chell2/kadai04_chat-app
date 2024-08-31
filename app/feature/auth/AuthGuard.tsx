'use client';

import { useAuthContext } from '@/feature/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { Box } from '@chakra-ui/react';

type Props = {
  children: ReactNode;
};

export const AuthGuard = ({ children }: Props) => {
  const { user } = useAuthContext();
  const router = useRouter();

  if (typeof user === 'undefined') {
    return <Box>読み込み中...</Box>;
  }

  if (user === null) {
    router.push('/signin');
    return null;
  }

  return <>{children}</>;
};
